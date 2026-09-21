import Link from "next/link";
import Image from "next/image";
import logo from "../public/logo.svg";
import { Button } from "./ui/button";

export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-[rgba(248,247,241,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-white shadow-sm">
              <Image src={logo} alt="Affitalink" width={24} height={24} priority />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-foreground">Affitalink</p>
              <p className="text-xs text-muted-foreground">Coupon workspace</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="hidden sm:block">
              <Button variant="outline">Use without an account</Button>
            </Link>
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1080px] flex-col px-4 py-8 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
