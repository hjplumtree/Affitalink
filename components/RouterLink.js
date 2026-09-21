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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
        isActive
          ? "bg-white/[0.11] text-white"
          : "text-inherit hover:bg-white/10",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
