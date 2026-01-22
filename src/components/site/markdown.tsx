function renderInline(text: string) {
  const pattern = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  const nodes: Array<string | JSX.Element> = [];
  let lastIndex = 0;

  text.replace(pattern, (match, _boldFull, boldText, _linkFull, linkText, linkUrl, offset) => {
    if (offset > lastIndex) {
      nodes.push(text.slice(lastIndex, offset));
    }

    if (boldText) {
      nodes.push(<strong key={`${offset}-b`} className="text-white">
        {boldText}
      </strong>);
    } else if (linkText && linkUrl) {
      nodes.push(
        <a key={`${offset}-l`} href={linkUrl} className="text-emerald-200 underline">
          {linkText}
        </a>,
      );
    } else {
      nodes.push(match);
    }

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parseBlocks(content: string) {
  const blocks = content.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block, index) => {
    if (block.startsWith("### ")) {
      return (
        <h3 key={index} className="text-lg font-semibold text-white">
          {renderInline(block.replace(/^###\s+/, ""))}
        </h3>
      );
    }

    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="text-xl font-semibold text-white">
          {renderInline(block.replace(/^##\s+/, ""))}
        </h2>
      );
    }

    if (block.startsWith("# ")) {
      return (
        <h1 key={index} className="text-2xl font-semibold text-white">
          {renderInline(block.replace(/^#\s+/, ""))}
        </h1>
      );
    }

    const lines = block.split("\n");
    if (lines.every((line) => line.trim().startsWith("- "))) {
      return (
        <ul key={index} className="list-disc space-y-2 pl-5">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInline(line.replace(/^[-]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
      return (
        <ol key={index} className="list-decimal space-y-2 pl-5">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInline(line.replace(/^\d+\.\s+/, ""))}</li>
          ))}
        </ol>
      );
    }

    return (
      <p key={index} className="text-sm text-white/80">
        {renderInline(block)}
      </p>
    );
  });
}

export function MarkdownRenderer({ content }: { content: string }) {
  return <div className="space-y-4">{parseBlocks(content)}</div>;
}
