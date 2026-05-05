import { useEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById("portal-root");
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("id", "portal-root");
      document.body.appendChild(el);
    }
    ref.current = el;
    setMounted(true);
    return () => {
      // Не удаляем portal-root, чтобы не ломать другие порталы
    };
  }, []);

  if (!mounted || !ref.current) return null;
  return createPortal(children, ref.current);
}
