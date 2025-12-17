
export enum GestureType {
  NONE = 'NONE',
  NEXT = 'NEXT',
  PREV = 'PREV'
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

// Share ViewMode type across components to ensure type safety
export type ViewMode = 'upload' | 'preview' | 'present';
