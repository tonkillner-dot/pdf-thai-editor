import React, { useState, useRef } from 'react';
import {
  FileUp,
  Sparkles,
  Type,
  FileText,
  MousePointerClick,
  ShieldCheck,
} from 'lucide-react';
import type { TextBoxItem } from './types/pdf';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { CanvasArea } from './components/CanvasArea';
import { QuickStampsModal } from './components/QuickStampsModal';
import { ExportModal } from './components/ExportModal';
import { loadPdfDocument } from './utils/pdfRenderer';
import { createSamplePdf } from './utils/samplePdf';
import { exportPdfWithOverlays } from './utils/pdfExporter';
import { QUICK_STAMPS } from './utils/thaiFonts';

export const App: React.FC = () => {
  // PDF state
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('sample.pdf');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);

  // Text boxes state
  const [textBoxes, setTextBoxes] = useState<TextBoxItem[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // History for Undo / Redo
  const [history, setHistory] = useState<TextBoxItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modals state
  const [isStampsModalOpen, setIsStampsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [exportComplete, setExportComplete] = useState<boolean>(false);
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Push to history when text boxes change (debounced or explicit)
  const pushHistory = (newBoxes: TextBoxItem[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newBoxes]);
    setHistoryIndex(updatedHistory.length);
    setTextBoxes(newBoxes);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setTextBoxes(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setTextBoxes(next);
    }
  };

  // Load PDF file from array buffer
  const loadPdf = async (buffer: Uint8Array, name: string) => {
    setIsLoadingPdf(true);
    try {
      const doc = await loadPdfDocument(buffer);
      setPdfBytes(buffer);
      setPdfDoc(doc);
      setFileName(name);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setSelectedBoxId(null);
      setTextBoxes([]);
      setHistory([[]]);
      setHistoryIndex(0);
    } catch (err: any) {
      alert(`ไม่สามารถเปิดไฟล์ PDF ได้: ${err.message || 'ไฟล์อาจเสียหาย'}`);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Load built-in sample PDF
  const handleLoadSample = async () => {
    setIsLoadingPdf(true);
    try {
      const sampleBytes = await createSamplePdf();
      await loadPdf(sampleBytes, 'ใบงานคณิตศาสตร์_ตัวอย่าง.pdf');

      // Add a couple default sample text boxes
      const sampleBoxes: TextBoxItem[] = [
        {
          id: 'box-sample-1',
          pageIndex: 0,
          xPercent: 12,
          yPercent: 33,
          widthPercent: 76,
          heightPercent: 6,
          text: 'วิธีทำ: พ.ท. สี่เหลี่ยมผืนผ้า = กว้าง x ยาว = 12 x 25 = 300 ตร.ซม.',
          fontFamily: 'Sarabun',
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#1e3a8a',
          backgroundColor: '#eff6ff',
          borderWidth: 1,
          borderColor: '#93c5fd',
          borderRadius: 6,
          textAlign: 'left',
          padding: 8,
          opacity: 1,
        },
        {
          id: 'box-sample-2',
          pageIndex: 0,
          xPercent: 12,
          yPercent: 47,
          widthPercent: 76,
          heightPercent: 6,
          text: 'คำนวณ: 125 x 48 = 6,000 จากนั้นบวก 350 ได้ผลลัพธ์คือ 6,350',
          fontFamily: 'Itim',
          fontSize: 18,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#15803d',
          backgroundColor: '#f0fdf4',
          borderWidth: 1,
          borderColor: '#86efac',
          borderRadius: 6,
          textAlign: 'left',
          padding: 8,
          opacity: 1,
        },
      ];
      setTextBoxes(sampleBoxes);
      setHistory([sampleBoxes]);
      setHistoryIndex(0);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการสร้างไฟล์ตัวอย่าง: ${err.message}`);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('กรุณาเลือกไฟล์ PDF เท่านั้น');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      loadPdf(new Uint8Array(arrayBuffer), file.name);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Add new text box on current page
  const handleAddTextBox = (customFont: string = 'Sarabun') => {
    const newBox: TextBoxItem = {
      id: `box-${Date.now()}`,
      pageIndex: currentPage - 1,
      xPercent: 25,
      yPercent: 30 + (textBoxes.length % 5) * 5,
      widthPercent: 50,
      heightPercent: 7,
      text: 'พิมพ์ข้อความภาษาไทยที่นี่...',
      fontFamily: customFont,
      fontSize: 18,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#94a3b8',
      borderRadius: 6,
      textAlign: 'left',
      padding: 8,
      opacity: 1,
    };

    const nextBoxes = [...textBoxes, newBox];
    pushHistory(nextBoxes);
    setSelectedBoxId(newBox.id);
  };

  // Add quick stamp
  const handleSelectStamp = (stamp: (typeof QUICK_STAMPS)[0]) => {
    const newBox: TextBoxItem = {
      id: `stamp-${Date.now()}`,
      pageIndex: currentPage - 1,
      xPercent: 30,
      yPercent: 20 + (textBoxes.length % 5) * 6,
      widthPercent: 45,
      heightPercent: 6,
      text: stamp.text,
      fontFamily: stamp.fontFamily,
      fontSize: stamp.fontSize,
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: stamp.color,
      backgroundColor: stamp.backgroundColor,
      borderWidth: stamp.borderWidth,
      borderColor: stamp.borderColor,
      borderRadius: 8,
      textAlign: 'center',
      padding: 8,
      opacity: 1,
    };

    const nextBoxes = [...textBoxes, newBox];
    pushHistory(nextBoxes);
    setSelectedBoxId(newBox.id);
  };

  // Update selected box
  const handleUpdateBox = (id: string, updates: Partial<TextBoxItem>) => {
    const nextBoxes = textBoxes.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setTextBoxes(nextBoxes);
    // update history when relevant
  };

  // Delete box
  const handleDeleteBox = (id: string) => {
    const nextBoxes = textBoxes.filter((b) => b.id !== id);
    pushHistory(nextBoxes);
    if (selectedBoxId === id) setSelectedBoxId(null);
  };

  // Duplicate box
  const handleDuplicateBox = () => {
    if (!selectedBoxId) return;
    const box = textBoxes.find((b) => b.id === selectedBoxId);
    if (!box) return;

    const newBox: TextBoxItem = {
      ...box,
      id: `box-${Date.now()}`,
      xPercent: Math.min(90, box.xPercent + 3),
      yPercent: Math.min(90, box.yPercent + 3),
    };

    const nextBoxes = [...textBoxes, newBox];
    pushHistory(nextBoxes);
    setSelectedBoxId(newBox.id);
  };

  // Export to PDF
  const handleExport = async () => {
    if (!pdfBytes) return;

    setIsExportModalOpen(true);
    setExportProgress(10);
    setExportStatusText('กำลังเตรียมข้อมูลเอกสาร...');
    setExportComplete(false);
    setExportDownloadUrl(null);

    try {
      const finalBytes = await exportPdfWithOverlays(
        pdfBytes,
        textBoxes,
        (progress, status) => {
          setExportProgress(progress);
          setExportStatusText(status);
        }
      );

      const blob = new Blob([finalBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setExportDownloadUrl(url);
      setExportComplete(true);
    } catch (err: any) {
      console.error(err);
      alert(`การส่งออก PDF ล้มเหลว: ${err.message}`);
      setIsExportModalOpen(false);
    }
  };

  const selectedBox = textBoxes.find((b) => b.id === selectedBoxId) || null;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 overflow-hidden font-sarabun text-slate-800">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Global Header */}
      <Header
        fileName={fileName}
        onUploadClick={() => fileInputRef.current?.click()}
        onLoadSample={handleLoadSample}
        onExportClick={handleExport}
        hasPdf={pdfDoc !== null}
        boxCount={textBoxes.length}
      />

      {/* Main Workspace */}
      {pdfDoc ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Action Toolbar */}
          <Toolbar
            selectedBox={selectedBox}
            onAddTextBox={() => handleAddTextBox('Sarabun')}
            onOpenStamps={() => setIsStampsModalOpen(true)}
            onUpdateSelectedBox={(updates) => {
              if (selectedBoxId) handleUpdateBox(selectedBoxId, updates);
            }}
            onDeleteSelectedBox={() => {
              if (selectedBoxId) handleDeleteBox(selectedBoxId);
            }}
            onDuplicateSelectedBox={handleDuplicateBox}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
            zoom={zoom}
            onZoomChange={(z) => setZoom(z)}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          {/* Canvas & Sidebar Split */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar (Pages, Layers, Fonts) */}
            <Sidebar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageSelect={(p) => setCurrentPage(p)}
              textBoxes={textBoxes}
              selectedBoxId={selectedBoxId}
              onSelectBox={(id) => setSelectedBoxId(id)}
              onDeleteBox={(id) => handleDeleteBox(id)}
              onAddBoxWithFont={(font) => handleAddTextBox(font)}
            />

            {/* Canvas Area */}
            <CanvasArea
              pdfDoc={pdfDoc}
              currentPage={currentPage}
              zoom={zoom}
              textBoxes={textBoxes}
              selectedBoxId={selectedBoxId}
              onSelectBox={(id) => setSelectedBoxId(id)}
              onUpdateBox={handleUpdateBox}
              onDeleteBox={handleDeleteBox}
              isLoading={isLoadingPdf}
            />
          </div>
        </div>
      ) : (
        /* Empty / Welcome Landing Screen */
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <FileText className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                โปรแกรมแก้ไขเอกสาร PDF ภาษาไทย
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                เพิ่มกล่องข้อความภาษาไทยได้อย่างอิสระ เลือกฟอนต์ไทยแท้ได้ตามใจชอบ เช่น TH Sarabun, Itim, Kanit, Prompt, Mali สระและวรรณยุกต์ไม่ลอย ไม่ซ้อน พร้อมดาวน์โหลดไฟล์ PDF ที่คงความคมชัด 100%
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <FileUp className="w-5 h-5" />
                <span>เปิดไฟล์ PDF จากคอมพิวเตอร์</span>
              </button>

              <button
                onClick={handleLoadSample}
                className="w-full sm:w-auto px-6 py-3 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-300 font-bold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>ทดลองด้วยไฟล์ตัวอย่าง (1-คลิก)</span>
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs mb-1">
                  <Type className="w-4 h-4" />
                  <span>ฟอนต์ไทย 10 แบบ</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  มีทั้งฟอนต์ทางการ ลายมือเด็ก และโมเดิร์น สระ-วรรณยุกต์คมชัดสมบูรณ์
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center space-x-2 text-green-600 font-bold text-xs mb-1">
                  <MousePointerClick className="w-4 h-4" />
                  <span>ปรับแต่งอิสระ</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  ลากย้าย ปรับขนาด หมุน เปลี่ยนสีพื้นหลัง สีตัวอักษร และใส่สแตมป์ตรวจ
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center space-x-2 text-purple-600 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>รักษาต้นฉบับ 100%</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  ส่งออกเป็น PDF คุณภาพสูง ฝังเลเยอร์ตัวหนังสือคมชัด ไม่บีบอัดภาพเดิม
                </p>
              </div>
            </div>

            {/* Footer Credit */}
            <div className="text-xs text-slate-400 pt-2 flex items-center justify-center space-x-2">
              <span>ระบบจัดทำและพัฒนาสำหรับคุณครูและนักเรียน</span>
              <span>•</span>
              <span className="font-semibold text-slate-600">ครูนภรัฐ</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stamps Modal */}
      <QuickStampsModal
        isOpen={isStampsModalOpen}
        onClose={() => setIsStampsModalOpen(false)}
        onSelectStamp={handleSelectStamp}
      />

      {/* Export / Download Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        progress={exportProgress}
        statusText={exportStatusText}
        isComplete={exportComplete}
        downloadUrl={exportDownloadUrl}
        fileName={fileName.replace(/\.pdf$/i, '') + '_แก้ไขแล้ว.pdf'}
      />
    </div>
  );
};

export default App;
