"use client";

import Link from "next/link";
import { useState } from "react";
import { type Applicant, clearLicense, createLicense, saveLicense, useLicense } from "@/lib/license";
import { PASS_THRESHOLD, QUESTIONS } from "@/lib/questions";

type Step = "details" | "identity" | "theory" | "result";

const STEP_LABELS: Record<Step, string> = {
  details: "Personal details",
  identity: "ID check",
  theory: "Theory test",
  result: "Result",
};
const STEPS = Object.keys(STEP_LABELS) as Step[];

const EMPTY_APPLICANT: Applicant = { firstName: "", lastName: "", dateOfBirth: "", idNumber: "" };
const SAMPLE_APPLICANT: Applicant = {
  firstName: "Erika",
  lastName: "Mustermann",
  dateOfBirth: "1990-08-12",
  idNumber: "T22000129",
};

const buttonPrimary =
  "rounded-full bg-emerald-600 px-6 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40";
const buttonSecondary =
  "rounded-full border border-black/15 px-6 py-2.5 font-medium transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10";
const inputClass =
  "w-full rounded-lg border border-black/15 bg-transparent px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-white/20";

export function ApplyWizard() {
  const license = useLicense();
  const [step, setStep] = useState<Step>("details");
  const [applicant, setApplicant] = useState<Applicant>(EMPTY_APPLICANT);
  const [issued, setIssued] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  if (license === undefined) return null;

  if (license && !issued) {
    return (
      <Panel title="You already have a license">
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          A demo license for {license.holder.firstName} {license.holder.lastName} is stored in this browser.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/license" className={buttonPrimary}>
            View my license
          </Link>
          <button type="button" onClick={clearLicense} className={buttonSecondary}>
            Delete it and start over
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <StepIndicator current={step} />
      {step === "details" && (
        <DetailsStep
          applicant={applicant}
          onChange={setApplicant}
          onNext={() => setStep("identity")}
        />
      )}
      {step === "identity" && (
        <IdentityStep
          applicant={applicant}
          onBack={() => setStep("details")}
          onNext={() => setStep("theory")}
        />
      )}
      {step === "theory" && (
        <TheoryStep
          onSubmit={(submitted) => {
            const { score, passed } = grade(submitted);
            if (passed) {
              setIssued(true);
              saveLicense(createLicense(applicant, score, QUESTIONS.length));
            }
            setAnswers(submitted);
            setStep("result");
          }}
        />
      )}
      {step === "result" && <ResultStep answers={answers} onRetry={() => setStep("theory")} />}
    </div>
  );
}

const REQUIRED_CORRECT = Math.ceil(QUESTIONS.length * PASS_THRESHOLD);

function grade(answers: (number | null)[]) {
  const score = answers.filter((a, i) => a === QUESTIONS[i].answer).length;
  return { score, passed: score >= REQUIRED_CORRECT };
}

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.indexOf(current);
  return (
    <ol className="flex flex-wrap gap-2 text-sm">
      {STEPS.map((s, i) => (
        <li
          key={s}
          className={`flex items-center gap-2 rounded-full px-3 py-1 ${
            i === currentIndex
              ? "bg-emerald-600 text-white"
              : i < currentIndex
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
          }`}
        >
          <span className="font-semibold">{i < currentIndex ? "✓" : i + 1}</span>
          {STEP_LABELS[s]}
        </li>
      ))}
    </ol>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/10 p-6 sm:p-8 dark:border-white/10">
      <h1 className="mb-4 text-2xl font-semibold">{title}</h1>
      {children}
    </section>
  );
}

