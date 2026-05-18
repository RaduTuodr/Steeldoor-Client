"use client";

import { Brain, Clock3, Layers3, Target, GripVertical } from "lucide-react";
import { useInterviewRoundsQuery, useInterviewRoundsUpdateMutation } from "@/hooks/use-interview-rounds-query";
import type { CompanySubmission } from "@/types/company-submission";
import type { InterviewRound } from "@/types/interview-round";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggableRubric,
} from "@hello-pangea/dnd";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface SubmissionRoundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: CompanySubmission | null;
  onRoundsReorder?: (reorderedRounds: InterviewRound[]) => void;
}

const ROUND_TYPE_STYLES: Record<string, string> = {
  hr: "border-rose-400/30 bg-rose-500/15 text-rose-200",
  behavioral: "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200",
  technical: "border-sky-400/30 bg-sky-500/15 text-sky-200",
  coding: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  systemdesign: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  takehome: "border-violet-400/30 bg-violet-500/15 text-violet-200",
  assignment: "border-indigo-400/30 bg-indigo-500/15 text-indigo-200",
  final: "border-cyan-400/30 bg-cyan-500/15 text-cyan-200",
  manager: "border-orange-400/30 bg-orange-500/15 text-orange-200",
};

function normalizeRoundType(roundType: string) {
  return roundType.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getRoundTypeClasses(roundType: string) {
  return ROUND_TYPE_STYLES[normalizeRoundType(roundType)] ?? "border-teal-400/30 bg-teal-500/15 text-teal-200";
}

function formatRoundType(roundType: string) {
  return roundType
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function RoundMeta({ round }: { round: InterviewRound }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-2.5 py-1">
        <Layers3 className="h-3.5 w-3.5 text-zinc-500" />
        Round {round.orderIndex}
      </span>
      {round.difficulty !== null && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-2.5 py-1">
          <Brain className="h-3.5 w-3.5 text-amber-300" />
          Difficulty {round.difficulty}/5
        </span>
      )}
      {round.durationMinutes !== null && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-2.5 py-1">
          <Clock3 className="h-3.5 w-3.5 text-sky-300" />
          {round.durationMinutes} min
        </span>
      )}
    </div>
  );
}

