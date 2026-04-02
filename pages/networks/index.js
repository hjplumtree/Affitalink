import NetworkSiteList from "../../components/NetworkSiteList";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

export default function index() {
  return (
    <div className="space-y-5">
      <Card className="border-white/60 bg-white/95">
        <CardHeader className="space-y-5">
          <Badge className="w-fit">Sources</Badge>
          <div className="space-y-3">
            <CardTitle className="text-4xl">Connect the sources you want to monitor</CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Save credentials, test the connection, and choose which merchants should feed your incoming offer updates.
            </CardDescription>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] bg-muted p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Setup</p>
              <p className="mt-2 text-sm leading-6 text-foreground/85">
                Credentials and source validation live here, away from the queue.
              </p>
            </div>
            <div className="rounded-[24px] bg-muted p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Selection</p>
              <p className="mt-2 text-sm leading-6 text-foreground/85">
                Choose only the merchants worth monitoring.
              </p>
            </div>
            <div className="rounded-[24px] bg-muted p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Checks</p>
              <p className="mt-2 text-sm leading-6 text-foreground/85">
                A source is only useful when the connection works and the sync results look right.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-white/60 bg-white/95">
        <CardHeader>
          <Badge className="w-fit">Available sources</Badge>
          <CardDescription className="mt-2 max-w-2xl text-base leading-7">
            Start with the networks you actively use. Leave the rest disconnected.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <NetworkSiteList
            imageUrl="/rakuten.png"
            name="Rakuten"
            subtitle="Add your Rakuten account"
            endpoint="rakuten"
          />
          <NetworkSiteList
            imageUrl="/cj.png"
            name="CJ"
            subtitle="Add your CJ account"
            endpoint="cj"
          />
          <NetworkSiteList
            imageUrl="/impact_logo.png"
            name="Impact"
            subtitle="Support planned"
            endpoint={false}
          />
          <NetworkSiteList
            imageUrl="/ebay_logo.png"
            name="eBay"
            subtitle="Support planned"
            endpoint={false}
          />
          <NetworkSiteList
            imageUrl="/logo.svg"
            name="Test network"
            subtitle="Use the built-in test source"
            endpoint="testnet"
          />
        </CardContent>
      </Card>
    </div>
  );
}
