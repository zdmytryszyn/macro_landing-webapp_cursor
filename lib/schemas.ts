import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const goalsSchema = z.object({
  calories: z.number().int().min(0),
  protein: z.number().int().min(0),
  carbs: z.number().int().min(0),
  fats: z.number().int().min(0),
});

export const createLogEntrySchema = z.object({
  meal: z.enum(["breakfast", "lunch", "dinner", "snacks"]),
  name: z.string().min(1),
  brand: z.string().optional(),
  servingSize: z.string().min(1),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fats: z.number().min(0),
  sourceType: z.string().optional(),
});

export const updateLogEntrySchema = createLogEntrySchema.partial();
