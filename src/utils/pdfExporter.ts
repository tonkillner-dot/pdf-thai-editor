import { PDFDocument } from 'pdf-lib';
import type { TextBoxItem } from '../types/pdf';

// Thai text word wrapping using Intl.Segmenter
export function wrapThaiText(
  text: string,
  ctx: CanvasRenderingContext2D,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const rawParagraphs = text.split('\n');

  let segmenter: any = null;
  if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
    try {
      segmenter = new (Intl as any).Segmenter('th', { granularity: 'word' });
    } catch (e) {
      segmenter = null;
    }
  }

  for (const para of rawParagraphs) {
    if (!para) {
      lines.push('');
      continue;
    }

    let words: string[] = [];
    if (segmenter) {
      const segments = Array.from(segmenter.segment(para));
      words = segments.map((s: any) => s.segment);
    } else {
      words = para.split(' ');
    }

    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

// Draw a single text box onto a 2D canvas context at specified scale
export function drawTextBoxOnCanvas(
  ctx: CanvasRenderingContext2D,
  box: TextBoxItem,
  pageWidth: number,
  pageHeight: number
) {
  const x = (box.xPercent / 100) * pageWidth;
  const y = (box.yPercent / 100) * pageHeight;
  const width = (box.widthPercent / 100) * pageWidth;
  const height = (box.heightPercent / 100) * pageHeight;

  // Scaling factor relative to typical 800px display width
  const scaleFactor = pageWidth / 800;
  const scaledFontSize = Math.max(10, box.fontSize * scaleFactor);
  const padding = (box.padding || 8) * scaleFactor;
  const borderRadius = (box.borderRadius || 6) * scaleFactor;
  const borderWidth = (box.borderWidth || 0) * scaleFactor;

  ctx.save();
  ctx.globalAlpha = box.opacity ?? 1;

  // Background and border
  if (box.backgroundColor && box.backgroundColor !== 'transparent') {
    ctx.fillStyle = box.backgroundColor;
    roundRect(ctx, x, y, width, height, borderRadius);
    ctx.fill();
  }

  if (borderWidth > 0 && box.borderColor) {
    ctx.strokeStyle = box.borderColor;
    ctx.lineWidth = borderWidth;
    roundRect(ctx, x, y, width, height, borderRadius);
    ctx.stroke();
  }

  // Text setup
  const fontStyle = box.fontStyle === 'italic' ? 'italic' : 'normal';
  const fontWeight = box.fontWeight === 'bold' ? 'bold' : 'normal';
  ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px '${box.fontFamily}', 'Sarabun', sans-serif`;
  ctx.fillStyle = box.color || '#000000';
  ctx.textBaseline = 'top';

  const maxTextWidth = Math.max(10, width - padding * 2);
  const lines = wrapThaiText(box.text || '', ctx, maxTextWidth);
  const lineHeight = scaledFontSize * 1.35;

  let startY = y + padding;

  for (const line of lines) {
    let startX = x + padding;
    if (box.textAlign === 'center') {
      const lineWidth = ctx.measureText(line).width;
      startX = x + (width - lineWidth) / 2;
    } else if (box.textAlign === 'right') {
      const lineWidth = ctx.measureText(line).width;
      startX = x + width - padding - lineWidth;
    }

    ctx.fillText(line, startX, startY);
    startY += lineHeight;
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Export modified PDF preserving original vector content and overlaying Thai text
 */
export async function exportPdfWithOverlays(
  originalPdfBytes: Uint8Array,
  textBoxes: TextBoxItem[],
  onProgress?: (progress: number, status: string) => void
): Promise<Uint8Array> {
  onProgress?.(10, 'กำลังโหลดเอกสาร PDF...');
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  const pageCount = pdfDoc.getPageCount();

  // Resolution multiplier for crystal-sharp print quality (3x = ~300 DPI)
  const exportScale = 3.0;

  for (let i = 0; i < pageCount; i++) {
    const pageProgress = Math.round(15 + ((i + 1) / pageCount) * 70);
    onProgress?.(pageProgress, `กำลังจัดรูปแบบและฝังฟอนต์ไทยหน้าที่ ${i + 1} จาก ${pageCount}...`);

    const pageBoxes = textBoxes.filter((b) => b.pageIndex === i);
    if (pageBoxes.length === 0) {
      continue;
    }

    const page = pdfDoc.getPage(i);
    const { width: ptWidth, height: ptHeight } = page.getSize();

    // Create high-res offscreen canvas
    const canvasWidth = Math.round(ptWidth * exportScale);
    const canvasHeight = Math.round(ptHeight * exportScale);

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    // Draw all text boxes on this page
    for (const box of pageBoxes) {
      drawTextBoxOnCanvas(ctx, box, canvasWidth, canvasHeight);
    }

    // Convert to PNG blob
    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    );

    if (pngBlob) {
      const pngBuffer = await pngBlob.arrayBuffer();
      const pngImage = await pdfDoc.embedPng(new Uint8Array(pngBuffer));

      // Draw overlay image onto page
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: ptWidth,
        height: ptHeight,
      });
    }
  }

  onProgress?.(95, 'กำลังบันทึกและสร้างไฟล์ PDF ขั้นสุดท้าย...');
  const finalPdfBytes = await pdfDoc.save();
  onProgress?.(100, 'เสร็จสมบูรณ์!');
  return finalPdfBytes;
}