function DetailsStep({
  applicant,
  onChange,
  onNext,
}: {
  applicant: Applicant;
  onChange: (a: Applicant) => void;
  onNext: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const field = (key: keyof Applicant, label: string, type = "text") => (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <input
        type={type}
        required
        max={type === "date" ? today : undefined}
        value={applicant[key]}
        onChange={(e) => onChange({ ...applicant, [key]: e.target.value })}
        className={inputClass}
      />
    </label>
  );

  return (
    <Panel title="Personal details">
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Please use dummy data only. Nothing leaves your browser.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="flex flex-col gap-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {field("firstName", "First name")}
          {field("lastName", "Last name")}
          {field("dateOfBirth", "Date of birth", "date")}
          {field("idNumber", "ID document number")}
        </div>
        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" onClick={() => onChange(SAMPLE_APPLICANT)} className={buttonSecondary}>
            Fill with sample data
          </button>
          <button type="submit" className={buttonPrimary}>
            Continue
          </button>
        </div>
      </form>
    </Panel>
  );
}

function IdentityStep({
  applicant,
  onBack,
  onNext,
}: {
  applicant: Applicant;
  onBack: () => void;
  onNext: () => void;
}) {
  const [state, setState] = useState<"idle" | "verifying" | "verified">("idle");

  const verify = () => {
    setState("verifying");
    setTimeout(() => setState("verified"), 1500);
  };

  return (
    <Panel title="Verify your identity">
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        In a real deployment, you would confirm your identity with your national eID (e.g. NFC scan of your ID card),
        so that each person can hold only one license. Here, the check is only simulated.
      </p>
      <dl className="mb-6 grid gap-x-6 gap-y-2 rounded-xl bg-zinc-100 p-4 text-sm sm:grid-cols-[auto_1fr] dark:bg-zinc-900">
        <dt className="text-zinc-500">Name</dt>
        <dd>
          {applicant.firstName} {applicant.lastName}
        </dd>
        <dt className="text-zinc-500">Date of birth</dt>
        <dd>{applicant.dateOfBirth}</dd>
        <dt className="text-zinc-500">ID number</dt>
        <dd className="font-mono">{applicant.idNumber}</dd>
      </dl>
      <div className="mb-6" aria-live="polite">
        {state === "idle" && (
          <button type="button" onClick={verify} className={buttonSecondary}>
            🪪 Verify with eID (simulated)
          </button>
        )}
        {state === "verifying" && (
          <p className="flex items-center gap-2 text-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            Verifying identity…
          </p>
        )}
        {state === "verified" && (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            ✓ Identity verified (simulated)
          </p>
        )}
      </div>
      <div className="flex justify-between gap-3">
        <button type="button" onClick={onBack} className={buttonSecondary}>
          Back
        </button>
        <button type="button" onClick={onNext} disabled={state !== "verified"} className={buttonPrimary}>
          Start theory test
        </button>
      </div>
    </Panel>
  );
}

function ResultStep({ answers, onRetry }: { answers: (number | null)[]; onRetry: () => void }) {
  const { score, passed } = grade(answers);
  return (
    <Panel title={passed ? "🎉 Theory test passed" : "Theory test not passed"}>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        You answered <strong>{score}</strong> of {QUESTIONS.length} questions correctly ({REQUIRED_CORRECT} required).
        {passed
          ? " Your digital license has been issued. Next comes the practical test."
          : " Review the answers below and try again."}
      </p>
      <ul className="mb-8 flex flex-col gap-3">
        {QUESTIONS.map((q, i) => {
          const correct = answers[i] === q.answer;
          return (
            <li
              key={q.question}
              className={`rounded-xl border p-4 text-sm ${
                correct
                  ? "border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-red-600/30 bg-red-50 dark:bg-red-950/30"
              }`}
            >
              <p className="font-medium">
                {correct ? "✓" : "✗"} {q.question}
              </p>
              {!correct && (
                <p className="mt-1">
                  Correct answer: <strong>{q.options[q.answer]}</strong>
                </p>
              )}
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{q.explanation}</p>
            </li>
          );
        })}
      </ul>
      {passed ? (
        <Link href="/license" className={buttonPrimary}>
          View my digital license
        </Link>
      ) : (
        <button type="button" className={buttonPrimary} onClick={onRetry}>
          Retry test
        </button>
      )}
    </Panel>
  );
}

function TheoryStep({ onSubmit }: { onSubmit: (answers: (number | null)[]) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));

  const q = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;

  return (
    <Panel title="Theory test">
      <div className="mb-2 flex justify-between text-sm text-zinc-500">
        <span>
          Question {index + 1} of {QUESTIONS.length}
        </span>
        <span>Pass mark: {REQUIRED_CORRECT} correct</span>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-emerald-600 transition-all"
          style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>
      <fieldset className="mb-8">
        <legend className="mb-4 text-lg font-medium">{q.question}</legend>
        <div className="flex flex-col gap-2">
          {q.options.map((option, o) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                answers[index] === o
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              }`}
            >
              <input
                type="radio"
                name={`q-${index}`}
                checked={answers[index] === o}
                onChange={() => setAnswers(answers.map((a, i) => (i === index ? o : a)))}
                className="accent-emerald-600"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          className={`${buttonSecondary} disabled:opacity-40`}
        >
          Back
        </button>
        <button
          type="button"
          disabled={answers[index] === null}
          onClick={isLast ? () => onSubmit(answers) : () => setIndex(index + 1)}
          className={buttonPrimary}
        >
          {isLast ? "Submit test" : "Next"}
        </button>
      </div>
    </Panel>
  );
}
