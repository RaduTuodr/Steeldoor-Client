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

export interface AddSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CompanySubmissionFormValues) => void | Promise<void>;
  companyName: string;
  isSaving?: boolean;
}

export function AddSubmissionDialog({
  open,
  onOpenChange,
  onSubmit,
  companyName,
  isSaving,
}: AddSubmissionDialogProps) {
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
      position: "",
      overallDifficulty: 3,
      offerReceived: false,
    },
  });

  // Watch offerReceived for the Select component
  const offerReceived = useWatch({ control, name: "offerReceived" });

  useEffect(() => {
    if (!open) {
      reset({ position: "", overallDifficulty: 3, offerReceived: false });
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
            Add a submission for <span className="text-zinc-300">{companyName}</span>. 
            This will be saved to your interview history and shared with the community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4">
          {/* Position Field */}
          <div className="grid gap-2">
            <Label htmlFor="position">Position / Role</Label>
            <Input
              id="position"
              placeholder="e.g. Junior Java Developer"
              autoComplete="off"
              {...register("position")}
            />
            {errors.position && (
              <p className="text-xs text-red-400">{errors.position.message}</p>
            )}
          </div>

          {/* Difficulty Field */}
          <div className="grid gap-2">
            <Label htmlFor="overallDifficulty">Overall Difficulty (1-5)</Label>
            <Input
              id="overallDifficulty"
              type="number"
              min={1}
              max={5}
              {...register("overallDifficulty", { valueAsNumber: true })}
            />
            {errors.overallDifficulty && (
              <p className="text-xs text-red-400">{errors.overallDifficulty.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="offer-received">Offer Received?</Label>
            <Select
              value={offerReceived ? "true" : "false"}
              onValueChange={(v) => setValue("offerReceived", v === "true")}
            >
              <SelectTrigger id="offer-received" className="w-full">
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No / Pending</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
            {errors.offerReceived && (
              <p className="text-xs text-red-400">{errors.offerReceived.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isSaving}>
              {isSaving ? "Saving..." : "Save submission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}