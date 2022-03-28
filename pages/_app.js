import "../styles/globals.css";
import Layouts from "../components/Layouts";
import { TokenProvider } from "../context/TokenContext";

function MyApp({ Component, pageProps }) {
  return (
    <Layouts>
      <TokenProvider>
        <Component {...pageProps} />
      </TokenProvider>
    </Layouts>
  );
}

export default MyApp;
