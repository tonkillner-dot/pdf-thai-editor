import React, { useState, useRef, useEffect } from 'react';
import type { TextBoxItem } from '../types/pdf';
import { GripVertical, X } from 'lucide-react';

interface TextBoxElementProps {
  box: TextBoxItem;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextBoxItem>) => void;
  onDelete: () => void;
  containerWidth: number;
  containerHeight: number;
}

export const TextBoxElement: React.FC<TextBoxElementProps> = ({
  box,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  containerWidth,
  containerHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Convert percentages to pixels for current display container
  const leftPx = (box.xPercent / 100) * containerWidth;
  const topPx = (box.yPercent / 100) * containerHeight;
  const widthPx = Math.max(60, (box.widthPercent / 100) * containerWidth);
  const heightPx = Math.max(30, (box.heightPercent / 100) * containerHeight);

  // Scaled font size relative to standard 800px width
  const scale = containerWidth / 800;
  const displayFontSize = Math.max(10, box.fontSize * scale);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Handle Dragging
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startLeft = leftPx;
    const startTop = topPx;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startMouseX;
      const dy = moveEvent.clientY - startMouseY;

      let newLeft = startLeft + dx;
      let newTop = startTop + dy;

      // Bound within container
      newLeft = Math.max(0, Math.min(containerWidth - widthPx, newLeft));
      newTop = Math.max(0, Math.min(containerHeight - heightPx, newTop));

      const newXPercent = (newLeft / containerWidth) * 100;
      const newYPercent = (newTop / containerHeight) * 100;

      onUpdate({ xPercent: newXPercent, yPercent: newYPercent });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Handle Resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsResizing(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startW = widthPx;
    const startH = heightPx;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startMouseX;
      const dy = moveEvent.clientY - startMouseY;

      const newW = Math.max(60, startW + dx);
      const newH = Math.max(30, startH + dy);

      const newWPercent = (newW / containerWidth) * 100;
      const newHPercent = (newH / containerHeight) * 100;

      onUpdate({ widthPercent: newWPercent, heightPercent: newHPercent });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      style={{
        position: 'absolute',
        left: `${leftPx}px`,
        top: `${topPx}px`,
        width: `${widthPx}px`,
        minHeight: `${heightPx}px`,
        backgroundColor: box.backgroundColor === 'transparent' ? 'transparent' : box.backgroundColor,
        border: box.borderWidth > 0 ? `${box.borderWidth}px solid ${box.borderColor}` : undefined,
        borderRadius: `${box.borderRadius}px`,
        fontFamily: `'${box.fontFamily}', 'Sarabun', sans-serif`,
        fontSize: `${displayFontSize}px`,
        fontWeight: box.fontWeight,
        fontStyle: box.fontStyle,
        color: box.color,
        textAlign: box.textAlign,
        padding: `${(box.padding || 8) * scale}px`,
        opacity: box.opacity ?? 1,
      }}
      className={`group select-none transition-shadow ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-md cursor-move'
          : 'hover:ring-1 hover:ring-blue-300 cursor-pointer'
      } ${isDragging ? 'opacity-80' : ''} ${isResizing ? 'ring-2 ring-amber-500' : ''}`}
    >
      {/* Selection Control Handles */}
      {isSelected && (
        <>
          {/* Top Drag Bar */}
          <div
            onMouseDown={handleDragStart}
            className="absolute -top-6 left-0 right-0 h-6 bg-blue-600 rounded-t flex items-center justify-between px-1.5 text-white text-[11px] font-sans shadow-xs cursor-move z-30"
          >
            <div className="flex items-center space-x-1">
              <GripVertical className="w-3.5 h-3.5 opacity-80" />
              <span className="font-medium text-[10px] tracking-wide">ลากย้าย</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-0.5 hover:bg-blue-700 rounded cursor-pointer"
              title="ลบกล่องข้อความ"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Bottom-right Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow cursor-se-resize z-30"
            title="ปรับขนาด"
          />
        </>
      )}

      {/* Text Area or Display */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={box.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          rows={box.text.split('\n').length || 1}
          style={{
            fontFamily: `'${box.fontFamily}', 'Sarabun', sans-serif`,
            fontSize: `${displayFontSize}px`,
            fontWeight: box.fontWeight,
            fontStyle: box.fontStyle,
            color: box.color,
            textAlign: box.textAlign,
            backgroundColor: 'transparent',
          }}
          className="w-full h-full resize-none border-none outline-none p-0 bg-transparent overflow-hidden leading-snug"
          autoFocus
        />
      ) : (
        <div
          className="w-full h-full whitespace-pre-wrap break-words leading-snug cursor-text"
          onDoubleClick={() => setIsEditing(true)}
        >
          {box.text || (
            <span className="text-slate-400 italic font-sans text-xs">
              (ดับเบิลคลิกเพื่อพิมพ์ข้อความ)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
