// src/pages/Home.jsx
import styles from "../styles/home.module.css";
import { Suspense } from "react";
import Spline from "@splinetool/react-spline";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
// Professional icons from lucide-react
import { 
  Brain, Layers, Cpu, CircuitBoard, Cloud, Network,
  Shield, Bolt, Truck, FlaskConical, Sparkles, Zap,
  Activity, Database, Lock, Globe, ChevronRight,
  ArrowRight, CheckCircle, TrendingUp
} from "lucide-react";
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const btnRef = useRef(null);

  // on mount read preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("darkMode");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (saved === "true") {
        document.body.classList.add("dark-mode");
        setIsDark(true);
      } else if (saved === "false") {
        document.body.classList.remove("dark-mode");
        setIsDark(false);
      } else {
        // no saved - respect system
        if (prefersDark) {
          document.body.classList.add("dark-mode");
          setIsDark(true);
        }
      }
    } catch (e) {
      /* ignore storage errors */
    }
  }, []);

  const toggle = () => {
  const btn = btnRef.current;
  if (!btn) return;

  // add blowing animation class for the button (visual)
  btn.classList.add(styles.blowing);

  // after short animation, toggle dark mode
  setTimeout(() => {
    const nowDark = !document.body.classList.contains("dark-mode");
    if (nowDark) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");

    // set aria-pressed for accessibility & debuggability
    try {
      btn.setAttribute("aria-pressed", nowDark ? "true" : "false");
    } catch (e) {}

    setIsDark(nowDark);
    try {
      localStorage.setItem("darkMode", nowDark ? "true" : "false");
    } catch (e) {}
    // remove blowing class to allow re-play next click
    btn.classList.remove(styles.blowing);
  }, 320);
};

  return (
    <button
      ref={btnRef}
      className={styles.themeToggleBtn}
      onClick={toggle}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      type="button"
    >
      <div className={styles.candleWrapper}>
        <div className={styles.candles}>
          <div className={styles.lightWave} />
          <div className={styles.candle1}>
            <div className={styles.candle1Eyes}>
              <span className={styles["candle1__eyes-one"]} />
              <span className={styles["candle1__eyes-two"]} />
            </div>
            <div className={styles.candle1Mouth} />
            <div className={styles.candle1Stick} />
          </div>

          <div className={styles.candle2}>
            <div className={styles.candle2Eyes}>
              <div className={styles["candle2__eyes-one"]} />
              <div className={styles["candle2__eyes-two"]} />
            </div>
            <div className={styles.candle2Stick} />
          </div>

          <div className={styles.candle2Fire} />
          <div className={styles.candleSmokeOne} />
          <div className={styles.candleSmokeTwo} />
        </div>

        <div className={styles.floor} />
      </div>
    </button>
  );
}
function TypewriterImpact() {
  const full = "Real-World\nImpact, Today"; // \n forces next line
  const [typed, setTyped] = useState("");

  useEffect(() => {
  try {
    const saved = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const btn = btnRef.current;

    if (saved === "true") {
      document.body.classList.add("dark-mode");
      setIsDark(true);
      if (btn) btn.setAttribute("aria-pressed", "true");
    } else if (saved === "false") {
      document.body.classList.remove("dark-mode");
      setIsDark(false);
      if (btn) btn.setAttribute("aria-pressed", "false");
    } else {
      if (prefersDark) {
        document.body.classList.add("dark-mode");
        setIsDark(true);
        if (btn) btn.setAttribute("aria-pressed", "true");
      } else {
        if (btn) btn.setAttribute("aria-pressed", "false");
      }
    }
  } catch (e) { /* ignore */ }
}, []);


  return (
    <span className={styles.impactText} aria-label="Real-World Impact, Today">
      <span className={styles.typeLine}>{typed}</span>
      {/* <span className={styles.caret} aria-hidden="true">|</span> */}
    </span>
  );
}


