---
id: playbooks
title: User Playbooks
---

These playbooks are opinionated operating patterns for different users. They are not mandatory, but they match how the tools are designed to be used.

## Beginner Playbook

1. Run `analyze_token`.
2. If the score is `High Risk` or `Extreme Risk`, stop and inspect the reasons before doing anything else.
3. If the score is `Medium Risk`, run `scan_risk` and focus on triggered flags.
4. If the token still looks interesting, re-run once after a short delay.
5. Size the position as if the tool can still be wrong.

## Active Trader Playbook

1. Run `scan_risk` first (speed).
2. Run `analyze_token` if still interested.
3. Compare with one alternative using `compare_tokens`.
4. If entering, set watch rules immediately.
5. Use `get_token_changes` on a cadence that matches volatility.

## Community Moderator Playbook

1. Run `analyze_token` for shared context.
2. Post a short summary with only the most relevant red flags and metrics.
3. Avoid certainty language.
4. Re-check after major market moves or new allegations.
5. Update the community only when the risk state materially changes.

## Wallet Follower Playbook

1. Run `analyze_wallet` on the wallet you want to study.
2. Check whether the label is driven by cadence, early-buy behavior, or large size.
3. Never follow a wallet purely because it looks like a whale or sniper.
4. Cross-check the tokens that wallet trades with `analyze_token` or `scan_risk`.

## Researcher Playbook

1. Use `analyze_token` to capture the full report.
2. Use `compare_tokens` to pressure-test your thesis against alternatives.
3. Save watches for the names you keep revisiting.
4. Treat snapshots as evidence points, not as immutable truth.
