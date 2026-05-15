import { z } from "zod";

export const companySubmissionFormSchema = z.object({
  position: z
    .string()
    .min(1, "Position is required")
    .max(120, "Position title is too long"),
  
  overallDifficulty: z
    .number()
    .min(1, "Minimum difficulty is 1")
    .max(5, "Maximum difficulty is 5"),
  
  offerReceived: z
    .boolean({
      error: "Please specify if an offer was received",
    }),
});

export type CompanySubmissionFormValues = z.infer<typeof companySubmissionFormSchema>;