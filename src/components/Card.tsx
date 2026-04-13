import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  footer?: ReactNode;
}

export function Card({ children, title, className, footer }: CardProps) {
  return (
    <div className={twMerge('glass overflow-hidden flex flex-col', className)}>
      {title && (
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="flex-1 p-6">
        {children}
      </div>
      {footer && (
        <div className="border-t border-white/10 bg-white/5 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}
