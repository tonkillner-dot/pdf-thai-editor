import React, { useState } from 'react';
import { Layers, Type, BookOpen, Trash2, Plus } from 'lucide-react';
import type { TextBoxItem } from '../types/pdf';
import { THAI_FONTS } from '../utils/thaiFonts';

interface SidebarProps {
  currentPage: number;
  totalPages: number;
  onPageSelect: (page: number) => void;
  textBoxes: TextBoxItem[];
  selectedBoxId: string | null;
  onSelectBox: (id: string) => void;
  onDeleteBox: (id: string) => void;
  onAddBoxWithFont: (fontFamily: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
          <Type className="w-3.5 h-3.5" />
          <span>ข้อความ ({currentPageBoxes.length})</span>
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
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const pageBoxesCount = textBoxes.filter((b) => b.pageIndex === i).length;
                const isCurrent = pageNum === currentPage;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageSelect(pageNum)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-700'}`}>
                        หน้า {pageNum}
                      </span>
                      {pageBoxesCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-200 text-blue-800 rounded-full font-bold">
                          {pageBoxesCount}
                        </span>
                      )}
                    </div>
                    <div className="w-full aspect-3/4 mt-1.5 rounded border border-slate-200 bg-white flex items-center justify-center text-slate-300 text-xs">
                      {isCurrent ? 'กำลังดู' : `P.${pageNum}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Text Boxes on this page */}
        {activeTab === 'boxes' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-medium px-1">
              กล่องข้อความในหน้า {currentPage}:
            </p>

            {currentPageBoxes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                ยังไม่มีกล่องข้อความในหน้านี้ กดปุ่ม &quot;+ เพิ่มข้อความ&quot; เพื่อเริ่มต้น
              </div>
            ) : (
              currentPageBoxes.map((box, index) => {
                const isSelected = box.id === selectedBoxId;
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
                    <div className="truncate flex-1 pr-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 truncate">
                          {box.text || '(ว่างเปล่า)'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        ฟอนต์: {box.fontFamily} • {box.fontSize}pt
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBox(box.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                      title="ลบกล่องนี้"
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
        <span>รองรับสระ-วรรณยุกต์ไทย 100%</span>
      </div>
    </aside>
  );
};
