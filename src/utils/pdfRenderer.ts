// Interface for window.pdfjsLib
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export async function ensurePdfJs(): Promise<any> {
  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    return window.pdfjsLib;
  }

  // If not yet loaded, wait a bit or load dynamically
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.pdfjsLib) {
        clearInterval(interval);
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else if (attempts > 50) {
        clearInterval(interval);
        reject(new Error('ไม่สามารถโหลดไลบรารี PDF.js ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'));
      }
    }, 100);
  });
}

export async function loadPdfDocument(data: Uint8Array | ArrayBuffer): Promise<any> {
  const pdfjs = await ensurePdfJs();
  const loadingTask = pdfjs.getDocument({ data });
  return await loadingTask.promise;
}

export async function renderPageToCanvas(
  pdfDoc: any,
  pageNumber: number, // 1-based
  canvas: HTMLCanvasElement,
  scale: number = 1.5
): Promise<{ width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2d context');

  // Clear previous drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  return {
    width: viewport.width,
    height: viewport.height,
  };
}
