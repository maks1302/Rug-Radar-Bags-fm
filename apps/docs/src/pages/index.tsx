import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "./index.module.css";

const toolCards = [
  {
    title: "analyze_token",
    text: "Full due diligence report with market, contract, and holder risk signals.",
  },
  {
    title: "scan_risk",
    text: "Fast red-flag scan for instant go/no-go checks.",
  },
  {
    title: "watch_token",
    text: "Save watch rules and baseline snapshots for continuous monitoring.",
  },
  {
    title: "get_token_changes",
    text: "Delta view from previous snapshot plus triggered alert conditions.",
  },
];

export default function Home(): JSX.Element {
  const healthUrl = "https://mcp.rugrdr.xyz/health";
  const [health, setHealth] = React.useState<"healthy" | "unhealthy" | "checking">("checking");

  React.useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const response = await fetch(healthUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!cancelled) {
          setHealth(response.ok || response.status === 304 ? "healthy" : "unhealthy");
        }
      } catch (_error) {
        if (!cancelled) {
          setHealth("unhealthy");
        }
      }
    };

    void check();
    const interval = window.setInterval(check, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [healthUrl]);

  return (
    <Layout title="Rug Radar" description="Instant Solana token and wallet due diligence for Claude and MCP-compatible agents.">
      <main className={styles.page}>
        <div className={styles.bgGrid} />

        <section className={`${styles.hero} ${styles.container}`}>
          <p className={styles.eyebrow}>MCP-Powered Solana Intelligence</p>
          <h1>Stop Guessing. Scan Risk Before You Trade.</h1>
          <p className={styles.lead}>
            Rug Radar gives retail traders instant token and wallet due diligence inside Claude and any MCP-compatible
            agent. No onchain detective work, no dashboard overload, just clear risk signals.
          </p>
          <div className={styles.ctaRow}>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} to="/docs/quickstart">
              Quickstart
            </Link>
            <Link className={styles.btn} to="/docs/clients/openclaw">
              <svg
                className={styles.btnIcon}
                viewBox="0 0 24 24"
                width="16"
                height="16"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M9 3h6v2h-2v2h4c1.1 0 2 .9 2 2v4h1a1 1 0 1 1 0 2h-1v4c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-4H4a1 1 0 1 1 0-2h1V9c0-1.1.9-2 2-2h4V5H9V3Zm-2 6v10h10V9H7Zm3 3a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Zm4 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Z"
                />
              </svg>
              <span>I am an agent</span>
            </Link>
          </div>
        </section>

        <section className={`${styles.tools} ${styles.container}`}>
          {toolCards.map((tool) => (
            <article key={tool.title} className={styles.toolCard}>
              <h3>{tool.title}</h3>
              <p>{tool.text}</p>
            </article>
          ))}
        </section>

        <section className={`${styles.foot} ${styles.container}`}>
          <p>DYOR. Rug Radar is analysis software, not financial advice.</p>
        </section>

        <div className={styles.healthBadge} aria-live="polite">
          <span
            className={`${styles.healthDot} ${
              health === "healthy"
                ? styles.healthDotGreen
                : health === "unhealthy"
                  ? styles.healthDotRed
                  : styles.healthDotGray
            }`}
          />
          <span className={styles.healthText}>
            MCP {health === "healthy" ? "Healthy" : health === "unhealthy" ? "Unhealthy" : "Checking"}
          </span>
        </div>
      </main>
    </Layout>
  );
}
