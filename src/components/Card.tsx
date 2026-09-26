import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  footer?: ReactNode;
}

export function Card({ children, title, className, footer }: CardProps) {
  return (
    <section className={twMerge("glass flex flex-col overflow-hidden", className)}>
      {title ? (
        <div className="border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
          <h3 className="text-base font-bold text-[var(--foreground)] sm:text-lg">{title}</h3>
        </div>
      ) : null}
      <div className="flex-1 p-4 sm:p-5">{children}</div>
      {footer ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3.5 sm:px-5">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
