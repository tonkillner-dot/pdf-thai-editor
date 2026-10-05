import React, { useState } from 'react';
import {
  X,
  Square,
  Circle,
  Triangle,
  Star,
  ArrowRight,
  Minus,
  Sparkles,
  Pipette,
} from 'lucide-react';
import type { ShapeType } from '../types/pdf';
import { EXPANDED_COLORS, PASTEL_COLORS } from '../utils/thaiFonts';

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

export const ShapesModal: React.FC<ShapesModalProps> = ({
  isOpen,
  onClose,
  onSelectShape,
}) => {
  const [currentColor, setCurrentColor] = useState<string>('#3b82f6');
  const [colorTab, setColorTab] = useState<'vibrant' | 'pastel'>('vibrant');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div
          className="px-5 py-4 text-white flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">เลือกรูปทรงเรขาคณิตและสี</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Extensive Color Picker Section */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">เลือกสีรูปทรง:</span>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden text-[11px] font-semibold bg-white">
                <button
                  onClick={() => setColorTab('vibrant')}
                  className={`px-2.5 py-1 transition-colors cursor-pointer ${
                    colorTab === 'vibrant'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  สียอดนิยม ({EXPANDED_COLORS.length})
                </button>
                <button
                  onClick={() => setColorTab('pastel')}
                  className={`px-2.5 py-1 transition-colors cursor-pointer ${
                    colorTab === 'pastel'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  สีพาสเทล ({PASTEL_COLORS.length})
                </button>
              </div>
            </div>

            {/* Custom Color Wheel / Input */}
            <label className="flex items-center space-x-1.5 px-2 py-1 bg-white border border-slate-300 hover:border-blue-400 rounded-lg cursor-pointer shadow-xs text-xs">
              <Pipette className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-slate-700">จานสีอิสระ</span>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
            </label>
          </div>

          {/* Color Swatches Grid */}
          <div className="max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
            {colorTab === 'vibrant' ? (
              <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
                {EXPANDED_COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentColor(c.hex)}
                    className={`w-6 h-6 rounded-md border transition-all cursor-pointer ${
                      currentColor.toLowerCase() === c.hex.toLowerCase()
                        ? 'scale-125 ring-2 ring-blue-600 border-white shadow z-10'
                        : 'border-slate-300 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {PASTEL_COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentColor(c.hex)}
                    className={`w-7 h-7 rounded-md border transition-all cursor-pointer ${
                      currentColor.toLowerCase() === c.hex.toLowerCase()
                        ? 'scale-125 ring-2 ring-blue-600 border-white shadow z-10'
                        : 'border-slate-300 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Active color status */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">สีที่เลือกในขณะนี้:</span>
            <div
              className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
              style={{ backgroundColor: currentColor }}
            />
            <span className="font-mono text-slate-700 font-bold uppercase">{currentColor}</span>
          </div>
        </div>

        {/* Shapes Grid */}
        <div className="p-4 max-h-[50vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SHAPES_LIST.map((shape) => (
            <div
              key={shape.id}
              onClick={() => {
                onSelectShape(shape.id, currentColor);
                onClose();
              }}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white hover:bg-blue-50/40 flex flex-col items-center text-center group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 shadow-xs"
                style={{ backgroundColor: `${currentColor}20`, color: currentColor }}
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
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>คลิกที่รูปทรงเพื่อวางลงในหน้าเอกสารทันที</span>
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
