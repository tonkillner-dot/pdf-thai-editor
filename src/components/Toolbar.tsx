import React, { useState } from 'react';
import {
  Plus,
  Stamp,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Palette,
  Square,
  Undo2,
  Redo2,
} from 'lucide-react';
import type { TextBoxItem } from '../types/pdf';
import { THAI_FONTS, COLOR_PALETTE, BG_COLOR_PALETTE } from '../utils/thaiFonts';

interface ToolbarProps {
  selectedBox: TextBoxItem | null;
  onAddTextBox: () => void;
  onOpenStamps: () => void;
  onUpdateSelectedBox: (updates: Partial<TextBoxItem>) => void;
  onDeleteSelectedBox: () => void;
  onDuplicateSelectedBox: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedBox,
  onAddTextBox,
  onOpenStamps,
  onUpdateSelectedBox,
  onDeleteSelectedBox,
  onDuplicateSelectedBox,
  currentPage,
  totalPages,
  onPageChange,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  return (
    <div className="w-full bg-white border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs z-10">
      {/* Group 1: Primary Add Tools */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={onAddTextBox}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
          title="เพิ่มกล่องข้อความภาษาไทย"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มข้อความ</span>
        </button>

        <button
          onClick={onOpenStamps}
          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
          title="แทรกสแตมป์และข้อความด่วน เช่น ครูผู้ตรวจ, ตรวจแล้ว"
        >
          <Stamp className="w-4 h-4 text-amber-600" />
          <span>สแตมป์ด่วน</span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors cursor-pointer"
          title="เลิกทำ (Undo)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors cursor-pointer"
          title="ทำซ้ำ (Redo)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Group 2: Text Box Formatting Tools (active when selectedBox exists) */}
      {selectedBox ? (
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-50 border border-blue-200 px-2 py-1 rounded-lg">
          {/* Font Selector */}
          <div className="flex items-center space-x-1">
            <label className="text-xs text-slate-500 font-medium hidden sm:inline">ฟอนต์:</label>
            <select
              value={selectedBox.fontFamily}
              onChange={(e) => onUpdateSelectedBox({ fontFamily: e.target.value })}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-blue-500 cursor-pointer min-w-[130px]"
              style={{ fontFamily: selectedBox.fontFamily }}
            >
              {THAI_FONTS.map((font) => (
                <option
                  key={font.id}
                  value={font.family}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onUpdateSelectedBox({ fontSize: Math.max(8, selectedBox.fontSize - 2) })}
              className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-bold text-slate-700 cursor-pointer"
              title="ลดขนาดตัวอักษร"
            >
              -
            </button>
            <span className="text-xs font-bold text-slate-800 w-6 text-center">
              {selectedBox.fontSize}
            </span>
            <button
              onClick={() => onUpdateSelectedBox({ fontSize: Math.min(96, selectedBox.fontSize + 2) })}
              className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-bold text-slate-700 cursor-pointer"
              title="เพิ่มขนาดตัวอักษร"
            >
              +
            </button>
          </div>

          <div className="h-5 w-px bg-slate-300" />

          {/* Bold & Italic */}
          <button
            onClick={() =>
              onUpdateSelectedBox({
                fontWeight: selectedBox.fontWeight === 'bold' ? 'normal' : 'bold',
              })
            }
            className={`p-1 rounded ${
              selectedBox.fontWeight === 'bold'
                ? 'bg-blue-100 text-blue-700 font-bold border border-blue-300'
                : 'text-slate-600 hover:bg-slate-200'
            } cursor-pointer`}
            title="ตัวหนา"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() =>
              onUpdateSelectedBox({
                fontStyle: selectedBox.fontStyle === 'italic' ? 'normal' : 'italic',
              })
            }
            className={`p-1 rounded ${
              selectedBox.fontStyle === 'italic'
                ? 'bg-blue-100 text-blue-700 italic border border-blue-300'
                : 'text-slate-600 hover:bg-slate-200'
            } cursor-pointer`}
            title="ตัวเอียง"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Alignment */}
          <div className="flex items-center space-x-0.5 bg-white border border-slate-200 rounded p-0.5">
            <button
              onClick={() => onUpdateSelectedBox({ textAlign: 'left' })}
              className={`p-1 rounded ${
                selectedBox.textAlign === 'left' ? 'bg-blue-100 text-blue-700' : 'text-slate-600'
              } cursor-pointer`}
              title="ชิดซ้าย"
            >
              <AlignLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => onUpdateSelectedBox({ textAlign: 'center' })}
              className={`p-1 rounded ${
                selectedBox.textAlign === 'center' ? 'bg-blue-100 text-blue-700' : 'text-slate-600'
              } cursor-pointer`}
              title="กึ่งกลาง"
            >
              <AlignCenter className="w-3 h-3" />
            </button>
            <button
              onClick={() => onUpdateSelectedBox({ textAlign: 'right' })}
              className={`p-1 rounded ${
                selectedBox.textAlign === 'right' ? 'bg-blue-100 text-blue-700' : 'text-slate-600'
              } cursor-pointer`}
              title="ชิดขวา"
            >
              <AlignRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-300" />

          {/* Text Color Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowBgPicker(false);
              }}
              className="flex items-center space-x-1 px-1.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-xs cursor-pointer"
              title="สีตัวอักษร"
            >
              <Palette className="w-3.5 h-3.5 text-slate-600" />
              <div
                className="w-3 h-3 rounded-full border border-slate-400"
                style={{ backgroundColor: selectedBox.color }}
              />
            </button>

            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-2 grid grid-cols-4 gap-1.5 z-50 min-w-[120px]">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdateSelectedBox({ color: c });
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-slate-300 hover:scale-125 transition-transform cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Background Color Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBgPicker(!showBgPicker);
                setShowColorPicker(false);
              }}
              className="flex items-center space-x-1 px-1.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-xs cursor-pointer"
              title="สีพื้นหลังกล่อง"
            >
              <Square className="w-3.5 h-3.5 text-slate-600" />
              <div
                className="w-3 h-3 rounded border border-slate-400"
                style={{
                  backgroundColor:
                    selectedBox.backgroundColor === 'transparent'
                      ? '#fff'
                      : selectedBox.backgroundColor,
                }}
              />
            </button>

            {showBgPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-2 space-y-1 z-50 min-w-[130px]">
                {BG_COLOR_PALETTE.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => {
                      onUpdateSelectedBox({ backgroundColor: bg.value });
                      setShowBgPicker(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2 py-1 hover:bg-slate-100 rounded text-xs text-slate-700 cursor-pointer"
                  >
                    <div
                      className="w-3.5 h-3.5 rounded border border-slate-300"
                      style={{
                        backgroundColor: bg.value === 'transparent' ? '#fff' : bg.value,
                        backgroundImage:
                          bg.value === 'transparent'
                            ? 'linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%)'
                            : 'none',
                      }}
                    />
                    <span>{bg.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Border Width Toggle */}
          <button
            onClick={() =>
              onUpdateSelectedBox({
                borderWidth: selectedBox.borderWidth > 0 ? 0 : 1,
                borderColor: selectedBox.borderWidth > 0 ? 'transparent' : '#3b82f6',
              })
            }
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium border ${
              selectedBox.borderWidth > 0
                ? 'bg-blue-100 border-blue-400 text-blue-700'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
            } cursor-pointer`}
            title="เปิด/ปิด เส้นกรอบกล่อง"
          >
            กรอบ
          </button>

          <div className="h-5 w-px bg-slate-300" />

          {/* Duplicate & Delete */}
          <button
            onClick={onDuplicateSelectedBox}
            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
            title="คัดลอกกล่องนี้"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDeleteSelectedBox}
            className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
            title="ลบกล่องนี้"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-400 italic hidden lg:inline">
          คลิกที่กล่องข้อความเพื่อปรับแต่งฟอนต์ ขนาด และสี
        </div>
      )}

      {/* Group 3: Page Navigation & Zoom */}
      <div className="flex items-center space-x-2">
        {/* Page Switcher */}
        {totalPages > 0 && (
          <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-lg text-xs font-medium text-slate-700">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
              title="หน้าก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
              title="หน้าถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.15))}
            className="p-1 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
            title="ย่อขนาด"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-slate-700 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.15))}
            className="p-1 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
            title="ขยายขนาด"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            className="p-1 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
            title="ขนาด 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
