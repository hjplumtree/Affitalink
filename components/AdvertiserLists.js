import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function AdvertiserLists({ advertisers, onToggleAdvertiser }) {
  const advertisersList = [...(advertisers?.advertisers_list || [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const selectedCount = advertisersList.filter((advertiser) => advertiser.selected).length;

  return (
    <Card className="border-white/60 bg-white/95">
      <CardHeader className="space-y-4">
        <Badge className="w-fit">Selection</Badge>
        <div>
          <CardTitle>Merchant watchlist</CardTitle>
          <CardDescription className="mt-2 text-base leading-7">
            Choose which merchants should be monitored during manual sync.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-3 rounded-[24px] bg-muted p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Watch coverage</p>
            <p className="mt-1 text-sm text-foreground/85">
              {selectedCount} of {advertisersList.length} merchants selected
            </p>
          </div>
          <Badge className="w-fit">Active feed</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {advertisers ? (
          advertisersList.length !== 0 ? (
            <div className="divide-y divide-border">
              {advertisersList.map((advertiser) => (
                <label
                  key={advertiser.id}
                  className="flex cursor-pointer items-center gap-4 px-2 py-4"
                >
                  <div>
                    <p className="text-base font-semibold text-foreground">{advertiser.name}</p>
                    <Badge variant="outline" className="mt-1 w-fit">
                      #{advertiser.id}
                    </Badge>
                  </div>
                  <span className="ml-auto flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {advertiser.selected ? "Watching" : "Off"}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={advertiser.selected}
                      onClick={() => onToggleAdvertiser(advertiser.id)}
                      className={`relative h-7 w-12 rounded-full transition-colors ${
                        advertiser.selected ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                          advertiser.selected ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="rounded-[20px] border border-border bg-muted/60 px-4 py-3 text-sm text-foreground/85">
              Save valid source credentials to load merchants here.
            </div>
          )
        ) : (
          <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Check the source details and try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
