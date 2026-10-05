export interface TextBoxItem {
  id: string;
  pageIndex: number; // 0-based page index
  xPercent: number; // 0 to 100 (% of page width)
  yPercent: number; // 0 to 100 (% of page height)
  widthPercent: number; // % of page width
  heightPercent: number; // % of page height
  text: string;
  fontFamily: string;
  fontSize: number; // base pt size at standard A4 (approx 16 - 36)
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  backgroundColor: string; // e.g. 'transparent', '#ffffff', '#fef08a'
  borderWidth: number; // 0, 1, 2, 4
  borderColor: string;
  borderRadius: number;
  textAlign: 'left' | 'center' | 'right';
  padding: number;
  opacity: number;
}

export interface ThaiFontDefinition {
  id: string;
  name: string;
  family: string;
  category: 'ทางการ' | 'น่ารัก/ลายมือ' | 'โมเดิร์น' | 'หัวข้อ';
  sampleText: string;
}

export interface PageDimension {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export type EditorTool = 'select' | 'addText' | 'draw' | 'stamp';
