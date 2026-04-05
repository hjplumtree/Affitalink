import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, CircleDot, Network, Sparkles } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

const workflow = [
  {
    step: "01",
    title: "Connect the networks you already use",
    description: "Keep CJ, Rakuten, and test sources in one workspace instead of checking each source by hand.",
  },
  {
    step: "02",
    title: "Review what actually changed",
    description: "See incoming offer changes in one review queue so you can keep signal and ignore noise.",
  },
  {
    step: "03",
    title: "Build a cleaner library",
    description: "Keep normalized coupon inventory in one place so your next publishing step starts from cleaner data.",
  },
];

const pains = [
  "Affiliate offers are scattered across too many network dashboards.",
  "Changed coupon codes and dates are easy to miss.",
  "Raw network data is noisy, inconsistent, and repetitive.",
  "Copying only the useful offers into a real site takes too much manual work.",
];

const outcomes = [
  "One place to monitor offers across networks",
  "One review queue for incoming changes",
  "One library for normalized coupon inventory",
];

export default function Home() {
  const [requestEmail, setRequestEmail] = useState("");
  const [requestState, setRequestState] = useState({ loading: false, error: "", message: "" });

  const submitEarlyAccess = async () => {
    setRequestState({ loading: true, error: "", message: "" });
    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: requestEmail,
          source: "landing_hero",
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message || "Could not request access");
      }
      setRequestEmail("");
      setRequestState({
        loading: false,
        error: "",
        message: "Request received. We will reach out when access is available.",
      });
    } catch (error) {
      setRequestState({
        loading: false,
        error: error instanceof Error ? error.message : "Could not request access",
        message: "",
      });
    }
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,247,255,0.92))] shadow-[0_30px_90px_rgba(18,21,34,0.08)]">
        <div className="grid gap-8 px-6 py-7 lg:px-8 lg:py-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <div>
            <Badge className="w-fit">For coupon and deal publishers</Badge>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold tracking-[-0.05em] text-foreground lg:text-6xl lg:leading-[0.96]">
              Stop checking every affiliate network by hand
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground lg:text-lg">
              AffitaLink gives affiliate publishers one place to monitor network offers, review incoming changes, and
              keep a cleaner coupon library before anything reaches the real site.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/login">
                <Button className="min-w-[170px]">
                  Open studio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login?mode=sign_up">
                <Button variant="outline" className="min-w-[170px]">
                  Request early access
                </Button>
              </Link>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Already have access? Use <Link href="/login" className="font-semibold text-foreground">sign in</Link>. Just exploring? You can still <Link href="/offers" className="font-semibold text-foreground">browse the library</Link>.
            </p>

            <div className="mt-6 rounded-[24px] border border-border/70 bg-white/78 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Get early access</p>
              <div className="mt-3 flex flex-col gap-3 md:flex-row">
                <Input
                  type="email"
                  value={requestEmail}
                  onChange={(event) => setRequestEmail(event.target.value)}
                  placeholder="you@site.com"
                  className="h-11 bg-white"
                />
                <Button onClick={submitEarlyAccess} disabled={requestState.loading} className="md:min-w-[190px]">
                  {requestState.loading ? "Sending..." : "Request access"}
                </Button>
              </div>
              {requestState.error ? (
                <p className="mt-3 text-sm font-medium text-red-600">{requestState.error}</p>
              ) : null}
              {requestState.message ? (
                <p className="mt-3 text-sm font-medium text-emerald-700">{requestState.message}</p>
              ) : null}
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {outcomes.map((item) => (
                <div key={item} className="rounded-[22px] border border-border/70 bg-white/72 p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium leading-6 text-foreground">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[30px] bg-[#12151f] p-6 text-white shadow-[0_28px_80px_rgba(14,18,27,0.22)]">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/60">
                <Sparkles className="h-3.5 w-3.5" />
                Why It Matters
              </div>
              <div className="mt-4 space-y-4">
                {pains.map((item, index) => (
                  <div key={item} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs text-white/45">0{index + 1}</p>
                    <p className="mt-2 text-sm leading-6 text-white/88">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-border/70 bg-white/85 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Current phase</p>
                <p className="mt-2 text-lg font-bold text-foreground">Review and library first</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Phase 1 is about seeing changes clearly and keeping a usable inventory in one place.
                </p>
              </div>
              <div className="rounded-[24px] border border-border/70 bg-white/85 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Next phase</p>
                <p className="mt-2 text-lg font-bold text-foreground">Publishing destinations later</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  WordPress publishing comes after the review and library workflow proves itself.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/60 bg-white/95">
          <CardHeader className="space-y-4">
            <Badge className="w-fit">Who it is for</Badge>
            <CardTitle className="text-3xl">Operators already running coupon or deal sites</CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              This product is for publishers who already have affiliate network access and need a better workflow
              between raw network data and the site they actually run.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="rounded-[22px] bg-muted/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Best fit</p>
              <p className="mt-2 text-sm leading-6 text-foreground/90">
                You manage merchant selections, check for offer changes, and decide what deserves to survive into your
                real publishing workflow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/networks">
                <Button variant="outline">Manage sources</Button>
              </Link>
              <Link href="/links">
                <Button variant="outline">Open review queue</Button>
              </Link>
              <Link href="/login?mode=sign_up">
                <Button variant="outline">Request early access</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/95">
          <CardHeader className="space-y-4">
            <Badge className="w-fit">How it works</Badge>
            <CardTitle className="text-3xl">One workflow, not a pile of dashboards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {workflow.map((item) => (
              <div key={item.step} className="flex gap-4 rounded-[22px] bg-muted/70 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-foreground shadow-sm">
                  {item.step}
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/95">
        <CardHeader className="space-y-4">
          <Badge className="w-fit">Early access</Badge>
          <CardTitle className="text-3xl">Start with the review and library workflow</CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
            Phase 1 is for publishers who want to stop checking every network by hand. Request access if you want to try the studio before publishing automation arrives.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            <Link href="/login?mode=sign_up">
              <Button>Request early access</Button>
            </Link>
            <Link href="/offers">
              <Button variant="outline">Browse the library</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-white/60 bg-white/95">
          <CardHeader className="space-y-3">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Sources</CardTitle>
            <CardDescription className="text-base leading-7">
              Connect the affiliate networks you already use and keep merchant selection under control.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-white/60 bg-white/95">
          <CardHeader className="space-y-3">
            <CircleDot className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Review</CardTitle>
            <CardDescription className="text-base leading-7">
              Compare changes in one queue so you can keep signal and reject noise before it pollutes the library.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-white/60 bg-white/95">
          <CardHeader className="space-y-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Library</CardTitle>
            <CardDescription className="text-base leading-7">
              Keep a normalized library of coupon inventory that is easier to reuse when you are ready for publishing.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
