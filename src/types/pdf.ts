export type ElementType = 'text' | 'shape' | 'image';
export type ShapeType = 'rectangle' | 'rounded-rectangle' | 'circle' | 'triangle' | 'star' | 'arrow' | 'line';

export interface CanvasItem {
  id: string;
  type: ElementType;
  pageIndex: number; // 0-based page index
  xPercent: number; // 0 to 100 (% of page width)
  yPercent: number; // 0 to 100 (% of page height)
  widthPercent: number; // % of page width
  heightPercent: number; // % of page height
  rotation: number; // 0 to 360 degrees
  opacity: number; // 0 to 1

  // Text specific properties
  text?: string;
  fontFamily?: string;
  fontSize?: number; // base pt size
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;

  // Background Fill & Border (Solid fill, translucent, etc.)
  isSolidBackground?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number; // 0 to 1
  borderWidth?: number; // 0, 1, 2, 4
  borderColor?: string;
  borderRadius?: number;

  // Shape specific properties
  shapeType?: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;

  // Image specific properties
  imageUrl?: string;
  imageFileName?: string;
}

// Backward compatibility alias
export type TextBoxItem = CanvasItem;

export interface ThaiFontDefinition {
  id: string;
  name: string;
  family: string;
  category: 'ทางการ' | 'น่ารัก/ลายมือ' | 'โมเดิร์น' | 'หัวข้อ';
  sampleText: string;
}

export interface ShapePreset {
  id: ShapeType;
  name: string;
  iconName: string;
}
