import React from 'react';
import {
  X,
  Square,
  Circle,
  Triangle,
  Star,
  ArrowRight,
  Minus,
  Sparkles,
} from 'lucide-react';
import type { ShapeType } from '../types/pdf';

interface ShapesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (shape: ShapeType, color: string) => void;
}

const SHAPES_LIST: { id: ShapeType; name: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'rectangle', name: 'สี่เหลี่ยมผืนผ้า', icon: <Square className="w-8 h-8" />, desc: 'กรอบสี่เหลี่ยมมาตรฐาน สำหรับตารางหรือขอบเขต' },
  { id: 'rounded-rectangle', name: 'สี่เหลี่ยมขอบมน', icon: <Square className="w-8 h-8 rounded-lg" />, desc: 'กล่องขอบมน สวยงาม สไตล์โมเดิร์น' },
  { id: 'circle', name: 'วงกลม / วงรี', icon: <Circle className="w-8 h-8" />, desc: 'วงกลมสำหรับเน้นคำตอบ หรือทำไดอะแกรม' },
  { id: 'triangle', name: 'สามเหลี่ยม', icon: <Triangle className="w-8 h-8" />, desc: 'สามเหลี่ยมเรขาคณิต สำหรับโจทย์คณิตศาสตร์' },
  { id: 'star', name: 'ดาว 5 แฉก', icon: <Star className="w-8 h-8" />, desc: 'ดาวให้คะแนน หรือสัญลักษณ์พิเศษ' },
  { id: 'arrow', name: 'ลูกศรชี้', icon: <ArrowRight className="w-8 h-8" />, desc: 'ลูกศรชี้บอกขั้นตอน ชี้คำตอบ หรือแผนผัง' },
  { id: 'line', name: 'เส้นตรง', icon: <Minus className="w-8 h-8" />, desc: 'เส้นคั่น หรือเส้นใต้สำหรับเขียนคำตอบ' },
];

const PRESET_COLORS = [
  { name: 'น้ำเงิน', fill: '#3b82f6', stroke: '#1d4ed8' },
  { name: 'เขียว', fill: '#22c55e', stroke: '#15803d' },
  { name: 'แดง', fill: '#ef4444', stroke: '#b91c1c' },
  { name: 'ส้ม/ทอง', fill: '#f59e0b', stroke: '#b45309' },
  { name: 'ม่วง', fill: '#a855f7', stroke: '#7e22ce' },
  { name: 'เทา/ดำ', fill: '#64748b', stroke: '#334155' },
];

export const ShapesModal: React.FC<ShapesModalProps> = ({
  isOpen,
  onClose,
  onSelectShape,
}) => {
  const [selectedColor, setSelectedColor] = React.useState(PRESET_COLORS[0]);

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
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">เลือกรูปทรงเรขาคณิต (Shapes)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Palette Selector */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            เลือกโทนสีของรูปทรง:
          </label>
          <div className="flex items-center space-x-2">
            {PRESET_COLORS.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                  selectedColor.fill === c.fill
                    ? 'scale-115 ring-2 ring-blue-500 border-white shadow'
                    : 'border-slate-300 hover:scale-105'
                }`}
                style={{ backgroundColor: c.fill }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Shapes Grid */}
        <div className="p-4 max-h-[60vh] overflow-y-auto grid grid-cols-2 gap-3">
          {SHAPES_LIST.map((shape) => (
            <div
              key={shape.id}
              onClick={() => {
                onSelectShape(shape.id, selectedColor.fill);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white hover:bg-blue-50/40 flex flex-col items-center text-center group"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-xs"
                style={{ backgroundColor: `${selectedColor.fill}15`, color: selectedColor.fill }}
              >
                {shape.icon}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {shape.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {shape.desc}
              </span>
            </div>
          ))}
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
