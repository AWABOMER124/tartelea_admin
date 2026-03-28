import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  footer?: ReactNode;
}

export function Card({ children, title, className, footer }: CardProps) {
  return (
    <div className={cn('premium-card flex flex-col', className)}>
      {title && (
        <div className="px-6 py-5 border-b border-border/50">
          <h3 className="spiritual-text text-xl font-bold gradient-text">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-1">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-primary/5 border-t border-border/50">
          {footer}
        </div>
      )}
    </div>
  );
}

