import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function NetworkSiteList({
  imageUrl,
  name,
  subtitle,
  endpoint,
}) {
  return (
    <div className="flex items-center gap-4 border-t border-border px-5 py-5 transition-colors hover:bg-muted/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted">
        <Image src={imageUrl} alt={name} width={30} height={30} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-xl font-bold tracking-[-0.03em] text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {endpoint ? (
        <Link href={`/networks/${endpoint}`}>
          <Button variant="outline">Open settings</Button>
        </Link>
      ) : (
        <Badge>Coming soon</Badge>
      )}
    </div>
  );
}
