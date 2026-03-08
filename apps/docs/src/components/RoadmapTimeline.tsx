import React from "react";
import { roadmapItems } from "./roadmapData";
import styles from "./RoadmapTimeline.module.css";

const statusLabel: Record<(typeof roadmapItems)[number]["status"], string> = {
  done: "Done",
  "in-progress": "In Progress",
  next: "Next Up",
  later: "Later",
};

type RoadmapTimelineProps = {
  compact?: boolean;
};

export default function RoadmapTimeline({ compact = false }: RoadmapTimelineProps): JSX.Element {
  return (
    <div className={`${styles.timeline} ${compact ? styles.compact : ""}`.trim()}>
      {roadmapItems.map((item) => (
        <article key={`${item.title}-${item.target}`} className={styles.item}>
          <div className={styles.rail} aria-hidden="true">
            <span className={`${styles.dot} ${styles[`dot-${item.status}` as keyof typeof styles]}`} />
          </div>

          <div className={styles.content}>
            <header className={styles.head}>
              <span className={`${styles.badge} ${styles[`badge-${item.status}` as keyof typeof styles]}`}>
                {statusLabel[item.status]}
              </span>
              <span className={styles.target}>{item.target}</span>
            </header>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <ul>
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
