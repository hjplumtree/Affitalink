function DeleteTokens({ setTokens }) {
  const handleOnClick = () => {
    setTokens({ cj: "", rakuten: "" });
    localStorage.clear();
  };

  return <input onClick={handleOnClick} type="button" value="Delete CJ Info" />;
}

export default DeleteTokens;
