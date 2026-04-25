# AffitaLink Execution Plan

Date: 2026-04-18

## What this document is

This is the implementation plan for AffitaLink.

It turns the product strategy into a practical backlog for the offer engine.

## The goal

Build a reusable affiliate offer operating system that can:

- ingest source data
- normalize it into a canonical offer model
- surface changes for review
- publish approved offers downstream
- support more than one market later

## What should happen first

The first build should focus on the engine loop, not on expansion.

The loop is:

1. connect a source
2. ingest offers
3. normalize them
4. detect changes
5. review the change
6. publish approved data
7. feed the front-end

If this loop is weak, everything on top of it becomes sloppy.

## Phase 1 backlog

### 1. Tighten the canonical offer model

The offer object should be explicit and stable.

Required fields should include:

- merchant
- title
- landing URL
- source reference
- discount or code
- expiration
- market or locale
- publish state
- review status

Acceptance criteria:

- the same offer looks the same across screens
- the model is not shaped differently by each network

### 2. Stabilize connectors

Connectors should own source-specific behavior.

Each connector should handle:

- authentication
- fetch cadence
- field mapping
- sync errors
- retry behavior

Acceptance criteria:

- one bad source cannot break the whole engine
- sync failures are visible and traceable
- connector logic stays out of downstream UI code

### 3. Improve review queue quality

The review queue should show only meaningful changes.

It should make it obvious:

- what changed
- whether the offer is new, updated, expired, or broken
- what the operator should do next

Acceptance criteria:

- review work does not feel like inspecting a wall of raw data
- operators can dismiss obvious noise quickly

### 4. Make publish state trustworthy

Publish state should be a real workflow state, not a label.

Required states at minimum:

- draft
- selected
- published
- inactive
- dismissed

Acceptance criteria:

- published means published
- inactive means the front should not treat it like fresh inventory

### 5. Define the downstream contract

AffitaLink should know how it hands data off.

Start with WordPress as the first adapter, but keep the contract general.

Acceptance criteria:

- downstream export is predictable
- front-end sites receive clean data, not source junk

## Phase 2 backlog

### 1. Add market-aware modeling

Market should become explicit.

Add support for:

- country
- locale
- currency
- disclaimer or compliance rules
- destination mapping

### 2. Improve dedupe and freshness checks

The engine should detect:

- duplicate offers
- stale offers
- changed codes
- changed landing pages
- source regressions

### 3. Add better change history

Operators should be able to see what changed over time.

### 4. Support more than one destination

The engine should be able to feed:

- WordPress
- a custom site
- future country fronts
- alerts or newsletters later

## Phase 3 backlog

### 1. Market packs

Package a market as reusable configuration instead of ad hoc code.

### 2. Second market support

Only after the first market is stable.

### 3. Better operator tooling

Improve the review and publish UI so the human operator can move faster without losing judgment.

## Non-goals

- do not become a consumer blog
- do not hide source complexity in page components
- do not make every market rewrite the core
- do not expand to another country before the workflow is repeatable

## Dependencies on HerMart

AffitaLink should provide HerMart with:

- clean canonical offers
- freshness and expiration signals
- publish state
- source metadata
- a stable export contract

HerMart should not need to know network-specific details.

## Success criteria

AffitaLink is successful when:

- source sync is reliable
- review is useful instead of noisy
- publish state is trusted
- one canonical offer can feed many outputs
- a second market does not require a new core

## What to do this week

- finalize the canonical offer schema
- review connector error handling
- make the review queue show obvious change types
- verify the publish-state lifecycle
- write the WordPress export contract clearly
