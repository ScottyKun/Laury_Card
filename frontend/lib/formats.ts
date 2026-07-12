export type CardFormat = {
  id: string;
  label: string;
  widthPx: number;
  heightPx: number;
};

export const FORMATS: CardFormat[] = [
  { id: "a3", label: "A3", widthPx: 841, heightPx: 1191 },
  { id: "a4", label: "A4", widthPx: 595, heightPx: 842 },
  { id: "a5", label: "A5", widthPx: 420, heightPx: 595 },
  { id: "square", label: "Carré", widthPx: 500, heightPx: 500 },
];

// 1 cm = 28.35px à 72 DPI
export const CM_TO_PX = 28.35;