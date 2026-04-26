"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type ExpandableTextBlockProps = {
  children: ReactNode;
  collapsedHeightClassName?: string;
};

export default function ExpandableTextBlock({
  children,
  collapsedHeightClassName = "max-h-[24rem]",
}: ExpandableTextBlockProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const updateExpandable = () => {
      if (expanded) {
        setIsExpandable(content.scrollHeight > wrapper.clientHeight + 12);
        return;
      }

      setIsExpandable(content.scrollHeight > wrapper.clientHeight + 12);
    };

    updateExpandable();

    const resizeObserver = new ResizeObserver(updateExpandable);
    resizeObserver.observe(wrapper);
    resizeObserver.observe(content);
    window.addEventListener("resize", updateExpandable);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateExpandable);
    };
  }, [children, expanded]);

  return (
    <div>
      <div
        ref={wrapperRef}
        className={!expanded ? `relative overflow-hidden ${collapsedHeightClassName}` : undefined}
      >
        <div ref={contentRef}>{children}</div>
        {!expanded && isExpandable ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/96 to-transparent" />
        ) : null}
      </div>

      {isExpandable ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 ml-auto block text-right text-sm font-semibold text-[color:var(--color-navy)] transition-colors hover:text-[color:var(--color-brackish)]"
        >
          {expanded ? "Weniger anzeigen" : "+ Mehr anzeigen"}
        </button>
      ) : null}
    </div>
  );
}
