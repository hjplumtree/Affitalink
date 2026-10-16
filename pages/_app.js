import { useRouter } from "next/router";
import Layouts from "../components/Layouts";
import Navigator from "../components/Navigator";
import PublicShell from "../components/PublicShell";
import { getShellForPath } from "../lib/appShells";
import Head from "next/head";
import { AuthProvider } from "../components/AuthProvider";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const shell = getShellForPath(router.pathname);

  return (
    <AuthProvider>
      <Head>
        <link rel="icon" href="/logo.svg" />
      </Head>
      {shell === "public" ? (
        <PublicShell>
          <Component {...pageProps} />
        </PublicShell>
      ) : (
        <div className="flex">
          <Navigator />
          <Layouts>
            <Component {...pageProps} />
          </Layouts>
        </div>
      )}
    </AuthProvider>
  );
}

export default MyApp;
