"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, Clock3, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
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
import { Badge } from "@/components/ui/badge";
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
  type InterviewRoundFormValues,
} from "@/lib/validation/company-submission";
import { cn } from "@/lib/utils";

const ROUND_TYPE_OPTIONS = [
  "OA",
  "Behavioral",
  "Live Coding",
  "Technical Discussion",
  "System Design",
  "HR",
  "Recruiter Call",
  "Manager"
];

const createEmptyRound = (): InterviewRoundFormValues => ({
  roundType: "Live Coding",
  title: "",
  description: "",
  difficulty: 3,
  durationMinutes: 60,
});

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
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [step, setStep] = useState<"submission" | "rounds">("submission");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CompanySubmissionFormValues>({
    resolver: zodResolver(companySubmissionFormSchema),
    defaultValues: {
      position: "",
      rating: 3,
      offerReceived: false,
      userId,
      rounds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rounds",
  });

  const offerReceived = useWatch({ control, name: "offerReceived" });
  const rounds = useWatch({ control, name: "rounds" }) ?? [];

  const completionText = useMemo(() => {
    const hasRounds = rounds.length > 0;
    return hasRounds ? `${rounds.length} round${rounds.length === 1 ? "" : "s"} ready` : "Rounds are optional";
  }, [rounds.length]);

  if (!user?.id) {
    return null;
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep("submission");
      reset({ position: "", rating: 3, offerReceived: false, userId, rounds: [] });
    }

    onOpenChange(nextOpen);
  };

  const handleContinue = async () => {
    const valid = await trigger(["position", "rating", "offerReceived"]);
    if (valid) {
      setStep("rounds");
    }
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const currentPosition = getValues("position").trim() || "your role";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div>
              <DialogTitle>Add submission</DialogTitle>
              <DialogDescription className="mt-1">
                Share your experience for <span className="text-zinc-300">{companyName}</span>, then optionally add the interview rounds while everything is still fresh.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <StepBadge active={step === "submission"} done={step === "rounds"}>
                Submission
              </StepBadge>
              <StepBadge active={step === "rounds"}>
                Rounds
              </StepBadge>
            </div>
          </div>
        </DialogHeader>

        {step === "submission" ? (
          <div className="flex max-h-[calc(88vh-7rem)] flex-col">
            <div className="overflow-y-auto pr-1">
              <div className="grid gap-5">
                {/* <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <p className="text-sm font-medium text-zinc-100">Start with the essentials</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    A quick summary helps others scan the feed fast. You can enrich it with round-by-round details next.
                  </p>
                </div> */}

                <div className="grid gap-2">
                  <Label htmlFor="position">Position / Role</Label>
                  <Input
                    id="position"
                    placeholder="e.g. Junior Java Developer"
                    autoComplete="off"
                    {...register("position")}
                  />
                  {errors.position && <p className="text-xs text-red-400">{errors.position.message}</p>}
                </div>

                <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min={1}
                      max={5}
                      {...register("rating", { valueAsNumber: true })}
                    />
                    {errors.rating && (
                      <p className="text-xs text-red-400">{errors.rating.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="offer-received">Outcome</Label>
                    <Select
                      value={offerReceived ? "true" : "false"}
                      onValueChange={(value) => setValue("offerReceived", value === "true", { shouldValidate: true })}
                    >
                      <SelectTrigger id="offer-received" className="w-full">
                        <SelectValue placeholder="Offer received?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No offer / still in process</SelectItem>
                        <SelectItem value="true">Offer received</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.offerReceived && (
                      <p className="text-xs text-red-400">{errors.offerReceived.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 pt-2 sm:gap-2 sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                You can review rounds before saving.
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void handleContinue()}>
                  Continue
                </Button>
              </div>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="flex max-h-[calc(88vh-7rem)] flex-col">
            <div className="overflow-y-auto pr-1">
              <div className="grid gap-5">
                {/* <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                        <Sparkles className="h-4 w-4 text-amber-300" />
                        Make the submission more useful
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        Add each round in order for <span className="text-zinc-200">{currentPosition}</span>. Skip this if you only want the high-level submission.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                      {completionText}
                    </Badge>
                  </div>
                </div> */}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">Interview rounds</p>
                    <p className="mt-1 text-xs text-zinc-500">You can add them now, or save the submission without any rounds.</p>
                  </div>
                  <Button type="button" variant="outline" className="gap-2" onClick={() => append(createEmptyRound())}>
                    <Plus className="h-4 w-4" />
                    Add round
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 px-5 py-10 text-center">
                    <Clock3 className="mx-auto h-8 w-8 text-zinc-600" />
                    <p className="mt-3 text-sm font-medium text-zinc-200">No rounds added yet</p>
                    <p className="mt-1 text-xs text-zinc-500">If you remember the interview flow, adding it here makes the review much more actionable.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-zinc-100">Round {index + 1}</p>
                            <p className="mt-1 text-xs text-zinc-500">Capture the stage name, what happened, and how intense it felt.</p>
                          </div>
                          <Button type="button" variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>

                        <div className="mt-4 grid gap-4">
                          <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor={`rounds.${index}.roundType`}>Round type</Label>
                              <Select
                                value={rounds[index]?.roundType ?? "Technical"}
                                onValueChange={(value) => setValue(`rounds.${index}.roundType`, value, { shouldValidate: true })}
                              >
                                <SelectTrigger id={`rounds.${index}.roundType`}>
                                  <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROUND_TYPE_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.rounds?.[index]?.roundType && (
                                <p className="text-xs text-red-400">{errors.rounds[index]?.roundType?.message}</p>
                              )}
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor={`rounds.${index}.title`}>Round title</Label>
                              <Input
                                id={`rounds.${index}.title`}
                                placeholder="e.g. Live coding with the backend team"
                                {...register(`rounds.${index}.title`)}
                              />
                              {errors.rounds?.[index]?.title && (
                                <p className="text-xs text-red-400">{errors.rounds[index]?.title?.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`rounds.${index}.description`}>What happened</Label>
                            <Textarea
                              id={`rounds.${index}.description`}
                              rows={4}
                              placeholder="Topics covered, question style, surprises, or what candidates should prepare for."
                              {...register(`rounds.${index}.description`)}
                            />
                            {errors.rounds?.[index]?.description && (
                              <p className="text-xs text-red-400">{errors.rounds[index]?.description?.message}</p>
                            )}
                          </div>

                          <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor={`rounds.${index}.difficulty`}>Difficulty (optional)</Label>
                              <Input
                                id={`rounds.${index}.difficulty`}
                                type="number"
                                min={1}
                                max={5}
                                {...register(`rounds.${index}.difficulty`, {
                                  setValueAs: (value) => (value === "" ? null : Number(value)),
                                })}
                              />
                              {errors.rounds?.[index]?.difficulty && (
                                <p className="text-xs text-red-400">{errors.rounds[index]?.difficulty?.message}</p>
                              )}
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor={`rounds.${index}.durationMinutes`}>Duration in minutes (optional)</Label>
                              <Input
                                id={`rounds.${index}.durationMinutes`}
                                type="number"
                                min={1}
                                max={600}
                                {...register(`rounds.${index}.durationMinutes`, {
                                  setValueAs: (value) => (value === "" ? null : Number(value)),
                                })}
                              />
                              {errors.rounds?.[index]?.durationMinutes && (
                                <p className="text-xs text-red-400">{errors.rounds[index]?.durationMinutes?.message}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 pt-2 sm:gap-2 sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Saving will create the submission and its rounds together.
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => setStep("submission")}>
                  Back
                </Button>
                <Button type="submit" isLoading={isSaving || isSubmitting}>
                  {isSaving ? "Saving..." : rounds.length > 0 ? "Save submission and rounds" : "Save submission"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StepBadge({
  active,
  done,
  children,
}: {
  active?: boolean;
  done?: boolean;
  children: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        done
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          : active
            ? "border-zinc-600 bg-zinc-800 text-zinc-100"
            : "border-zinc-800 bg-zinc-900/60 text-zinc-500"
      )}
    >
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
