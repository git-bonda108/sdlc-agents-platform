
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface UseSocketOptions {
  projectId?: string;
  documentId?: string;
  autoConnect?: boolean;
}

interface SocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const { projectId, documentId, autoConnect = true } = options;

  // Connect to socket
  const connect = useCallback(() => {
    if (!user || !token || socketRef.current?.connected) {
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
      path: '/socket.io',
      auth: {
        token,
        project_id: projectId,
        document_id: documentId,
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setState(prev => ({
        ...prev,
        connected: true,
        connecting: false,
        error: null,
      }));
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
      }));
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: error.message,
      }));
    });

    // Real-time events
    socket.on('user_joined', (data) => {
      console.log('User joined:', data);
    });

    socket.on('user_left', (data) => {
      console.log('User left:', data);
    });

    socket.on('notification', (data) => {
      console.log('Notification received:', data);
      // Handle notifications (could integrate with a notification system)
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setState(prev => ({ ...prev, error: data.message }));
    });

    socketRef.current = socket;
  }, [user, token, projectId, documentId]);

  // Disconnect from socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setState({
        connected: false,
        connecting: false,
        error: null,
      });
    }
  }, []);

  // Join project room
  const joinProject = useCallback((projectId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_project', { project_id: projectId });
    }
  }, []);

  // Leave project room
  const leaveProject = useCallback((projectId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_project', { project_id: projectId });
    }
  }, []);

  // Send cursor update
  const sendCursorUpdate = useCallback((documentId: string, cursor: any, selection?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('cursor_update', {
        document_id: documentId,
        cursor,
        selection,
      });
    }
  }, []);

  // Send document operation
  const sendDocumentOperation = useCallback((documentId: string, operation: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('document_operation', {
        document_id: documentId,
        operation,
      });
    }
  }, []);

  // Send typing indicators
  const sendTypingStart = useCallback((context: string, contextId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', {
        context,
        context_id: contextId,
      });
    }
  }, []);

  const sendTypingStop = useCallback((context: string, contextId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', {
        context,
        context_id: contextId,
      });
    }
  }, []);

  // Update presence
  const updatePresence = useCallback((presence: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('presence_update', { presence });
    }
  }, []);

  // Subscribe to events
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current?.off(event, callback);
    }
    return () => {};
  }, []);

  // Emit events
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Auto-connect when user is available
  useEffect(() => {
    if (autoConnect && user && token && !socketRef.current) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        disconnect();
      }
    };
  }, [user, token, autoConnect, connect, disconnect]);

  // Reconnect when project or document changes
  useEffect(() => {
    if (socketRef.current?.connected && (projectId || documentId)) {
      // Update connection context
      socketRef.current.auth = {
        ...socketRef.current.auth,
        project_id: projectId,
        document_id: documentId,
      };

      if (projectId) {
        joinProject(projectId);
      }
    }
  }, [projectId, documentId, joinProject]);

  return {
    socket: socketRef.current,
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    connect,
    disconnect,
    joinProject,
    leaveProject,
    sendCursorUpdate,
    sendDocumentOperation,
    sendTypingStart,
    sendTypingStop,
    updatePresence,
    on,
    emit,
  };
};

export default useSocket;
