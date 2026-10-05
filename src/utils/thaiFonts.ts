import type { ThaiFontDefinition, ShapePreset } from '../types/pdf';

export const THAI_FONTS: ThaiFontDefinition[] = [
  {
    id: 'sarabun',
    name: 'TH Sarabun (สารบัญ)',
    family: 'Sarabun',
    category: 'ทางการ',
    sampleText: 'มาตรฐานราชการและเอกสารทางการ',
  },
  {
    id: 'itim',
    name: 'Itim (ไอติม)',
    family: 'Itim',
    category: 'น่ารัก/ลายมือ',
    sampleText: 'ฟอนต์ลายมือน่ารัก เหมาะกับแบบฝึกหัดเด็ก',
  },
  {
    id: 'kanit',
    name: 'Kanit (คณิต)',
    family: 'Kanit',
    category: 'โมเดิร์น',
    sampleText: 'ทันสมัย คมชัด ไร้หัว อ่านง่าย',
  },
  {
    id: 'prompt',
    name: 'Prompt (พร้อมท์)',
    family: 'Prompt',
    category: 'โมเดิร์น',
    sampleText: 'สวยงาม เรียบหรู นิยมในงานออกแบบ',
  },
  {
    id: 'mali',
    name: 'Mali (มะลิ)',
    family: 'Mali',
    category: 'น่ารัก/ลายมือ',
    sampleText: 'ลายมือน่ารัก มีหัว โครงสร้างอบอุ่น',
  },
  {
    id: 'mitr',
    name: 'Mitr (มิตร)',
    family: 'Mitr',
    category: 'โมเดิร์น',
    sampleText: 'อ่านง่าย สบายตา สมดุลยอดเยี่ยม',
  },
  {
    id: 'niramit',
    name: 'TH Niramit AS (นิรมิต)',
    family: 'Niramit',
    category: 'ทางการ',
    sampleText: 'คลาสสิก สง่างาม สไตล์หนังสือเรียน',
  },
  {
    id: 'kodchasan',
    name: 'Kodchasan (คชสาร)',
    family: 'Kodchasan',
    category: 'น่ารัก/ลายมือ',
    sampleText: 'ตัวหนังสือโค้งมน สดใส เหมาะกับการศึกษา',
  },
  {
    id: 'chonburi',
    name: 'Chonburi (ชลบุรี)',
    family: 'Chonburi',
    category: 'หัวข้อ',
    sampleText: 'ตัวหนา โดดเด่น สำหรับหัวข้อและชื่อเรื่อง',
  },
  {
    id: 'krub',
    name: 'Krub (ครับ)',
    family: 'Krub',
    category: 'ทางการ',
    sampleText: 'โมเดิร์นกึ่งทางการ คมชัดทุกรายละเอียด',
  },
];

export const SHAPE_PRESETS: ShapePreset[] = [
  { id: 'rectangle', name: 'สี่เหลี่ยมผืนผ้า', iconName: 'Square' },
  { id: 'rounded-rectangle', name: 'สี่เหลี่ยมขอบมน', iconName: 'SquareCode' },
  { id: 'circle', name: 'วงกลม / วงรี', iconName: 'Circle' },
  { id: 'triangle', name: 'สามเหลี่ยม', iconName: 'Triangle' },
  { id: 'star', name: 'ดาว 5 แฉก', iconName: 'Star' },
  { id: 'arrow', name: 'ลูกศรชี้', iconName: 'ArrowRight' },
  { id: 'line', name: 'เส้นตรง', iconName: 'Minus' },
];

export const QUICK_STAMPS = [
  {
    label: 'เครดิต: ครูนภรัฐ',
    text: 'จัดทำโดย: ครูนภรัฐ (ครูต้น)',
    fontFamily: 'Sarabun',
    fontSize: 16,
    color: '#1e3a8a',
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 1,
    isSolidBackground: true,
  },
  {
    label: 'ตรวจแล้ว ✓',
    text: 'ตรวจแล้ว ✓ วันที่ ....................',
    fontFamily: 'Itim',
    fontSize: 20,
    color: '#15803d',
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    borderWidth: 2,
    isSolidBackground: true,
  },
  {
    label: 'ยอดเยี่ยม ★★★',
    text: '★ ยอดเยี่ยมมาก ทำได้ดีมาก! ★',
    fontFamily: 'Itim',
    fontSize: 18,
    color: '#b45309',
    backgroundColor: '#fefce8',
    borderColor: '#eab308',
    borderWidth: 1,
    isSolidBackground: true,
  },
  {
    label: 'กรอกชื่อ-นามสกุล',
    text: 'ชื่อ .......................................... ชั้น ป.6 เลขที่ ......',
    fontFamily: 'Sarabun',
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    isSolidBackground: true,
  },
  {
    label: 'ช่องคะแนน',
    text: 'คะแนนที่ได้ : ........ / 10',
    fontFamily: 'Prompt',
    fontSize: 18,
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 2,
    isSolidBackground: true,
  },
];

