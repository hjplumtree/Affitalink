import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { REVIEW_ITEM_STATE } from "../lib/client/reviewState";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

function DiffRow({ label, beforeValue, afterValue }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[20px] border border-border bg-muted/60 p-4">
          <p className="text-xs text-muted-foreground">Before</p>
          <p className="mt-1 text-sm leading-6 text-foreground">{beforeValue || "—"}</p>
        </div>
        <div className="rounded-[20px] border border-primary/20 bg-primary/[0.08] p-4">
          <p className="text-xs text-muted-foreground">After</p>
          <p className="mt-1 text-sm leading-6 text-foreground">{afterValue || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewDetailPane({ item, onAction, acting, showBack, onBack }) {
  if (!item) {
    return (
      <Card className="min-h-[520px] border-white/60 bg-white/95">
        <CardHeader>
          <Badge className="w-fit">Update details</Badge>
          <CardTitle>Select an update</CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7">
            Open an update from the list to compare the old values with the latest values from the source.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const state = REVIEW_ITEM_STATE[item.changeType] || REVIEW_ITEM_STATE.changed;
  const beforeSnapshot = item.beforeSnapshot || {};
  const afterSnapshot = item.afterSnapshot || {};

  return (
    <Card className="min-h-[520px] border-white/60 bg-white/95 shadow-sm">
      <CardContent className="space-y-5 p-5 lg:p-6">
        <div className="space-y-3">
          {showBack ? (
            <Button type="button" variant="ghost" size="sm" onClick={onBack} className="w-fit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to queue
            </Button>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Badge>{state.eyebrow}</Badge>
            <Badge variant="outline">{item.connector?.toUpperCase()}</Badge>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-foreground">
              {item.merchantName}
            </h2>
            <p className="mt-1 text-base text-foreground/85">{item.title}</p>
          </div>
        </div>

        <div className="rounded-[24px] bg-muted/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Update summary
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">Why this update was flagged</p>
          <p className="mt-2 text-sm leading-6 text-foreground/85">{item.reason}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Confidence: {item.confidence}</Badge>
            <Badge variant="outline">
              Created {new Date(item.createdAt).toLocaleString()}
            </Badge>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Changed fields
          </p>
          <DiffRow
            label="Coupon code"
            beforeValue={beforeSnapshot.couponCode}
            afterValue={afterSnapshot.couponCode}
          />
          <DiffRow
            label="Title"
            beforeValue={beforeSnapshot.title}
            afterValue={afterSnapshot.title}
          />
          <DiffRow
            label="Destination"
            beforeValue={beforeSnapshot.destinationUrl}
            afterValue={afterSnapshot.destinationUrl}
          />
        </div>

        <div className="rounded-[24px] bg-muted/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Source evidence
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">Latest source details</p>
          <p className="mt-2 text-sm text-foreground/85">
            Latest seen: {afterSnapshot.lastSeenAt || "Unknown"}
          </p>
          {afterSnapshot.sourceUrl ? (
            <div className="mt-3">
              <Link href={afterSnapshot.sourceUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                Open source link
              </Link>
            </div>
          ) : null}
          {afterSnapshot.destinationUrl ? (
            <pre className="mt-3 overflow-x-auto rounded-[20px] border border-border bg-white p-4 text-sm leading-6 text-foreground">
              {afterSnapshot.destinationUrl}
            </pre>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="button"
            onClick={() => onAction("approve")}
            disabled={acting === "approve" || acting === "dismiss"}
          >
            {acting === "approve" ? "Keeping..." : "Keep update"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onAction("dismiss")}
            disabled={acting === "approve" || acting === "dismiss"}
          >
            {acting === "dismiss" ? "Dismissing..." : "Dismiss update"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
