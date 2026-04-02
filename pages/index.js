import Link from "next/link";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function Home() {
  return (
    <div className="space-y-5">
      <Card className="border-white/60 bg-white/95">
        <CardHeader className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
            <div>
              <Badge className="w-fit">Affiliate offers</Badge>
              <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold tracking-[-0.04em] text-foreground lg:text-6xl lg:leading-[0.98]">
                Bring network discounts and sale offers into one clean view
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground">
                Connect your affiliate sources, pull the latest coupons and sales, and keep them in one consistent format instead of checking each network by hand.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/offers">
                  <Button>View offers</Button>
                </Link>
                <Link href="/links">
                  <Button variant="outline">Check updates</Button>
                </Link>
                <Link href="/networks">
                  <Button variant="outline">Connect sources</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#11141d] p-6 text-white shadow-[0_28px_70px_rgba(15,17,23,0.18)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">How it works</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-white/60">01</p>
                  <p className="text-lg font-bold">Connect the networks you already use</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">02</p>
                  <p className="text-lg font-bold">Choose which merchants should be tracked</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">03</p>
                  <p className="text-lg font-bold">Sync new offers and check what changed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] bg-muted p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Sources</p>
              <p className="mt-2 text-lg font-bold text-foreground">Keep every network in one place</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Save network credentials once, then manage merchant coverage from a single dashboard.
              </p>
            </div>
            <div className="rounded-[22px] bg-muted p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Format</p>
              <p className="mt-2 text-lg font-bold text-foreground">Standardize messy affiliate data</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pull coupons, titles, and destination links into one format so the output is easier to use.
              </p>
            </div>
            <div className="rounded-[22px] bg-muted p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Updates</p>
              <p className="mt-2 text-lg font-bold text-foreground">Check what changed before it goes live</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Compare before and after values so you can spot real offer changes without digging through each network.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-white/60 bg-white/95">
          <CardHeader>
            <Badge className="w-fit">Product flow</Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <p className="text-lg font-bold text-foreground">1. Connect sources</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add CJ, Rakuten, or test sources so the app can pull affiliate offers from them.
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">2. Choose merchants</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Track only the merchants you care about so the dashboard stays focused.
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">3. Review incoming updates</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Sync new offers, compare changed fields, then approve or dismiss each update.
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">4. Pick offers for the coupon site</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the offers list as your source of truth, then select and copy only the offers you want to publish.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/95">
          <CardHeader>
            <Badge className="w-fit">What this dashboard is for</Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm leading-7 text-foreground/85">
              This is not the public offers page. It is the internal dashboard that collects discount data from affiliate networks and helps you review incoming changes.
            </p>
            <p className="text-sm leading-7 text-foreground/85">
              Updates is the triage step. Offers is the reusable data set you copy from when something is ready for the coupon site.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/95">
        <CardHeader>
          <Badge className="w-fit">Before you connect</Badge>
          <CardTitle>You need active affiliate network access</CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
            This dashboard only works if you already have partner access to a network. If you are already a partner with CJ or Rakuten, connect right away and stop checking each source by hand.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            More about partner programs:{" "}
            <a
              href="https://rakutenadvertising.com/partners/publishers/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary"
            >
              Rakuten Affiliate Publisher
            </a>
          </p>
          <div className="mt-5">
            <Link href="/offers">
              <Button variant="outline">View offer list</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
