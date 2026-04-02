import Image from "next/image";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaLink,
  FaNetworkWired,
  FaSignInAlt,
  FaSignOutAlt,
  FaTags,
} from "react-icons/fa";
import { useState } from "react";
import logo from "../public/logo.svg";
import RouterLink from "./RouterLink";
import { useOptionalAuth } from "./AuthProvider";
import { cn } from "../lib/utils";

export default function Navigator({ className, style }) {
  const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
  const auth = useOptionalAuth();
  const user = auth?.user || null;
  const signOut = auth?.signOut || (async () => {});

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-[100] h-full border-r border-white/10 bg-[#12131a] p-3 pt-4 backdrop-blur-xl transition-all",
        burgerMenuOpen ? "w-[210px]" : "w-[55px]",
        "lg:w-[210px]",
        className
      )}
      style={style}
    >
      <div className="relative mb-5 flex w-full items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <Image src={logo} alt="logo" width={24} height={24} />
          </div>
          <div className={cn("hidden lg:block", burgerMenuOpen && "block")}>
            <p className="text-lg font-bold tracking-[-0.03em] text-white">AffitaLink</p>
            <p className="text-xs text-white/75">Affiliate offers dashboard</p>
          </div>
        </div>

        <button
          type="button"
          className="absolute -right-[17px] grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-[rgba(21,25,38,0.98)] text-white lg:hidden"
          onClick={() => setBurgerMenuOpen((menu) => !menu)}
        >
          {burgerMenuOpen ? <FaChevronLeft className="h-3.5 w-3.5" /> : <FaChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="w-full">
        <p className={cn("mb-4 px-3 text-xs leading-5 text-white/80", !burgerMenuOpen && "hidden", "lg:block")}>
          Collect offers from affiliate networks and keep them in one format.
        </p>
        <div className={cn("mx-3 mb-4 rounded-[18px] border border-white/10 bg-white/5 p-3", !burgerMenuOpen && "hidden", "lg:block")}>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">Workspace</p>
          <p className="mt-1 text-sm font-bold text-white">
            Sync sources, check updates, publish cleaner offer data.
          </p>
        </div>
        <div className="mb-4 h-px bg-white/10" />

        <RouterLink
          to="/"
          className={cn(!burgerMenuOpen && "justify-center lg:justify-start", "text-white")}
        >
          <FaHome className="h-[18px] w-[18px]" />
          <span className={cn(!burgerMenuOpen && "hidden", "lg:inline")}>Overview</span>
        </RouterLink>

        <p className={cn("mb-2 mt-4 text-xs font-bold tracking-[0.18em] text-white/55", !burgerMenuOpen && "hidden", "lg:block")}>
          SETUP
        </p>
        <RouterLink to="/networks" className={cn(!burgerMenuOpen && "justify-center lg:justify-start", "text-white")}>
          <FaNetworkWired className="h-[18px] w-[18px]" />
          <span className={cn(!burgerMenuOpen && "hidden", "lg:inline")}>Sources</span>
        </RouterLink>

        <p className={cn("mb-2 mt-4 text-xs font-bold tracking-[0.18em] text-white/55", !burgerMenuOpen && "hidden", "lg:block")}>
          OFFERS
        </p>
        <RouterLink to="/offers" className={cn(!burgerMenuOpen && "justify-center lg:justify-start", "text-white")}>
          <FaTags className="h-[18px] w-[18px]" />
          <span className={cn(!burgerMenuOpen && "hidden", "lg:inline")}>Offers</span>
        </RouterLink>
        <RouterLink to="/links" className={cn("mt-3 text-white", !burgerMenuOpen && "justify-center lg:justify-start")}>
          <FaLink className="h-[18px] w-[18px]" />
          <span className={cn(!burgerMenuOpen && "hidden", "lg:inline")}>Updates</span>
        </RouterLink>

        <p className={cn("mb-2 mt-4 text-xs font-bold tracking-[0.18em] text-white/55", !burgerMenuOpen && "hidden", "lg:block")}>
          ACCOUNT
        </p>
        {user ? (
          <button
            type="button"
            onClick={signOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-white/10",
              !burgerMenuOpen && "justify-center lg:justify-start"
            )}
          >
            <FaSignOutAlt className="h-[18px] w-[18px]" />
            <span className={cn(!burgerMenuOpen && "hidden", "lg:inline")}>Sign out</span>
          </button>
        ) : (
          <RouterLink to="/login" className={cn(!burgerMenuOpen && "justify-center lg:justify-start", "text-white")}>
            <FaSignInAlt className="h-[18px] w-[18px]" />
            <span className={cn(!burgerMenuOpen && "hidden", "lg:inline")}>Sign in</span>
          </RouterLink>
        )}
      </div>
    </aside>
  );
}
