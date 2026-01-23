// src/components/site/markdown.tsx
import * as React from "react";

function renderInline(text: string): Array<React.ReactNode> {
  const pattern = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  const nodes: Array<React.ReactNode> = []; // <- NÃO use JSX.Element aqui
  let lastIndex = 0;

  text.replace(
    pattern,
    (match, _boldFull, boldText, _linkFull, linkText, linkUrl, offset: number) => {
      if (offset > lastIndex) nodes.push(text.slice(lastIndex, offset));

      if (boldText) {
        nodes.push(<strong key={`b-${offset}`}>{String(boldText)}</strong>);
      }

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

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
