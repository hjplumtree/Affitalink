import { useEffect } from "react";

export default function Token({ tokens, setTokens, networkName, storageName }) {
  useEffect(() => {
    if (localStorage.getItem(storageName)) {
      setTokens((prevState) => {
        const newState = { ...prevState };
        newState[storageName] = localStorage.getItem(storageName);
        return newState;
      });
      console.log(tokens);
    }
  }, []);

  const handleOnChange = (e) => {
    setTokens((prevState) => {
      const newState = { ...prevState };
      newState[storageName] = e.target.value;
      return newState;
    });
  };

  const handleOnClick = () => {
    if (tokens[storageName]) {
      setTokens((prevState) => {
        const newState = { ...prevState };
        newState[storageName] = tokens[storageName];
        return newState;
      });
      localStorage.setItem(storageName, tokens[storageName]);
    }
  };

  return (
    <div>
      <h1>{networkName}</h1>
      <form>
        <input
          onChange={handleOnChange}
          type="text"
          placeholder="Enter your token"
          value={tokens[storageName]}
        />
        <input onClick={handleOnClick} type="button" value="Save" />
      </form>
    </div>
  );
}
