import { TokenContext } from "../context/TokenContext";
import { useContext } from "react";

function DeleteTokens({ setTokens }) {
  const handleOnClick = () => {
    setTokens({ cj: "", rakuten: "" });
    localStorage.clear();
  };

  return <input onClick={handleOnClick} type="button" value="Delete Tokens" />;
}

export default DeleteTokens;
