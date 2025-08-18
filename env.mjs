// env.mjs
import { z } from "zod";

export const serverEnv = z.object({
  DATABASE_URL: z.string().url(),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().default("5432"),
  DB_NAME: z.string().default("myteamcamp"),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string(),
  JWT_SECRET: z.string().min(32, "Use a long random secret"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
}).parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});
