import Link from "next/link";
import Image from "next/image";
import logo from "../public/logo.svg";
import Footer from "./Footer";
import { Button } from "./ui/button";

export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[rgba(247,247,252,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border/70 bg-white shadow-sm">
              <Image src={logo} alt="AffitaLink" width={24} height={24} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-[-0.03em] text-foreground">AffitaLink</p>
              <p className="text-xs text-muted-foreground">Affiliate publisher studio</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/offers" className="hidden sm:block">
              <Button variant="outline">Browse library</Button>
            </Link>
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1280px] flex-col px-4 py-5 lg:px-8 lg:py-8">
        {children}
        <Footer />
      </main>
    </div>
  );
}
