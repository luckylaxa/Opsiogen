"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { submitEnquiry } from "@/app/(site)/contact/actions";
import type { EnquiryState } from "@/app/(site)/contact/types";
import { buttonClass } from "@/components/ui/Button";
import { Check, ChevronDown } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type Props = { needs: Option[]; sources: string[]; preselect?: string | null };

const field =
  "w-full rounded-[6px] border border-transparent bg-field px-[clamp(14px,calc(0.4vw+12.5px),20px)] text-base text-ink placeholder:text-mute transition-[border-color,background-color] duration-200 hover:border-ink/20 focus:border-ink focus:bg-surface focus:outline-none aria-[invalid=true]:border-error";

const initial: EnquiryState = { status: "idle" };

/** Reads ?service=<slug> so “Start a project” on a service page pre-ticks it. */
export function ContactFormWithParams(props: Omit<Props, "preselect">) {
  const params = useSearchParams();
  return <ContactForm {...props} preselect={params.get("service")} />;
}

export function ContactForm({ needs, sources, preselect }: Props) {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const status = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const id = useId();
  const errors = state.errors ?? {};
  const v = state.values;

  // Move focus to the result so screen readers and keyboard users land on it.
  useEffect(() => {
    if (state.status === "success") status.current?.focus();
    if (state.status === "error") {
      const firstInvalid = form.current?.querySelector<HTMLElement>("[aria-invalid=true]");
      (firstInvalid ?? status.current)?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={status} tabIndex={-1} role="status" className="outline-none">
        <p className="max-w-[22ch] text-h2 font-medium text-balance">{state.message}</p>
      </div>
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

  return (
    <form ref={form} action={action} noValidate className="grid grid-cols-1 gap-x-gap gap-y-[clamp(20px,calc(0.72vw+17.3px),31px)] sm:grid-cols-2">
      <div
        ref={status}
        tabIndex={-1}
        role="alert"
        className={cn("outline-none sm:col-span-2", state.status === "error" ? "text-base text-error" : "sr-only")}
      >
        {state.status === "error" ? state.message : ""}
      </div>

      <Field label="Name" htmlFor={`${id}-name`}>
        <input id={`${id}-name`} name="name" autoComplete="name" required defaultValue={v?.name} className={cn(field, "h-[clamp(48px,calc(0.79vw+45px),60px)]")} {...a11y("name")} />
        {err("name")}
      </Field>
      <Field label="Email" htmlFor={`${id}-email`}>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" required defaultValue={v?.email} className={cn(field, "h-[clamp(48px,calc(0.79vw+45px),60px)]")} {...a11y("email")} />
        {err("email")}
      </Field>
      <Field label="Phone" optional htmlFor={`${id}-phone`}>
        <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" defaultValue={v?.phone} className={cn(field, "h-[clamp(48px,calc(0.79vw+45px),60px)]")} {...a11y("phone")} />
        {err("phone")}
      </Field>
      <Field label="Company" htmlFor={`${id}-company`}>
        <input id={`${id}-company`} name="company" autoComplete="organization" required defaultValue={v?.company} className={cn(field, "h-[clamp(48px,calc(0.79vw+45px),60px)]")} {...a11y("company")} />
        {err("company")}
      </Field>

      <fieldset className="sm:col-span-2" aria-describedby={errors.needs ? `${id}-needs-error` : undefined}>
        <legend className="mb-[clamp(10px,0.6vw,14px)] text-base text-ink-2">What do you need?</legend>
        <div className="flex flex-wrap gap-[clamp(6px,0.42vw,8px)]">
          {needs.map((n) => (
            <label key={n.value} className="relative cursor-pointer">
              <input type="checkbox" name="needs" value={n.value} defaultChecked={checked(n.value)} className="peer sr-only" />
              <span className="flex h-[clamp(40px,calc(0.72vw+37.3px),49px)] items-center gap-2 rounded-[7px] border border-ink/15 px-[clamp(14px,calc(0.33vw+12.8px),19px)] text-base transition-[background-color,border-color,color] duration-200 hover:border-ink/60 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-on-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink [&>svg]:hidden peer-checked:[&>svg]:block">
                <Check className="size-4" strokeWidth={2} />
                {n.label}
              </span>
            </label>
          ))}
        </div>
        {err("needs")}
      </fieldset>

      <Field label="Message" htmlFor={`${id}-message`} className="sm:col-span-2">
        <textarea id={`${id}-message`} name="message" required rows={6} defaultValue={v?.message} className={cn(field, "min-h-[clamp(160px,10vw,220px)] resize-y py-[clamp(12px,0.8vw,16px)]")} {...a11y("message")} />
        {err("message")}
      </Field>

      <Field label="How did you hear about us?" optional htmlFor={`${id}-source`}>
        <div className="relative">
          <select id={`${id}-source`} name="source" defaultValue={v?.source ?? ""} className={cn(field, "h-[clamp(48px,calc(0.79vw+45px),60px)] appearance-none pr-12")}>
            <option value="">Choose one</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2" />
        </div>
      </Field>

      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex items-end sm:col-span-2">
        <button type="submit" disabled={pending} className={cn(buttonClass("dark", "lg"), "disabled:cursor-wait disabled:opacity-60")}>
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-[clamp(8px,0.5vw,12px)] block text-base text-ink-2">
        {label}
        {optional && <span className="text-mute"> (optional)</span>}
      </label>
      {children}
    </div>
  );
}
