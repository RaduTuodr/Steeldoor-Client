"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  companySubmissionFormSchema,
  type CompanySubmissionFormValues,
} from "@/lib/validation/company-submission";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/types/company-submission";

const statusLabels: Record<SubmissionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  closed: "Closed",
};

export interface AddSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CompanySubmissionFormValues) => void | Promise<void>;
  companyName: string;
  /** Server request in progress (parent mutation). */
  isSaving?: boolean;
}

export function AddSubmissionDialog({ open, onOpenChange, onSubmit, companyName, isSaving }: AddSubmissionDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CompanySubmissionFormValues>({
    resolver: zodResolver(companySubmissionFormSchema),
    defaultValues: {
      title: "",
      summary: "",
      status: "draft",
    },
  });

  const status = useWatch({ control, name: "status", defaultValue: "draft" });

  useEffect(() => {
    if (!open) {
      reset({ title: "", summary: "", status: "draft" });
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add submission</DialogTitle>
          <DialogDescription>
            Add a submission for <span className="text-zinc-300">{companyName}</span> via{" "}
            <span className="font-mono text-zinc-400">POST /api/company/…/submissions</span>. Everyone with access
            will see it in the company feed after the server saves it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="submission-title">Title</Label>
            <Input id="submission-title" placeholder="e.g. RFP response — Q2" autoComplete="off" {...register("title")} />
            {errors.title ? <p className="text-xs text-red-400">{errors.title.message}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="submission-summary">Summary</Label>
            <Textarea id="submission-summary" placeholder="Optional context, scope, or notes" {...register("summary")} />
            {errors.summary ? <p className="text-xs text-red-400">{errors.summary.message}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="submission-status">Status</Label>
            <Select value={status ?? "draft"} onValueChange={(v) => setValue("status", v as SubmissionStatus, { shouldValidate: true })}>
              <SelectTrigger id="submission-status" className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {SUBMISSION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status ? <p className="text-xs text-red-400">{errors.status.message}</p> : null}
          </div>
          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isSaving}>
              Save submission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
