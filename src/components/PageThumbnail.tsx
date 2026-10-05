import React, { useRef, useEffect } from 'react';

interface PageThumbnailProps {
  pdfDoc: any;
  pageNum: number;
  isSelected: boolean;
  boxCount: number;
  onClick: () => void;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  pdfDoc,
  pageNum,
  isSelected,
  boxCount,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let isCancelled = false;

    const renderThumbnail = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;
      } catch (e) {
        console.error('Thumbnail render error:', e);
      }
    };

    renderThumbnail();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNum]);

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col items-center ${
        isSelected
          ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-500/30 shadow-md'
          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
      }`}
    >
      <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
        <span
          className={`text-xs font-bold ${
            isSelected ? 'text-blue-700' : 'text-slate-700'
          }`}
        >
          หน้า {pageNum}
        </span>
        {boxCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.2 bg-blue-600 text-white rounded-full font-bold shadow-xs">
            {boxCount}
          </span>
        )}
      </div>

      <div className="w-full bg-white rounded border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center min-h-[100px]">
        <canvas ref={canvasRef} className="block w-full h-auto select-none" />
      </div>
    </button>
  );
};
