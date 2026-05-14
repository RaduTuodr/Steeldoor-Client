import { z } from "zod";
import { SUBMISSION_STATUSES } from "@/types/company-submission";

export const companySubmissionFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title is too long"),
  summary: z.string().max(2000, "Summary is too long"),
  status: z.enum(SUBMISSION_STATUSES),
});

export type CompanySubmissionFormValues = z.infer<typeof companySubmissionFormSchema>;
