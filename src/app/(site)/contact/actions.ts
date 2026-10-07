"use server";

import { Resend } from "resend";
import { getServices, getSettings } from "@/lib/data";
import { getWriteClient } from "@/sanity/lib/write-client";
import { CONTACT_FORM } from "@/content/seed-data";
import type { EnquiryState } from "./types";

const DEFAULT_ENQUIRY_INBOX = "opsiogen@gmail.com";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\-.\s\d]{6,30}$/;

const text = (fd: FormData, key: string, max: number) => String(fd.get(key) ?? "").trim().slice(0, max);

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const settings = await getSettings();

  // Honeypot: people never see or fill this field; bots usually do.
  // Pretend it worked so the bot moves on.
  if (text(formData, "website", 200)) {
    return { status: "success", message: settings.enquirySuccessMessage };
  }

  const services = await getServices();
  const allowedNeeds = new Map<string, string>([
    ...services.map((s) => [s.slug, s.name] as [string, string]),
    ...CONTACT_FORM.extraNeeds.map((n) => [n, n] as [string, string]),
  ]);

  const values = {
    name: text(formData, "name", 120),
    email: text(formData, "email", 200),
    phone: text(formData, "phone", 40),
    company: text(formData, "company", 160),
    message: text(formData, "message", 5000),
    source: text(formData, "source", 60),
    needs: formData
      .getAll("needs")
      .map(String)
      .filter((n) => allowedNeeds.has(n)),
  };

  const errors: Record<string, string> = {};
  if (!values.name) errors.name = "Please enter your name.";
  if (!values.email) errors.email = "Please enter your email.";
  else if (!EMAIL.test(values.email)) errors.email = "Please enter a valid email.";
  if (values.phone && !PHONE.test(values.phone)) errors.phone = "Please enter a valid phone number.";
  if (!values.company) errors.company = "Please enter your company.";
  if (values.needs.length === 0) errors.needs = "Please choose at least one option.";
  if (!values.message) errors.message = "Please tell us what you need.";
  if (values.source && !CONTACT_FORM.sources.includes(values.source)) values.source = "";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", errors, values };
  }

  const needNames = values.needs.map((n) => allowedNeeds.get(n)!);
  const submittedAt = new Date().toISOString();
  let delivered = false;

  // 1. Save to the CMS as an Enquiry.
  const sanity = getWriteClient();
  if (sanity) {
    try {
      await sanity.create({
        // IDs containing a "." are private in Sanity: only signed-in editors
        // and token holders can read them, even though the dataset is public.
        _id: `enquiry.${crypto.randomUUID()}`,
        _type: "enquiry",
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        company: values.company,
        needs: needNames,
        message: values.message,
        source: values.source || undefined,
        submittedAt,
      });
      delivered = true;
    } catch (err) {
      console.error("Enquiry: could not save to Sanity", err);
    }
  }

  // 2. Email the company inbox.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.ENQUIRY_TO_EMAIL || DEFAULT_ENQUIRY_INBOX;
  if (apiKey && from && to) {
    const rows: [string, string][] = [
      ["Name", values.name],
      ["Email", values.email],
      ["Phone", values.phone || "—"],
      ["Company", values.company],
      ["What do you need?", needNames.join(", ")],
      ["How did you hear about us?", values.source || "—"],
    ];
    try {
      const { error } = await new Resend(apiKey).emails.send({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        replyTo: values.email,
        subject: `New enquiry: ${values.name}, ${values.company}`,
        text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nMessage:\n${values.message}`,
        html: `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
          .map(([k, v]) => `<tr><td style="color:#6f6f6f;vertical-align:top">${escape(k)}</td><td>${escape(v)}</td></tr>`)
          .join("")}</table><p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escape(values.message)}</p>`,
      });
      if (error) throw error;
      delivered = true;
    } catch (err) {
      console.error("Enquiry: could not send email", err);
    }
  }

  if (!delivered) {
    if (!sanity && !(apiKey && from && to) && process.env.NODE_ENV !== "production") {
      // Local development before the keys are added: log instead of failing.
      console.warn("Enquiry received but no Sanity token or Resend key is set:", { ...values, needs: needNames });
    } else {
      return {
        status: "error",
        message: "Sorry, something went wrong sending your message. Please try again.",
        values,
      };
    }
  }

  return { status: "success", message: settings.enquirySuccessMessage };
}
