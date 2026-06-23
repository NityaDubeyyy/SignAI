import * as dotenv from 'dotenv';
import {z} from 'zod';

const stringToNumber = (x: string) => parseInt(x, 10);

const schema = z.object({

  ENABLE_CAPACITOR_SERVER: z.string().default('0').transform(stringToNumber).transform(Boolean),

  OVERRIDE_CAPACITOR_SERVER: z.string().optional(),

  CAPACITOR_SERVER_PORT: z.string().default('4200').transform(stringToNumber),
});

export const env = schema.parse(dotenv.config().parsed ?? {});
