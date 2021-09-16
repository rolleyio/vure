import { z } from 'zod';

import { schema } from '../firestore';

export type Pet = { name: string; age?: number };

export const usePets = schema<Pet>('Pets', {
  name: z.string(),
  age: z.optional(z.number().min(0).max(20)),
});

const pet = usePets().parse({
  name: 'Hello world',
  age: 10,
});
