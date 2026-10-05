import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function createSamplePdf(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 (points)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();

  // Draw header bar
  page.drawRectangle({
    x: 40,
    y: height - 80,
    width: width - 80,
    height: 45,
    color: rgb(0.12, 0.23, 0.54), // #1e3a8a
  });

  page.drawText('Sample Math Worksheet / Document', {
    x: 55,
    y: height - 55,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Thai PDF Editor - Demo Page', {
    x: width - 230,
    y: height - 53,
    size: 11,
    font: font,
    color: rgb(0.75, 0.86, 1),
  });

  // Instruction box
  page.drawRectangle({
    x: 40,
    y: height - 170,
    width: width - 80,
    height: 70,
    color: rgb(0.96, 0.98, 1.0),
    borderColor: rgb(0.75, 0.86, 1.0),
    borderWidth: 1,
  });

  page.drawText('Instructions:', {
    x: 55,
    y: height - 118,
    size: 13,
    font: fontBold,
    color: rgb(0.12, 0.23, 0.54),
  });

  page.drawText('1. Click "Add Text Box" to type any Thai text with authentic fonts.', {
    x: 55,
    y: height - 138,
    size: 11,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText('2. Choose fonts like TH Sarabun, Itim, Kanit, Mali, Niramit etc.', {
    x: 55,
    y: height - 156,
    size: 11,
    font: font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Practice boxes / Problems
  const problemBoxes = [
    { title: 'Question 1: Calculate the area of rectangle', y: height - 260 },
    { title: 'Question 2: Solve 125 x 48 + 350', y: height - 370 },
    { title: 'Question 3: Word Problem Analysis', y: height - 480 },
    { title: 'Teacher Comments & Feedback Zone', y: height - 610 },
  ];

  problemBoxes.forEach((item, index) => {
    // Problem box
    page.drawRectangle({
      x: 40,
      y: item.y,
      width: width - 80,
      height: 90,
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    page.drawText(item.title, {
      x: 55,
      y: item.y + 70,
      size: 12,
      font: fontBold,
      color: rgb(0.15, 0.2, 0.35),
    });

    // Scratch area indicator
    page.drawText(`[ Click here to insert Thai answer or annotations (ข้อ ${index + 1}) ]`, {
      x: 55,
      y: item.y + 35,
      size: 10,
      font: font,
      color: rgb(0.6, 0.65, 0.75),
    });
  });

  // Footer
  page.drawLine({
    start: { x: 40, y: 50 },
    end: { x: width - 40, y: 50 },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.92),
  });

  page.drawText('Thai PDF Editor - Designed for Teachers & Students', {
    x: 40,
    y: 35,
    size: 9,
    font: font,
    color: rgb(0.5, 0.55, 0.65),
  });

  page.drawText('Page 1 of 1', {
    x: width - 90,
    y: 35,
    size: 9,
    font: font,
    color: rgb(0.5, 0.55, 0.65),
  });

  return await pdfDoc.save();
}
