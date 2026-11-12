"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitEnquiry } from "@/app/(site)/contact/actions";
import type { EnquiryState } from "@/app/(site)/contact/types";
import { buttonClass } from "@/components/ui/Button";
import { Check } from "@/components/ui/Icons";
import { Mark } from "@/components/site/Mark";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type Props = { needs: Option[]; sources: string[]; preselect?: string | null };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\-.\s\d]{6,30}$/;

const field =
  "w-full rounded-[6px] border border-transparent bg-field px-[clamp(14px,calc(0.4vw+12.5px),20px)] text-base text-ink placeholder:text-mute transition-[border-color,background-color] duration-200 hover:border-ink/20 focus:border-ink focus:bg-surface focus:outline-none aria-[invalid=true]:border-error";
const input = cn(field, "h-[clamp(48px,calc(0.79vw+45px),60px)]");
const chip =
  "flex min-h-[clamp(44px,calc(0.72vw+41.3px),53px)] items-center gap-2 rounded-[8px] border border-ink/15 px-[clamp(14px,calc(0.33vw+12.8px),19px)] py-2 text-base transition-[background-color,border-color,color] duration-200 hover:border-ink/60 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-on-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink [&>svg]:hidden peer-checked:[&>svg]:block";

/** One question per screen. Each step names the fields it checks before moving on. */
const STEPS = [
  { key: "needs", question: "What do you need help with?", hint: "Choose all that apply.", fields: ["needs"] },
  { key: "message", question: "Tell us a little about it.", hint: "A few lines is plenty.", fields: ["message"] },
  { key: "who", question: "Who are we talking to?", hint: null, fields: ["name", "company"] },
  { key: "reach", question: "Where can we reach you?", hint: "We reply within one working day.", fields: ["email", "phone"] },
  { key: "source", question: "How did you hear about us?", hint: "Optional.", fields: [] },
] as const;
const LAST = STEPS.length - 1;

const initial: EnquiryState = { status: "idle" };

/** Reads ?service=<slug> so “Get a quote” on a service page pre-ticks it. */
export function ContactFormWithParams(props: Omit<Props, "preselect">) {
  const params = useSearchParams();
  return <ContactForm {...props} preselect={params.get("service")} />;
}

/**
 * The enquiry form, one question at a time: a step counter and progress line,
 * big tappable options, Back and Continue, contact details near the end and a
 * thank-you screen. Every step stays in the one <form>, so the server action
 * receives the same fields as before and re-checks them all.
 */
