import Image from "next/image";
import { BarChart3, Building2, LogIn, LogOut, Network, TicketPercent } from "lucide-react";
import logo from "../public/logo.svg";
import RouterLink from "./RouterLink";
import { useOptionalAuth } from "./AuthProvider";
import { cn } from "../lib/utils";

const navigation = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/networks", label: "Networks", icon: Network },
  { href: "/advertisers", label: "Advertisers", icon: Building2 },
  { href: "/coupons", label: "Coupons", icon: TicketPercent },
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
          <p className="truncate text-xs text-white/50">Coupon workspace</p>
        </div>
      </div>
      <nav className="mt-8 space-y-1" aria-label="Main navigation">
        {navigation.map(({ href, label, icon: Icon }) => (
          <RouterLink key={href} to={href} className="justify-center text-white/75 hover:bg-white/[0.07] hover:text-white lg:justify-start">
            <Icon className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">{label}</span>
          </RouterLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="mb-3 hidden rounded-lg bg-white/[0.05] px-3 py-2 lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Storage</p>
          <p className="mt-1 text-xs font-medium text-white/80">{user ? "Workspace" : "This browser"}</p>
        </div>
        {user ? (
          <button type="button" onClick={() => auth.signOut()} className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.07] hover:text-white lg:justify-start">
            <LogOut className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        ) : (
          <RouterLink to="/login" className="justify-center text-white/75 hover:bg-white/[0.07] hover:text-white lg:justify-start">
            <LogIn className="h-[18px] w-[18px]" />
            <span className="hidden lg:inline">Sign in to sync</span>
          </RouterLink>
        )}
      </div>
    </aside>
  );
}
