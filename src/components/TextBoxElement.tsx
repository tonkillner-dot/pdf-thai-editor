import React, { useState, useRef, useEffect } from 'react';
import type { CanvasItem } from '../types/pdf';
import { GripVertical, X, RotateCw } from 'lucide-react';

interface TextBoxElementProps {
  box: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasItem>) => void;
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
  const [isRotating, setIsRotating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Convert percentages to pixels for current display container
  const leftPx = (box.xPercent / 100) * containerWidth;
  const topPx = (box.yPercent / 100) * containerHeight;
  const widthPx = Math.max(30, (box.widthPercent / 100) * containerWidth);
  const heightPx = Math.max(20, (box.heightPercent / 100) * containerHeight);

  // Scaled font size relative to standard 800px width
  const scale = containerWidth / 800;
  const displayFontSize = Math.max(10, (box.fontSize || 18) * scale);

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

      const newW = Math.max(30, startW + dx);
      const newH = Math.max(20, startH + dy);

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

  // Handle Rotation
  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsRotating(true);

    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - centerX;
      const dy = moveEvent.clientY - centerY;
      let angle = Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 90;
      if (angle < 0) angle += 360;
      // Snap to 15 degrees if shift key is pressed
      if (moveEvent.shiftKey) {
        angle = Math.round(angle / 15) * 15;
      }
      onUpdate({ rotation: angle % 360 });
    };

    const onMouseUp = () => {
      setIsRotating(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Render content based on element type
  const renderContent = () => {
    if (box.type === 'shape') {
      const shape = box.shapeType || 'rectangle';
      const fill = box.fillColor || box.backgroundColor || '#3b82f6';
      const stroke = box.strokeColor || box.borderColor || '#1d4ed8';
      const strokeW = box.strokeWidth ?? box.borderWidth ?? 2;

      return (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full block overflow-visible pointer-events-none"
        >
          {shape === 'rectangle' && (
            <rect x="2" y="2" width="96" height="96" fill={fill} stroke={stroke} strokeWidth={strokeW} />
          )}
          {shape === 'rounded-rectangle' && (
            <rect x="2" y="2" width="96" height="96" rx="14" fill={fill} stroke={stroke} strokeWidth={strokeW} />
          )}
          {shape === 'circle' && (
            <ellipse cx="50" cy="50" rx="48" ry="48" fill={fill} stroke={stroke} strokeWidth={strokeW} />
          )}
          {shape === 'triangle' && (
            <polygon points="50,4 96,96 4,96" fill={fill} stroke={stroke} strokeWidth={strokeW} />
          )}
          {shape === 'star' && (
            <polygon
              points="50,5 61,38 96,38 68,58 79,91 50,70 21,91 32,58 4,38 39,38"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeW}
            />
          )}
          {shape === 'arrow' && (
            <polygon
              points="4,35 65,35 65,15 96,50 65,85 65,65 4,65"
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeW}
            />
          )}
          {shape === 'line' && (
            <line x1="2" y1="50" x2="98" y2="50" stroke={stroke} strokeWidth={Math.max(2, strokeW)} />
          )}
        </svg>
      );
    }

    if (box.type === 'image' && box.imageUrl) {
      return (
        <img
          src={box.imageUrl}
          alt={box.imageFileName || 'รูปภาพ'}
          className="w-full h-full object-contain pointer-events-none rounded select-none"
        />
      );
    }

    // Default: Text element
    return isEditing ? (
      <textarea
        ref={textareaRef}
        value={box.text || ''}
        onChange={(e) => onUpdate({ text: e.target.value })}
        onBlur={() => setIsEditing(false)}
        rows={box.text?.split('\n').length || 1}
        style={{
          fontFamily: `'${box.fontFamily || 'Sarabun'}', 'Sarabun', sans-serif`,
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
    );
  };

  const isText = box.type === 'text' || !box.type;

  return (
    <div
      ref={boxRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (isText) setIsEditing(true);
      }}
      style={{
        position: 'absolute',
        left: `${leftPx}px`,
        top: `${topPx}px`,
        width: `${widthPx}px`,
        minHeight: `${heightPx}px`,
        height: box.type === 'shape' || box.type === 'image' ? `${heightPx}px` : undefined,
        transform: box.rotation ? `rotate(${box.rotation}deg)` : undefined,
        transformOrigin: 'center center',
        backgroundColor:
          isText && box.backgroundColor && box.backgroundColor !== 'transparent'
            ? box.backgroundColor
            : undefined,
        border:
          isText && box.borderWidth && box.borderWidth > 0
            ? `${box.borderWidth}px solid ${box.borderColor || '#3b82f6'}`
            : undefined,
        borderRadius: isText && box.borderRadius ? `${box.borderRadius}px` : undefined,
        fontFamily: isText ? `'${box.fontFamily || 'Sarabun'}', 'Sarabun', sans-serif` : undefined,
        fontSize: isText ? `${displayFontSize}px` : undefined,
        fontWeight: isText ? box.fontWeight : undefined,
        fontStyle: isText ? box.fontStyle : undefined,
        color: isText ? box.color : undefined,
        textAlign: isText ? box.textAlign : undefined,
        padding: isText ? `${(box.padding || 8) * scale}px` : 0,
        opacity: box.opacity ?? 1,
      }}
      className={`group select-none transition-shadow ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-md cursor-move z-30'
          : 'hover:ring-1 hover:ring-blue-300 cursor-pointer z-10'
      } ${isDragging ? 'opacity-80' : ''} ${isResizing ? 'ring-2 ring-amber-500' : ''} ${
        isRotating ? 'ring-2 ring-purple-500' : ''
      }`}
    >
      {/* Selection Control Handles */}
      {isSelected && (
        <>
          {/* Top Drag Bar */}
          <div
            onMouseDown={handleDragStart}
            className="absolute -top-6 left-0 right-0 h-6 bg-blue-600 rounded-t flex items-center justify-between px-1.5 text-white text-[11px] font-sans shadow-xs cursor-move z-40"
          >
            <div className="flex items-center space-x-1">
              <GripVertical className="w-3.5 h-3.5 opacity-80" />
              <span className="font-medium text-[10px] tracking-wide">
                {box.type === 'shape' ? 'รูปทรง' : box.type === 'image' ? 'รูปภาพ' : 'ข้อความ'}
                {box.rotation ? ` (${box.rotation}°)` : ''}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-0.5 hover:bg-blue-700 rounded cursor-pointer"
              title="ลบ"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Top Rotation Handle */}
          <div
            onMouseDown={handleRotateStart}
            className="absolute -top-11 left-1/2 -translate-x-1/2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-40 border border-white"
            title="ลากเพื่อหมุน (กด Shift เพื่อหมุนทีละ 15°)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </div>
          {/* Connecting line to rotation handle */}
          <div className="absolute -top-5 left-1/2 w-px h-5 bg-purple-500 -translate-x-1/2 pointer-events-none z-30" />

          {/* Bottom-right Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow cursor-se-resize z-40"
            title="ปรับขนาด"
          />
        </>
      )}

      {/* Main Content Render */}
      {renderContent()}
    </div>
  );
};
