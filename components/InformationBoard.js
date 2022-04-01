import { useEffect } from "react";

export default function Token({
  cjInfo,
  setCjInfo,
  networkName,
  storageName,
  initialState,
}) {
  useEffect(() => {
    console.log(JSON.parse(localStorage.getItem(storageName)));
    if (localStorage.getItem(storageName)) {
      setCjInfo(JSON.parse(localStorage.getItem(storageName)));
    }
  }, []);

  const handleOnChange = (e) => {
    setCjInfo((prevState) => {
      const newState = { ...prevState };
      newState[e.target.dataset.name] = e.target.value;
      return newState;
    });
  };

  const handleOnClick = () => {
    if (cjInfo || localStorage.getItem(storageName)) {
      localStorage.setItem(storageName, JSON.stringify(cjInfo));
    }
  };

  const handleDelete = () => {
    setCjInfo(initialState);
    localStorage.removeItem(storageName);
  };
  return (
    <div>
      <h1>{networkName}</h1>
      <form>
        <div>
          <p>TOKEN</p>
          <input
            onChange={handleOnChange}
            type="password"
            placeholder="Enter token"
            value={cjInfo["token"]}
            data-name="token"
            required
          />
        </div>
        <div>
          <p>Requestor id</p>

          <input
            onChange={handleOnChange}
            type="text"
            placeholder="Enter requestor id"
            value={cjInfo["requestorId"]}
            data-name="requestorId"
          />
        </div>
        <div>
          <p>website id</p>

          <input
            onChange={handleOnChange}
            type="text"
            placeholder="Enter website id"
            value={cjInfo["websiteId"]}
            data-name="websiteId"
          />
        </div>
        <input onClick={handleOnClick} type="button" value="Save" />
        <input onClick={handleDelete} type="button" value={`Delete Info`} />
      </form>
    </div>
  );
}
