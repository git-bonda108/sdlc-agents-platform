
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChatBubbleLeftIcon, 
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  HeartIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import { RichTextEditor } from './RichTextEditor';
import { UserAvatar } from '../ui/UserAvatar';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useComments } from '../../hooks/useComments';

interface Comment {
  id: string;
  content: string;
  content_html: string;
  author_id: string;
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  parent_id?: string;
  depth: number;
  type: string;
  status: string;
  mentions: string[];
  tags: string[];
  is_edited: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
  reactions?: CommentReaction[];
  reply_count: number;
}

interface CommentReaction {
  id: string;
  user_id: string;
  reaction_type: string;
  user: {
    username: string;
    full_name: string;
  };
}

interface CommentSystemProps {
  projectId: string;
  fileId?: string;
  workflowId?: string;
  annotationData?: any;
  className?: string;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  projectId,
  fileId,
  workflowId,
  annotationData,
  className = '',
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const {
    comments,
    loading,
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    removeReaction,
    resolveComment,
    loadComments,
  } = useComments(projectId, fileId, workflowId);

  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_replies'>('newest');

  const commentInputRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLDivElement>(null);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [projectId, fileId, workflowId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleCommentCreated = (data: { comment: Comment }) => {
      // Comment will be added through the useComments hook
      console.log('Comment created:', data.comment);
    };

    const handleCommentUpdated = (data: { comment: Comment }) => {
      console.log('Comment updated:', data.comment);
    };

    socket.on('comment_created', handleCommentCreated);
    socket.on('comment_updated', handleCommentUpdated);

    return () => {
      socket.off('comment_created', handleCommentCreated);
      socket.off('comment_updated', handleCommentUpdated);
    };
  }, [socket]);

  // Handle new comment submission
  const handleSubmitComment = useCallback(async () => {
    if (!newCommentContent.trim() || !user) return;

    try {
      await createComment({
        content: newCommentContent,
        type: 'general',
        file_id: fileId,
        workflow_id: workflowId,
        annotation_data: annotationData,
      });

      setNewCommentContent('');
      
      // Emit real-time event
      if (socket) {
        socket.emit('comment_create', {
          content: newCommentContent,
          file_id: fileId,
          workflow_id: workflowId,
          annotation_data: annotationData,
        });
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  }, [newCommentContent, user, createComment, fileId, workflowId, annotationData, socket]);

  // Handle reply submission
  const handleSubmitReply = useCallback(async (parentId: string, content: string) => {
    if (!content.trim() || !user) return;

    try {
      await createComment({
        content,
        type: 'general',
        parent_id: parentId,
        file_id: fileId,
        workflow_id: workflowId,
      });

      setReplyingTo(null);
      
      // Emit real-time event
      if (socket) {
        socket.emit('comment_create', {
          content,
          parent_id: parentId,
          file_id: fileId,
          workflow_id: workflowId,
        });
      }
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  }, [user, createComment, fileId, workflowId, socket]);

  // Handle comment edit
  const handleEditComment = useCallback(async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, { content });
      setEditingComment(null);
      setEditContent('');
      
      // Emit real-time event
      if (socket) {
        socket.emit('comment_update', {
          comment_id: commentId,
          content,
        });
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  }, [updateComment, socket]);

  // Handle reaction toggle
  const handleReactionToggle = useCallback(async (commentId: string, reactionType: string) => {
    if (!user) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const existingReaction = comment.reactions?.find(
      r => r.user_id === user.id && r.reaction_type === reactionType
    );

    try {
      if (existingReaction) {
        await removeReaction(commentId, reactionType);
      } else {
        await addReaction(commentId, reactionType);
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  }, [user, comments, addReaction, removeReaction]);

  // Filter and sort comments
  const filteredComments = comments
    .filter(comment => {
      if (!showResolved && comment.is_resolved) return false;
      return comment.depth === 0; // Only show root comments, replies are nested
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_replies':
          return b.reply_count - a.reply_count;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Render comment component
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}
    >
      <div className="flex space-x-3">
        <UserAvatar
          user={comment.author}
          size="sm"
          className="flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm text-gray-900">
                {comment.author.full_name || comment.author.username}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.is_edited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
              {comment.is_resolved && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <CheckIcon className="w-3 h-3 mr-1" />
                  Resolved
                </span>
              )}
            </div>
            
            {/* Comment Actions */}
            <Dropdown
              trigger={
                <Button variant="ghost" size="sm">
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Button>
              }
            >
              <div className="py-1">
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Reply
                </button>
                {user?.id === comment.author_id && (
                  <>
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <PencilIcon className="w-4 h-4 inline mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <TrashIcon className="w-4 h-4 inline mr-2" />
                      Delete
                    </button>
                  </>
                )}
                {!comment.is_resolved && (
                  <button
                    onClick={() => resolveComment(comment.id)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <CheckIcon className="w-4 h-4 inline mr-2" />
                    Mark as Resolved
                  </button>
                )}
              </div>
            </Dropdown>
          </div>
          
          {/* Comment Content */}
          <div className="mt-2">
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <RichTextEditor
                  content={editContent}
                  onChange={setEditContent}
                  placeholder="Edit your comment..."
                  className="min-h-[100px]"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.id, editContent)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: comment.content_html || comment.content }}
              />
            )}
          </div>
          
          {/* Comment Reactions */}
          <div className="mt-3 flex items-center space-x-4">
            <button
              onClick={() => handleReactionToggle(comment.id, 'like')}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500"
            >
              {comment.reactions?.some(r => r.user_id === user?.id && r.reaction_type === 'like') ? (
                <HeartSolidIcon className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span>{comment.reactions?.filter(r => r.reaction_type === 'like').length || 0}</span>
            </button>
            
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-sm text-gray-500 hover:text-blue-500"
            >
              Reply
            </button>
            
            {comment.reply_count > 0 && (
              <span className="text-sm text-gray-500">
                {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
          
          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-4">
              <ReplyInput
                onSubmit={(content) => handleSubmitReply(comment.id, content)}
                onCancel={() => setReplyingTo(null)}
                ref={replyInputRef}
              />
            </div>
          )}
          
          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">
              Comments ({comments.length})
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Show resolved</span>
            </label>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="most_replies">Most replies</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* New Comment Input */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-3">
          <UserAvatar user={user} size="sm" className="flex-shrink-0" />
          <div className="flex-1">
            <RichTextEditor
              content={newCommentContent}
              onChange={setNewCommentContent}
              placeholder="Add a comment..."
              className="min-h-[100px]"
              ref={commentInputRef}
            />
            <div className="mt-2 flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newCommentContent.trim()}
                className="flex items-center space-x-2"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>Comment</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredComments.map(comment => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
};

// Reply Input Component
interface ReplyInputProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

const ReplyInput = React.forwardRef<HTMLDivElement, ReplyInputProps>(
  ({ onSubmit, onCancel }, ref) => {
    const [content, setContent] = useState('');

    const handleSubmit = () => {
      if (content.trim()) {
        onSubmit(content);
        setContent('');
      }
    };

    return (
      <div className="border border-gray-200 rounded-lg p-3">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write a reply..."
          className="min-h-[80px]"
          ref={ref}
        />
        <div className="mt-2 flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            Reply
          </Button>
        </div>
      </div>
    );
  }
);

ReplyInput.displayName = 'ReplyInput';

export default CommentSystem;
