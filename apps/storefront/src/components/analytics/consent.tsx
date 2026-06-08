"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Consent = "granted" | "denied" | null;
const STORAGE_KEY = "hudsten_consent";

const ConsentContext = createContext<{
  consent: Consent;
  setConsent: (c: Exclude<Consent, null>) => void;
}>({ consent: null, setConsent: () => {} });

/** Persists the visitor's analytics-cookie choice; gates script loading. */
export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setState] = useState<Consent>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "granted" || stored === "denied") setState(stored);
  }, []);

  const setConsent = useCallback((c: Exclude<Consent, null>) => {
    localStorage.setItem(STORAGE_KEY, c);
    setState(c);
  }, []);

  return (
    <ConsentContext.Provider value={{ consent, setConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export const useConsent = () => useContext(ConsentContext);
