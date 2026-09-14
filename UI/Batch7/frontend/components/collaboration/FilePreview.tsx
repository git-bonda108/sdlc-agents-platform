
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  ZoomInIcon,
  ZoomOutIcon,
  ArrowsPointingOutIcon,
  DocumentIcon,
  PhotoIcon,
  CodeBracketIcon,
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

import { Button } from '../ui/Button';
import { Toolbar } from '../ui/Toolbar';
import { AnnotationTool } from './AnnotationTool';
import { CommentSystem } from './CommentSystem';
import { useFilePreview } from '../../hooks/useFilePreview';
import { useAnnotations } from '../../hooks/useAnnotations';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FilePreviewProps {
  fileId: string;
  projectId: string;
  className?: string;
  showComments?: boolean;
  showAnnotations?: boolean;
  readOnly?: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileId,
  projectId,
  className = '',
  showComments = true,
  showAnnotations = true,
  readOnly = false,
}) => {
  const {
    file,
    previewUrl,
    loading,
    error,
    loadFile,
    downloadFile,
  } = useFilePreview(fileId);

  const {
    annotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    loadAnnotations,
  } = useAnnotations(fileId);

  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [showAnnotationTools, setShowAnnotationTools] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(showComments);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [annotationMode, setAnnotationMode] = useState<'select' | 'highlight' | 'note' | 'draw'>('select');

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load file and annotations on mount
  useEffect(() => {
    loadFile();
    if (showAnnotations) {
      loadAnnotations();
    }
  }, [fileId, loadFile, loadAnnotations, showAnnotations]);

  // Handle PDF document load
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1.0);
  }, []);

  // Handle page navigation
  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, numPages || 1));
  }, [numPages]);

  // Handle annotation creation
  const handleCreateAnnotation = useCallback(async (annotationData: any) => {
    if (readOnly) return;

    try {
      await createAnnotation({
        ...annotationData,
        page: currentPage,
      });
    } catch (error) {
      console.error('Failed to create annotation:', error);
    }
  }, [createAnnotation, currentPage, readOnly]);

  // Render file preview based on file type
  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading preview...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96 text-red-600">
          <DocumentIcon className="w-12 h-12 mr-3" />
          <div>
            <p className="font-medium">Preview not available</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      );
    }

    if (!file) return null;

    // PDF Preview
    if (file.mime_type === 'application/pdf') {
      return (
        <div className="relative">
          <TransformWrapper
            initialScale={scale}
            minScale={0.25}
            maxScale={3.0}
            centerOnInit
          >
            <TransformComponent>
              <div ref={previewRef} className="relative">
                <Document
                  file={previewUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  }
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                
                {/* Annotations Overlay */}
                {showAnnotations && (
                  <AnnotationTool
                    annotations={annotations.filter(a => a.position_data?.page === currentPage)}
                    mode={annotationMode}
                    onCreateAnnotation={handleCreateAnnotation}
                    onSelectAnnotation={setSelectedAnnotation}
                    selectedAnnotation={selectedAnnotation}
                    readOnly={readOnly}
                    className="absolute inset-0 pointer-events-none"
                  />
                )}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      );
    }

    // Image Preview
    if (file.file_type === 'image') {
      return (
        <div className="relative">
          <TransformWrapper
            initialScale={scale}
            minScale={0.25}
            maxScale={3.0}
            centerOnInit
          >
            <TransformComponent>
              <div ref={previewRef} className="relative">
                <img
                  src={previewUrl}
                  alt={file.filename}
                  className="max-w-full h-auto"
                  style={{ transform: `scale(${scale})` }}
                />
                
                {/* Annotations Overlay */}
                {showAnnotations && (
                  <AnnotationTool
                    annotations={annotations}
                    mode={annotationMode}
                    onCreateAnnotation={handleCreateAnnotation}
                    onSelectAnnotation={setSelectedAnnotation}
                    selectedAnnotation={selectedAnnotation}
                    readOnly={readOnly}
                    className="absolute inset-0 pointer-events-none"
                  />
                )}
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      );
    }

    // Code Preview
    if (file.file_type === 'code') {
      return (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
          <pre className="text-sm">
            <code>{file.extracted_text || 'Loading code content...'}</code>
          </pre>
        </div>
      );
    }

    // Document Preview (for text-based files)
    if (file.file_type === 'document') {
      return (
        <div className="bg-white p-6 rounded-lg border overflow-auto">
          <div className="prose max-w-none">
            {file.extracted_text ? (
              <pre className="whitespace-pre-wrap font-sans">
                {file.extracted_text}
              </pre>
            ) : (
              <p className="text-gray-500">Loading document content...</p>
            )}
          </div>
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <DocumentIcon className="w-12 h-12 mr-3" />
        <div className="text-center">
          <p className="font-medium">Preview not available</p>
          <p className="text-sm">This file type is not supported for preview</p>
          <Button
            onClick={downloadFile}
            className="mt-3"
            variant="outline"
          >
            Download File
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <Toolbar className="border-b border-gray-200 p-2">
          <div className="flex items-center justify-between w-full">
            {/* File Info */}
            <div className="flex items-center space-x-3">
              {file?.file_type === 'image' && <PhotoIcon className="w-5 h-5 text-gray-400" />}
              {file?.file_type === 'document' && <DocumentIcon className="w-5 h-5 text-gray-400" />}
              {file?.file_type === 'code' && <CodeBracketIcon className="w-5 h-5 text-gray-400" />}
              <div>
                <h3 className="font-medium text-sm text-gray-900">
                  {file?.filename}
                </h3>
                <p className="text-xs text-gray-500">
                  {file?.human_readable_size} • {file?.mime_type}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* PDF Page Navigation */}
              {file?.mime_type === 'application/pdf' && numPages && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentPage} of {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= numPages}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.25}
                >
                  <ZoomOutIcon className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={scale >= 3.0}
                >
                  <ZoomInIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomReset}
                >
                  <ArrowsPointingOutIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Annotation Tools */}
              {showAnnotations && !readOnly && (
                <Button
                  variant={showAnnotationTools ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowAnnotationTools(!showAnnotationTools)}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
              )}

              {/* Comments Toggle */}
              {showComments && (
                <Button
                  variant={showCommentsPanel ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Annotation Mode Selector */}
          {showAnnotationTools && !readOnly && (
            <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Annotation mode:</span>
              <div className="flex space-x-1">
                {[
                  { mode: 'select', label: 'Select' },
                  { mode: 'highlight', label: 'Highlight' },
                  { mode: 'note', label: 'Note' },
                  { mode: 'draw', label: 'Draw' },
                ].map(({ mode, label }) => (
                  <Button
                    key={mode}
                    variant={annotationMode === mode ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setAnnotationMode(mode as any)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Toolbar>

        {/* Preview Content */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-gray-50 p-4"
        >
          {renderPreview()}
        </div>
      </div>

      {/* Comments Panel */}
      {showCommentsPanel && (
        <div className="w-96 border-l border-gray-200 bg-white">
          <CommentSystem
            projectId={projectId}
            fileId={fileId}
            className="h-full border-0 rounded-none"
          />
        </div>
      )}
    </div>
  );
};

export default FilePreview;
