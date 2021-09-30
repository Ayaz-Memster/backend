import { Collectionable } from './collectionable';

export const usersCollection = 'users';

export type User = {
  username: string;
  password: string;
  canAccess: boolean;
  canEdit: boolean;
} & Collectionable<typeof usersCollection>;
