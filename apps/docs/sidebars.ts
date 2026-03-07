import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "overview",
    "quickstart",
    {
      type: "category",
      label: "Guides",
      items: [
        "reading-reports",
        "trust-vs-wait",
        "risk-examples",
        "playbooks",
        "monitoring-workflow",
        "prompt-cookbook",
        "sharing-format",
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
      label: "MCP Clients",
      items: ["clients/openclaw", "clients/claude", "clients/gemini", "clients/other-clients"],
    },
    {
      type: "category",
      label: "Reference",
      items: ["data-sources", "false-positives", "limitations", "glossary", "faq"],
    },
  ],
};

export default sidebars;
