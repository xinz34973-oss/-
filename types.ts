// Enums for Modes and Orientation
export enum ViewMode {
  General = 'general',
  House = 'house',
  Ocean = 'ocean',
  Thermometer = 'thermometer'
}

export enum Orientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

// Interface for Control Panel State
export interface ControlState {
  showValues: boolean;
  showDistance: boolean;
  showDescription: boolean;
  showFormula: boolean;
}

// Props for the Draggable Point
export interface PointProps {
  id: 'A' | 'B';
  value: number;
  orientation: Orientation;
  color: string;
  icon?: React.ReactNode;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: (newValue: number) => void;
  scale: any; // d3 scale type
  showValue: boolean;
}

// SnowBox types
export interface BoxProps {
  children?: React.ReactNode;
  flex?: boolean | number;
  row?: boolean;
  col?: boolean;
  wrap?: boolean;
  center?: boolean; // quick center
  jC?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  aI?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  w?: number | string;
  h?: number | string;
  m?: number;
  mt?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mx?: number;
  my?: number;
  p?: number;
  pt?: number;
  pb?: number;
  pl?: number;
  pr?: number;
  px?: number;
  py?: number;
  bg?: string;
  br?: number; // borderRadius
  bWidth?: number;
  bColor?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  relative?: boolean;
  absolute?: boolean;
  l?: number;
  r?: number;
  t?: number;
  b?: number;
  z?: number;
}

export interface TxtProps {
  children: React.ReactNode;
  f?: number; // fontSize
  fw?: '400' | '500' | '600' | '700' | 'bold' | 'normal';
  cl?: string; // color token
  lh?: number; // lineHeight
  ls?: number; // letterSpacing
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
  m?: number;
  mt?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mx?: number;
  my?: number;
}
