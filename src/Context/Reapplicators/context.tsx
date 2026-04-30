import { createContext } from "react";
import { ReapplicatorsTypes } from "./type";
import { ReapplicatorsState } from "./state";

export const ReapplicatorsContext = createContext<ReapplicatorsTypes | null>(null);

const ReapplicatorsProvider = ({ children }: { children: React.ReactNode }) => {
  const state = ReapplicatorsState();

  return (
    <ReapplicatorsContext.Provider value={state}>
      {children}
    </ReapplicatorsContext.Provider>
  );
};

export default ReapplicatorsProvider;
