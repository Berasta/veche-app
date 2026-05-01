import { lazy, Suspense, ComponentType } from "react";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
    </div>
  );
}

export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
) {
  const Lazy = lazy(importFn);
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingFallback />}>
      <Lazy {...props} />
    </Suspense>
  );
}
