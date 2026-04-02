import { REVIEW_ITEM_STATE } from "../lib/client/reviewState";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function ReviewQueueList({ items, selectedId, onSelect }) {
  if (items.length === 0) {
    return (
      <Card className="border-white/60 bg-white/95">
        <CardHeader>
          <Badge className="w-fit">No new updates</Badge>
          <CardTitle>No offer changes to review</CardTitle>
          <CardDescription className="max-w-xl text-base leading-7">
            Nothing new came in from the selected source. Run another update check when you want the latest changes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-white/60 bg-white/95 shadow-sm">
      <CardHeader className="border-b border-border bg-muted/40">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge className="w-fit">Offer updates</Badge>
            <CardTitle className="mt-3 text-2xl">Changes to review</CardTitle>
            <CardDescription className="mt-2 text-base leading-7">
              Pick an update, compare the fields that changed, then keep or dismiss it.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit md:self-start">
            {items.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.map((item) => {
            const state = REVIEW_ITEM_STATE[item.changeType] || REVIEW_ITEM_STATE.changed;
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition-colors lg:px-5 ${
                  isSelected ? "bg-primary/[0.08]" : "bg-transparent hover:bg-muted/70"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge>{state.eyebrow}</Badge>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {item.connector?.toUpperCase()}
                    </p>
                  </div>
                  <p className="truncate text-base font-semibold text-foreground">{item.merchantName}</p>
                  <p className="mt-1 truncate text-sm text-foreground/85">{item.title}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{item.reason}</p>
                </div>
                <p className="whitespace-nowrap pl-3 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