export default function Home() {
  const fullText = "Real-World Impact, Today";
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setTyped(fullText);
      setDone(true);
      return;
    }

    let i = 0;
    const speed = 45; // ms per character (tweak to taste)
    const id = setInterval(() => {
      i += 1;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) {
        setDone(true);
        clearInterval(id);
      }
    }, speed);
    return () => clearInterval(id);
  }, []);

  return (
    <main className={styles.mainWrapper}>
      {/* THEME TOGGLE (top-right) */}
      <div className={styles.themeToggleWrap}>
        <ThemeToggle />
      </div>
      {/* === Hero Section === */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>

            
              <h1 className={styles.heroTitle}>
                <span className={styles.gradientText}>Quantum + AI</span>
                <TypewriterImpact />
            </h1>
            
            <p className={styles.heroDescription}>
              Turning advanced technology into solutions that deliver measurable ROI. 
              We bridge the gap between cutting-edge innovation and practical business outcomes.
            </p>
            
            <div className={styles.heroCTA}>
              <button className={styles.primaryButton}>
                Get Started
                <ArrowRight className={styles.buttonIcon} />
              </button>
              <button className={styles.secondaryButton}>
                Watch Demo
              </button>
            </div>
            
            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <CheckCircle className={styles.trustIcon} />
                <span>Enterprise Ready</span>
              </div>
              <div className={styles.trustItem}>
                <Lock className={styles.trustIcon} />
                <span>SOC 2 Compliant</span>
              </div>
              <div className={styles.trustItem}>
                <Globe className={styles.trustIcon} />
                <span>Global Scale</span>
              </div>
            </div>
          </div>
          
          <div className={styles.heroVisual}>
            <Suspense fallback={
              <div className={styles.loadingOrb}>
                <div className={styles.orbPulse} />
              </div>
            }>
              <div className={styles.splineContainer}>
                <Spline scene="/3d/scene.splinecode" />
              </div>
            </Suspense>
          </div>
        </div>
        
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollDot} />
        </div>
      </section>
<div className={styles.sectionLabelCenter}>
  <span className={styles.sectionLabel}>Classical vs. Quantum</span>
</div>
{/* === Quantum Optimization Section (replace Solutions + Quantum blocks with this) === */}
<section className={styles['quantum-section']}>

  {/* background blobs */}
  <div className={styles['blob-left']} />
  <div className={styles['blob-right']} />

  <div className={styles['quantum-grid']}>
    {/* Left: Wall motif */}
    <div className={styles.left}>
      <div>
        <h2 className={styles.headline}>
          <span className={`${styles.line} ${styles.gradient}`}>When Classical Optimization</span>

          <span className={`${styles.line} ${styles.sub}`}>
            <span>Hits a </span>

            <span className={styles['wall-wrap']}>
              <span className={styles.wall}>Wall</span>

              {/* crack SVG */}
              <svg className={styles.crack} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
                <path className={styles.crackPath} d="M0,5 L18,3 L36,7 L54,2 L72,6 L90,4" />
              </svg>

              {/* shards */}
              <div className={styles['shard-wrap']}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className={styles.shard} />
                ))}
              </div>
            </span>
          </span>
        </h2>

        <p className={styles.lead}>
          Imagine racing toward growth — only to smash into a wall of complexity. Classical optimization can’t scale fast enough, leaving you stuck and frustrated.
        </p>

        <div className={styles.points}>
          <div className={styles.point}>
            <div className={styles.pointIcon}>⏳</div>
            <div>
              <h4>Slow &amp; Expensive</h4>
              <p>Hours-to-days runtimes stall innovation.</p>
            </div>
          </div>

          <div className={styles.point}>
            <div className={styles.pointIcon}>🛠️</div>
            <div>
              <h4>Manual &amp; Fragile</h4>
              <p>Weeks wasted on tuning and prep.</p>
            </div>
          </div>

          <div className={styles.point}>
            <div className={styles.pointIcon}>💸</div>
            <div>
              <h4>High Cost</h4>
              <p>Specialized infra drives TCO sky-high.</p>
            </div>
          </div>

          <div className={styles.point}>
            <div className={styles.pointIcon}>🧱</div>
            <div>
              <h4>Blocked Integration</h4>
              <p>Pipelines break against rigid tools.</p>
            </div>
          </div>
        </div>

        <div className={styles.ctas}>
          <button className={`${styles.btn} ${styles['btn-break']}`}>Break the Wall →</button>
          <a className={`${styles['btn-ghost']}`} href="#stories">See Customer Stories</a>
        </div>
      </div>
    </div>

    {/* Right: Quantum wave motif (card) */}
    <div className={`${styles.card} ${styles['quantum-card']}`}>
      <div className={styles['card-blob']} />
      <h3 className={styles['card-title']}>
        <span className={styles['card-solution']}>Quantum Intelligence</span>
        <span className={`${styles['card-sub']} ${styles.gradient}`}>Helps You Win</span>
      </h3>



      <p className={styles['card-lead']}>
        Quantum transforms barriers into breakthroughs. Instead of hitting the wall, your business rides a new wave — reaching decisions faster, cheaper, and smarter.
      </p>

      <div className={styles.benefits}>
        <div className={styles.benefit}>
          <div className={styles['benefitIcon']}>⚡</div>
          <div>
            <h4>Faster Insights</h4>
            <p>From hours to seconds — stay ahead of the market.</p>
          </div>
        </div>

        <div className={styles.benefit}>
          <div className={styles['benefitIcon']}>🌊</div>
          <div>
            <h4>Seamless Flow</h4>
            <p>Hybrid orchestration sweeps past local minima.</p>
          </div>
        </div>

        <div className={styles.benefit}>
          <div className={styles['benefitIcon']}>☁️</div>
          <div>
            <h4>Future-proof</h4>
            <p>Deploy anywhere — cloud, edge, or on-prem with APIs.</p>
          </div>
        </div>
      </div>

      <div className={styles['card-cta']}>
        <button className={`${styles.btn} ${styles['btn-ride']}`}>Ride the Wave</button>
      </div>
    </div>
  </div>

  {/* subtle starfield */}
  <svg className={styles.starfield} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
    <g fill="rgba(255,255,255,0.02)">
      <circle cx="10" cy="20" r="0.6" />
      <circle cx="23" cy="80" r="0.5" />
      <circle cx="70" cy="30" r="0.7" />
      <circle cx="85" cy="70" r="0.4" />
      <circle cx="50" cy="50" r="0.45" />
    </g>
  </svg>
