import React, { useState } from 'react';
import { Layers, Shapes, BookOpen, Trash2, Plus, Image as ImageIcon, Type } from 'lucide-react';
import type { CanvasItem } from '../types/pdf';
import { THAI_FONTS } from '../utils/thaiFonts';
import { PageThumbnail } from './PageThumbnail';

interface SidebarProps {
  pdfDoc?: any;
  currentPage: number;
  totalPages: number;
  onPageSelect: (page: number) => void;
  textBoxes: CanvasItem[];
  selectedBoxId: string | null;
  onSelectBox: (id: string) => void;
  onDeleteBox: (id: string) => void;
  onAddBoxWithFont: (fontFamily: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pdfDoc,
  currentPage,
  totalPages,
  onPageSelect,
  textBoxes,
  selectedBoxId,
  onSelectBox,
  onDeleteBox,
  onAddBoxWithFont,
}) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'boxes' | 'fonts'>('pages');

  const currentPageBoxes = textBoxes.filter((b) => b.pageIndex === currentPage - 1);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none z-10 shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
            activeTab === 'pages'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>หน้า ({totalPages})</span>
        </button>

        <button
          onClick={() => setActiveTab('boxes')}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
            activeTab === 'boxes'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shapes className="w-3.5 h-3.5" />
          <span>เลเยอร์ ({currentPageBoxes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fonts')}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
            activeTab === 'fonts'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>ฟอนต์ไทย</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* TAB 1: Pages */}
        {activeTab === 'pages' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-medium px-1">
              เลือกหน้าที่ต้องการแก้ไข:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const pageBoxesCount = textBoxes.filter((b) => b.pageIndex === i).length;

                return (
                  <PageThumbnail
                    key={pageNum}
                    pdfDoc={pdfDoc}
                    pageNum={pageNum}
                    isSelected={pageNum === currentPage}
                    boxCount={pageBoxesCount}
                    onClick={() => onPageSelect(pageNum)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Layers (Text, Shapes, Images) */}
        {activeTab === 'boxes' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-medium px-1">
              ออบเจกต์ในหน้า {currentPage}:
            </p>

            {currentPageBoxes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                ยังไม่มีข้อมูลในหน้านี้ เลือกเพิ่มข้อความ รูปทรงเรขาคณิต หรือแทรกรูปภาพจากแถบเครื่องมือ
              </div>
            ) : (
              currentPageBoxes.map((box, index) => {
                const isSelected = box.id === selectedBoxId;
                const isShape = box.type === 'shape';
                const isImage = box.type === 'image';

                return (
                  <div
                    key={box.id}
                    onClick={() => onSelectBox(box.id)}
                    className={`p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="truncate flex-1 pr-2 flex items-center space-x-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-600 shrink-0">
                        {isShape ? (
                          <Shapes className="w-3.5 h-3.5 text-indigo-600" />
                        ) : isImage ? (
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Type className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 truncate">
                            {isShape
                              ? `รูปทรง: ${box.shapeType || 'เรขาคณิต'}`
                              : isImage
                              ? `รูปภาพ: ${box.imageFileName || 'รูปภาพ'}`
                              : box.text || '(ว่างเปล่า)'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {box.rotation ? `หมุน ${box.rotation}° • ` : ''}
                          {isShape
                            ? 'เวกเตอร์'
                            : isImage
                            ? 'ภาพแทรก'
                            : `${box.fontFamily || 'Sarabun'} (${box.fontSize || 18}pt)`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBox(box.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: Thai Fonts Catalog */}
        {activeTab === 'fonts' && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-400 font-medium px-1">
              คลิกเพื่อเพิ่มกล่องข้อความด้วยฟอนต์นี้:
            </p>

            {THAI_FONTS.map((font) => (
              <div
                key={font.id}
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">
                    {font.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {font.category}
                  </span>
                </div>
                <div
                  className="text-sm text-slate-700 my-1 py-1 px-1.5 bg-slate-50 rounded"
                  style={{ fontFamily: font.family }}
                >
                  {font.sampleText}
                </div>
                <button
                  onClick={() => onAddBoxWithFont(font.family)}
                  className="w-full mt-1.5 py-1 px-2 bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>ใช้ฟอนต์นี้</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center">
        <span>รองรับหมุน, รูปทรง, รูปภาพ, สระ-วรรณยุกต์ 100%</span>
      </div>
    </aside>
  );
};
