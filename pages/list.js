import { fetchCjAdvertisers } from "../lib/fetch";

function list() {
  const handleOnClick = () => {
    fetchCjAdvertisers().then((data) => {
      console.log(data);
    });
  };
  return (
    <div>
      <header>
        <div>
          <h1>Rakuten</h1>
          <p>last update : 2022-03-27</p>
        </div>
        <div>
          <button onClick={handleOnClick}>Retrieve</button>
          <select>
            <option>CJ</option>
            <option>Rakuten</option>
            <option>pepperjam</option>
          </select>
        </div>
      </header>
      <main>
        <div>
          <h3>Ashford</h3>
          <p>13 Offers</p>
        </div>
      </main>
    </div>
  );
}

export default list;
