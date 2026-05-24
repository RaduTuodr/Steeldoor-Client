"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateCompanyMutation } from "@/hooks/use-create-company-mutation";
import { createCompanyFormSchema, type CreateCompanyFormValues } from "@/lib/validation/company";
import { useI18n } from "@/components/i18n/i18n-provider";

const COMPANY_SIZES = [
  { value: "STARTUP", label: "Startup" },
  { value: "SMB", label: "SMB" },
  { value: "MID_MARKET", label: "Mid-market" },
  { value: "ENTERPRISE", label: "Enterprise" },
] as const;

export function CreateCompanyPanel() {
  const [selectedFileName, setSelectedFileName] = useState("");
  const { toast } = useToast();
  const { dictionary } = useI18n();
  const mutation = useCreateCompanyMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanyFormSchema),
    defaultValues: {
      name: "",
      website: "",
      description: "",
      industry: "",
      location: "",
      companySize: "SMB",
      logo: undefined,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const company = await mutation.mutateAsync(values);

      toast({
        title: dictionary.home.companyCreated,
        description: company?.name
          ? dictionary.home.companyCreatedDescription.replace("{name}", company.name)
          : dictionary.home.companyCreatedDescription.replace("{name}", values.name.trim()),
        variant: "success",
      });

      reset({
        name: "",
        website: "",
        description: "",
        industry: "",
        location: "",
        companySize: "SMB",
        logo: undefined,
      });
      setSelectedFileName("");
    } catch (error) {
      toast({
        title: "Unable to create company",
        description:
          error instanceof Error ? error.message : "Something went wrong while creating the company.",
        variant: "destructive",
      });
    }
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="mt-3 text-xl text-zinc-50">{dictionary.home.addCompanyTitle}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void onSubmit(event)} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="company-name">{dictionary.home.companyName}</Label>
              <Input id="company-name" placeholder="e.g. Google" {...register("name")} />
              {errors.name ? <p className="text-xs text-red-400">{errors.name.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-website">{dictionary.home.companyWebsite}</Label>
              <Input id="company-website" placeholder="https://company.com" {...register("website")} />
              {errors.website ? <p className="text-xs text-red-400">{errors.website.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="company-industry">{dictionary.home.companyIndustry}</Label>
              <Input id="company-industry" placeholder="e.g. Technology" {...register("industry")} />
              {errors.industry ? <p className="text-xs text-red-400">{errors.industry.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-location">{dictionary.home.companyLocation}</Label>
              <Input id="company-location" placeholder="e.g. Bucharest" {...register("location")} />
              {errors.location ? <p className="text-xs text-red-400">{errors.location.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-size">{dictionary.home.companySize}</Label>
              <Select
                defaultValue="SMB"
                onValueChange={(value) => setValue("companySize", value as CreateCompanyFormValues["companySize"], { shouldValidate: true })}
              >
                <SelectTrigger id="company-size" className="w-full">
                  <SelectValue placeholder={dictionary.home.companySize} />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companySize ? <p className="text-xs text-red-400">{errors.companySize.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company-description">{dictionary.home.companyDescription}</Label>
            <Textarea
              id="company-description"
              rows={5}
              placeholder={dictionary.home.companyDescriptionPlaceholder}
              {...register("description")}
            />
            {errors.description ? <p className="text-xs text-red-400">{errors.description.message}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company-logo">{dictionary.home.companyLogo}</Label>
            <label
              htmlFor="company-logo"
              className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/40 px-4 py-4 text-sm text-zinc-300 hover:border-zinc-600"
            >
              <span className="inline-flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-zinc-400" />
                {selectedFileName || dictionary.home.companyLogoHint}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{dictionary.home.optional}</span>
            </label>
            <Input
              id="company-logo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setValue("logo", file, { shouldValidate: true });
                setSelectedFileName(file?.name ?? "");
              }}
            />
            {errors.logo ? <p className="text-xs text-red-400">{errors.logo.message}</p> : null}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" isLoading={mutation.isPending || isSubmitting}>
              {dictionary.home.createCompanyCta}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
