import { PDFDocument } from 'pdf-lib';
import type { CanvasItem } from '../types/pdf';

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
    } catch {
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

// Draw a geometric shape onto canvas
function drawShape(
  ctx: CanvasRenderingContext2D,
  box: CanvasItem,
  x: number,
  y: number,
  w: number,
  h: number,
  scaleFactor: number
) {
  const shape = box.shapeType || 'rectangle';
  const fillColor = box.fillColor || box.backgroundColor || '#3b82f6';
  const strokeColor = box.strokeColor || box.borderColor || '#1d4ed8';
  const strokeWidth = (box.strokeWidth ?? box.borderWidth ?? 2) * scaleFactor;

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;

  ctx.beginPath();

  if (shape === 'rectangle') {
    ctx.rect(x, y, w, h);
  } else if (shape === 'rounded-rectangle') {
    roundRect(ctx, x, y, w, h, (box.borderRadius || 12) * scaleFactor);
  } else if (shape === 'circle') {
    ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
  } else if (shape === 'triangle') {
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  } else if (shape === 'star') {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const outerR = Math.min(w, h) / 2;
    const innerR = outerR * 0.4;
    const spikes = 5;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.closePath();
  } else if (shape === 'arrow') {
    const headW = w * 0.35;
    const stemH = h * 0.4;
    const stemTop = y + (h - stemH) / 2;
    const stemBottom = stemTop + stemH;

    ctx.moveTo(x, stemTop);
    ctx.lineTo(x + w - headW, stemTop);
    ctx.lineTo(x + w - headW, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w - headW, y + h);
    ctx.lineTo(x + w - headW, stemBottom);
    ctx.lineTo(x, stemBottom);
    ctx.closePath();
  } else if (shape === 'line') {
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
  }

  if (shape !== 'line') {
    if (fillColor && fillColor !== 'transparent') {
      ctx.fill();
    }
  }

  if (strokeWidth > 0 && strokeColor && strokeColor !== 'transparent') {
    ctx.stroke();
  }
}

// Draw a single element (Text, Shape, Image) on canvas with rotation and styles
export async function drawItemOnCanvas(
  ctx: CanvasRenderingContext2D,
  item: CanvasItem,
  pageWidth: number,
  pageHeight: number
) {
  const x = (item.xPercent / 100) * pageWidth;
  const y = (item.yPercent / 100) * pageHeight;
  const width = (item.widthPercent / 100) * pageWidth;
  const height = (item.heightPercent / 100) * pageHeight;

  // Center point for rotation
  const cx = x + width / 2;
  const cy = y + height / 2;

  const scaleFactor = pageWidth / 800;

  ctx.save();
  ctx.globalAlpha = item.opacity ?? 1;

  // Apply rotation if any
  if (item.rotation && item.rotation !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  if (item.type === 'shape') {
    drawShape(ctx, item, x, y, width, height, scaleFactor);
  } else if (item.type === 'image' && item.imageUrl) {
    // Draw image
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, x, y, width, height);
        resolve();
      };
      img.onerror = () => {
        resolve();
      };
      img.src = item.imageUrl!;
    });
  } else {
    // Text item
    const scaledFontSize = Math.max(10, (item.fontSize || 18) * scaleFactor);
    const padding = (item.padding || 8) * scaleFactor;
    const borderRadius = (item.borderRadius || 6) * scaleFactor;
    const borderWidth = (item.borderWidth || 0) * scaleFactor;

    // Solid or background fill
    if (item.backgroundColor && item.backgroundColor !== 'transparent') {
      ctx.fillStyle = item.backgroundColor;
      roundRect(ctx, x, y, width, height, borderRadius);
      ctx.fill();
    }

    if (borderWidth > 0 && item.borderColor && item.borderColor !== 'transparent') {
      ctx.strokeStyle = item.borderColor;
      ctx.lineWidth = borderWidth;
      roundRect(ctx, x, y, width, height, borderRadius);
      ctx.stroke();
    }

    // Text typography
    const fontStyle = item.fontStyle === 'italic' ? 'italic' : 'normal';
    const fontWeight = item.fontWeight === 'bold' ? 'bold' : 'normal';
    ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px '${item.fontFamily || 'Sarabun'}', 'Sarabun', sans-serif`;
    ctx.fillStyle = item.color || '#000000';
    ctx.textBaseline = 'top';

    const maxTextWidth = Math.max(10, width - padding * 2);
    const lines = wrapThaiText(item.text || '', ctx, maxTextWidth);
    const lineHeight = scaledFontSize * 1.35;

    let startY = y + padding;

    for (const line of lines) {
      let startX = x + padding;
      if (item.textAlign === 'center') {
        const lineWidth = ctx.measureText(line).width;
        startX = x + (width - lineWidth) / 2;
      } else if (item.textAlign === 'right') {
        const lineWidth = ctx.measureText(line).width;
        startX = x + width - padding - lineWidth;
      }

      ctx.fillText(line, startX, startY);
      startY += lineHeight;
    }
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
 * Export modified PDF preserving original vector content and overlaying elements
 */
export async function exportPdfWithOverlays(
  originalPdfBytes: Uint8Array,
  items: CanvasItem[],
  onProgress?: (progress: number, status: string) => void
): Promise<Uint8Array> {
  onProgress?.(10, 'กำลังโหลดเอกสาร PDF...');
  const pdfDoc = await PDFDocument.load(originalPdfBytes);
  const pageCount = pdfDoc.getPageCount();

  // Resolution multiplier for print quality (3x = ~300 DPI)
  const exportScale = 3.0;

  for (let i = 0; i < pageCount; i++) {
    const pageProgress = Math.round(15 + ((i + 1) / pageCount) * 70);
    onProgress?.(pageProgress, `กำลังจัดเตรียมหน้าที่ ${i + 1} จาก ${pageCount} (รูปภาพ/รูปทรง/ข้อความ)...`);

    const pageItems = items.filter((b) => b.pageIndex === i);
    if (pageItems.length === 0) {
      continue;
    }

    const page = pdfDoc.getPage(i);
    const { width: ptWidth, height: ptHeight } = page.getSize();

    const canvasWidth = Math.round(ptWidth * exportScale);
    const canvasHeight = Math.round(ptHeight * exportScale);

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    // Draw all items sequentially
    for (const item of pageItems) {
      await drawItemOnCanvas(ctx, item, canvasWidth, canvasHeight);
    }

    // Convert to PNG blob
    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    );

    if (pngBlob) {
      const pngBuffer = await pngBlob.arrayBuffer();
      const pngImage = await pdfDoc.embedPng(new Uint8Array(pngBuffer));

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