</section>


{/* === Industry Verticals === */}
<section id="verticals" className={styles.verticals}>
  <div className={styles.vertHeader}>
<span className={styles.sectionLabel}>Verticals</span>
    {/* Make [flip] Quantum! */}
    <div className={styles.tickerBlock}>
      <h2 className={styles.tagH2}>Make</h2>

      <div className={styles.tickerPill} aria-hidden="true">
        <span className={styles.flip}>
          <span className={styles.flipInner}>
            <span><b>Cybersecurity</b></span>
            <span><b>Energy</b></span>
            <span><b>Logistics</b></span>
            <span><b>Pharmaceuticals</b></span>
            <span><b>Cybersecurity</b></span>
          </span>
        </span>
      </div>

      <h2 className={styles.tagH2}>Quantum!</h2>
    </div>
  </div>

  <div className={styles.vertContainer}>
    <div className={styles.ivGridFour}>

      {/* CYBERSECURITY */}
      <article className={`${styles.ivFour} ${styles.accentCyan}`}>
        
        <div className={styles.ivIconWrap}>
          {/* your existing SVG (unchanged) */}
          <svg viewBox="0 0 180 140" className={styles.ivSvg} aria-hidden="true">
            <circle className={styles.csRing} cx="90" cy="56" r="56" />
            <g className={styles.csSweep}>
              <circle className={styles.csArc} cx="90" cy="56" r="56" />
            </g>
            <g className={styles.csLock}>
              <path className={`${styles.csShackle} ${styles.csShackleDraw}`} pathLength="100" d="M66 44 a24 24 0 0 1 48 0 v12" />
              <rect className={styles.csBody} x="60" y="55" width="60" height="38" rx="9" />
              <circle className={styles.csKey} cx="90" cy="72" r="3.6" />
            </g>
          </svg>
        </div>

        <div className={styles.ivContent}>
          <h3 className={styles.ivTitle}>Cybersecurity</h3>
          <p className={styles.ivBody}>
            NeoQubit accelerates post‑quantum readiness and anomaly detection by orchestrating quantum‑enhanced ML with classical analytics, improving signal-to-noise in high‑volume telemetry and automating incident response playbooks end‑to‑end. Organizations use quantum‑ready frameworks to measure readiness and uplift detection accuracy while reducing false positives for faster mean‑time‑to‑respond.
          </p>

          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <div className={styles.kpiValue}>92–93%</div>
              <div className={styles.kpiLabel}>Threat detection</div>
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiValue}>30–40%</div>
              <div className={styles.kpiLabel}>MTTR reduction</div>
            </div>
          </div>

          <Link className={styles.ivLink} to="/verticals/cybersecurity">Learn more</Link>



        </div>
      </article>
      
      {/* ENERGY */}
      <article className={`${styles.ivFour} ${styles.accentGreen}`}>
        <span className={styles.badge}>FEATURED</span>
        <div className={styles.ivIconWrap}>
          <svg viewBox="0 0 180 140" className={styles.ivSvg} aria-hidden="true">
            <circle className={styles.enHalo} cx="90" cy="56" r="56" />
            <g className={styles.enRotor}>
              <circle className={styles.enHub} cx="90" cy="68" r="6" />
              <path className={styles.enBlade} d="M90 68 L124 62 L116 75 Z" />
              <path className={styles.enBlade} d="M90 68 L84 34 L76 48 Z" />
              <path className={styles.enBlade} d="M90 68 L52 86 L66 92 Z" />
            </g>
            <path className={styles.enWave} d="M30 104 Q60 94 90 104 T150 104" />
          </svg>
        </div>

        <div className={styles.ivContent}>
          <h3 className={styles.ivTitle}>Energy</h3>
          <p className={styles.ivBody}>NeoQubit’s AI agents formulate grid problems as QUBOs and orchestrate quantum, quantum‑inspired, and classical solvers for real‑time unit commitment, OPF, and demand response—enabling millisecond re‑optimization and higher renewable utilization at scale. Market analyses and deployments indicate clear ROI and expanding adoption across grid and storage workflows.</p>
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiValue}>5–15%</div><div className={styles.kpiLabel}>Cost reduction</div></div>
            <div className={styles.kpi}><div className={styles.kpiValue}>15–25%</div><div className={styles.kpiLabel}>Renewables gain</div></div>
          </div>
          <Link className={styles.ivLink} to="/verticals/energy">Learn more</Link>
        </div>
      </article>

      {/* LOGISTICS */}
      <article className={`${styles.ivFour} ${styles.accentOrange}`}>
        <div className={styles.ivIconWrap}>
          <svg viewBox="0 0 180 140" className={styles.ivSvg} aria-hidden="true">
            <circle className={styles.loHub} cx="90" cy="30" r="6" />
            <path className={styles.loRoute} d="M90 30 C 110 56, 134 54, 150 60" />
            <path className={styles.loRoute} d="M90 30 C 72 82, 58 100, 44 94" />
            <path className={styles.loRoute} d="M90 30 C 94 90, 102 108, 112 108" />
            <circle className={styles.loNode} cx="150" cy="60" r="5" />
            <circle className={styles.loNode} cx="44" cy="94" r="5" />
            <circle className={styles.loNode} cx="112" cy="108" r="5" />
          </svg>
        </div>

        <div className={styles.ivContent}>
          <h3 className={styles.ivTitle}>Logistics</h3>
          <p className={styles.ivBody}>NeoQubit evaluates billions of route permutations simultaneously and re‑optimizes in real time for last‑mile, fleet dispatch, and network design, converting complex constraints into QUBOs that run across quantum‑classical solvers for superior routes and resilient plans. Independent research and case studies show tangible savings and service improvements.</p>
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiValue}>10%</div><div className={styles.kpiLabel}>Faster deliveries</div></div>
            <div className={styles.kpi}><div className={styles.kpiValue}>10–25%</div><div className={styles.kpiLabel}>Cost savings</div></div>
          </div>
          <Link className={styles.ivLink} to="/verticals/logistics">Learn more</Link>        </div>
      </article>

      {/* PHARMACEUTICALS */}
      <article className={`${styles.ivFour} ${styles.accentPurple}`}>
        <div className={styles.ivIconWrap}>
          <svg viewBox="0 0 180 140" className={styles.ivSvg} aria-hidden="true">
            <circle className={styles.phHalo} cx="120" cy="56" r="30" />
            <path className={styles.phFlask} d="M90 38 h20 v10 l14 36 a10 10 0 0 1 -10 14 h-42 a10 10 0 0 1 -10 -14 l14 -36 v-10 z" />
            <path className={styles.phLiquid} d="M68 98 h48" />
            <circle className={styles.phBubble} cx="80" cy="92" r="3" />
            <circle className={styles.phBubble} cx="90" cy="96" r="4.5" />
            <circle className={styles.phBubble} cx="100" cy="96" r="2.5" />
          </svg>
        </div>

        <div className={styles.ivContent}>
          <h3 className={styles.ivTitle}>Pharmaceuticals</h3>
          <p className={styles.ivBody}>NeoQubit accelerates discovery by encoding molecular, ADMET, and trial‑design objectives as QUBOs, orchestrating quantum/quantum‑inspired solvers to explore much larger chemical spaces, prioritize candidates, and optimize trials—with AI agents automating data prep, model selection, and iteration. Peer analyses highlight order‑of‑magnitude efficiency gains.</p>
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiValue}>60%</div><div className={styles.kpiLabel}>Faster discovery</div></div>
            <div className={styles.kpi}><div className={styles.kpiValue}>10–20×</div><div className={styles.kpiLabel}>ROI improvement</div></div>
          </div>
          <Link className={styles.ivLink} to="/verticals/pharmaceuticals">Learn more</Link>        </div>
      </article>

    </div>
  </div>
