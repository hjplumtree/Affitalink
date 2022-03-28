import { TokenContext } from "../context/TokenContext";

function DeleteTokens() {
  const { tokens, setTokens } = useContext(TokenContext);
  const handleOnClick = () => {
    console.log(tokens);
    localStorage.clear();
  };

  return <input onClick={handleOnClick} type="button" value="Delete Tokens" />;
}

export default DeleteTokens;
