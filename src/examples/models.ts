import { z } from 'zod';

import { useSchema } from '../firestore';

export type Pet = { name: string };

export const usePets = useSchema<Pet>(
  'Pets',
  z.object({ name: z.string() }) as z.Schema<Pet>,
);
