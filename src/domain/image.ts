import { Collectionable } from './collectionable';

export const imagesCollection = 'images';

export type Image = {
  name: string;
  uploadDateTime: number;
  isAnimated: boolean;
} & Collectionable<typeof imagesCollection>;
