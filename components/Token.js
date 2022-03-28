import { useState, useEffect } from "react";

export default function Token({ networkName, storageName }) {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (localStorage.getItem(storageName)) {
      setInput(localStorage.getItem(storageName));
    }
  }, []);

  const handleOnChange = (e) => {
    console.log(e.target.value);
    setInput(e.target.value);
  };

  const handleOnClick = () => {
    if (input) {
      localStorage.setItem(storageName, input);
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
          value={input}
        />
        <input onClick={handleOnClick} type="button" value="Save" />
      </form>
    </div>
  );
}
