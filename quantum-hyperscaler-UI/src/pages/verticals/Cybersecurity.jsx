// src/pages/verticals/Cybersecurity.jsx
import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/Cybersecurity.module.css";

/* Small presentational bits */
const FeatureCard = ({ icon, title, children }) => (
  <article className={styles.featureCard} tabIndex={0} role="article" aria-label={title}>
    <div className={styles.featureIcon} aria-hidden>{icon}</div>
    <h3>{title}</h3>
    <p>{children}</p>
  </article>
);

const CheckRow = ({ text }) => (
  <li className={styles.checkRow}>
    <span className={styles.checkMark} aria-hidden>✓</span>
    <span>{text}</span>
  </li>
);

export default function Cybersecurity() {
  // ---------- page reveal ----------
  const rootRef = useRef(null);
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    node.classList.add(styles.pageReady);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add(styles.revealed);
        });
      },
      { threshold: 0.18 }
    );
    node.querySelectorAll(`.${styles.section}`).forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ------------------------------
     Workflow animation (all hooks inside component)
     Desired logical sequence: Data Ingestion -> AI Processing -> Hybrid Solving -> Deploy Results
     Physical tile positions:
       1 = TL (Data Ingestion)
       2 = TR (AI Processing)
       3 = BR (Deploy Results)
       4 = BL (Hybrid Solving)
     We map logical steps to tile ids via tileOrder.
  ------------------------------ */

  const STEP_INTERVAL_MS = 1400; // ms per sequence step (tweak to taste)
  const [seqStep, setSeqStep] = useState(1); // 1..4 sequence index

  useEffect(() => {
    const id = setInterval(() => {
      setSeqStep(prev => (prev % 4) + 1);
    }, STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // map logical sequence index -> physical tile id
  // sequence: step1 -> Data Ingestion (1), step2 -> AI Processing (2), step3 -> Hybrid Solving (4), step4 -> Deploy Results (3)
  const tileOrder = [1, 2, 4, 3];

  const activeTileId = tileOrder[seqStep - 1];
  const nextTileId = tileOrder[seqStep % 4]; // next in sequence (wraps)

  // connector segments:
  // seg1 = top (TL -> TR),
  // seg2 = right (TR -> BR),
  // seg3 = bottom (BR -> BL),
  // seg4 = left (BL -> TL)
  const connectorMap = {
    "1->2": [1],        // TL -> TR (top)
    "2->4": [2, 3],     // TR -> BL (right then bottom)
    "4->3": [3],        // BL -> BR (bottom)
    "3->1": [4, 1]      // BR -> TL (left then top)
  };

  const movementKey = `${activeTileId}->${nextTileId}`;
  const activeConnectors = connectorMap[movementKey] || [];

  // Tile labels in physical order TL, TR, BR, BL (1..4)
  const tileLabels = {
    1: "Data Ingestion",
    2: "AI Processing",
    3: "Deploy Results",
    4: "Hybrid Solving"
  };

  return (
    <div className={styles.page} ref={rootRef}>
      {/* Header / hero box */}
      <header className={`${styles.hero} ${styles.box}`}>
        <p className={styles.eyebrow}>NeoQubit • Cybersecurity</p>

        <h1 className={styles.title}>Accelerate Cybersecurity Optimization</h1>

        <p className={styles.subhead}>
          Hybrid quantum-classical orchestration for real-time, cost-efficient defense
        </p>

        <div className={styles.kpiStrip} role="list" aria-label="Key performance indicators">
          <div className={styles.kpiTile}>
            <div className={styles.gauge} style={{ ["--p"]: 98 }} aria-hidden />
            <div className={styles.kpiNum}>ms</div>
            <div className={styles.kpiText}>Re-Opt</div>
          </div>
          <div className={styles.kpiTile}>
            <div className={styles.gauge} style={{ ["--p"]: 90 }} aria-hidden />
            <div className={styles.kpiNum}>8–100×</div>
            <div className={styles.kpiText}>Faster</div>
          </div>
          <div className={styles.kpiTile}>
            <div className={styles.gauge} style={{ ["--p"]: 80 }} aria-hidden />
            <div className={styles.kpiNum}>~80%</div>
            <div className={styles.kpiText}>Automation</div>
          </div>
          <div className={styles.kpiTile}>
            <div className={styles.gauge} style={{ ["--p"]: 70 }} aria-hidden />
            <div className={styles.kpiNum}>≈70%</div>
            <div className={styles.kpiText}>Compute↓</div>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <a className={styles.ctaPrimary} href="#get-started">Get Started</a>
          <a className={styles.ctaGhost} href="#see-action">See NeoQubit in Action</a>
        </div>
      </header>

      {/* FEATURES */}
      <section id="features" className={`${styles.section} ${styles.featuresSection} ${styles.box}`}>
        <div className={styles.sectionHeader}>
          <h2>AI-Driven Hyperscaler Platform</h2>
          <p>Seamlessly blend quantum, quantum-inspired, and classical solvers for adaptive defense</p>
        </div>

        <div className={styles.featuresGrid}>
          <FeatureCard icon={<span className={styles.emoji}>⚛️</span>} title="Quantum-Enhanced NIDS">
            Optimize sensor placement and alert thresholds under resource limits with quantum computing power.
          </FeatureCard>

          <FeatureCard icon={<span className={styles.emoji}>🤖</span>} title="AI Multi-Agent Orchestration">
            Automated data prep, feature engineering, and solver selection through intelligent agents.
          </FeatureCard>

          <FeatureCard icon={<span className={styles.emoji}>⚡</span>} title="Millisecond Reoptimization">
            Adapt to evolving threats in real-time with instant strategy recomputation.
          </FeatureCard>

          <FeatureCard icon={<span className={styles.emoji}>🛡️</span>} title="Smart Patch Management">
            Prioritize deployments to close critical risk paths with minimal disruption.
          </FeatureCard>

          <FeatureCard icon={<span className={styles.emoji}>🔍</span>} title="Advanced Anomaly Detection">
            High-dimensional feature selection for user behavior clustering and threat identification.
          </FeatureCard>

          <FeatureCard icon={<span className={styles.emoji}>🔗</span>} title="Seamless Integration">
            Native APIs/SDKs for SIEM, SOAR, and policy engines. Deploy in minutes.
          </FeatureCard>
        </div>
      </section>

      {/* SEE HYPERQUO IN ACTION */}
      <section id="see-action" className={`${styles.section} ${styles.demoSection} ${styles.box}`}>
        <div className={styles.demoContainer}>
          <div className={styles.demoVisual} aria-hidden>
            <svg className={styles.connectorSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <path id="seg-1" className={`${styles.connectorPath} ${activeConnectors.includes(1) ? styles.connectorActive : ""}`} d="M25 25 L75 25" strokeLinecap="round" />
              <path id="seg-2" className={`${styles.connectorPath} ${activeConnectors.includes(2) ? styles.connectorActive : ""}`} d="M75 25 L75 75" strokeLinecap="round" />
              <path id="seg-3" className={`${styles.connectorPath} ${activeConnectors.includes(3) ? styles.connectorActive : ""}`} d="M75 75 L25 75" strokeLinecap="round" />
              <path id="seg-4" className={`${styles.connectorPath} ${activeConnectors.includes(4) ? styles.connectorActive : ""}`} d="M25 75 L25 25" strokeLinecap="round" />
            </svg>

            <div className={styles.workflowGrid}>
              {/* TL (1) */}
              <div className={`${styles.tile} ${activeTileId === 1 ? styles.tileActive : ""} ${nextTileId === 1 ? styles.tileNext : ""}`}>
                {tileLabels[1]}
              </div>

              {/* TR (2) */}
              <div className={`${styles.tile} ${activeTileId === 2 ? styles.tileActive : ""} ${nextTileId === 2 ? styles.tileNext : ""}`}>
                {tileLabels[2]}
              </div>

              {/* BR (3) */}
              <div className={`${styles.tile} ${activeTileId === 3 ? styles.tileActive : ""} ${nextTileId === 3 ? styles.tileNext : ""}`}>
                {tileLabels[3]}
              </div>

              {/* BL (4) */}
              <div className={`${styles.tile} ${activeTileId === 4 ? styles.tileActive : ""} ${nextTileId === 4 ? styles.tileNext : ""}`}>
                {tileLabels[4]}
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className={styles.demoContent}>
            <h3>See NeoQubit in Action</h3>
            <p>Experience how our platform transforms your cybersecurity operations:</p>

            <ul className={styles.demoFeatures}>
              <CheckRow text="Automated log parsing and feature selection" />
              <CheckRow text="Intelligent problem decomposition into QUBO matrices" />
              <CheckRow text="Real-time solver selection and orchestration" />
              <CheckRow text="Direct integration with existing security tools" />
              <CheckRow text="Continuous learning and optimization" />
            </ul>

            <div style={{ marginTop: 20 }}>
              <button className={styles.ctaButton} onClick={() => window.alert("Request Demo form would open here")}>
                Request Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className={`${styles.section} ${styles.compareSection} ${styles.box}`}>
        <div className={styles.sectionHeader}>
          <h2>NeoQubit vs. Traditional Solutions</h2>
          <p>See why leading enterprises choose NeoQubit</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table} role="table" aria-label="NeoQubit comparison">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Traditional Tools</th>
                <th>NeoQubit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Solver Technology</td>
                <td>Classical only</td>
                <td className={styles.hyperquoCol}>Quantum + Classical Hybrid</td>
              </tr>
              <tr>
                <td>Reoptimization Speed</td>
                <td>Hours to days</td>
                <td className={styles.hyperquoCol}>Milliseconds</td>
              </tr>
              <tr>
                <td>Automation Level</td>
                <td>Manual configuration</td>
                <td className={styles.hyperquoCol}>80% AI-automated</td>
              </tr>
              <tr>
                <td>Integration</td>
                <td>Custom scripts</td>
                <td className={styles.hyperquoCol}>Native APIs/SDKs</td>
              </tr>
              <tr>
                <td>Cost Efficiency</td>
                <td>High compute costs</td>
                <td className={styles.hyperquoCol}>70% cost reduction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className={`${styles.section} ${styles.ctaSection} ${styles.box}`}>
        <div className={styles.ctaInner}>
          <h2>Ready to Transform Your Cybersecurity?</h2>
          <p>Join industry leaders who've already accelerated their security operations with NeoQubit</p>

          <div className={styles.ctaButtons}>
            <button className={styles.ctaPrimary} onClick={() => window.alert("Start Free Pilot flow")}>Start Free Pilot</button>
            <button className={styles.ctaGhost} onClick={() => window.alert("Contact Sales flow")}>Contact Sales</button>
          </div>
        </div>
      </section>
    </div>
  );
}
