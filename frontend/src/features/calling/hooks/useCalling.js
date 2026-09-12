import { useContext } from "react";
import { CallContext } from "../call.context";

export const useCalling = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCalling must be used within a CallContextProvider");
  }
  return context;
};
