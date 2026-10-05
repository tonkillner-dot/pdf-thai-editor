import React, { useState, useRef, useEffect } from 'react';
import {
  FileUp,
  Sparkles,
  Type,
  FileText,
  Shapes,
  Image as ImageIcon,
  RotateCw,
} from 'lucide-react';
import type { CanvasItem, ShapeType } from './types/pdf';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { CanvasArea } from './components/CanvasArea';
import { ShapesModal } from './components/ShapesModal';
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

  // Canvas elements state (Text, Shapes, Images)
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // History for Undo / Redo
  const [history, setHistory] = useState<CanvasItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modals state
  const [isShapesModalOpen, setIsShapesModalOpen] = useState<boolean>(false);
  const [isStampsModalOpen, setIsStampsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [exportComplete, setExportComplete] = useState<boolean>(false);
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Push to history when canvas items change
  const pushHistory = (newItems: CanvasItem[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newItems]);
    setHistoryIndex(updatedHistory.length);
    setCanvasItems(newItems);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCanvasItems(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCanvasItems(next);
    }
  };

  // Keyboard shortcuts (Delete, Escape, Ctrl+Z, Ctrl+Y, Ctrl+D, Arrow keys nudge)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Deselect on Escape
      if (e.key === 'Escape') {
        setSelectedBoxId(null);
        return;
      }

      // Undo / Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Duplicate shortcut (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedBoxId) {
          e.preventDefault();
          handleDuplicateBox();
        }
        return;
      }

      // If user is actively typing in text box or input, let standard text editing handle it
      if (isInput) return;

      // Delete selected box
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBoxId) {
          e.preventDefault();
          handleDeleteBox(selectedBoxId);
        }
      }

      // Arrow keys nudge selected element position
      if (selectedBoxId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5; // Shift = faster nudge
        const currentItem = canvasItems.find((b) => b.id === selectedBoxId);
        if (!currentItem) return;

        let newX = currentItem.xPercent;
        let newY = currentItem.yPercent;

        if (e.key === 'ArrowUp') newY = Math.max(0, newY - step);
        if (e.key === 'ArrowDown') newY = Math.min(98, newY + step);
        if (e.key === 'ArrowLeft') newX = Math.max(0, newX - step);
        if (e.key === 'ArrowRight') newX = Math.min(98, newX + step);

        handleUpdateBox(selectedBoxId, { xPercent: newX, yPercent: newY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBoxId, canvasItems, historyIndex, history]);

  // Support paste image from clipboard (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!pdfDoc) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              addImageItem(dataUrl, 'รูปภาพวางจากคลิปบอร์ด');
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [pdfDoc, currentPage, canvasItems]);

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
      setCanvasItems([]);
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

      const sampleBoxes: CanvasItem[] = [
        {
          id: 'box-sample-1',
          type: 'text',
          pageIndex: 0,
          xPercent: 12,
          yPercent: 33,
          widthPercent: 76,
          heightPercent: 6,
          rotation: 0,
          text: 'วิธีทำ: พ.ท. สี่เหลี่ยมผืนผ้า = กว้าง x ยาว = 12 x 25 = 300 ตร.ซม.',
          fontFamily: 'Sarabun',
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#1e3a8a',
          backgroundColor: '#eff6ff',
          isSolidBackground: true,
          borderWidth: 1,
          borderColor: '#93c5fd',
          borderRadius: 6,
          textAlign: 'left',
          padding: 8,
          opacity: 1,
        },
        {
          id: 'box-sample-2',
          type: 'text',
          pageIndex: 0,
          xPercent: 12,
          yPercent: 47,
          widthPercent: 76,
          heightPercent: 6,
          rotation: 0,
          text: 'คำนวณ: 125 x 48 = 6,000 จากนั้นบวก 350 ได้ผลลัพธ์คือ 6,350',
          fontFamily: 'Itim',
          fontSize: 18,
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#15803d',
          backgroundColor: '#f0fdf4',
          isSolidBackground: true,
          borderWidth: 1,
          borderColor: '#86efac',
          borderRadius: 6,
          textAlign: 'left',
          padding: 8,
          opacity: 1,
        },
        {
          id: 'shape-sample-star',
          type: 'shape',
          shapeType: 'star',
          pageIndex: 0,
          xPercent: 82,
          yPercent: 62,
          widthPercent: 8,
          heightPercent: 6,
          rotation: 15,
          fillColor: '#f59e0b',
          strokeColor: '#d97706',
          strokeWidth: 2,
          opacity: 1,
        },
      ];
      setCanvasItems(sampleBoxes);
      setHistory([sampleBoxes]);
      setHistoryIndex(0);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการสร้างไฟล์ตัวอย่าง: ${err.message}`);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Handle file input change for PDF
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

  // Handle file input change for Image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addImageItem(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Add Image item
  const addImageItem = (dataUrl: string, fileName: string) => {
    const newItem: CanvasItem = {
      id: `img-${Date.now()}`,
      type: 'image',
      imageUrl: dataUrl,
      imageFileName: fileName,
      pageIndex: currentPage - 1,
      xPercent: 30,
      yPercent: 30,
      widthPercent: 25,
      heightPercent: 15,
      rotation: 0,
      opacity: 1,
    };

    const nextItems = [...canvasItems, newItem];
    pushHistory(nextItems);
    setSelectedBoxId(newItem.id);
  };

  // Add Geometric Shape item
  const handleSelectShape = (shapeType: ShapeType, color: string) => {
    const isLine = shapeType === 'line';
    const newItem: CanvasItem = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType: shapeType,
      pageIndex: currentPage - 1,
      xPercent: 35,
      yPercent: 35,
      widthPercent: isLine ? 30 : 18,
      heightPercent: isLine ? 4 : 12,
      rotation: 0,
      fillColor: isLine ? 'transparent' : color,
      strokeColor: color,
      strokeWidth: 2,
      opacity: 1,
    };

    const nextItems = [...canvasItems, newItem];
    pushHistory(nextItems);
    setSelectedBoxId(newItem.id);
  };

  // Add new text box on current page
  const handleAddTextBox = (customFont: string = 'Sarabun') => {
    const newBox: CanvasItem = {
      id: `box-${Date.now()}`,
      type: 'text',
      pageIndex: currentPage - 1,
      xPercent: 25,
      yPercent: 30 + (canvasItems.length % 5) * 5,
      widthPercent: 50,
      heightPercent: 7,
      rotation: 0,
      text: 'พิมพ์ข้อความภาษาไทยที่นี่...',
      fontFamily: customFont,
      fontSize: 18,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      backgroundColor: '#ffffff',
      isSolidBackground: false,
      borderWidth: 1,
      borderColor: '#94a3b8',
      borderRadius: 6,
      textAlign: 'left',
      padding: 8,
      opacity: 1,
    };

    const nextItems = [...canvasItems, newBox];
    pushHistory(nextItems);
    setSelectedBoxId(newBox.id);
  };

  // Add Whiteout (ลบหรือปิดทับข้อความเดิมใน PDF)
  const handleAddWhiteout = () => {
    const whiteoutBox: CanvasItem = {
      id: `whiteout-${Date.now()}`,
      type: 'text',
      pageIndex: currentPage - 1,
      xPercent: 30,
      yPercent: 30 + (canvasItems.length % 5) * 4,
      widthPercent: 35,
      heightPercent: 5,
      rotation: 0,
      text: '',
      backgroundColor: '#ffffff',
      isSolidBackground: true,
      borderWidth: 0,
      borderColor: 'transparent',
      borderRadius: 2,
      padding: 0,
      opacity: 1,
    };

    const nextItems = [...canvasItems, whiteoutBox];
    pushHistory(nextItems);
    setSelectedBoxId(whiteoutBox.id);
  };

  // Insert math symbol
  const handleInsertMathSymbol = (sym: string) => {
    if (selectedBoxId) {
      const box = canvasItems.find((b) => b.id === selectedBoxId);
      if (box && (box.type === 'text' || !box.type)) {
        handleUpdateBox(selectedBoxId, { text: (box.text || '') + sym });
        return;
      }
    }

    // If none selected, create a new text box with this symbol
    const newBox: CanvasItem = {
      id: `box-${Date.now()}`,
      type: 'text',
      pageIndex: currentPage - 1,
      xPercent: 40,
      yPercent: 35,
      widthPercent: 15,
      heightPercent: 6,
      rotation: 0,
      text: sym,
      fontFamily: 'Prompt',
      fontSize: 22,
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: '#1e3a8a',
      backgroundColor: 'transparent',
      isSolidBackground: false,
      borderWidth: 0,
      borderColor: 'transparent',
      borderRadius: 4,
      textAlign: 'center',
      padding: 4,
      opacity: 1,
    };

    const nextItems = [...canvasItems, newBox];
    pushHistory(nextItems);
    setSelectedBoxId(newBox.id);
  };

  // Fit Width calculation
  const handleFitWidth = () => {
    // Calculate suitable zoom based on available screen space
    const availableWidth = window.innerWidth - 320;
    const standardA4Width = 794; // approx display width at 1.0 zoom
    const targetZoom = Math.max(0.6, Math.min(1.6, availableWidth / standardA4Width));
    setZoom(parseFloat(targetZoom.toFixed(2)));
  };

  // Add quick stamp
  const handleSelectStamp = (stamp: (typeof QUICK_STAMPS)[0]) => {
    const newBox: CanvasItem = {
      id: `stamp-${Date.now()}`,
      type: 'text',
      pageIndex: currentPage - 1,
      xPercent: 30,
      yPercent: 20 + (canvasItems.length % 5) * 6,
      widthPercent: 45,
      heightPercent: 6,
      rotation: 0,
      text: stamp.text,
      fontFamily: stamp.fontFamily,
      fontSize: stamp.fontSize,
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: stamp.color,
      backgroundColor: stamp.backgroundColor,
      isSolidBackground: true,
      borderWidth: stamp.borderWidth,
      borderColor: stamp.borderColor,
      borderRadius: 8,
      textAlign: 'center',
      padding: 8,
      opacity: 1,
    };

    const nextItems = [...canvasItems, newBox];
    pushHistory(nextItems);
    setSelectedBoxId(newBox.id);
  };

  // Update selected box
  const handleUpdateBox = (id: string, updates: Partial<CanvasItem>) => {
    const nextItems = canvasItems.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setCanvasItems(nextItems);
  };

  // Delete box
  const handleDeleteBox = (id: string) => {
    const nextItems = canvasItems.filter((b) => b.id !== id);
    pushHistory(nextItems);
    if (selectedBoxId === id) setSelectedBoxId(null);
  };

  // Duplicate box
  const handleDuplicateBox = () => {
    if (!selectedBoxId) return;
    const box = canvasItems.find((b) => b.id === selectedBoxId);
    if (!box) return;

    const newBox: CanvasItem = {
      ...box,
      id: `${box.type || 'item'}-${Date.now()}`,
      xPercent: Math.min(90, box.xPercent + 3),
      yPercent: Math.min(90, box.yPercent + 3),
    };

    const nextItems = [...canvasItems, newBox];
    pushHistory(nextItems);
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
        canvasItems,
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

  const selectedBox = canvasItems.find((b) => b.id === selectedBoxId) || null;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 overflow-hidden font-sarabun text-slate-800">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Global Header */}
      <Header
        fileName={fileName}
        onUploadClick={() => fileInputRef.current?.click()}
        onLoadSample={handleLoadSample}
        onExportClick={handleExport}
        hasPdf={pdfDoc !== null}
        boxCount={canvasItems.length}
      />

      {/* Main Workspace */}
      {pdfDoc ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Action Toolbar */}
          <Toolbar
            selectedBox={selectedBox}
            onAddTextBox={() => handleAddTextBox('Sarabun')}
            onAddWhiteout={handleAddWhiteout}
            onOpenShapes={() => setIsShapesModalOpen(true)}
            onOpenImageUpload={() => imageInputRef.current?.click()}
            onOpenStamps={() => setIsStampsModalOpen(true)}
            onInsertMathSymbol={handleInsertMathSymbol}
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
            onFitWidth={handleFitWidth}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          {/* Canvas & Sidebar Split */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar (Pages with Live Thumbnails, Layers, Fonts) */}
            <Sidebar
              pdfDoc={pdfDoc}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageSelect={(p) => setCurrentPage(p)}
              textBoxes={canvasItems}
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
              textBoxes={canvasItems}
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
                เพิ่มกล่องข้อความภาษาไทย เติมทึบปิดทับข้อความเดิม หมุนข้อความอิสระ แทรกรูปทรงเรขาคณิต และรูปภาพ สระและวรรณยุกต์ไม่ลอย ไม่ซ้อน พร้อมดาวน์โหลดไฟล์ PDF คุณภาพคมชัด 100%
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-left border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center space-x-1.5 text-blue-600 font-bold text-xs mb-1">
                  <Type className="w-4 h-4" />
                  <span>ฟอนต์ไทย 10 แบบ</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Sarabun, Itim, Kanit สระไม่ลอย ตัดคำอัตโนมัติ
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center space-x-1.5 text-indigo-600 font-bold text-xs mb-1">
                  <Shapes className="w-4 h-4" />
                  <span>รูปทรงเรขาคณิต</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  สี่เหลี่ยม วงกลม สามเหลี่ยม ดาว ลูกศร เส้นตรง
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center space-x-1.5 text-purple-600 font-bold text-xs mb-1">
                  <RotateCw className="w-4 h-4" />
                  <span>หมุน & เติมทึบ</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  หมุน 0-360° เติมพื้นหลังทึบปิดทับข้อความเดิม
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center space-x-1.5 text-emerald-600 font-bold text-xs mb-1">
                  <ImageIcon className="w-4 h-4" />
                  <span>แทรกรูปภาพ</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  อัปโหลดรูป หรือวางภาพจากคลิปบอร์ด (Ctrl+V)
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

      {/* Shapes Modal */}
      <ShapesModal
        isOpen={isShapesModalOpen}
        onClose={() => setIsShapesModalOpen(false)}
        onSelectShape={handleSelectShape}
      />

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
