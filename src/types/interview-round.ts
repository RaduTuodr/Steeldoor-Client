export interface InterviewRound {
  id: number;
  submissionId: number;
  roundType: string;
  title: string;
  description: string | null;
  difficulty: number | null;
  durationMinutes: number | null;
  orderIndex: number;
}
