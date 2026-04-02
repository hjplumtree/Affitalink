import { AlertCircle, ArrowUp, CheckCircle2, Clock3, RefreshCw } from "lucide-react";
import { HEALTH_STATUS } from "../lib/client/reviewState";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

function getHealthTone(summary) {
  if (!summary) return HEALTH_STATUS.idle;
  if (summary.syncStatus === "partial_failure") return HEALTH_STATUS.partial_failure;
  if (summary.syncStatus === "failed") return HEALTH_STATUS.failed;
  if (summary.isStale) return HEALTH_STATUS.stale;
  if (summary.lastSuccessfulSyncAt) return HEALTH_STATUS.success;
  return HEALTH_STATUS.idle;
}

function getStatusIcon(tone) {
  if (tone.tone === "green") return CheckCircle2;
  if (tone.tone === "yellow") return Clock3;
  if (tone.tone === "red" || tone.tone === "orange") return AlertCircle;
  return ArrowUp;
}

export default function HealthStrip({
  connectors,
  activeNetwork,
  onNetworkChange,
  onSync,
  syncing,
}) {
  const summary = connectors.find((entry) => entry.network === activeNetwork) || null;
  const tone = getHealthTone(summary);
  const StatusIcon = getStatusIcon(tone);

  return (
    <Card className="border-white/60 bg-white/95 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-start">
          <div className="flex min-w-[220px] items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
              <StatusIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Source status
              </p>
              <p className="font-semibold text-foreground">{tone.label}</p>
            </div>
          </div>
          <div className="hidden h-11 w-px bg-border md:block" />
          <div className="flex-1">
            <p className="text-sm leading-6 text-foreground">{tone.message}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {summary?.lastSyncAt
                ? `Last update check: ${new Date(summary.lastSyncAt).toLocaleString()}.`
                : "No manual sync has been run yet."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <Badge variant="outline">{activeNetwork.toUpperCase()}</Badge>
          <select
            value={activeNetwork}
            onChange={(event) => onNetworkChange(event.target.value)}
            aria-label="Select source network"
            className="h-11 rounded-full border border-border bg-white px-4 text-sm font-medium text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {connectors.map((connector) => (
              <option key={connector.network} value={connector.network}>
                {connector.network.toUpperCase()}
              </option>
            ))}
          </select>
          <Button onClick={onSync} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing" : "Check for updates"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
