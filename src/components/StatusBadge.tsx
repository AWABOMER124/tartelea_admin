import { twMerge } from "tailwind-merge";

const toneStyles = {
  neutral: "bg-[var(--surface-soft)] text-[var(--muted-strong)] border-[var(--border)]",
  success: "bg-[var(--success-soft)] text-[var(--success)] border-[color:rgba(79,117,95,0.18)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color:rgba(154,106,29,0.18)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color:rgba(181,75,75,0.18)]",
  info: "bg-[var(--info-soft)] text-[var(--info)] border-[color:rgba(70,107,118,0.18)]",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: keyof typeof toneStyles;
  className?: string;
}) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneStyles[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
