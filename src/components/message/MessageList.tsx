import { ReactNode } from 'react';

export interface MessageListProps {
  children: ReactNode;
}

export function MessageList({ children }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1">
      {children}
    </div>
  );
}
