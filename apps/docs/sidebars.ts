import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "overview",
    "quickstart",
    {
      type: "category",
      label: "Use Hosted MCP",
      items: ["use-hosted-mcp", "clients/openclaw", "clients/claude", "clients/gemini", "clients/other-clients"],
    },
    {
      type: "category",
      label: "Core Concepts",
      items: ["reading-reports", "scoring-model", "data-sources"],
    },
    "roadmap",
    {
      type: "category",
      label: "Usage Guides",
      items: [
        "trust-vs-wait",
        "risk-examples",
        "playbooks",
        "monitoring-workflow",
        "prompt-cookbook",
        "sharing-format",
        "troubleshooting",
      ],
    },
    {
      type: "category",
      label: "Tools",
      items: [
        "tools/analyze-token",
        "tools/scan-risk",
        "tools/analyze-wallet",
        "tools/compare-tokens",
        "tools/watch-token",
        "tools/get-token-changes",
      ],
    },
    {
      type: "category",
      label: "Self-Hosting",
      items: ["installation", "local-development", "environment-variables", "deployment", "architecture"],
    },
    {
      type: "category",
      label: "Reference",
      items: [
        "http-endpoints",
        "database-schema",
        "monitoring-internals",
        "false-positives",
        "limitations",
        "glossary",
        "faq",
      ],
    },
  ],
};

export default sidebars;
