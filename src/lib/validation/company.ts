import { z } from "zod";

export const createCompanyFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(120, "Company name is too long"),
  website: z
    .string()
    .trim()
    .max(255, "Website is too long")
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), "Website must start with http:// or https://"),
  description: z.string().trim().min(1, "Description is required").max(1500, "Description is too long"),
  industry: z.string().trim().min(1, "Industry is required").max(120, "Industry is too long"),
  location: z.string().trim().min(1, "Location is required").max(120, "Location is too long"),
  companySize: z.enum(["STARTUP", "SMB", "MID_MARKET", "ENTERPRISE"]),
  logo: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "Logo must be 5MB or smaller")
    .refine(
      (file) => !file || file.type.startsWith("image/"),
      "Logo must be an image"
    ),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanyFormSchema>;
