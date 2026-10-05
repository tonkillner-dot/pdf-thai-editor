import React, { useRef, useEffect, useState } from 'react';
import type { TextBoxItem } from '../types/pdf';
import { TextBoxElement } from './TextBoxElement';
import { renderPageToCanvas } from '../utils/pdfRenderer';

interface CanvasAreaProps {
  pdfDoc: any;
  currentPage: number;
  zoom: number;
  textBoxes: TextBoxItem[];
  selectedBoxId: string | null;
  onSelectBox: (id: string | null) => void;
  onUpdateBox: (id: string, updates: Partial<TextBoxItem>) => void;
  onDeleteBox: (id: string) => void;
  isLoading: boolean;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  pdfDoc,
  currentPage,
  zoom,
  textBoxes,
  selectedBoxId,
  onSelectBox,
  onUpdateBox,
  onDeleteBox,
  isLoading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });
  const [renderError, setRenderError] = useState<string | null>(null);

  // Render PDF page whenever pdfDoc, currentPage, or base scale changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isMounted = true;
    setRenderError(null);

    const render = async () => {
      try {
        const result = await renderPageToCanvas(
          pdfDoc,
          currentPage,
          canvasRef.current!,
          1.5 * zoom // High-DPI base render
        );
        if (isMounted) {
          setPageSize({ width: result.width, height: result.height });
        }
      } catch (err: any) {
        console.error('Error rendering page:', err);
        if (isMounted) {
          setRenderError(err.message || 'เกิดข้อผิดพลาดในการแสดงผลหน้า PDF');
        }
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, currentPage, zoom]);

  // Filter text boxes for current page (0-based page index)
  const currentPageBoxes = textBoxes.filter((b) => b.pageIndex === currentPage - 1);

  return (
    <div
      onClick={() => onSelectBox(null)}
      className="flex-1 overflow-auto bg-slate-200/80 p-4 md:p-8 flex items-start justify-center min-h-[500px]"
    >
      <div
        className="relative bg-white shadow-2xl transition-all duration-150 rounded-sm"
        style={{
          width: pageSize.width ? `${pageSize.width}px` : 'auto',
          height: pageSize.height ? `${pageSize.height}px` : 'auto',
        }}
      >
        {/* PDF Canvas layer */}
        <canvas
          ref={canvasRef}
          className="block w-full h-full select-none"
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-40">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-slate-700">กำลังโหลดหน้าเอกสาร...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {renderError && (
          <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center p-6 text-center z-40">
            <div className="text-red-700">
              <p className="font-bold">เกิดข้อผิดพลาดในการแสดงผล</p>
              <p className="text-sm mt-1">{renderError}</p>
            </div>
          </div>
        )}

        {/* Interactive Text Boxes Layer */}
        {pageSize.width > 0 && (
          <div
            className="absolute inset-0 z-20 pointer-events-auto"
            style={{ width: `${pageSize.width}px`, height: `${pageSize.height}px` }}
          >
            {currentPageBoxes.map((box) => (
              <TextBoxElement
                key={box.id}
                box={box}
                isSelected={box.id === selectedBoxId}
                onSelect={() => onSelectBox(box.id)}
                onUpdate={(updates) => onUpdateBox(box.id, updates)}
                onDelete={() => onDeleteBox(box.id)}
                containerWidth={pageSize.width}
                containerHeight={pageSize.height}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
