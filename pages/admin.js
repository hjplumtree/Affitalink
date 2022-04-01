import { useState } from "react";
import InformationBoard from "../components/InformationBoard";

export default function Admin() {
  const cj_initialState = {
    token: "",
    requestorId: "",
    websiteId: "",
  };
  const [cjInfo, setCjInfo] = useState(cj_initialState);

  return (
    <main>
      <InformationBoard
        cjInfo={cjInfo}
        setCjInfo={setCjInfo}
        networkName="CJ"
        storageName="cj"
        initialState={cj_initialState}
      />
      {/* <InformationBoard
        tokens={tokens}
        setTokens={setTokens}
        networkName="Rakuten"
        storageName="rakuten"
      /> */}
    </main>
  );
}
