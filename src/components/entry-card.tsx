"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "./ui";
import { cn } from "@/lib/utils";

/** Collapsible entry card with drag handle + reorder/move/delete controls. */
export const EntryCard = ({
  title,
  subtitle,
  children,
  onRemove,
  onMoveUp,
  onMoveDown,
  first,
  last,
  dragProps,
  isDragging,
  over,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  first?: boolean;
  last?: boolean;
  dragProps?: Record<string, unknown>;
  isDragging?: boolean;
  over?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn("entry-card", isDragging && "opacity-50", over && "border-t-2 border-t-[var(--accent)]")}
      draggable={!!dragProps}
      {...(dragProps || {})}
    >
      <div className="entry-head-row">
        {dragProps && (
          <span className="handle" title="Drag">
            <Icon.grip />
          </span>
        )}
        <button
          type="button"
          className="flex-1 text-start"
          onClick={() => setOpen(!open)}
          style={{ textAlign: "start" }}
        >
          <span className="entry-title-text">{title}</span>
          {subtitle && <span className="text-xs text-[var(--text-2)] ms-2">{subtitle}</span>}
          <span className="text-xs text-[var(--text-2)]">{open ? " ▲" : " ▼"}</span>
        </button>
        <div className="entry-tools">
          {onMoveUp && (
            <button className="iconbtn" onClick={onMoveUp} disabled={first} title="Up">
              <Icon.up />
            </button>
          )}
          {onMoveDown && (
            <button className="iconbtn" onClick={onMoveDown} disabled={last} title="Down">
              <Icon.down />
            </button>
          )}
          <button className="iconbtn danger" onClick={onRemove} title="Delete">
            <Icon.trash />
          </button>
        </div>
      </div>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
};
