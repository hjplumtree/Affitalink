# Product Direction

## Purpose

AffitaLink is not primarily a consumer coupon site.

AffitaLink is a publisher-side operating system for affiliate offers:

- collect offers from multiple affiliate networks
- review changes in one workflow
- normalize offers into a canonical library
- decide what is ready to publish
- send approved inventory to downstream publishing destinations

The first downstream destination is WordPress.

## Strategic Position

### What AffitaLink is

AffitaLink helps affiliate publishers turn messy network offers into reviewed, publishable inventory.

### What AffitaLink is not

- not just a coupon aggregation site
- not just a link copier
- not a WordPress-only data model
- not a broad multi-country platform on day one

## Core User

The primary user is a publisher or operator who runs a coupon or deal site and has to work across multiple affiliate networks.

Typical traits:

- uses WordPress or another CMS to publish content
- logs into multiple affiliate networks
- spends time checking for new or changed offers
- needs to filter low-quality or duplicate offers
- wants a faster path from network data to publishable content

## Real Problem

The real problem is not "finding coupons."

The real problem is operational:

- network interfaces are fragmented
- offer formats are inconsistent
- updates are easy to miss
- manual review takes time
- publishing to the final site is repetitive
- automation without review reduces quality

AffitaLink exists to reduce that operational drag without giving up operator control.

## Product Model

AffitaLink should be understood as a pipeline:

1. `Sources`
   Connect affiliate networks and store merchant-level configuration.
2. `Updates`
   Ingest changes from networks and present them for review.
3. `Offers`
   Maintain a canonical offer library with normalized fields.
4. `Publish states`
   Track whether an offer is draft, selected, published, or no longer active.
5. `Destinations`
   Send publishable offers to a downstream output such as WordPress.

This is the source of truth:

- AffitaLink owns the canonical offer model.
- WordPress is a publishing destination.
- WordPress should not define the internal data model.

## Current Product Boundary

### V1

V1 is a publisher studio with a canonical offer library and publish workflow.

V1 includes:

- network connection and merchant selection
- offer sync
- review queue for updates
- normalized offer records
- `selected` and `published` status management
- a clear internal flow from review to publish-ready inventory

V1 does not require AffitaLink to be the final public coupon site.

### V2

V2 is the first production publishing adapter.

V2 includes:

- WordPress export or sync
- mapping from canonical offers to WordPress content fields
- publish status tracking across AffitaLink and WordPress
- a practical operator flow for pushing reviewed offers into the live site

## Direction Decisions

These decisions should remain stable unless there is strong evidence to change them.

1. The primary customer is the publisher, not the coupon reader.
2. The canonical offer library is the product core.
3. WordPress is the first downstream adapter.
4. A standalone public coupon site is optional, not required for product-market validation.
5. Country expansion is a later multiplier, not the current wedge.

## Things To Avoid

- building both a consumer coupon site and a publisher SaaS at the same time
- shaping the data model around one CMS
- describing the product as just "affiliate links in one place"
- expanding to multiple countries before one publishing workflow works reliably
- confusing internal library pages with reader-facing destination pages

## Current Repo Interpretation

The repo should be read through this lens:

- `/links` is the review inbox
- `/studio/offers` is the canonical offer library workspace
- publish state is part of the core product model
- WordPress is the next major output integration

If `/offers` exists as a public route, it should be treated carefully:

- it can act as a proof-of-pipeline or QA surface
- it should not redefine the company as a consumer coupon site unless that becomes an explicit strategic choice

## Working Message

Use this message when explaining the product internally:

> AffitaLink helps affiliate publishers turn messy network offers into reviewed, publishable inventory.

Use this message when making scope decisions:

> We are building the operating system behind a coupon site, not just another coupon site.

## Near-Term Priorities

1. Keep the review-to-publish workflow reliable.
2. Make the canonical offer schema the clear source of truth.
3. Ship the WordPress publishing adapter.
4. Clean up UI and copy so the product reads as a publisher tool first.

## Checkpoint Questions

Use these questions before adding major scope:

1. Does this help the publisher review, select, or publish offers faster?
2. Does this strengthen the canonical offer model?
3. Does this help WordPress publishing without making the core model WordPress-shaped?
4. Is this needed before one real publishing workflow works end to end?

If the answer is mostly no, it is probably not a V1 priority.
