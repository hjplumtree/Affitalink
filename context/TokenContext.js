import { createContext, useReducer, useState } from "react";

export const TokenContext = createContext();

const initialState = {
  cj: "",
  rakuten: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_CJ_TOKEN":
      return {
        ...state,
        cj: action.value,
      };
    case "SET_RAKUTEN_TOKEN":
      return {
        ...state,
        rakuten: action.value,
      };
    case "CLEAR_TOKENS":
      return {
        ...initialState,
      };
    default:
      throw new Error("Check action type");
  }
};

export function TokenProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <TokenContext.Provider value={{ state, dispatch }}>
      {children}
    </TokenContext.Provider>
  );
}
