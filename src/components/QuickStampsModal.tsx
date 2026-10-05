import React from 'react';
import { X, Stamp, Sparkles } from 'lucide-react';
import { QUICK_STAMPS } from '../utils/thaiFonts';

interface QuickStampsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStamp: (stamp: (typeof QUICK_STAMPS)[0]) => void;
}

export const QuickStampsModal: React.FC<QuickStampsModalProps> = ({
  isOpen,
  onClose,
  onSelectStamp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div
          className="px-5 py-4 text-white flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
        >
          <div className="flex items-center space-x-2">
            <Stamp className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">สแตมป์และข้อความด่วนสำหรับครู</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-500">
            เลือกข้อความสำเร็จรูปเพื่อวางลงในหน้าเอกสาร PDF ได้ทันที:
          </p>

          <div className="space-y-2.5">
            {QUICK_STAMPS.map((stamp, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectStamp(stamp);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-slate-50 hover:bg-white flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800">
                      {stamp.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-medium">
                      {stamp.fontFamily}
                    </span>
                  </div>
                  <div
                    className="text-sm px-2 py-1 rounded inline-block"
                    style={{
                      fontFamily: stamp.fontFamily,
                      color: stamp.color,
                      backgroundColor: stamp.backgroundColor,
                      border: stamp.borderWidth
                        ? `${stamp.borderWidth}px solid ${stamp.borderColor}`
                        : undefined,
                    }}
                  >
                    {stamp.text}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
