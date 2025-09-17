import React, { useEffect, useRef, useState } from "react";

const QuantumEnergyPage = () => {
  const [activeMetric, setActiveMetric] = useState(0);
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const [roiValue, setRoiValue] = useState(10);
  const [playing, setPlaying] = useState(true);
  
  // Auto-cycle metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle workflow
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setActiveWorkflow((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, [playing]);

  // Animated counter
  const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
    const [display, setDisplay] = useState(0);
    
    useEffect(() => {
      const duration = 1000;
      const start = Date.now();
      const from = display;
      const to = value;
      
      const timer = setInterval(() => {
        const now = Date.now();
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(from + (to - from) * eased));
        
        if (progress >= 1) clearInterval(timer);
      }, 16);
      
      return () => clearInterval(timer);
    }, [value]);
    
    return <>{prefix}{display}{suffix}</>;
  };

  return (
    <div className="quantum-energy-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .quantum-energy-page {
          min-height: 100vh;
          background: #0a0a08;
          color: #f4f4e8;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
        }
        
        /* Hero Section */
        .hero {
          position: relative;
          padding: 80px 20px 60px;
          background: 
            radial-gradient(ellipse 1400px 500px at 50% 0%, rgba(250, 204, 21, 0.08), transparent),
            linear-gradient(180deg, #0a0a08 0%, #141410 100%);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #facc15;
          margin-bottom: 24px;
        }
        
        .hero-title {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        
        .hero-title span {
          background: linear-gradient(135deg, #ffffff 0%, #facc15 50%, #eab308 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: 18px;
          color: rgba(254, 240, 138, 0.8);
          max-width: 800px;
          line-height: 1.6;
          margin-bottom: 48px;
        }
        
        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 48px;
        }
        
        .metric-card {
          position: relative;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .metric-card:hover {
          transform: translateY(-4px);
        }
        
        .metric-visual {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 20px;
        }
        
        .metric-ring {
          width: 100%;
          height: 100%;
        }
        
        .metric-ring svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        
        .metric-ring circle {
          fill: none;
          stroke-width: 8;
          stroke-linecap: round;
        }
        
        .ring-bg {
          stroke: rgba(250, 204, 21, 0.1);
        }
        
        .ring-progress {
          stroke: url(#yellowGradient);
          stroke-dasharray: 314;
          stroke-dashoffset: 314;
          animation: fillProgress 2s ease-out forwards;
          filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.4));
        }
        
        @keyframes fillProgress {
          to {
            stroke-dashoffset: 62;
          }
        }
        
        .metric-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 22px;
          font-weight: 900;
          color: #facc15;
        }
        
        .metric-label {
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(254, 240, 138, 0.6);
          margin-bottom: 4px;
        }
        
        .metric-sublabel {
          text-align: center;
          font-size: 13px;
          color: rgba(253, 224, 71, 0.5);
        }
        
        /* CTA Buttons */
        .cta-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-primary {
          background: #facc15;
          color: #0a0a08;
        }
        
        .btn-primary:hover {
          background: #eab308;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(250, 204, 21, 0.3);
        }
        
        .btn-secondary {
          background: transparent;
          color: #facc15;
          border: 1px solid rgba(250, 204, 21, 0.3);
        }
        
        .btn-secondary:hover {
          background: rgba(250, 204, 21, 0.1);
          border-color: #facc15;
        }
        
        /* Crisis Section */
        .crisis-section {
          padding: 80px 20px;
          background: linear-gradient(180deg, #141410 0%, #0a0a08 100%);
        }
        
        .section-header {
          max-width: 900px;
          margin: 0 auto 48px;
          text-align: center;
        }
        
        .section-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 900;
          margin-bottom: 16px;
        }
        
        .section-subtitle {
          color: rgba(254, 240, 138, 0.7);
          font-size: 17px;
          line-height: 1.6;
        }
        
        .crisis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .crisis-card {
          background: rgba(250, 204, 21, 0.02);
          border: 1px solid rgba(250, 204, 21, 0.1);
          border-radius: 12px;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        
        .crisis-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #facc15, transparent);
          animation: scan 4s infinite;
        }
        
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .crisis-metric {
          font-size: 32px;
          font-weight: 900;
          color: #facc15;
          margin-bottom: 8px;
        }
        
        .crisis-label {
          font-size: 14px;
          font-weight: 600;
          color: rgba(254, 240, 138, 0.9);
          margin-bottom: 8px;
        }
        
        .crisis-description {
          font-size: 13px;
          color: rgba(254, 240, 138, 0.6);
          line-height: 1.5;
        }
        
        /* Platform Section */
        .platform-section {
          padding: 80px 20px;
          background: #0a0a08;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .feature-card {
          background: rgba(250, 204, 21, 0.03);
          border: 1px solid rgba(250, 204, 21, 0.15);
          border-radius: 12px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .feature-card:hover {
          transform: translateY(-4px);
          background: rgba(250, 204, 21, 0.06);
          border-color: rgba(250, 204, 21, 0.3);
          box-shadow: 0 12px 32px rgba(250, 204, 21, 0.1);
        }
        
        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(250, 204, 21, 0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
        }
        
        .feature-title {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        
        .feature-description {
          color: rgba(254, 240, 138, 0.7);
          line-height: 1.6;
        }
        
        /* ROI Section */
        .roi-section {
          padding: 80px 20px;
          background: linear-gradient(180deg, #0a0a08 0%, #141410 100%);
        }
        
        .roi-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .roi-visual {
          background: rgba(250, 204, 21, 0.03);
          border: 1px solid rgba(250, 204, 21, 0.15);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 48px;
        }
        
        .roi-calculator {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }
        
        .roi-inputs {
          space-y: 24px;
        }
        
        .roi-slider-container {
          margin-bottom: 32px;
        }
        
        .roi-slider-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 600;
        }
        
        .roi-slider-value {
          color: #facc15;
          font-size: 24px;
          font-weight: 900;
        }
        
        .roi-slider {
          width: 100%;
          height: 6px;
          background: rgba(250, 204, 21, 0.2);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }
        
        .roi-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: #facc15;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.4);
        }
        
        .roi-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #facc15;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.4);
          border: none;
        }
        
        .roi-results {
          background: rgba(250, 204, 21, 0.05);
          border: 1px solid rgba(250, 204, 21, 0.2);
          border-radius: 12px;
          padding: 32px;
        }
        
        .roi-result-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(254, 240, 138, 0.7);
          margin-bottom: 8px;
        }
        
        .roi-result-value {
          font-size: 36px;
          font-weight: 900;
          color: #facc15;
          margin-bottom: 24px;
        }
        
        .roi-breakdown {
          border-top: 1px solid rgba(250, 204, 21, 0.1);
          padding-top: 24px;
        }
        
        .roi-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: rgba(254, 240, 138, 0.7);
        }
        
        .roi-item-value {
          color: #facc15;
          font-weight: 700;
        }
        
        /* Applications Grid */
        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 48px;
        }
        
        .application-card {
          background: rgba(250, 204, 21, 0.02);
          border: 1px solid rgba(250, 204, 21, 0.1);
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        
        .application-card:hover {
          transform: translateY(-2px);
          border-color: rgba(250, 204, 21, 0.3);
        }
        
        .application-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #ffffff;
        }
        
        .application-metric {
          font-size: 28px;
          font-weight: 900;
          color: #facc15;
          margin-bottom: 8px;
        }
        
        .application-description {
          font-size: 14px;
          color: rgba(254, 240, 138, 0.6);
          line-height: 1.5;
        }
        
        /* Workflow Section */
        .workflow-section {
          padding: 80px 20px;
          background: #0a0a08;
        }
        
        .workflow-container {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .workflow-visual {
          background: rgba(250, 204, 21, 0.02);
          border: 1px solid rgba(250, 204, 21, 0.1);
          border-radius: 16px;
          padding: 40px;
          position: relative;
        }
        
        .workflow-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        
        .workflow-title {
          font-size: 20px;
          font-weight: 700;
        }
        
        .workflow-controls {
          display: flex;
          gap: 12px;
        }
        
        .control-btn {
          padding: 8px 16px;
          background: rgba(250, 204, 21, 0.1);
          border: 1px solid rgba(250, 204, 21, 0.3);
          color: #facc15;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .control-btn:hover {
          background: rgba(250, 204, 21, 0.2);
        }
        
        .control-btn.active {
          background: #facc15;
          color: #0a0a08;
        }
        
        .workflow-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        
        .workflow-step {
          text-align: center;
          position: relative;
        }
        
        .workflow-step::after {
          content: '→';
          position: absolute;
          right: -25px;
          top: 35px;
          color: rgba(250, 204, 21, 0.3);
          font-size: 20px;
        }
        
        .workflow-step:last-child::after {
          display: none;
        }
        
        .workflow-node {
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          background: rgba(250, 204, 21, 0.05);
          border: 2px solid rgba(250, 204, 21, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          transition: all 0.3s ease;
        }
        
        .workflow-step.active .workflow-node {
          background: rgba(250, 204, 21, 0.2);
          border-color: #facc15;
          transform: scale(1.1);
          box-shadow: 0 0 32px rgba(250, 204, 21, 0.4);
        }
        
        .workflow-label {
          font-size: 14px;
          font-weight: 700;
          color: rgba(254, 240, 138, 0.8);
        }
        
        /* Differentiator Section */
        .differentiator-section {
          padding: 80px 20px;
          background: linear-gradient(180deg, #0a0a08 0%, #141410 100%);
        }
        
        .differentiator-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .differentiator-item {
          text-align: center;
        }
        
        .differentiator-number {
          width: 60px;
          height: 60px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(250, 204, 21, 0.1));
          border: 2px solid #facc15;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
          color: #facc15;
        }
        
        .differentiator-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .differentiator-text {
          font-size: 14px;
          color: rgba(254, 240, 138, 0.6);
          line-height: 1.5;
        }
        
        /* CTA Section */
        .cta-section {
          padding: 80px 20px;
          background: #0a0a08;
          text-align: center;
        }
        
        .cta-title {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 16px;
        }
        
        .cta-subtitle {
          color: rgba(254, 240, 138, 0.7);
          margin-bottom: 40px;
          font-size: 18px;
        }
        
        .cta-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
          max-width: 800px;
          margin: 0 auto 48px;
        }
        
        .cta-stat {
          text-align: center;
        }
        
        .cta-stat-value {
          font-size: 32px;
          font-weight: 900;
          color: #facc15;
          margin-bottom: 8px;
        }
        
        .cta-stat-label {
          font-size: 14px;
          color: rgba(254, 240, 138, 0.6);
        }
        
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .features-grid,
          .crisis-grid,
          .applications-grid {
            grid-template-columns: 1fr;
          }
          
          .roi-calculator {
            grid-template-columns: 1fr;
          }
          
          .workflow-steps {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .workflow-step::after {
            display: none;
          }
          
          .differentiator-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* SVG Gradients */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
      </svg>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="header-badge">NEOQUBIT • ENERGY</div>
          <h1 className="hero-title">
            <span>Transform Energy Operations with Quantum-Powered Optimization</span>
          </h1>
          <p className="hero-subtitle">
            AI-orchestrated quantum computing meets classical solvers for breakthrough energy optimization performance. 
            Achieve 10-20x ROI through millisecond solutions for complex grid management challenges.
          </p>

          {/* Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-visual">
                <div className="metric-ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" className="ring-bg" />
                    <circle cx="60" cy="60" r="50" className="ring-progress" />
                  </svg>
                  <div className="metric-value">ms</div>
                </div>
              </div>
              <div className="metric-label">REAL-TIME</div>
              <div className="metric-sublabel">Millisecond optimization</div>
            </div>

            <div className="metric-card">
              <div className="metric-visual">
                <div className="metric-ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" className="ring-bg" />
                    <circle cx="60" cy="60" r="50" className="ring-progress" />
                  </svg>
                  <div className="metric-value">8-100×</div>
                </div>
              </div>
              <div className="metric-label">FASTER</div>
              <div className="metric-sublabel">vs. classical methods</div>
            </div>

            <div className="metric-card">
              <div className="metric-visual">
                <div className="metric-ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" className="ring-bg" />
                    <circle cx="60" cy="60" r="50" className="ring-progress" />
                  </svg>
                  <div className="metric-value">~80%</div>
                </div>
              </div>
              <div className="metric-label">AUTOMATION</div>
              <div className="metric-sublabel">Manual task reduction</div>
            </div>

            <div className="metric-card">
              <div className="metric-visual">
                <div className="metric-ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" className="ring-bg" />
                    <circle cx="60" cy="60" r="50" className="ring-progress" />
                  </svg>
                  <div className="metric-value">10-20×</div>
                </div>
              </div>
              <div className="metric-label">ROI</div>
              <div className="metric-sublabel">Return on investment</div>
            </div>
          </div>

          <div className="cta-group">
            <button className="btn btn-primary">Get Started with HyperQuo</button>
            <button className="btn btn-secondary">Contact for Assessment</button>
          </div>
        </div>
      </section>

      {/* Crisis Section */}
      <section className="crisis-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">The Energy Optimization Crisis Classical Computing Can't Solve</h2>
            <p className="section-subtitle">
              Grid complexity has exploded beyond classical computing capabilities. Energy companies report manual processes 
              consuming 10-40% of managers' time while 81% of leaders have reached computational limits.
            </p>
          </div>

          <div className="crisis-grid">
            <div className="crisis-card">
              <div className="crisis-metric">81%</div>
              <div className="crisis-label">At Classical Limits</div>
              <div className="crisis-description">
                Business leaders report reaching the computational ceiling of traditional optimization methods
              </div>
            </div>

            <div className="crisis-card">
              <div className="crisis-metric">10-40%</div>
              <div className="crisis-label">Time on Manual Tasks</div>
              <div className="crisis-description">
                Energy managers consumed by optimization processes that should be automated
              </div>
            </div>

            <div className="crisis-card">
              <div className="crisis-metric">20 OOM</div>
              <div className="crisis-label">More Solutions</div>
              <div className="crisis-description">
                Quantum explores 20 orders of magnitude more possibilities than classical methods
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="platform-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Quantum-Powered Solutions for Real-Time Energy Management</h2>
            <p className="section-subtitle">
              HyperQuo's AI multi-agent architecture orchestrates quantum annealing, Coherent Ising Machines, 
              and classical solvers to deliver breakthrough performance
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚛️</div>
              <h3 className="feature-title">Millisecond Solutions</h3>
              <p className="feature-description">
                Large-scale optimization problems solved in milliseconds versus hours-to-days for classical methods
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3 className="feature-title">100,000+ Variables</h3>
              <p className="feature-description">
                All-to-all connectivity enabling optimization of the largest energy grid problems
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Real-Time Optimization</h3>
              <p className="feature-description">
                Dynamic capabilities for smart grids and renewable integration with instant response
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Quantum Tunneling</h3>
              <p className="feature-description">
                Escape local minima to find superior global solutions unreachable by classical methods
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI Orchestration</h3>
              <p className="feature-description">
                Intelligent multi-agent automation eliminating 80% of manual optimization workflows
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3 className="feature-title">Hybrid Processing</h3>
              <p className="feature-description">
                Seamless switching between quantum and classical solvers based on problem characteristics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="roi-section">
        <div className="roi-container">
          <div className="section-header">
            <h2 className="section-title">Proven ROI and Industry Applications</h2>
            <p className="section-subtitle">
              $51.5 billion quantum optimization market delivering $60-65M annual benefits from $3-6M investments
            </p>
          </div>

          <div className="roi-visual">
            <div className="roi-calculator">
              <div className="roi-inputs">
                <div className="roi-slider-container">
                  <div className="roi-slider-label">
                    <span>Investment Scale</span>
                    <span className="roi-slider-value">${roiValue}M</span>
                  </div>
                  <input
                    type="range"
                    className="roi-slider"
                    min="3"
                    max="20"
                    value={roiValue}
                    onChange={(e) => setRoiValue(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="roi-results">
                <div className="roi-result-title">Expected Annual Benefits</div>
                <div className="roi-result-value">
                  $<AnimatedNumber value={Math.round(roiValue * 10.8)} />M
                </div>
                <div className="roi-breakdown">
                  <div className="roi-item">
                    <span>ROI Multiple</span>
                    <span className="roi-item-value">10-20×</span>
                  </div>
                  <div className="roi-item">
                    <span>Payback Period</span>
                    <span className="roi-item-value">6-12 months</span>
                  </div>
                  <div className="roi-item">
                    <span>Cost Reduction</span>
                    <span className="roi-item-value">5-15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="applications-grid">
            <div className="application-card">
              <h3 className="application-title">Unit Commitment</h3>
              <div className="application-metric">5-15%</div>
              <div className="application-description">
                Reduction in production costs through optimized scheduling of thousands of generating units
              </div>
            </div>

            <div className="application-card">
              <h3 className="application-title">Energy Markets</h3>
              <div className="application-metric">100%</div>
              <div className="application-description">
                Increase in battery storage revenue through optimized multi-market bidding strategies
              </div>
            </div>

            <div className="application-card">
              <h3 className="application-title">Power Flow</h3>
              <div className="application-metric">2-5%</div>
              <div className="application-description">
                Reduction in transmission losses with improved voltage profiles using quantum algorithms
              </div>
            </div>

            <div className="application-card">
              <h3 className="application-title">Renewable Integration</h3>
              <div className="application-metric">15-25%</div>
              <div className="application-description">
                Improvement in renewable utilization with reduced curtailment through enhanced optimization
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow-section">
        <div className="workflow-container">
          <div className="section-header">
            <h2 className="section-title">AI Multi-Agent Orchestration</h2>
            <p className="section-subtitle">
              Autonomous workflow automation from data preparation to deployment
            </p>
          </div>

          <div className="workflow-visual">
            <div className="workflow-header">
              <div className="workflow-title">Processing Pipeline</div>
              <div className="workflow-controls">
                <button 
                  className={`control-btn ${playing ? 'active' : ''}`}
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? 'Pause' : 'Play'}
                </button>
                <button 
                  className="control-btn"
                  onClick={() => {
                    setActiveWorkflow((n) => (n + 1) % 4);
                    setPlaying(false);
                  }}
                >
                  Next Step
                </button>
              </div>
            </div>

            <div className="workflow-steps">
              <div className={`workflow-step ${activeWorkflow === 0 ? 'active' : ''}`}>
                <div className="workflow-node">📊</div>
                <div className="workflow-label">Data Ingestion</div>
              </div>
              <div className={`workflow-step ${activeWorkflow === 1 ? 'active' : ''}`}>
                <div className="workflow-node">🤖</div>
                <div className="workflow-label">AI Processing</div>
              </div>
              <div className={`workflow-step ${activeWorkflow === 2 ? 'active' : ''}`}>
                <div className="workflow-node">⚛️</div>
                <div className="workflow-label">Quantum Solving</div>
              </div>
              <div className={`workflow-step ${activeWorkflow === 3 ? 'active' : ''}`}>
                <div className="workflow-node">🎯</div>
                <div className="workflow-label">Grid Dispatch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiator Section */}
      <section className="differentiator-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why NEOQUBIT vs. Alternatives</h2>
            <p className="section-subtitle">
              Unlike classical tools hitting computational walls or pure quantum systems requiring specialized expertise
            </p>
          </div>

          <div className="differentiator-grid">
            <div className="differentiator-item">
              <div className="differentiator-number">1</div>
              <h3 className="differentiator-title">Autonomous Intelligence</h3>
              <p className="differentiator-text">
                AI agents eliminate need for quantum expertise, automating 80% of workflows
              </p>
            </div>

            <div className="differentiator-item">
              <div className="differentiator-number">2</div>
              <h3 className="differentiator-title">Hybrid Orchestration</h3>
              <p className="differentiator-text">
                Intelligent switching between quantum and classical solvers in real-time
              </p>
            </div>

            <div className="differentiator-item">
              <div className="differentiator-number">3</div>
              <h3 className="differentiator-title">Enterprise Integration</h3>
              <p className="differentiator-text">
                Deploy in weeks with existing EMS systems via standard APIs
              </p>
            </div>

            <div className="differentiator-item">
              <div className="differentiator-number">4</div>
              <h3 className="differentiator-title">Proven Scalability</h3>
              <p className="differentiator-text">
                From pilot projects to enterprise-wide Fortune 500 deployments
              </p>
            </div>

            <div className="differentiator-item">
              <div className="differentiator-number">5</div>
              <h3 className="differentiator-title">Risk Mitigation</h3>
              <p className="differentiator-text">
                Classical fallback ensures consistent performance with quantum upside
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Transform Your Energy Operations Today</h2>
          <p className="cta-subtitle">
            Join leading energy companies achieving breakthrough optimization performance
          </p>

          <div className="cta-stats">
            <div className="cta-stat">
              <div className="cta-stat-value">$60-65M</div>
              <div className="cta-stat-label">Annual Benefits</div>
            </div>
            <div className="cta-stat">
              <div className="cta-stat-value">8-100×</div>
              <div className="cta-stat-label">Faster Solutions</div>
            </div>
            <div className="cta-stat">
              <div className="cta-stat-value">21%</div>
              <div className="cta-stat-label">Planning Production</div>
            </div>
          </div>

          <div className="cta-group">
            <button className="btn btn-primary">Get Started with HyperQuo</button>
            <button className="btn btn-secondary">Request ROI Assessment</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuantumEnergyPage;