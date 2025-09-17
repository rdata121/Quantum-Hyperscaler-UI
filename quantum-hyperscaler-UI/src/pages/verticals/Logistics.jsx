// src/pages/Logistics.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/Logistics.module.css"; // adjust path if needed

/* -------------------------
   Utilities
   -------------------------*/
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* -------------------------
   QuantumNetworkVisualization
   - Canvas particle network, safe animation loop + cleanup
   -------------------------*/
function QuantumNetworkVisualization({ height = 520 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = canvas.clientWidth || window.innerWidth;
    let heightLocal = height;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(heightLocal * DPR);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${heightLocal}px`;
    ctx.scale(DPR, DPR);

    const initParticles = (count = 80) => {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          x: Math.random() * width,
          y: Math.random() * heightLocal,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: 1 + Math.random() * 2,
          quantum: Math.random() > 0.35,
          phase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = arr;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, heightLocal);
      // subtle background grid
      ctx.fillStyle = "rgba(2,4,8,0.9)";
      ctx.fillRect(0, 0, width, heightLocal);

      const particles = particlesRef.current;
      // connections and particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const alpha = 0.35 * (1 - dist / 120);
            ctx.beginPath();
            const grd = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            if (p1.quantum && p2.quantum) {
              grd.addColorStop(0, `rgba(0,212,255,${alpha})`);
              grd.addColorStop(1, `rgba(0,165,255,${alpha})`);
              ctx.lineWidth = 1.4;
            } else {
              grd.addColorStop(0, `rgba(255,184,107,${alpha * 0.6})`);
              grd.addColorStop(1, `rgba(255,160,80,${alpha * 0.6})`);
              ctx.lineWidth = 0.9;
            }
            ctx.strokeStyle = grd;
            // gentle curve midpoint for "quantum" feel
            const mx = (p1.x + p2.x) / 2 + Math.sin(Date.now() * 0.001 + p1.phase) * 8;
            const my = (p1.y + p2.y) / 2 + Math.cos(Date.now() * 0.001 + p2.phase) * 8;
            ctx.moveTo(p1.x, p1.y);
            ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // draw particles and update
      particles.forEach((p) => {
        // simple mouse attraction
        const mdx = mouseRef.current.x - p.x;
        const mdy = mouseRef.current.y - p.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < 120) {
          p.vx += (mdx / mdist) * 0.0006;
          p.vy += (mdy / mdist) * 0.0006;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;

        // bounds
        if (p.x < 6 || p.x > width - 6) p.vx *= -0.9;
        if (p.y < 6 || p.y > heightLocal - 6) p.vy *= -0.9;
        p.x = clamp(p.x, 6, width - 6);
        p.y = clamp(p.y, 6, heightLocal - 6);

        if (p.quantum) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          glow.addColorStop(0, "rgba(0,212,255,0.55)");
          glow.addColorStop(1, "rgba(0,212,255,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4 * (0.8 + Math.sin(p.phase) * 0.15), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = p.quantum ? "#00d4ff" : "rgba(255,184,107,0.9)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const handleLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    initParticles(80);
    window.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    // start
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [height]);

  return <canvas ref={canvasRef} className={styles["quantum-canvas"]} style={{ width: "100%", height }} />;
}

/* -------------------------
   Animated Metrics + MetricCard
   -------------------------*/
function MetricCard({ value = 0, suffix = "", label = "", color = "#00d4ff" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 800;
    const from = 0;
    const to = Number(String(value).replace(/[^\d.-]/g, "")) || 0;
    const step = (ts) => {
      const t = Math.min(1, (ts - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setV(Math.round(from + (to - from) * ease));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className={styles.metricCard || ""} style={{ minWidth: 140 }}>
      <div className={styles.metricValue || ""} style={{ color }}>{v}{suffix}</div>
      <div className={styles.metricLabel || ""}>{label}</div>
    </div>
  );
}
function AnimatedMetrics() {
  // simple reveal on mount
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShow(true), 220);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className={styles["metrics-row"] || ""} style={{ opacity: show ? 1 : 0, transition: "opacity .45s ease" }}>
      <MetricCard value={100} suffix="×" label="Faster Optimization" color="#00d4ff" />
      <MetricCard value={30} suffix="%" label="Cost Reduction" color="#00ff94" />
      <MetricCard value={20} suffix="×" label="ROI Potential" color="#ffb86b" />
    </div>
  );
}

/* -------------------------
   Simple CTA QuantumParticles (fixed)
   -------------------------*/
function QuantumParticles({ count = 6 }) {
  // render lightweight decorative spans
  return (
    <div className={styles["quantum-particles"] || ""} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

/* -------------------------
   ComplexityVisualizer (keeps behavior but robust)
   -------------------------*/
function ComplexityVisualizer() {
  const [nodes, setNodes] = useState(12);
  const [quantOn, setQuantOn] = useState(false);

  const classical = Math.pow(2, nodes);
  const quantum = Math.max(1, Math.round(nodes * Math.log2(nodes)));

  const formatNum = (n) => {
    if (n > 1e12) return `${(n / 1e12).toFixed(1)}T`;
    if (n > 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n > 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n > 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return String(Math.round(n));
  };

  return (
    <div className={styles["complexity-visualizer"] || ""}>
      <div className={styles["complexity-header"] || ""}>
        <h3>Problem Complexity Scaling</h3>
        <p>See how quantum-hybrid methods tame exponential growth</p>
      </div>

      <div className={styles["complexity-controls"] || ""}>
        <label>
          Delivery Locations: <strong style={{ marginLeft: 8 }}>{nodes}</strong>
        </label>
        <input
          className={styles["complexity-slider"] || ""}
          type="range"
          min={5}
          max={60}
          value={nodes}
          onChange={(e) => setNodes(Number(e.target.value))}
        />
      </div>

      <div className={styles["complexity-comparison"] || ""}>
        <div className={`${styles["complexity-card"] || ""} classical ${!quantOn ? "" : "dimmed"}`}>
          <h4>Classical Computing</h4>
          <div className={styles["complexity-value"] || ""}>{formatNum(classical)}</div>
          <div className={styles["complexity-desc"] || ""}>Route combinations to evaluate</div>
          <div className={styles["complexity-time"] || ""}>
            Time: {classical > 1e9 ? "Days–Years" : classical > 1e6 ? "Hours–Days" : "Minutes"}
          </div>
        </div>

        <div className={`${styles["complexity-card"] || ""} quantum ${quantOn ? "active" : ""}`}>
          <h4>Quantum-Hybrid</h4>
          <div className={styles["complexity-value"] || ""}>{formatNum(quantum)}</div>
          <div className={styles["complexity-desc"] || ""}>Effective quantum ops</div>
          <div className={styles["complexity-time"] || ""}>Time: Milliseconds</div>
        </div>
      </div>

      <button
        className={styles["quantum-toggle"] || ""}
        onClick={() => setQuantOn((s) => !s)}
        style={{ marginTop: 12 }}
      >
        {quantOn ? "⚡ Quantum Optimization Active" : "Activate Quantum Optimization"}
      </button>
    </div>
  );
}

/* -------------------------
   SupplyChainSimulator (canvas) - simplified and robust
   -------------------------*/
function SupplyChainSimulator() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const vehiclesRef = useRef([]);
  const [vehicles, setVehicles] = useState(3);
  const [optimization, setOptimization] = useState("classical");
  const [disruption, setDisruption] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 900;
    const H = 500;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(DPR, DPR);

    // nodes
    const initNodes = () => {
      nodesRef.current = [
        { id: "DC", x: 100, y: 250, type: "distribution", label: "Distribution Center", inventory: 120 },
        { id: "W1", x: 300, y: 120, type: "warehouse", label: "Warehouse A", inventory: 80 },
        { id: "W2", x: 300, y: 380, type: "warehouse", label: "Warehouse B", inventory: 65 },
        { id: "S1", x: 520, y: 80, type: "store", label: "Store 1", demand: 22 },
        { id: "S2", x: 620, y: 200, type: "store", label: "Store 2", demand: 18 },
        { id: "S3", x: 520, y: 340, type: "store", label: "Store 3", demand: 28 },
        { id: "S4", x: 760, y: 420, type: "store", label: "Store 4", demand: 16 },
        { id: "S5", x: 820, y: 240, type: "store", label: "Store 5", demand: 20 },
      ];
    };

    const computeRoutes = () => {
      const nodes = nodesRef.current;
      const stores = nodes.filter((n) => n.type === "store");
      const depot = nodes[0];
      const routeCount = Math.min(vehicles, Math.max(1, stores.length));
      const routes = Array.from({ length: routeCount }, () => [depot]);
      stores.forEach((s, i) => routes[i % routeCount].push(s));
      routes.forEach((r) => r.push(depot));
      return routes;
    };

    const initVehicles = () => {
      const routes = computeRoutes();
      vehiclesRef.current = routes.map((route, i) => ({
        id: `v${i}`,
        route,
        progress: Math.random() * 0.6,
        speed: optimization === "quantum" ? 0.014 : 0.008,
        color: i === 0 ? "#00d4ff" : i === 1 ? "#00ff94" : "#ffb86b",
        capacity: 100 - i * 20,
      }));
    };

    const getPosOnRoute = (route, progress) => {
      if (!route || route.length < 2) return route[0] || { x: 0, y: 0 };
      const segCount = route.length - 1;
      const total = Math.min(segCount - 1e-6, progress * segCount);
      const idx = Math.floor(total);
      const t = total - idx;
      const from = route[idx];
      const to = route[idx + 1];
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      };
    };

    const draw = () => {
      // background
      ctx.fillStyle = "rgba(4,8,12,0.98)";
      ctx.fillRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // connections
      ctx.strokeStyle = optimization === "quantum" ? "rgba(0,212,255,0.08)" : "rgba(255,184,107,0.06)";
      nodesRef.current.forEach((n1, i) => {
        nodesRef.current.slice(i + 1).forEach((n2) => {
          if ((n1.type === "distribution" && n2.type === "warehouse") || (n1.type === "warehouse" && n2.type === "store")) {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        });
      });

      // disruption zone
      if (disruption) {
        const g = ctx.createRadialGradient(disruption.x, disruption.y, 0, disruption.x, disruption.y, 100);
        g.addColorStop(0, "rgba(255,80,80,0.28)");
        g.addColorStop(1, "rgba(255,80,80,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(disruption.x, disruption.y, 100, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw nodes
      nodesRef.current.forEach((n) => {
        // glow if quantum
        if (optimization === "quantum") {
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 28);
          glow.addColorStop(0, "rgba(0,212,255,0.06)");
          glow.addColorStop(1, "rgba(0,212,255,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 26, 0, Math.PI * 2);
          ctx.fill();
        }

        // node icon
        ctx.fillStyle = n.type === "distribution" ? "#00d4ff" : n.type === "warehouse" ? "#00ff94" : "#ffb86b";
        ctx.beginPath();
        if (n.type === "distribution") ctx.rect(n.x - 12, n.y - 12, 24, 24);
        else ctx.arc(n.x, n.y, n.type === "warehouse" ? 10 : 8, 0, Math.PI * 2);
        ctx.fill();

        // label
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText(n.label, n.x + 14, n.y + 4);

        // small inventory bar
        if (n.inventory !== undefined) {
          ctx.fillStyle = "rgba(0,255,148,0.6)";
          ctx.fillRect(n.x - 20, n.y + 14, clamp((n.inventory / 150) * 40, 0, 40), 5);
        } else if (n.demand !== undefined) {
          ctx.fillStyle = "rgba(255,184,107,0.6)";
          ctx.fillRect(n.x - 20, n.y + 14, clamp((n.demand / 40) * 40, 0, 40), 5);
        }
      });

      // vehicles
      vehiclesRef.current.forEach((veh) => {
        veh.progress += veh.speed;
        if (veh.progress > 1) veh.progress = 0;
        const pos = getPosOnRoute(veh.route, veh.progress);
        // trail (simple)
        ctx.beginPath();
        ctx.fillStyle = veh.color;
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "9px Inter, sans-serif";
        ctx.fillText(String(veh.capacity), pos.x + 8, pos.y - 6);
      });

      // status text
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "13px Inter, sans-serif";
      ctx.fillText(`Mode: ${optimization === "quantum" ? "Quantum-Optimized" : "Classical"} | Vehicles: ${vehicles}`, 18, 26);

      animRef.current = requestAnimationFrame(draw);
    };

    initNodes();
    initVehicles();
    animRef.current = requestAnimationFrame(draw);

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      setDisruption({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => setDisruption(null), 2200);
    };
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, optimization]);

  return (
    <div className={styles["supply-chain-simulator"] || ""}>
      <div className={styles["simulator-controls"] || ""}>
        <div className="control-group" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ color: "rgba(255,255,255,0.85)" }}>Vehicles: {vehicles}</label>
          <input type="range" min={1} max={6} value={vehicles} onChange={(e) => setVehicles(Number(e.target.value))} />
        </div>
        <div className="control-group" style={{ display: "flex", gap: 8 }}>
          <button className={`${styles["mode-btn"] || ""} ${optimization === "classical" ? "active" : ""}`} onClick={() => setOptimization("classical")}>Classical</button>
          <button className={`${styles["mode-btn"] || ""} ${optimization === "quantum" ? "active" : ""}`} onClick={() => setOptimization("quantum")}>Quantum-Optimized</button>
        </div>
      </div>

      <canvas ref={canvasRef} className={styles["simulator-canvas"] || ""} />
      <p className={styles["simulator-hint"] || ""}>Click on the map to simulate a disruption.</p>
    </div>
  );
}

/* -------------------------
   UseCaseExplorer (safe)
   -------------------------*/
function UseCaseExplorer() {
  const [selected, setSelected] = useState(null);
  const useCases = [
    { id: "routing", title: "Vehicle Routing", icon: "🚚", description: "Optimize routes for thousands with time windows", metrics: { speed: "8–100×", savings: "30% cost" }, details: "..." },
    { id: "inventory", title: "Inventory Balancing", icon: "📦", description: "Multi-echelon optimization", metrics: { safety: "20–50%" }, details: "..." },
    { id: "coldchain", title: "Cold Chain", icon: "❄️", description: "Temperature-aware routing", metrics: { spoilage: "-30%" }, details: "..." },
    { id: "supplier", title: "Supplier Risk", icon: "🌍", description: "Multi-tier risk modeling", metrics: { risk: "-40%" }, details: "..." },
  ];
  return (
    <div className={styles["use-case-explorer"] || ""}>
      <div className={styles["use-case-grid"] || ""}>
        {useCases.map((uc) => (
          <div key={uc.id} className={`${styles["use-case-card"] || ""} ${selected === uc.id ? "expanded" : ""}`} onClick={() => setSelected(selected === uc.id ? null : uc.id)}>
            <div className={styles["use-case-header"] || ""}>
              <span className={styles["use-case-icon"] || ""}>{uc.icon}</span>
              <h3>{uc.title}</h3>
            </div>
            <p className={styles["use-case-description"] || ""}>{uc.description}</p>
            <div className={styles["use-case-metrics"] || ""}>
              {Object.entries(uc.metrics).map(([k, v]) => (
                <div key={k} className="metric-item">
                  <div className="metric-value">{v}</div>
                  <div className="metric-key">{k}</div>
                </div>
              ))}
            </div>
            {selected === uc.id && (
              <div className={styles["use-case-details"] || ""}>
                <p>{uc.details}</p>
                <button className={styles["learn-more-btn"] || ""}>Learn More →</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------
   ROI Calculator (kept safe)
   -------------------------*/
function ROICalculator() {
  const [fleetSize, setFleetSize] = useState(100);
  const [dailyDeliveries, setDailyDeliveries] = useState(1000);
  const [avgDistance, setAvgDistance] = useState(50);
  const [showResults, setShowResults] = useState(false);

  const calc = () => {
    const fuelSavings = fleetSize * avgDistance * 0.12 * 365;
    const timeSavings = dailyDeliveries * 0.45 * 365 * 25;
    const optSavings = fleetSize * 40000 * 0.3;
    const total = fuelSavings + timeSavings + optSavings;
    return { fuelSavings, timeSavings, optSavings, total, roi: (total / 500000) * 100 };
  };

  const res = calc();
  const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className={styles["roi-calculator"] || ""}>
      <div className={styles["roi-header"] || ""}><h3>Calculate Your ROI</h3><p>See potential savings</p></div>
      <div className={styles["roi-inputs"] || ""}>
        <div className={styles["input-group"] || ""}>
          <label>Fleet Size <input type="number" value={fleetSize} onChange={(e) => setFleetSize(Number(e.target.value))} /></label>
          <input type="range" min={10} max={500} value={fleetSize} onChange={(e) => setFleetSize(Number(e.target.value))} />
        </div>
        <div className={styles["input-group"] || ""}>
          <label>Daily Deliveries <input type="number" value={dailyDeliveries} onChange={(e) => setDailyDeliveries(Number(e.target.value))} /></label>
          <input type="range" min={100} max={10000} value={dailyDeliveries} onChange={(e) => setDailyDeliveries(Number(e.target.value))} />
        </div>
        <div className={styles["input-group"] || ""}>
          <label>Avg Route Distance <input type="number" value={avgDistance} onChange={(e) => setAvgDistance(Number(e.target.value))} /></label>
          <input type="range" min={10} max={200} value={avgDistance} onChange={(e) => setAvgDistance(Number(e.target.value))} />
        </div>
      </div>
      <button className={styles["calculate-btn"] || ""} onClick={() => setShowResults(true)}>Calculate Savings</button>

      {showResults && (
        <div className={styles["roi-results"] || ""}>
          <div className={styles["savings-breakdown"] || ""}>
            <div className={styles["savings-item"] || ""}><span className="savings-label">Fuel Optimization</span><span className="savings-value">{fmt(res.fuelSavings)}</span></div>
            <div className={styles["savings-item"] || ""}><span className="savings-label">Time Efficiency</span><span className="savings-value">{fmt(res.timeSavings)}</span></div>
            <div className={styles["savings-item"] || ""}><span className="savings-label">Route Optimization</span><span className="savings-value">{fmt(res.optSavings)}</span></div>
          </div>
          <div className={styles["roi-summary"] || ""}>
            <div className="total-savings"><h4>Annual Savings</h4><div className="total-value">{fmt(res.total)}</div></div>
            <div className="roi-percentage"><h4>Expected ROI</h4><div className="roi-value">{Math.round(res.roi)}%</div></div>
          </div>
          <button className={styles["get-report-btn"] || ""}>Get Detailed Report →</button>
        </div>
      )}
    </div>
  );
}

/* -------------------------
   ImplementationTimeline (robust map usage)
   -------------------------*/
function ImplementationTimeline() {
  const [activePhase, setActivePhase] = useState(0);
  const phases = [
    { title: "Assessment", duration: "Week 1-2", description: "Analyze network and opportunities", deliverables: ["Network analysis", "ROI projection", "Roadmap"] },
    { title: "Integration", duration: "Week 3-4", description: "Connect data & APIs", deliverables: ["API integration", "Data pipeline"] },
    { title: "Optimization", duration: "Week 5-6", description: "Configure algorithms & agents", deliverables: ["QUBOs", "Agent tuning"] },
    { title: "Pilot", duration: "Week 7-8", description: "Run pilot", deliverables: ["Live testing", "Metrics"] },
    { title: "Scale", duration: "Week 9+", description: "Full rollout", deliverables: ["Full rollout", "Support"] },
  ];

  return (
    <div className={styles["implementation-timeline"] || ""}>
      <h3>Fast-Track Implementation</h3>
      <p className="timeline-subtitle">From assessment to full deployment in ~8 weeks</p>

      <div className="timeline-track" style={{ position: "relative", marginTop: 18 }}>
        <div className="timeline-progress" style={{ width: `${((activePhase + 1) / phases.length) * 100}%` }} />
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
          {phases.map((p, idx) => (
            <div key={idx} className={`timeline-phase ${idx <= activePhase ? "active" : ""}`} onClick={() => setActivePhase(idx)} style={{ cursor: "pointer", textAlign: "center", flex: 1 }}>
              <div className="phase-marker" style={{ margin: "0 auto" }}><span>{idx + 1}</span></div>
              <div className="phase-content"><h4>{p.title}</h4><span className="phase-duration">{p.duration}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="phase-details" style={{ marginTop: 18 }}>
        <h4 style={{ color: "#00ff94" }}>{phases[activePhase].title}</h4>
        <p style={{ color: "rgba(255,255,255,0.8)" }}>{phases[activePhase].description}</p>
        <ul className="deliverables-list">
          {phases[activePhase].deliverables.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------
   Final Page
   -------------------------*/
export default function Logistics() {
  return (
    <main className={styles.page || ""}>
      <header className={styles.hero || ""}>
        <QuantumNetworkVisualization height={480} />
        <div className={styles.heroContent || ""} style={{ position: "relative", zIndex: 12 }}>
          <p className={styles.eyebrow || ""}>INDUSTRY • LOGISTICS & SUPPLY CHAIN</p>
          <h1 className={styles.title || ""}>Transform Supply Chain Performance with <span className={styles.gradientText || ""}>Quantum-Powered Optimization</span></h1>
          <p className={styles.subhead || ""}>Autonomous AI agents orchestrate quantum, quantum-inspired, and classical solvers to solve complex routing, inventory and network design problems in (near) real time.</p>

          <AnimatedMetrics />

          <div className={styles.ctaRow || ""} style={{ marginTop: 12 }}>
            <Link to="/console" className={styles.ctaPrimary || ""}>Get Started</Link>
            <a href="#sim" className={styles.ctaGhost || ""}>See Live Demo ↓</a>
            <QuantumParticles />
          </div>
        </div>
      </header>

      <section className={styles.section || ""}>
        <h2 className={styles.h2 || ""}>Executive Summary</h2>
        <p className={styles.lede || ""}>NeoQubit combines quantum, quantum-inspired and classical optimization with autonomous agent orchestration — turning previously intractable logistics problems into rapid, measurable operational improvements.</p>
      </section>

      <section className={styles.split || ""}>
        <div>
          <h2 className={styles.h2 || ""}>The Supply Chain Complexity Crisis</h2>
          <ul className={styles.bullets || ""}>
            <li>Classical optimization hits computational walls as network size and constraints grow.</li>
            <li>Real-time decisioning across orders, telematics and supplier risk demands continuous re-optimization.</li>
            <li>Multi-objective trade-offs require simultaneous consideration — not sequential heuristics.</li>
          </ul>
        </div>

        <aside className={styles.kpis || ""}>
          <div className={styles.kpi || ""}><div className={styles.kpiValue || ""}>8–100×</div><div className={styles.kpiLabel || ""}>Faster optimization</div></div>
          <div className={styles.kpi || ""}><div className={styles.kpiValue || ""}>ms</div><div className={styles.kpiLabel || ""}>Re-opt latency</div></div>
          <div className={styles.kpi || ""}><div className={styles.kpiValue || ""}>10–20×</div><div className={styles.kpiLabel || ""}>Expected ROI</div></div>
        </aside>
      </section>

      <section className={styles.section || ""}>
        <h2 className={styles.h2 || ""}>Breakthrough Orchestration</h2>
        <ol className={styles.steps || ""}>
          <li><h3>Problem Formulation Agents</h3><p>Translate business constraints into solver-ready models.</p></li>
          <li><h3>Autonomous Model Configuration</h3><p>Select quantum vs classical pathways and tune penalties in real time.</p></li>
          <li><h3>Device Interaction Agents</h3><p>Orchestrate annealers, quantum-inspired engines and classical fallbacks.</p></li>
          <li><h3>Result Interpretation Agents</h3><p>Turn solver outputs into routes, allocations and BI insights.</p></li>
        </ol>
      </section>

      <section className={styles.section || ""}>
        <h2 className={styles.h2 || ""}>Proven Supply Chain Applications</h2>
        <ul className={styles.cardGrid || ""}>
          <li className={styles.card || ""}><h3>Vehicle Routing & Last-Mile</h3><p>Adaptive routing for 2,000+ stops, time windows and traffic.</p><p className={styles.meta || ""}><b>8–100× speedups</b></p></li>
          <li className={styles.card || ""}><h3>Dynamic Inventory Balancing</h3><p>Multi-e echelon balancing under uncertainty.</p><p className={styles.meta || ""}><b>20–50% safety stock reduction</b></p></li>
          <li className={styles.card || ""}><h3>Multi-Tier Supplier Risk</h3><p>Graph modeling for risk propagation & alternate sourcing.</p><p className={styles.meta || ""}><b>30–40% risk reduction</b></p></li>
          <li className={styles.card || ""}><h3>Cold-Chain Path Optimization</h3><p>Constraint-aware routing to preserve perishable integrity.</p><p className={styles.meta || ""}><b>Up to 30% spoilage reduction</b></p></li>
        </ul>
      </section>

      <section className={styles.section || ""}>
        <div className={styles.vizGrid || ""}>
          <div className={styles.archBox || ""}>
            <h4>Platform Architecture</h4>
            <div className={styles.archRow || ""}>
              <button className={styles.archNode || ""}>ERP / WMS / TMS</button>
              <span className={styles.archArrow || ""} />
              <button className={styles.archNode || ""}>AI Agents</button>
              <span className={styles.archArrow || ""} />
              <button className={styles.archNode || ""}>Hybrid Solvers</button>
              <span className={styles.archArrow || ""} />
              <button className={styles.archNode || ""}>BI & Dashboards</button>
            </div>
            <p className={styles.hint || ""}>Click nodes to learn more.</p>
          </div>

          <div className={styles.archBox || ""}>
            <h4>ROI Comparison</h4>
            <div style={{ height: 180 }}><svg className={styles.roiSvg || ""} viewBox="0 0 300 160" aria-hidden><rect x="18" y="28" width="90" height="100" rx="8" fill="rgba(255,255,255,0.04)"/><rect x="132" y="8" width="90" height="120" rx="8" fill="url(#barGrad)"/></svg></div>
          </div>

          <div id="sim" className={styles.archBox || ""}>
            <h4>Use-Case Dashboard — Live Demo</h4>
            <SupplyChainSimulator />
          </div>
        </div>
      </section>

      <section className={styles.section || ""}>
        <div className={styles.ctaBand || ""}>
          <div className={styles.ctaBandInner || ""}>
            <div>
              <h3>Ready to end supply-chain bottlenecks with intelligent quantum orchestration?</h3>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/console" className={styles.ctaPrimary || ""}>Get Started</Link>
              <Link to="/contact" className={styles.ctaGhost || ""}>Request a Logistics Assessment</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section || ""}>
        <ImplementationTimeline />
      </section>
    </main>
  );
}
