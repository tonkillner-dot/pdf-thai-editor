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
  Shapes,
  Image as ImageIcon,
  RotateCw,
  Pipette,
} from 'lucide-react';
import type { CanvasItem } from '../types/pdf';
import {
  THAI_FONTS,
  EXPANDED_COLORS,
  PASTEL_COLORS,
  BG_COLOR_PALETTE,
} from '../utils/thaiFonts';

interface ToolbarProps {
  selectedBox: CanvasItem | null;
  onAddTextBox: () => void;
  onOpenShapes: () => void;
  onOpenImageUpload: () => void;
  onOpenStamps: () => void;
  onUpdateSelectedBox: (updates: Partial<CanvasItem>) => void;
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
  onOpenShapes,
  onOpenImageUpload,
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
  const [showShapeFillPicker, setShowShapeFillPicker] = useState(false);
  const [showShapeStrokePicker, setShowShapeStrokePicker] = useState(false);

  const isText = selectedBox && (selectedBox.type === 'text' || !selectedBox.type);
  const isShape = selectedBox && selectedBox.type === 'shape';

  return (
    <div className="w-full bg-white border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs z-10">
      {/* Group 1: Primary Insertion Tools */}
      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
        <button
          onClick={onAddTextBox}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
          title="เพิ่มกล่องข้อความภาษาไทย"
        >
          <Plus className="w-4 h-4" />
          <span>ข้อความ</span>
        </button>

        <button
          onClick={onOpenShapes}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
          title="เพิ่มรูปทรงเรขาคณิต เช่น สี่เหลี่ยม วงกลม สามเหลี่ยม ลูกศร ดาว"
        >
          <Shapes className="w-4 h-4 text-indigo-600" />
          <span>รูปทรงเรขาคณิต</span>
        </button>

        <button
          onClick={onOpenImageUpload}
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
          title="แทรกรูปภาพจากเครื่อง (PNG, JPG)"
        >
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>แทรกรูปภาพ</span>
        </button>

        <button
          onClick={onOpenStamps}
          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
          title="สแตมป์สำเร็จรูป เช่น ตรวจแล้ว, ครูนภรัฐ"
        >
          <Stamp className="w-4 h-4 text-amber-600" />
          <span>สแตมป์</span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Undo / Redo */}
        <div className="flex items-center space-x-0.5">
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
      </div>

