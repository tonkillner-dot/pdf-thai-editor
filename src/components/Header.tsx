import React from 'react';
import { FileUp, Download, Sparkles, FileText } from 'lucide-react';

interface HeaderProps {
  fileName: string | null;
  onUploadClick: () => void;
  onLoadSample: () => void;
  onExportClick: () => void;
  hasPdf: boolean;
  boxCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  fileName,
  onUploadClick,
  onLoadSample,
  onExportClick,
  hasPdf,
  boxCount,
}) => {
  return (
    <header className="w-full text-white shadow-md relative z-20" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">
                ระบบแก้ไข PDF ภาษาไทย
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-400/40 text-blue-100 font-medium">
                Thai PDF Editor
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-blue-100 mt-0.5">
              <span>เพิ่มข้อความภาษาไทย • เลือกฟอนต์สวยงาม • สระวรรณยุกต์ไม่เพี้ยน 100%</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 font-semibold text-[11px]">
                ครูนภรัฐ
              </span>
            </div>
          </div>
        </div>

        {/* Center: File Status */}
        {hasPdf && (
          <div className="hidden md:flex items-center space-x-2 bg-blue-900/40 border border-blue-400/30 px-3 py-1.5 rounded-lg text-xs">
            <FileText className="w-3.5 h-3.5 text-blue-200" />
            <span className="text-blue-100 truncate max-w-xs font-medium">
              {fileName || 'เอกสารกำลังแก้ไข'}
            </span>
            <span className="text-blue-300">|</span>
            <span className="text-amber-200 font-medium">
              {boxCount} กล่องข้อความ
            </span>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {!hasPdf && (
            <button
              onClick={onLoadSample}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/30 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="ทดลองใช้ด้วยไฟล์ตัวอย่าง"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ไฟล์ตัวอย่าง</span>
            </button>
          )}

          <button
            onClick={onUploadClick}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/30 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            title="เปิดไฟล์ PDF จากคอมพิวเตอร์"
          >
            <FileUp className="w-4 h-4 text-blue-200" />
            <span>{hasPdf ? 'เปลี่ยนไฟล์' : 'เปิดไฟล์ PDF'}</span>
          </button>

          {hasPdf && (
            <button
              onClick={onExportClick}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-md active:scale-95 text-white"
              style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)' }}
              title="ส่งออกเอกสาร PDF พร้อมกล่องข้อความภาษาไทย"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด PDF</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
