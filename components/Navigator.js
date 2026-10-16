import Image from "next/image";
import { BarChart3, Link2, LogIn, LogOut, Network } from "lucide-react";
import logo from "../public/logo.svg";
import RouterLink from "./RouterLink";
import { useOptionalAuth } from "./AuthProvider";
import { cn } from "../lib/utils";

const navigation = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/networks", label: "Networks", icon: Network },
  { href: "/links", label: "Links", icon: Link2 },
];

export default function Navigator({ className, style }) {
  const auth = useOptionalAuth();
  const user = auth?.user || null;

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-16 flex-col border-r border-white/10 bg-foreground px-2 py-4 lg:w-[232px] lg:px-4", className)} style={style}>
      <div className="flex h-11 items-center gap-3 px-1 lg:px-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06]">
          <Image src={logo} alt="Affitalink" width={21} height={21} priority />
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="text-base font-semibold tracking-[-0.02em] text-white">Affitalink</p>
        </div>
      </div>
      <nav className="mt-8 space-y-1" aria-label="Main navigation">
        {navigation.map(({ href, label, icon: Icon }) => (
          <RouterLink key={href} to={href} aria-label={label} title={label} className="justify-center text-white hover:bg-white/[0.07] lg:justify-start">
            <Icon className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">{label}</span>
          </RouterLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4">
        {user ? (
          <button type="button" onClick={() => auth.signOut()} aria-label="Sign out" title="Sign out" className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white hover:bg-white/[0.07] lg:justify-start">
            <LogOut className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        ) : (
          <RouterLink to="/login" aria-label="Sign in" title="Sign in" className="justify-center text-white hover:bg-white/[0.07] lg:justify-start">
            <LogIn className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Sign in</span>
          </RouterLink>
        )}
      </div>
    </aside>
  );
}