      {/* Group 2: Contextual Element Formatter */}
      {selectedBox ? (
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-50 border border-blue-200 px-2 py-1 rounded-lg">
          {/* TEXT FORMATTING */}
          {isText && (
            <>
              {/* Font Selector */}
              <div className="flex items-center space-x-1">
                <select
                  value={selectedBox.fontFamily || 'Sarabun'}
                  onChange={(e) => onUpdateSelectedBox({ fontFamily: e.target.value })}
                  className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-blue-500 cursor-pointer min-w-[120px]"
                  style={{ fontFamily: selectedBox.fontFamily || 'Sarabun' }}
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
                  onClick={() => onUpdateSelectedBox({ fontSize: Math.max(8, (selectedBox.fontSize || 18) - 2) })}
                  className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-bold text-slate-700 cursor-pointer"
                  title="ลดขนาดตัวอักษร"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-800 w-6 text-center">
                  {selectedBox.fontSize || 18}
                </span>
                <button
                  onClick={() => onUpdateSelectedBox({ fontSize: Math.min(96, (selectedBox.fontSize || 18) + 2) })}
                  className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-bold text-slate-700 cursor-pointer"
                  title="เพิ่มขนาดตัวอักษร"
                >
                  +
                </button>
              </div>

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
                    style={{ backgroundColor: selectedBox.color || '#000000' }}
                  />
                </button>

                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50 min-w-[220px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700">เลือกสีตัวอักษร</span>
                      <label className="flex items-center space-x-1 text-[10px] text-blue-600 cursor-pointer">
                        <Pipette className="w-3 h-3" />
                        <span>จานสี</span>
                        <input
                          type="color"
                          value={selectedBox.color || '#000000'}
                          onChange={(e) => onUpdateSelectedBox({ color: e.target.value })}
                          className="w-4 h-4 cursor-pointer border-0 p-0 bg-transparent"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 max-h-36 overflow-y-auto p-1">
                      {EXPANDED_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            onUpdateSelectedBox({ color: c.hex });
                            setShowColorPicker(false);
                          }}
                          className="w-5 h-5 rounded-full border border-slate-300 hover:scale-125 transition-transform cursor-pointer"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Solid Fill & Background Color */}
              <div className="relative flex items-center space-x-1">
                <button
                  onClick={() => {
                    const isCurrentlyTransparent =
                      !selectedBox.backgroundColor || selectedBox.backgroundColor === 'transparent';
                    onUpdateSelectedBox({
                      backgroundColor: isCurrentlyTransparent ? '#ffffff' : 'transparent',
                      isSolidBackground: isCurrentlyTransparent,
                    });
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                    selectedBox.backgroundColor && selectedBox.backgroundColor !== 'transparent'
                      ? 'bg-amber-100 border-amber-400 text-amber-800'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="เปิด/ปิด เติมทึบพื้นหลัง (ช่วยปิดทับข้อความเดิมหรือทำไฮไลต์)"
                >
                  เติมทึบ
                </button>

                <button
                  onClick={() => {
                    setShowBgPicker(!showBgPicker);
                    setShowColorPicker(false);
                  }}
                  className="flex items-center space-x-1 px-1.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-xs cursor-pointer"
                  title="เลือกสีพื้นหลังทึบ"
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
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-2 space-y-1 z-50 min-w-[140px]">
                    {BG_COLOR_PALETTE.map((bg) => (
                      <button
                        key={bg.value}
                        onClick={() => {
                          onUpdateSelectedBox({
                            backgroundColor: bg.value,
                            isSolidBackground: bg.value !== 'transparent',
                          });
                          setShowBgPicker(false);
                        }}
                        className="w-full flex items-center space-x-2 px-2 py-1 hover:bg-slate-100 rounded text-xs text-slate-700 cursor-pointer"
                      >
                        <div
                          className="w-3.5 h-3.5 rounded border border-slate-300"
                          style={{
                            backgroundColor: bg.value === 'transparent' ? '#fff' : bg.value,
                          }}
                        />
                        <span>{bg.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ADVANCED SHAPE FORMATTING */}
          {isShape && (
            <div className="flex items-center space-x-2 flex-wrap">
              {/* Shape Fill Color */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowShapeFillPicker(!showShapeFillPicker);
                    setShowShapeStrokePicker(false);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  title="เลือกสีพื้นรูปทรง (Fill)"
                >
                  <span className="text-slate-600">สีพื้น:</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-slate-400 shadow-xs"
                    style={{
                      backgroundColor:
                        selectedBox.fillColor || selectedBox.backgroundColor || '#3b82f6',
                    }}
                  />
                </button>

                {showShapeFillPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-2xl rounded-xl p-3 z-50 min-w-[240px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">สีพื้นรูปทรง</span>
                      <label className="flex items-center space-x-1 text-xs text-blue-600 font-semibold cursor-pointer">
                        <Pipette className="w-3.5 h-3.5" />
                        <span>จานสีอิสระ</span>
                        <input
                          type="color"
                          value={selectedBox.fillColor || '#3b82f6'}
                          onChange={(e) =>
                            onUpdateSelectedBox({
                              fillColor: e.target.value,
                              backgroundColor: e.target.value,
                            })
                          }
                          className="w-4 h-4 cursor-pointer border-0 p-0 bg-transparent"
                        />
                      </label>
                    </div>

                    <p className="text-[10px] text-slate-400 mb-1">สียอดนิยม ({EXPANDED_COLORS.length}):</p>
                    <div className="grid grid-cols-7 gap-1.5 max-h-32 overflow-y-auto p-1 mb-2">
                      {EXPANDED_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            onUpdateSelectedBox({
                              fillColor: c.hex,
                              backgroundColor: c.hex,
                            });
                            setShowShapeFillPicker(false);
                          }}
                          className="w-6 h-6 rounded-md border border-slate-300 hover:scale-120 transition-transform cursor-pointer"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-400 mb-1">สีพาสเทล ({PASTEL_COLORS.length}):</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {PASTEL_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            onUpdateSelectedBox({
                              fillColor: c.hex,
                              backgroundColor: c.hex,
                            });
                            setShowShapeFillPicker(false);
                          }}
                          className="w-7 h-5 rounded-md border border-slate-300 hover:scale-115 transition-transform cursor-pointer"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    {/* Transparent Option */}
                    <button
                      onClick={() => {
                        onUpdateSelectedBox({
                          fillColor: 'transparent',
                          backgroundColor: 'transparent',
                        });
                        setShowShapeFillPicker(false);
                      }}
                      className="w-full mt-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                    >
                      พื้นหลังโปร่งใส (มีเฉพาะเส้นขอบ)
                    </button>
                  </div>
                )}
              </div>

              {/* Shape Stroke / Border Color */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowShapeStrokePicker(!showShapeStrokePicker);
                    setShowShapeFillPicker(false);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  title="เลือกสีเส้นขอบรูปทรง (Stroke)"
                >
                  <span className="text-slate-600">เส้นขอบ:</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs"
                    style={{
                      backgroundColor:
                        selectedBox.strokeColor || selectedBox.borderColor || '#1d4ed8',
                    }}
                  />
                </button>

                {showShapeStrokePicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-2xl rounded-xl p-3 z-50 min-w-[240px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">สีเส้นขอบรูปทรง</span>
                      <label className="flex items-center space-x-1 text-xs text-blue-600 font-semibold cursor-pointer">
                        <Pipette className="w-3.5 h-3.5" />
                        <span>จานสีอิสระ</span>
                        <input
                          type="color"
                          value={selectedBox.strokeColor || '#1d4ed8'}
                          onChange={(e) =>
                            onUpdateSelectedBox({
                              strokeColor: e.target.value,
                              borderColor: e.target.value,
                            })
                          }
                          className="w-4 h-4 cursor-pointer border-0 p-0 bg-transparent"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 max-h-36 overflow-y-auto p-1">
                      {EXPANDED_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            onUpdateSelectedBox({
                              strokeColor: c.hex,
                              borderColor: c.hex,
                            });
                            setShowShapeStrokePicker(false);
                          }}
                          className="w-6 h-6 rounded-md border border-slate-300 hover:scale-120 transition-transform cursor-pointer"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        onUpdateSelectedBox({
                          strokeWidth: 0,
                          borderWidth: 0,
                          strokeColor: 'transparent',
                        });
                        setShowShapeStrokePicker(false);
                      }}
                      className="w-full mt-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                    >
                      ไม่มีเส้นขอบ (ไร้ขอบ)
                    </button>
                  </div>
                )}
              </div>

              {/* Stroke Width */}
              <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                <span className="text-[10px] text-slate-500 font-bold">หนา:</span>
                {[1, 2, 4, 6].map((w) => (
                  <button
                    key={w}
                    onClick={() => onUpdateSelectedBox({ strokeWidth: w, borderWidth: w })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      (selectedBox.strokeWidth ?? selectedBox.borderWidth ?? 2) === w
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>

              {/* Opacity Selector */}
              <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                <span className="text-[10px] text-slate-500 font-bold">โปร่งใส:</span>
                {[1, 0.75, 0.5, 0.25].map((op) => (
                  <button
                    key={op}
                    onClick={() => onUpdateSelectedBox({ opacity: op })}
                    className={`px-1 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      (selectedBox.opacity ?? 1) === op
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    title={`ความทึบแสง ${Math.round(op * 100)}%`}
                  >
                    {Math.round(op * 100)}%
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-5 w-px bg-slate-300" />

          {/* ROTATION CONTROLS (Common to all elements) */}
          <div className="flex items-center space-x-1">
            <RotateCw className="w-3.5 h-3.5 text-purple-600" />
            <button
              onClick={() => onUpdateSelectedBox({ rotation: ((selectedBox.rotation || 0) + 90) % 360 })}
              className="px-1.5 py-0.5 bg-white border border-slate-300 hover:bg-purple-50 hover:text-purple-700 rounded text-[11px] font-bold text-slate-700 cursor-pointer"
              title="หมุนตามเข็ม 90 องศา"
            >
              +90°
            </button>
            <button
              onClick={() => onUpdateSelectedBox({ rotation: ((selectedBox.rotation || 0) + 45) % 360 })}
              className="px-1.5 py-0.5 bg-white border border-slate-300 hover:bg-purple-50 hover:text-purple-700 rounded text-[11px] font-bold text-slate-700 cursor-pointer"
              title="หมุน 45 องศา"
            >
              +45°
            </button>
            {selectedBox.rotation ? (
              <button
                onClick={() => onUpdateSelectedBox({ rotation: 0 })}
                className="px-1 py-0.5 bg-purple-100 text-purple-700 border border-purple-300 rounded text-[10px] font-bold cursor-pointer"
                title="รีเซ็ตมุมหมุนเป็น 0°"
              >
                0° ({selectedBox.rotation}°)
              </button>
            ) : null}
          </div>

          <div className="h-5 w-px bg-slate-300" />

          {/* Duplicate & Delete */}
          <button
            onClick={onDuplicateSelectedBox}
            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
            title="คัดลอก"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDeleteSelectedBox}
            className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
            title="ลบ"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-400 italic hidden lg:inline">
          คลิกที่ข้อความ รูปทรง หรือรูปภาพเพื่อปรับแต่ง
        </div>
      )}

      {/* Group 3: Page Navigation & Zoom */}
      <div className="flex items-center space-x-2">
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
