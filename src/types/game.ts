export type ElementCategory = 'relleu' | 'litoral' | 'hidrografia';

export type ElementSubcategory = 
  | 'serralada'
  | 'pic'
  | 'depressio'
  | 'plana'
  | 'cap'
  | 'golf'
  | 'delta'
  | 'x_mediterrania'
  | 'x_pirineu_ebre'
  | 'x_pirineu_mediterrania'
  | 'mar';

export interface GeoElement {
  id: string;
  name: string; // The display name as written in the teacher's worksheet (e.g., "Pica d'Estats", "R. Ebre", "S. PRELITORAL")
  fullName?: string; // Optional expanded name (e.g. "Serralada Prelitoral", "Riu Ebre")
  category: ElementCategory;
  subcategory: ElementSubcategory;
  x: number; // SVG viewBox coordinate X (0-1000)
  y: number; // SVG viewBox coordinate Y (0-1000)
  description: string;
  extraInfo?: string;
  colorType: 'black' | 'blue' | 'black_caps' | 'blue_caps'; // According to the homework color & caps rules
}

export type GameMode = 'quiz' | 'placement' | 'study';

export interface GameStats {
  encerts: number;
  errors: number;
  streak: number;
  maxStreak: number;
  totalTimeSeconds: number;
  completedElementIds: string[];
  failedElementIds: string[];
}
