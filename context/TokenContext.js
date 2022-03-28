import { createContext, useReducer } from "react";

export const TokenContext = createContext();

const initialState = {
  cj: "",
  rakuten: "",
};

const reducer = (state, action) => {
  if (action.type === "SET_CJ_TOKEN") {
    return {
      ...state,
      cj: action.value,
    };
  } else if (action.type === "SET_RAKUTEN_TOKEN") {
    return {
      ...state,
      rakuten: action.value,
    };
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
