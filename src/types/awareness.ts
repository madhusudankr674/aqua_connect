export type AwarenessCategory =
  | 'Safe drinking-water storage'
  | 'Proper boiling practices'
  | 'Household purification guidance'
  | 'Tap and pipeline hygiene'
  | 'Warning signs of potentially unsafe water'
  | 'Water-borne illness awareness'
  | 'Appropriate health precautions';

export interface AwarenessArticle {
  articleId: string;
  title: string;
  titleKn?: string;
  category: AwarenessCategory;
  content: string;
  contentKn?: string;
  sourceName: string;
  sourceUrl: string;
  lastReviewedAt: string;
  approvedByPhed: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}
