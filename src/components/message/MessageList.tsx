import { ReactNode, useRef, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export interface MessageListProps {
  children: ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export function MessageList({ children, onLoadMore, hasMore, loadingMore }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);
  const prevChildCount = useRef(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !onLoadMore || !hasMore || loadingMore) return;
    if (el.scrollTop < 100) {
      prevScrollHeight.current = el.scrollHeight;
      onLoadMore();
    }
  }, [onLoadMore, hasMore, loadingMore]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Preserve scroll position when new messages are prepended
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const childCount = el.children.length;
    if (childCount > prevChildCount.current) {
      const newHeight = el.scrollHeight;
      el.scrollTop = newHeight - prevScrollHeight.current;
    }
    prevChildCount.current = childCount;
  }, [children]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1">
      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
        </div>
      )}
      {children}
    </div>
  );
}
