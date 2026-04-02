import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "../lib/utils";

export default function RouterLink({ to, children, className, color, _hover, ...props }) {
  const router = useRouter();
  const isActive = router.pathname === to;

  return (
    <Link
      href={to}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-150",
        isActive
          ? "border border-primary/30 bg-primary/[0.16] text-foreground shadow-[0_14px_32px_rgba(139,77,255,0.14)]"
          : "text-inherit hover:bg-white/10",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