export const COLOR_PALETTE = [
  '#000000', // ดำ
  '#1e3a8a', // น้ำเงินเข้ม
  '#2563eb', // ฟ้าคราม
  '#0284c7', // ฟ้าสว่าง
  '#15803d', // เขียวเข้ม
  '#16a34a', // เขียวมรกต
  '#b91c1c', // แดง
  '#dc2626', // แดงสด
  '#d97706', // ส้มอำพัน
  '#7c3aed', // ม่วง
  '#475569', // เทาเข้ม
  '#ffffff', // ขาว
];

export const EXPANDED_COLORS = [
  // มาตรฐาน & สดใส
  { name: 'ดำสนิท', hex: '#000000' },
  { name: 'เทาเข้ม', hex: '#334155' },
  { name: 'เทากลาง', hex: '#64748b' },
  { name: 'เทาเงิน', hex: '#94a3b8' },
  { name: 'ขาวบริสุทธิ์', hex: '#ffffff' },
  { name: 'แดงเข้ม (Crimson)', hex: '#991b1b' },
  { name: 'แดง (Red)', hex: '#ef4444' },
  { name: 'กุหลาบ (Rose)', hex: '#f43f5e' },
  { name: 'ชมพูบานเย็น', hex: '#ec4899' },
  { name: 'ชมพูสด (Pink)', hex: '#f472b6' },
  { name: 'ม่วงเข้ม (Plum)', hex: '#581c87' },
  { name: 'ม่วงลาเวนเดอร์', hex: '#9333ea' },
  { name: 'ม่วงสด (Purple)', hex: '#a855f7' },
  { name: 'ม่วงคราม (Indigo)', hex: '#6366f1' },
  { name: 'น้ำเงินเข้ม (Navy)', hex: '#1e3a8a' },
  { name: 'น้ำเงินหลัก (Royal)', hex: '#2563eb' },
  { name: 'ฟ้าคราม (Blue)', hex: '#3b82f6' },
  { name: 'ฟ้าทะเล (Ocean)', hex: '#0284c7' },
  { name: 'ฟ้าสว่าง (Sky)', hex: '#0ea5e9' },
  { name: 'ฟ้าไอซ์ (Cyan)', hex: '#06b6d4' },
  { name: 'เขียวมิ้นต์ (Teal)', hex: '#14b8a6' },
  { name: 'เขียวเข้ม (Forest)', hex: '#14532d' },
  { name: 'เขียวมรกต (Emerald)', hex: '#16a34a' },
  { name: 'เขียวสด (Green)', hex: '#22c55e' },
  { name: 'เขียวมะนาว (Lime)', hex: '#84cc16' },
  { name: 'เหลืองทอง (Gold)', hex: '#eab308' },
  { name: 'เหลืองสว่าง (Yellow)', hex: '#facc15' },
  { name: 'ส้มอำพัน (Amber)', hex: '#f59e0b' },
  { name: 'ส้มสด (Orange)', hex: '#f97316' },
  { name: 'น้ำตาลดินเผา', hex: '#9a3412' },
  { name: 'น้ำตาลกาแฟ', hex: '#78350f' },
];

export const PASTEL_COLORS = [
  { name: 'แดงพาสเทล', hex: '#fee2e2' },
  { name: 'ส้มพาสเทล', hex: '#ffedd5' },
  { name: 'เหลืองพาสเทล', hex: '#fef9c3' },
  { name: 'เขียวพาสเทล', hex: '#dcfce7' },
  { name: 'มิ้นต์พาสเทล', hex: '#ccfbf1' },
  { name: 'ฟ้าพาสเทล', hex: '#e0f2fe' },
  { name: 'ครามพาสเทล', hex: '#e0e7ff' },
  { name: 'ม่วงพาสเทล', hex: '#f3e8ff' },
  { name: 'ชมพูพาสเทล', hex: '#fce7f3' },
  { name: 'เทาพาสเทล', hex: '#f1f5f9' },
];

export const BG_COLOR_PALETTE = [
  { name: 'โปร่งใส', value: 'transparent' },
  { name: 'ขาวทึบ', value: '#ffffff' },
  { name: 'เหลืองโน้ตทึบ', value: '#fef9c3' },
  { name: 'เขียวอ่อนทึบ', value: '#dcfce7' },
  { name: 'ฟ้าอ่อนทึบ', value: '#e0f2fe' },
  { name: 'ชมพูอ่อนทึบ', value: '#fce7f3' },
  { name: 'ส้มอ่อนทึบ', value: '#ffedd5' },
  { name: 'น้ำเงินเข้มทึบ', value: '#1e3a8a' },
  { name: 'ดำทึบ', value: '#0f172a' },
];