</section>

<section id="NeoQubit vs. Alternatives" className={styles.verticals}>
    {/* <div className={styles.vertHeader}> */}
<div className={styles.sectionLabelCenter}>
  <span className={styles.sectionLabel}>NeoQubit vs. Alternatives</span>
</div>
</section>
<section className={styles['compare-section']} aria-labelledby="compare-title">
  <div className={styles['compare-wrapper']}>


    <div className={styles['table-scroll']}>
      <table className={styles['compare-table']} role="table" aria-describedby="compare-title">
        <thead>
          <tr className={styles['compare-thead']}>
            <th scope="col" className={styles['col-cap']}>Capability</th>
            <th scope="col" className={styles['col-hyper']}>NeoQubit</th>
            <th scope="col" className={styles['col-classical']}>Classical Solvers</th>
            <th scope="col" className={styles['col-quantum']}>Quantum-Only</th>
          </tr>
        </thead>

        <tbody>
          <tr className={styles['compare-row']}>
            <td className={styles['cap-cell']}><strong>Solution Speed</strong></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-cyan']}`}>Milliseconds</span></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-amber']}`}>Hours–Days</span></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-rose']}`}>Limited Scale</span></td>
          </tr>

          <tr className={styles['compare-row']}>
            <td className={styles['cap-cell']}><strong>Variable Capacity</strong></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-cyan']}`}>100,000+</span></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-amber']}`}>Limited</span></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-rose']}`}>Very Limited</span></td>
          </tr>

          <tr className={styles['compare-row']}>
            <td className={styles['cap-cell']}><strong>Deployment Time</strong></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-cyan']}`}>Weeks</span></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-amber']}`}>Months</span></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-rose']}`}>Years</span></td>
          </tr>

          <tr className={styles['compare-row']}>
            <td className={styles['cap-cell']}><strong>Expert Dependency</strong></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-cyan']}`}>Zero-Code</span></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-amber']}`}>High</span></td>
            <td className={styles['value-cell']}><span className={`${styles.pill} ${styles['pill-rose']}`}>Critical</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Mobile stacked cards fallback */}
    <div className={styles['compare-cards']}>
      <article className={styles.card}>
        <div className={styles['card-head']}><div className={styles.cap}>Solution Speed</div></div>
        <div className={styles['card-body']}>
          <div className={styles['card-row']}><div className={styles['card-col-title']}>NeoQubit</div><div><span className={`${styles.pill} ${styles['pill-cyan']}`}>Milliseconds</span></div></div>
          <div className={styles['card-row']}><div className={styles['card-col-title']}>Classical</div><div><span className={`${styles.pill} ${styles['pill-amber']}`}>Hours–Days</span></div></div>
          <div className={styles['card-row']}><div className={styles['card-col-title']}>Quantum</div><div><span className={`${styles.pill} ${styles['pill-rose']}`}>Limited Scale</span></div></div>
        </div>
      </article>

      {/* Add additional cards for Variable Capacity, Deployment Time, Expert Dependency — you can duplicate above card and change text */}
    </div>
  </div>
</section>

<section className={styles['lead-section']} aria-labelledby="lead-cta-title">
  <div className={styles['lead-wrapper']}>
    {/* Left content */}
    <div className={styles['lead-left']}>
      <h2 id="lead-cta-title" className={styles['lead-title']}>
        Ready to Transform Your <br /> Optimization Strategy?
      </h2>

      <p className={styles['lead-sub']}>
        Join leading enterprises using NeoQubit to achieve breakthrough optimization performance.
      </p>

      <ul className={styles['lead-benefits']} aria-hidden="false">
        <li className={styles['benefit-item']}>
          <span className={styles['benefit-icon']} aria-hidden>✅</span>
          <span className={styles['benefit-text']}>Free technical consultation</span>
        </li>

        <li className={styles['benefit-item']}>
          <span className={styles['benefit-icon']} aria-hidden>✅</span>
          <span className={styles['benefit-text']}>Custom ROI assessment</span>
        </li>

        <li className={styles['benefit-item']}>
          <span className={styles['benefit-icon']} aria-hidden>✅</span>
          <span className={styles['benefit-text']}>Proof-of-concept deployment</span>
        </li>
      </ul>
    </div>

    {/* Right form card */}
    <aside className={styles['lead-right']} aria-labelledby="demo-form-title">
      <div className={styles['form-card']}>
        <h3 id="demo-form-title" className={styles['form-title']}>Get Started</h3>

        <form
          className={styles['lead-form']}
          name="demo-request"
          action="#"
          method="POST"
          onSubmit={(e) => { e.preventDefault(); /* wire to your handler */ }}
        >
          <label className={styles['form-field']}>
            <span className={styles['form-label']}>Full Name</span>
            <input className={styles.input} name="name" type="text" placeholder="Your full name" required />
          </label>

          <label className={styles['form-field']}>
            <span className={styles['form-label']}>Business Email</span>
            <input className={styles.input} name="email" type="email" placeholder="you@company.com" required />
          </label>

          <label className={styles['form-field']}>
            <span className={styles['form-label']}>Company</span>
            <input className={styles.input} name="company" type="text" placeholder="Company name" />
          </label>

          <div className={styles['form-row']}>
            <label className={`${styles['form-field']} ${styles['flex-1']}`}>
              <span className={styles['form-label']}>Role</span>
              <select className={styles.select} name="role" defaultValue="">
                <option value="" disabled>Select your role</option>
                <option>Data Scientist</option>
                <option>Engineering Leader</option>
                <option>Product Manager</option>
                <option>CTO / Executive</option>
              </select>
            </label>

            <label className={`${styles['form-field']} ${styles['flex-1']}`}>
              <span className={styles['form-label']}>Industry</span>
              <select className={styles.select} name="industry" defaultValue="">
                <option value="" disabled>Select your industry</option>
                <option>Energy</option>
                <option>Logistics</option>
                <option>Pharmaceuticals</option>
                <option>Finance</option>
              </select>
            </label>
          </div>

          <label className={styles['form-field']}>
            <span className={styles['form-label']}>Tell us about your optimization challenges</span>
            <textarea className={styles.textarea} name="message" rows="5" placeholder="Describe your current optimization needs or challenges..." />
          </label>

          <div className={styles['form-actions']}>
            <button type="submit" className={`${styles['cta-large']}`} aria-label="Get Started with NeoQubit">
              Get Started with NeoQubit
            </button>
          </div>
        </form>
      </div>
    </aside>
  </div>
</section>

        <footer className={styles.footer}>
          <p>&copy; 2025 NeoQubit. Quantum Intelligence for Everyone.</p>
        </footer>
    </main>
  );
}