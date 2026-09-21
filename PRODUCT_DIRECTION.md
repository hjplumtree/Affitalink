# Product Direction

## Goal

Give affiliate publishers one place to fetch and inspect coupons from the networks they already use.

## Core flow

`Networks → Advertisers → Coupons`

- Networks stores or holds the credentials needed to fetch data.
- Advertisers controls which brands are included.
- Coupons fetches a date range and saves the normalized result.
- Dashboard shows the current workspace at a glance.

## Storage rule

There is no storage selector.

- Without an account: credentials last for the tab, settings stay in the browser, and coupons stay in IndexedDB.
- With an account: encrypted credentials, settings, and coupons save to the Supabase workspace.

Login exists only for workspace sync. It is not an entry gate.

## Product boundary

The current product does not include a public coupon catalog, a review queue, publish states, or WordPress publishing. Those paths hid the main job and created data rules that did not match the product.

Add a new feature only when it shortens or protects the core flow.

## Decision test

Before adding scope ask:

1. Does it help connect a network?
2. Does it help choose advertisers?
3. Does it help fetch or inspect coupons?
4. Can an existing step solve it without a new screen or state?
