"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { initial, KEY, State } from "@/lib/data";
type Ctx = {
  state: State;
  ready: boolean;
  save: (next: State) => void;
  reset: () => void;
};
const Context = createContext<Ctx>({
  state: initial,
  ready: false,
  save: () => {},
  reset: () => {},
});
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        setState({
          business: obj.business ?? null,
          completed: Array.isArray(obj.completed) ? obj.completed : [],
          inspection: Array.isArray(obj.inspection) ? obj.inspection : [],
          documents: Array.isArray(obj.documents) ? obj.documents : [],
        });
      }
    } catch {}
    setReady(true);
  }, []);
  function save(next: State) {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }
  function reset() {
    save(initial);
  }
  return (
    <Context.Provider value={{ state, ready, save, reset }}>
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
