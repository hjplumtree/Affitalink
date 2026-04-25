# AffitaLink Product Strategy

Date: 2026-04-18

## What this document is

This is the product definition for AffitaLink.

If you only read one page, read this:

- AffitaLink is the operating system for affiliate offer collection, review, normalization, and publish control.
- AffitaLink is not primarily a consumer coupon site.
- AffitaLink is the engine behind public market fronts like HerMart.
- AffitaLink should stay reusable across countries, languages, and publisher destinations.

## The short version

AffitaLink exists because affiliate data is messy.

Different networks expose different fields.
Offers change shape.
Some links break.
Codes expire.
Merchants go inactive.
A human operator still needs to decide what is worth publishing.

AffitaLink should make that manageable.

The system should answer:

1. What offer came in?
2. What changed?
3. Is it good enough to publish?
4. Where should it go next?

## Who it is for

AffitaLink is for the people who operate affiliate offer pipelines.

That usually means:

- founders or operators running affiliate/content commerce businesses
- editors or reviewers who decide what gets published
- systems that need clean offer data downstream
- teams that need one engine for multiple markets

This is not built first for the end shopper.
The shopper sees the output surface, not the engine.

## What AffitaLink is

AffitaLink is the control plane for offers.

It should manage:

- connector setup
- source sync
- offer normalization
- review queues
- canonical offer records
- publish state
- downstream export or publish adapters

The job is not to be a marketplace.
The job is to keep offer data clean enough that a public front can trust it.

## What AffitaLink is not

- not a consumer-facing coupon blog
- not a random scraper
- not a CMS replacement
- not a one-country toy project
- not a place where every market gets its own separate logic

If AffitaLink becomes a dump of raw network data, it fails.

If AffitaLink becomes tied too tightly to one front-end or one country, it also fails.

## Current state

AffitaLink already points in the right direction.
It has the shape of a real offer operating system.

The current codebase includes:

- workspace-based access patterns
- source connector configuration
- sync runs
- review items
- canonical offer library views
- publish state
- downstream destination handling

That means the core thesis is already present.
The job now is to make the system stricter, clearer, and easier to extend.

## Product thesis

AffitaLink should evolve from:

`offer ingestion tool`

to:

`offer operating system`

That means it should do more than fetch data.
It should help an operator make a clean publish decision.

The difference is:

- ingestion tool = pulls data in
- operating system = manages the lifecycle of that data

## The core objects

AffitaLink should be built around a small number of clear objects.

### Connector

A connector knows how to talk to one source network.

It should know:

- credentials
- sync behavior
- source-specific fields
- fetch cadence
- error state

### Offer

An offer is the canonical unit of value.

It can include:

- merchant
- title
- landing URL
- discount or code
- market or locale
- source reference
- expiration
- status
- editorial notes

### Review item

A review item is a change or decision point.

It should show:

- what changed
- what source caused it
- what needs attention
- what the operator can approve or reject

### Publish state

Publish state answers one question: is this offer ready to leave the engine?

Examples:

- draft
- selected
- published
- inactive
- dismissed

## What AffitaLink should do well

### 1. Normalize

Different sources should become one shape.

That keeps downstream systems sane.

### 2. Review

The operator should not have to inspect raw junk every time.

A review queue should surface only the changes that matter.

### 3. Publish

Approved data should move cleanly to one or more destinations.

### 4. Reuse

The same canonical offer should be publishable to:

- WordPress
- a custom front-end
- a country-specific site
- email or alert systems later

## The content model

AffitaLink should store data as structured objects, not one-off page content.

The important unit is `offer`, not `post`.

That matters because an offer can feed multiple outputs:

- public page
- admin review queue
- export payload
- newsletter highlight
- alert trigger

## Current state of the codebase

From the current repo structure, the main signals are:

- `pages/links.js` acts like a review queue surface.
- `pages/studio/offers.tsx` acts like a canonical library and publish control view.
- `supabase/schema.sql` already models the basic workflow state.
- `README.md` and `PRODUCT_DIRECTION.md` already point toward publisher-side operations, not consumer blogging.

What is still missing is a first-class market model and sharper language around cross-country reuse.

## The schema gap

The current schema already has useful workflow tables, but it does not yet treat market as a first-class concept.

That is a problem if the product is meant to power more than one country.

The schema should eventually make these things explicit:

- country or market
- locale
- currency
- compliance or disclaimer rules
- destination mapping
- localization state

If these stay implicit, they will leak into page code and ad hoc config.
That gets ugly fast.

## Product principles

### Clean truth

The canonical offer should be the truth source.

Downstream destinations should not rewrite it casually.

### Review before publish

AffitaLink should not auto-publish junk just because it is available.

Human review still matters.

### Source separation

Network-specific weirdness belongs in connectors, not in the shared core.

### Market separation

Country-specific behavior belongs in market config or market packs, not in the universal core.

### Reuse first

One connector or offer model should serve many outputs.

That is the whole point.

## How AffitaLink should make money

AffitaLink is infrastructure, so the revenue stack is different from HerMart.

Possible revenue sources:

- internal use as the engine behind owned sites
- licensing the offer engine to other operators later
- workflow or publish tooling for teams running affiliate content systems
- market expansion packages for new countries

Do not start by turning AffitaLink into a public consumer brand.
That would blur the product.

## What success looks like

AffitaLink is working when:

- offers sync without manual heroics
- review items show real changes instead of noise
- publish state is reliable
- downstream sites receive clean data
- adding a second market does not require rewriting the core

## Short term goals

Over the next phase, AffitaLink should:

- stabilize source sync
- tighten the review queue
- make the canonical offer shape more explicit
- document downstream contracts
- keep WordPress or other export targets predictable

## Mid term goals

Once the core is stable:

- add market-aware data modeling
- improve dedupe and offer change detection
- support more than one destination
- make localization a core concept, not a patch
- prove that HerMart can consume the engine cleanly

## Long term goals

AffitaLink should become:

- a reusable offer operating system
- the backend for multiple country fronts
- a platform that can power affiliate publishing without rebuilding the core each time

## What to avoid

- tying the engine to one front-end brand
- hardcoding country behavior in page code
- letting raw source payloads leak into product surfaces
- turning the review queue into a dumping ground
- over-optimizing for one network while ignoring the broader workflow

## Expansion rule

Do not add new countries before the core loop works.

The sequence should be:

1. prove one market end to end
2. make the workflow repeatable
3. model market explicitly
4. package the next market
5. launch the next market only as a reuse of the core

## Relationship to HerMart

AffitaLink is the engine.
HerMart is the first consumer front.

That means AffitaLink should own:

- connector logic
- normalization
- review workflow
- publish state
- downstream export

HerMart should own:

- consumer presentation
- editorial framing
- trust and explanation
- SEO and category navigation

The boundary should stay hard.

## Final mental model

If this product works, the operator should think:

`AffitaLink takes in messy affiliate data and turns it into something a public front can trust and reuse.`

That is the whole game.

## Companion docs

If you are moving from strategy into execution, read:

- [AffitaLink Execution Plan](./affitalink-execution.md)
- [HerMart + AffitaLink System Architecture](/Users/tardis/Desktop/dev/repositories/hermart/docs/strategy/system-architecture.md)
- [HerMart / AffitaLink Strategy Index](/Users/tardis/Desktop/dev/repositories/hermart/docs/strategy/strategy-index.md)
