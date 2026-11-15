"use client";

import { useState } from "react";
import { QUIZ } from "@/lib/data";
import { pct, QuizResult } from "@/lib/score";

export default function Quiz({
  phase,
  result,
  locked,
  onDone,
}: {
  phase: "pre" | "post";
  result?: QuizResult;
  locked?: boolean;
  onDone: (r: QuizResult) => void | Promise<void>;
}) {
  const [ans, setAns] = useState<number[]>(QUIZ.map(() => -1));
  const [retake, setRetake] = useState(false);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const title =
    phase === "pre" ? "Pre-training quiz" : "Post-training quiz";

  if (locked) {
    return (
      <div className="glass p-5">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-white/70">
          Take the pre-training quiz and finish the scenarios first to unlock this quiz.
        </p>
      </div>
    );
  }

  if (result && !retake) {
    return (
      <div className="glass p-5">
        <h3 className="font-semibold">{title}</h3>

        <p className="mt-1 text-2xl font-bold" role="status">
          {result.score}/{result.total} ({pct(result.score, result.total)}%)
        </p>

        <ol className="mt-3 space-y-3">
          {QUIZ.map((q, i) => {
            const ok = result.answers[i] === q.a;

            return (
              <li
                key={i}
                className={`rounded-xl border p-3 ${
                  ok ? "border-emerald" : "border-coral"
                }`}
              >
                <p className="font-medium">{q.q}</p>

                <p className="text-sm">
                  Your answer: {q.opts[result.answers[i]]} (
                  {ok ? "correct" : "not quite"})
                </p>

                {!ok && (
                  <p className="text-sm">
                    Correct answer: {q.opts[q.a]}
                  </p>
                )}

                <p className="text-sm text-teal">{q.why}</p>
              </li>
            );
          })}
        </ol>

        {phase === "post" && (
          <button
            className="btn btn-ghost mt-3"
            onClick={() => {
              setAns(QUIZ.map(() => -1));
              setRetake(true);
              setErr("");
            }}
          >
            Retake quiz
          </button>
        )}
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (ans.includes(-1)) {
      setErr(
        "Answer all " + QUIZ.length + " questions before submitting."
      );
      return;
    }

    try {
      setErr("");
      setSaving(true);

      const score = QUIZ.reduce(
        (total, question, index) =>
          total + (ans[index] === question.a ? 1 : 0),
        0
      );

      await onDone({
        score,
        total: QUIZ.length,
        answers: [...ans],
        at: new Date().toISOString(),
      });

      setRetake(false);
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : "Unable to save your quiz. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="glass p-5">
      <h3 className="font-semibold">{title}</h3>

      {QUIZ.map((q, i) => (
        <fieldset key={i} className="mt-4">
          <legend className="mb-2 font-medium">
            {i + 1}. {q.q}
          </legend>

          {q.opts.map((o, j) => (
            <label
              key={j}
              className="mb-1 flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-white/10"
            >
              <input
                type="radio"
                name={`${phase}-${i}`}
                className="accent-emerald"
                checked={ans[i] === j}
                disabled={saving}
                onChange={() =>
                  setAns((previous) =>
                    previous.map((x, k) => (k === i ? j : x))
                  )
                }
              />
              {o}
            </label>
          ))}
        </fieldset>
      ))}

      {err && (
        <p role="alert" className="mt-3 text-coral">
          {err}
        </p>
      )}

      <button
        className="btn btn-pri mt-4"
        type="submit"
        disabled={saving}
      >
        {saving ? "Saving quiz..." : "Submit quiz"}
      </button>
    </form>
  );
}