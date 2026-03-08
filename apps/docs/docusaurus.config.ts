import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Rug Radar Docs",
  tagline: "Instant token and wallet due diligence for Claude and any MCP-compatible agent.",
  favicon: "img/logo.svg",

  url: "https://rugrdr.xyz",
  baseUrl: "/",

  organizationName: "rug-radar",
  projectName: "rug-radar-docs",

  onBrokenLinks: "warn",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    image: "img/logo.svg",
    navbar: {
      title: "Rug Radar",
      logo: {
        alt: "Rug Radar",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "/docs/quickstart",
          label: "Quickstart",
          position: "right",
          className: "navbar-cta navbar-cta--primary navbar-icon navbar-icon--quickstart",
        },
        {
          to: "/docs/roadmap",
          label: "Roadmap",
          position: "right",
          className: "navbar-cta navbar-icon navbar-icon--roadmap",
        },
        {
          href: "https://mcp.rugrdr.xyz",
          label: "Try MCP",
          position: "right",
          className: "navbar-cta navbar-icon navbar-icon--mcp",
        },
        {
          href: "https://github.com/maks1302/Rug-Radar-Bags-fm",
          label: "GitHub",
          position: "right",
          className: "navbar-cta navbar-icon navbar-icon--github",
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "docs",
          sidebarPath: "./sidebars.ts",
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
};

export default config;
