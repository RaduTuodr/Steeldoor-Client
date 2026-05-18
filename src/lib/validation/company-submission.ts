import { z } from "zod";

export const interviewRoundFormSchema = z.object({
  roundType: z
    .string()
    .min(1, "Round type is required")
    .max(50, "Round type is too long"),
  title: z
    .string()
    .min(1, "Round title is required")
    .max(120, "Round title is too long"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .or(z.literal("")),
  difficulty: z
    .number()
    .min(1, "Minimum difficulty is 1")
    .max(5, "Maximum difficulty is 5")
    .nullable(),
  durationMinutes: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration is too large")
    .nullable(),
});

export const companySubmissionFormSchema = z.object({
  userId: z.
    string().
    optional(),

  position: z
    .string()
    .min(1, "Position is required")
    .max(120, "Position title is too long"),
  
  rating: z
    .number()
    .min(1, "Minimum rating is 1")
    .max(5, "Maximum rating is 5"),
  
  offerReceived: z
    .boolean({
      error: "Please specify if an offer was received",
    }),

  rounds: z.array(interviewRoundFormSchema).max(12, "You can add up to 12 rounds"),
});

export type CompanySubmissionFormValues = z.infer<typeof companySubmissionFormSchema>;
export type InterviewRoundFormValues = z.infer<typeof interviewRoundFormSchema>;
