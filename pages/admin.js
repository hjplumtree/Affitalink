import { useState } from "react";
import Token from "../components/Token";
import DeleteTokens from "../components/DeleteTokens";

export default function Admin() {
  const initialState = {
    cj: "",
    rakuten: "",
  };

  const [tokens, setTokens] = useState(initialState);

  return (
    <main>
      <Token
        tokens={tokens}
        setTokens={setTokens}
        networkName="CJ"
        storageName="cj"
      />
      <Token
        tokens={tokens}
        setTokens={setTokens}
        networkName="Rakuten"
        storageName="rakuten"
      />
      <DeleteTokens setTokens={setTokens} />
    </main>
  );
}
