
export enum Author {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM'
}

export interface HistoryEntry {
  author: Author;
  text: string;
}
