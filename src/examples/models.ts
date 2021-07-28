import { z } from 'zod';

import { useModel } from '../firestore';

export type Pet = { name: string };

export const usePets = useModel<Pet>(
  'Pets',
  z.object({ name: z.string().min(3) }),
);
