import Layouts from "../components/Layouts";
import Navigator from "../components/Navigator";
import Head from "next/head";
import { AuthProvider } from "../components/AuthProvider";
import { ToastProvider } from "../components/ToastProvider";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Head>
          <link rel="icon" href="/logo.svg" />
        </Head>
        <div className="flex">
          <Navigator />
          <Layouts>
            <Component {...pageProps} />
          </Layouts>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default MyApp;
