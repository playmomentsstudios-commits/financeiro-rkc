// src/components/site/markdown.tsx
import * as React from "react";

function renderInline(text: string): Array<React.ReactNode> {
  const pattern = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  const nodes: Array<React.ReactNode> = [];
  let lastIndex = 0;

  text.replace(
    pattern,
    (
      match,
      _boldFull,
      boldText,
      _linkFull,
      linkText,
      linkUrl,
      offset: number
    ) => {
      // texto antes do match
      if (offset > lastIndex) nodes.push(text.slice(lastIndex, offset));

      // **negrito**
      if (boldText) {
        nodes.push(
          <strong key={`b-${offset}`}>{String(boldText)}</strong>
        );
      }

      // [texto](url)
      if (linkText && linkUrl) {
        const href = String(linkUrl);
        const isExternal = /^https?:\/\//i.test(href);

        nodes.push(
          <a
            key={`a-${offset}`}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer noopener" : undefined}
            className="underline underline-offset-4 hover:opacity-80"
          >
            {String(linkText)}
          </a>
        );
      }

      lastIndex = offset + match.length;
      return match;
    }
  );

  // texto restante
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function MarkdownRenderer({ content }: { content: string }) {
  const lines = (content ?? "").split("\n");

  return (
    <div className="prose prose-invert max-w-none">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={i} className="h-3" />;

        // headings simples
        if (trimmed.startsWith("### "))
          return <h3 key={i}>{trimmed.replace(/^###\s+/, "")}</h3>;
        if (trimmed.startsWith("## "))
          return <h2 key={i}>{trimmed.replace(/^##\s+/, "")}</h2>;
        if (trimmed.startsWith("# "))
          return <h1 key={i}>{trimmed.replace(/^#\s+/, "")}</h1>;

        // lista simples "- "
        if (trimmed.startsWith("- ")) {
          return (
            <ul key={i}>
              <li>{renderInline(trimmed.replace(/^-+\s+/, ""))}</li>
            </ul>
          );
        }

        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

// Alias para compatibilidade caso outras telas importem "Markdown"
export const Markdown = MarkdownRenderer;
