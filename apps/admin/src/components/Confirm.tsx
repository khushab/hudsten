import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Promise-based confirm: `if (await confirm({...})) { ... }`. */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}

/**
 * App-level confirmation modal. Replaces window.confirm() with an on-brand dialog
 * and exposes a promise-based `useConfirm()` so call sites stay one-liners. A single
 * modal instance is rendered for the whole app; the resolved boolean is the answer.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    opts: ConfirmOptions;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (opts) => new Promise<boolean>((resolve) => setState({ opts, resolve })),
    [],
  );

  // Defined in render so it closes over the current pending state.
  const settle = (result: boolean) => {
    if (!state) return;
    state.resolve(result);
    setState(null);
  };

  // Esc cancels; lock body scroll while a dialog is open.
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        state.resolve(false);
        setState(null);
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [state]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
            onClick={() => settle(false)}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              className="w-full max-w-md rounded-lg border border-stone-200 bg-paper p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="confirm-title" className="font-display text-lg font-semibold text-ink">
                {state.opts.title}
              </h2>
              {state.opts.message && (
                <p className="mt-2 text-sm text-stone-600">{state.opts.message}</p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => settle(false)}>
                  {state.opts.cancelLabel ?? "Cancel"}
                </Button>
                <Button
                  variant={state.opts.danger ? "danger" : "primary"}
                  size="sm"
                  autoFocus
                  onClick={() => settle(true)}
                >
                  {state.opts.confirmLabel ?? "Confirm"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
}