export function OwnSubmissionRoundsDialog({
  open,
  onOpenChange,
  submission,
  onRoundsReorder,
}: SubmissionRoundsDialogProps) {
  const { data: fetchedRounds = [], isPending, isError, error } = useInterviewRoundsQuery(submission?.id ?? null, open);
  const updateRoundsMutation = useInterviewRoundsUpdateMutation();
  const [draftState, setDraftState] = useState<{ submissionId: string; rounds: InterviewRound[] } | null>(null);
  const rounds =
    draftState && submission && draftState.submissionId === submission.id
      ? draftState.rounds
      : fetchedRounds;

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination || !submission) return;

    const items = Array.from(rounds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      orderIndex: index + 1,
    }));

    setDraftState({
      submissionId: submission.id,
      rounds: updatedItems,
    });
  };

  const hasOrderChanges =
    rounds.length === fetchedRounds.length &&
    rounds.some((round, index) => {
      const fetchedRound = fetchedRounds[index];
      return !fetchedRound || fetchedRound.id !== round.id || fetchedRound.orderIndex !== round.orderIndex;
    });

  const handleUpdateClick = async () => {
    if (!submission || !hasOrderChanges) {
      return;
    }

    try {
      await updateRoundsMutation.mutateAsync({
        submissionId: submission.id,
        rounds,
      });
      setDraftState({
        submissionId: submission.id,
        rounds,
      });
      onRoundsReorder?.(rounds);
      toast({
        title: "Interview rounds updated",
        description: "The new round order was saved successfully.",
      });
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Please try again.";
      toast({
        title: "Could not update interview rounds",
        description: message,
        variant: "destructive",
      });
    }
  };

  const renderCloneElement = (
    provided: DraggableProvided,
    _snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric
  ) => {
    const round = rounds[rubric.source.index];
    if (!round) return null;

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{ ...provided.draggableProps.style }}
        className="w-full shadow-2xl shadow-black/60 pointer-events-none z-[9999] sm:max-w-[calc(640px-3rem)] md:max-w-[calc(768px-3rem)]"
      >
        <Card className="overflow-hidden rounded-2xl border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
          <CardContent className="p-0">
            <div className="border-b border-zinc-800/80 bg-zinc-950/60 px-5 py-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-zinc-300 p-1">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 flex-1 min-w-0">
                  <div className="space-y-2 flex-1 min-w-0">
                    <Badge className={cn("w-fit border font-medium", getRoundTypeClasses(round.roundType))}>
                      {formatRoundType(round.roundType)}
                    </Badge>
                    <div>
                      <h3 className="text-base font-semibold text-zinc-50">{round.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400 break-words">
                        {round.description || "No description was provided for this round yet."}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 sm:self-start">
                    <RoundMeta round={round} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl flex flex-col">
        <div className="flex items-start justify-between gap-4 pr-6">
          <DialogHeader className="flex-1">
            <DialogTitle className="flex items-center gap-2">
              Interview rounds
            </DialogTitle>
            <DialogDescription>
              {submission ? (
                <>
                  Details for <span className="text-zinc-200">{submission.position}</span> by{" "}
                  <span className="text-zinc-200">{submission.user?.username || "Anonymous"}</span>.
                </>
              ) : (
                "Select a submission to inspect its interview rounds."
              )}
            </DialogDescription>
          </DialogHeader>

          {submission && rounds.length > 0 && !isPending && !isError && (
            <Button 
              size="sm" 
              onClick={() => void handleUpdateClick()}
              disabled={!hasOrderChanges || updateRoundsMutation.isPending}
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-medium rounded-xl shrink-0 mt-1"
            >
              {updateRoundsMutation.isPending ? "Updating..." : "Update"}
            </Button>
          )}
        </div>

        <div className="space-y-3 overflow-y-auto pr-1 flex-1 mt-4">
          {isPending ? (
            <>
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </>
          ) : isError ? (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/20 px-4 py-5 text-sm text-red-200">
              <p className="font-medium">Could not load interview rounds</p>
              <p className="mt-1 text-red-300/80">{error.message}</p>
            </div>
          ) : rounds.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-8 text-center">
              <Target className="mx-auto h-9 w-9 text-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-200">No rounds yet</p>
              <p className="mt-1 text-xs text-zinc-500">This submission does not have interview rounds attached for now.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="interview-rounds" renderClone={renderCloneElement}>
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className="space-y-3"
                  >
                    {rounds.map((round, index) => (
                      <Draggable key={round.id} draggableId={round.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{ ...provided.draggableProps.style }}
                            className={cn(
                              "transition-shadow",
                              snapshot.isDragging && "opacity-0"
                            )}
                          >
                            <Card className="overflow-hidden rounded-2xl border-zinc-800/80 bg-zinc-900/20 backdrop-blur-sm">
                              <CardContent className="p-0">
                                <div className="border-b border-zinc-800/80 bg-zinc-950/40 px-5 py-4">
                                  <div className="flex items-start gap-4">
                                    <div 
                                      {...provided.dragHandleProps} 
                                      className="mt-1 text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-zinc-800/50 transition-colors"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 flex-1 min-w-0">
                                      <div className="space-y-2 flex-1 min-w-0">
                                        <Badge className={cn("w-fit border font-medium", getRoundTypeClasses(round.roundType))}>
                                          {formatRoundType(round.roundType)}
                                        </Badge>
                                        <div>
                                          <h3 className="text-base font-semibold text-zinc-50">{round.title}</h3>
                                          <p className="mt-1 text-sm text-zinc-400 break-words">
                                            {round.description || "No description was provided for this round yet."}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="shrink-0 sm:self-start">
                                        <RoundMeta round={round} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
