// env.mjs
import { z } from "zod";

export const serverEnv = z.object({
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32, "Use a long random secret"),
}).parse({
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
});