export function ContactForm({ needs, sources, preselect }: Props) {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const [step, setStep] = useState(0);
  const [local, setLocal] = useState<Record<string, string>>({});
  const [sentName, setSentName] = useState("");
  const [moved, setMoved] = useState(false);
  const [seen, setSeen] = useState(state);
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLLegendElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const id = useId();
  const v = state.values;
  const errors: Record<string, string> = { ...(state.errors ?? {}), ...local };

  // When the server replies with errors, open the first step that has one.
  if (seen !== state) {
    setSeen(state);
    if (state.status === "error") {
      const bad = STEPS.findIndex((s) => s.fields.some((f) => state.errors?.[f]));
      setLocal({});
      setStep(bad === -1 ? LAST : bad);
      setMoved(true);
    }
  }

  // The thank-you screen takes focus; so does each new question (not on first load).
  useEffect(() => {
    if (state.status === "success") done.current?.focus();
    else if (moved) heading.current?.focus();
  }, [state, step, moved]);

  const check = (i: number) => {
    const fd = new FormData(form.current!);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const e: Record<string, string> = {};
    if (i === 0 && fd.getAll("needs").length === 0) e.needs = "Please choose at least one option.";
    if (i === 1 && !get("message")) e.message = "Please tell us what you need.";
    if (i === 2) {
      if (!get("name")) e.name = "Please enter your name.";
      if (!get("company")) e.company = "Please enter your company.";
    }
    if (i === 3) {
      if (!get("email")) e.email = "Please enter your email.";
      else if (!EMAIL.test(get("email"))) e.email = "Please enter a valid email.";
      if (get("phone") && !PHONE.test(get("phone"))) e.phone = "Please enter a valid phone number.";
    }
    setLocal(e);
    if (Object.keys(e).length) {
      form.current?.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus();
      return false;
    }
    return true;
  };
  const go = (to: number) => {
    setMoved(true);
    setStep(to);
  };
  const next = () => {
    if (check(step)) go(Math.min(step + 1, LAST));
  };

  if (state.status === "success") {
    return (
      <Card step={LAST} done>
        <div ref={done} tabIndex={-1} role="status" className="step-in outline-none">
          <p className="text-[length:clamp(30px,calc(1.6vw+24px),54px)] leading-[1.08] font-medium tracking-[-0.02em] text-balance">
            Thanks{sentName ? `, ${sentName}` : ""}.
          </p>
          <p className="mt-[clamp(12px,1vw,20px)] max-w-[34ch] text-lead text-ink-2 text-pretty">{state.message}</p>
          <div className="mt-[clamp(28px,2.4vw,48px)] flex flex-wrap items-center gap-3">
            <Link href="/" className={buttonClass("dark", "md")}>
              <span className="btn-label">Back to home</span>
            </Link>
            {/* A full reload, so the form starts clean. */}
            <button type="button" onClick={() => window.location.reload()} className={buttonClass("outline", "md")}>
              <span className="btn-label">Start again</span>
            </button>
          </div>
        </div>
      </Card>
    );
  }

  const err = (name: string) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="mt-2 text-small text-error">
        {errors[name]}
      </p>
    ) : null;
  const a11y = (name: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });
  const checked = (value: string) => (v ? v.needs.includes(value) : preselect === value);
  const panel = (i: number) => ({ hidden: step !== i, className: step === i ? "step-in" : undefined });
  const legend = (i: number) => (
    <>
      <legend
        ref={step === i ? heading : undefined}
        tabIndex={-1}
        className="text-[length:clamp(26px,calc(1.3vw+21px),44px)] leading-[1.1] font-medium tracking-[-0.02em] text-balance outline-none"
      >
        {STEPS[i].question}
      </legend>
      {STEPS[i].hint && <p className="mt-[clamp(6px,0.5vw,10px)] text-base text-mute">{STEPS[i].hint}</p>}
    </>
  );
  const body = "mt-[clamp(20px,1.8vw,36px)]";

  return (
    <Card step={step}>
      <form
        ref={form}
        action={action}
        noValidate
        onSubmit={(e) => {
          // Enter on an early step moves on instead of sending.
          if (step < LAST) {
            e.preventDefault();
            next();
            return;
          }
          const fd = new FormData(e.currentTarget);
          const unfinished = STEPS.findIndex((_, i) => !stepFilled(i, fd));
          if (unfinished !== -1) {
            e.preventDefault();
            check(unfinished);
            go(unfinished);
            return;
          }
          setSentName(String(fd.get("name") ?? "").trim().split(/\s+/)[0]);
        }}
      >
        <div role="alert" className={state.status === "error" && !state.errors ? "mb-5 text-base text-error" : "sr-only"}>
          {state.status === "error" && !state.errors ? state.message : ""}
        </div>

        <fieldset {...panel(0)} aria-describedby={errors.needs ? `${id}-needs-error` : undefined}>
          {legend(0)}
          {err("needs")}
          <div className={cn(body, "flex flex-wrap gap-[clamp(8px,0.5vw,10px)]")}>
            {needs.map((n) => (
              <label key={n.value} className="group relative cursor-pointer">
                <input type="checkbox" name="needs" value={n.value} defaultChecked={checked(n.value)} className="peer sr-only" />
                <span className={chip}>
                  <Check className="size-4" strokeWidth={2} />
                  {n.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset {...panel(1)}>
          {legend(1)}
          <div className={body}>
            <label htmlFor={`${id}-message`} className="sr-only">
              Message
            </label>
            <textarea
              id={`${id}-message`}
              name="message"
              required
              rows={6}
              defaultValue={v?.message}
              placeholder="What you want to build or fix, and by when."
              className={cn(field, "min-h-[clamp(160px,10vw,220px)] resize-y py-[clamp(12px,0.8vw,16px)]")}
              {...a11y("message")}
            />
            {err("message")}
          </div>
        </fieldset>

        <fieldset {...panel(2)}>
          {legend(2)}
          <div className={cn(body, "grid gap-[clamp(16px,1.2vw,24px)] sm:grid-cols-2")}>
            <Field label="Name" htmlFor={`${id}-name`}>
              <input id={`${id}-name`} name="name" autoComplete="name" required defaultValue={v?.name} className={input} {...a11y("name")} />
              {err("name")}
            </Field>
            <Field label="Company" htmlFor={`${id}-company`}>
              <input id={`${id}-company`} name="company" autoComplete="organization" required defaultValue={v?.company} className={input} {...a11y("company")} />
              {err("company")}
            </Field>
          </div>
        </fieldset>

        <fieldset {...panel(3)}>
          {legend(3)}
          <div className={cn(body, "grid gap-[clamp(16px,1.2vw,24px)] sm:grid-cols-2")}>
            <Field label="Email" htmlFor={`${id}-email`}>
              <input id={`${id}-email`} name="email" type="email" autoComplete="email" required defaultValue={v?.email} className={input} {...a11y("email")} />
              {err("email")}
            </Field>
            <Field label="Phone" optional htmlFor={`${id}-phone`}>
              <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" defaultValue={v?.phone} className={input} {...a11y("phone")} />
              {err("phone")}
            </Field>
          </div>
        </fieldset>

        <fieldset {...panel(4)}>
          {legend(4)}
          <div className={cn(body, "flex flex-wrap gap-[clamp(8px,0.5vw,10px)]")}>
            {sources.map((s) => (
              <label key={s} className="group relative cursor-pointer">
                <input type="radio" name="source" value={s} defaultChecked={v?.source === s} className="peer sr-only" />
                <span className={chip}>
                  <Check className="size-4" strokeWidth={2} />
                  {s}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Honeypot: hidden from people and assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${id}-website`}>Website</label>
          <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="mt-[clamp(28px,2.6vw,52px)] flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={() => go(step - 1)} className={buttonClass("outline", "lg")}>
              <span className="btn-label">Back</span>
            </button>
          )}
          {step < LAST ? (
            // A submit button, so Enter in a field moves on too (see onSubmit).
            <button type="submit" className={cn(buttonClass("dark", "lg"), "flex-1 sm:flex-none sm:min-w-[220px]")}>
              <span className="btn-label">Continue</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className={cn(buttonClass("dark", "lg"), "flex-1 disabled:cursor-wait disabled:opacity-60 sm:flex-none sm:min-w-[220px]")}
            >
              <span className="btn-label">{pending ? "Sending…" : "Send request"}</span>
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}

/** Whether a step's required fields are filled (used to open the first unfinished step). */
function stepFilled(i: number, fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  if (i === 0) return fd.getAll("needs").length > 0;
  if (i === 1) return Boolean(get("message"));
  if (i === 2) return Boolean(get("name") && get("company"));
  if (i === 3) return EMAIL.test(get("email")) && (!get("phone") || PHONE.test(get("phone")));
  return true;
}

/** The card around the steps: logo, step counter and a progress line. */
function Card({ step, done, children }: { step: number; done?: boolean; children: React.ReactNode }) {
  const total = STEPS.length;
  return (
    <div className="self-start rounded-card border border-ink/10 bg-surface p-[clamp(22px,calc(2vw+14px),56px)]">
      <div className="flex items-center justify-between">
        <Mark className="size-[clamp(30px,2.2vw,40px)]" />
        <p className="text-small text-mute tabular-nums" aria-live="polite">
          <span className="sr-only">{done ? "Sent. " : "Step "}</span>
          {done ? total : step + 1} / {total}
        </p>
      </div>
      <div aria-hidden="true" className="mt-[clamp(14px,1.2vw,22px)] mb-[clamp(24px,2.4vw,48px)] h-px bg-ink/10">
        <div
          className="h-px bg-ink transition-[width] duration-500 ease-[var(--ease-out-soft)]"
          style={{ width: `${((done ? total : step + 1) / total) * 100}%` }}
        />
      </div>
      {children}
    </div>
  );
}

function Field({ label, htmlFor, optional, children }: { label: string; htmlFor: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-[clamp(8px,0.5vw,12px)] block text-base text-ink-2">
        {label}
        {optional && <span className="text-mute"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}
