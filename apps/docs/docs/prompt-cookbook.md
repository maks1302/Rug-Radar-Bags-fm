---
id: prompt-cookbook
title: Prompt Cookbook
---

These prompts are written for natural-language MCP clients. They assume the client will map your request to the correct Rug Radar tool.

## Token Research

- `Analyze <token address> and give me a plain-English verdict.`
- `Research <token name>. Focus on holder concentration and contract risk.`
- `Analyze <token> and tell me the three biggest reasons to avoid it.`
- `Analyze <token> and explain whether the risk is structural or just early-stage volatility.`

## Fast Safety

- `Scan red flags for <token address>. Keep it short.`
- `Is <token> safe right now? Show only critical flags.`
- `Give me a go/no-go scan for <token> with only triggered flags.`

## Wallet Analysis

- `Analyze this wallet: <wallet>. Is it sniper, whale, bot, insider, or retail?`
- `Check this wallet's behavior and tell me if I should mirror it.`
- `Analyze this wallet and explain what drove the classification.`

## Token Comparison

- `Compare <token A> vs <token B> and pick the healthier one.`
- `Which is safer between <token A> and <token B>, and why?`
- `Compare <A> vs <B> focusing on liquidity, concentration, and contract safety.`

## Monitoring

- `Watch <token address> with 20% liquidity-drop threshold.`
- `What changed since last check for <token address>?`
- `Watch <token> with 10 point risk score increase and authority change alerts.`
- `Compare the current state of <token> to the last stored snapshot and highlight only material changes.`

## Prompting Tips

- say whether you want a short verdict or a full report
- use token addresses when precision matters
- ask for plain English if you are sharing the output with non-technical users
- ask for only red flags when speed matters more than completeness
