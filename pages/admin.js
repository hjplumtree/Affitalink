import Token from "../components/Token";
import DeleteTokens from "../components/DeleteTokens";

function admin() {
  return (
    <main>
      <Token networkName="CJ" storageName="cjToken" />
      <Token networkName="Rakuten" storageName="rakutenToken" />
      <DeleteTokens />
    </main>
  );
}

export default admin;
