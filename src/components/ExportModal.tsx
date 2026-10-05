import React, { useEffect } from 'react';
import { X, Download, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: number;
  statusText: string;
  isComplete: boolean;
  downloadUrl: string | null;
  fileName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  progress,
  statusText,
  isComplete,
  downloadUrl,
  fileName,
}) => {
  useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [isComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div
          className="px-5 py-4 text-white flex items-center justify-between"
          style={{
            background: isComplete
              ? 'linear-gradient(135deg, #15803d, #16a34a)'
              : 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          }}
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-bold text-base">
              {isComplete ? 'ส่งออก PDF สำเร็จเรียบร้อย' : 'กำลังจัดเตรียมไฟล์ PDF'}
            </h3>
          </div>
          {isComplete && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          {!isComplete ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{statusText}</p>
                <p className="text-xs text-slate-500 mt-1">
                  ระบบกำลังฝังข้อความภาษาไทยและรักษาความคมชัดระดับสิ่งพิมพ์...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-blue-700">{progress}%</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  ไฟล์ PDF ของคุณพร้อมดาวน์โหลดแล้ว!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  ข้อความภาษาไทยและฟอนต์ที่คุณเลือกถูกฝังลงในเอกสารอย่างสมบูรณ์แบบ
                </p>
              </div>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={fileName}
                  className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)' }}
                >
                  <Download className="w-5 h-5" />
                  <span>บันทึกและดาวน์โหลดไฟล์ ({fileName})</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <span>Thai PDF Editor • จัดทำโดย ครูนภรัฐ</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
