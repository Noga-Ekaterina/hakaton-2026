import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, description, children, actions, onClose }: ModalProps) {
  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Закрыть модальное окно"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        type="button"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.24)]"
      >
        <div className="border-b border-slate-200 bg-gradient-to-br from-orange-50 to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="modal-title" className="text-2xl font-black tracking-tight text-slate-950">
                {title}
              </h2>
              {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
            </div>

            <Button type="button" variant="ghost" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>

        <div className="p-6">{children}</div>

        {actions ? <div className="border-t border-slate-200 px-6 py-5">{actions}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
