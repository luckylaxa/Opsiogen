import Link from "next/link";
import { PortableText, type PortableTextBlock, type PortableTextComponents } from "next-sanity";
import type { Post, PostImageBlock } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { isExternal } from "@/lib/utils";

/** Text of a block, for heading anchors and the contents list. */
const blockText = (b: PortableTextBlock) =>
  (b.children as { text?: string }[] | undefined)?.map((c) => c.text ?? "").join("") ?? "";

export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");

/** The post's main headings, for the contents list. */
export function postHeadings(body: Post["body"]) {
  return body
    .filter((b): b is PortableTextBlock => b._type === "block" && (b as PortableTextBlock).style === "h2")
    .map((b) => ({ id: headingId(blockText(b)), text: blockText(b) }))
    .filter((h) => h.text);
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-[1.1em] first:mt-0">{children}</p>,
    h2: ({ children, value }) => (
      <h2
        id={headingId(blockText(value))}
        className="mt-[1.9em] scroll-mt-[calc(var(--header-h)+24px)] text-[length:clamp(24px,calc(0.9vw+20.6px),38px)] leading-[1.15] font-medium tracking-[-0.02em] text-ink text-balance first:mt-0"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-[1.6em] text-[length:clamp(19px,calc(0.42vw+17.4px),26px)] leading-[1.25] font-medium text-ink">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-[1.6em] border-l-2 border-accent pl-[clamp(16px,1.6vw,32px)] text-[length:clamp(22px,calc(0.84vw+18.8px),34px)] leading-[1.25] font-medium tracking-[-0.015em] text-ink text-balance">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mt-[1.1em] list-disc space-y-[0.5em] pl-[1.3em] marker:text-accent">{children}</ul>,
    number: ({ children }) => (
      <ol className="mt-[1.1em] list-decimal space-y-[0.5em] pl-[1.4em] marker:font-medium marker:text-accent">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href = String(value?.href ?? "");
      return isExternal(href) ? (
        <a href={href} className="link-accent text-ink underline underline-offset-[0.2em]" rel="noopener">
          {children}
        </a>
      ) : (
        <Link href={href} className="link-accent text-ink underline underline-offset-[0.2em]">
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }: { value: PostImageBlock }) =>
      value?.url ? (
        <figure className="my-[1.8em]">
          <div className="overflow-hidden rounded-card bg-night">
            <Media image={value} fill={false} lowPriority sizes="(min-width: 1024px) 720px, 100vw" />
          </div>
          {value.caption && <figcaption className="mt-3 text-small text-mute">{value.caption}</figcaption>}
        </figure>
      ) : null,
  },
};

/** A post's text, set for reading. */
export function PostBody({ body }: { body: Post["body"] }) {
  return (
    <div className="text-[length:clamp(17px,calc(0.33vw+15.8px),21px)] leading-[1.65] text-ink-2">
      <PortableText value={body as PortableTextBlock[]} components={components} />
    </div>
  );
}
