import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "overview",
    "quickstart",
    "reading-reports",
    "prompt-cookbook",
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
    "data-sources",
    "limitations",
    "faq",
  ],
};

export default sidebars;
