export type QuizResult = { score: number; total: number; answers: number[]; at: string };
export type QuizStore = { pre?: QuizResult; post?: QuizResult };
export const gradeQuiz = (qs: { a: number }[], ans: number[]) => qs.reduce((s, q, i) => s + (ans[i] === q.a ? 1 : 0), 0);
export const pct = (s: number, t: number) => (t ? Math.round((s / t) * 100) : 0);
export const progress = (scenariosDone: number, scenarioTotal: number, quiz: QuizStore) =>
  pct(scenariosDone + (quiz.pre ? 1 : 0) + (quiz.post ? 1 : 0), scenarioTotal + 2);
export const improvement = (quiz: QuizStore) => (quiz.pre && quiz.post ? pct(quiz.post.score, quiz.post.total) - pct(quiz.pre.score, quiz.pre.total) : null);
export function earnedBadges(o: { enrolled: number; scenariosDone: number; scenarioTotal: number; quiz: QuizStore }) {
  const { quiz: q } = o, imp = improvement(q);
  return [
    { id: "enrol", label: "First enrolment", ok: o.enrolled > 0 },
    { id: "s1", label: "First scenario", ok: o.scenariosDone > 0 },
    { id: "sall", label: "All scenarios complete", ok: o.scenariosDone === o.scenarioTotal },
    { id: "pre", label: "Baseline set", ok: !!q.pre },
    { id: "imp", label: "Knowledge grew", ok: imp !== null && imp > 0 },
    { id: "perf", label: "Perfect post-quiz", ok: !!q.post && q.post.score === q.post.total },
  ];
}
export const certificateReady = (scenariosDone: number, scenarioTotal: number, quiz: QuizStore) => scenariosDone === scenarioTotal && !!quiz.pre && !!quiz.post;