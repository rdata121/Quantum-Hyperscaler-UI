import React, { useState, useEffect, useRef } from "react";

// Inline styles object
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0a0e0f 0%, #0f1517 50%, #141a1c 100%)",
    color: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  
  // Hero Section
  hero: {
    position: "relative",
    minHeight: "90vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "4rem 2rem",
  },
  heroBackground: {
    position: "absolute",
    inset: 0,
    opacity: 0.3,
  },
  moleculeCanvas: {
    width: "100%",
    height: "100%",
  },
  heroContent: {
    position: "relative",
    zIndex: 10,
    maxWidth: "1200px",
    textAlign: "center",
  },
  eyebrow: {
    fontSize: "0.875rem",
    fontWeight: "700",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#B08CFF",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: "900",
    lineHeight: 1.1,
    marginBottom: "1.5rem",
  },
  highlight: {
    background: "linear-gradient(90deg, #B08CFF 0%, #9370DB 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  subtitle: {
    fontSize: "1.25rem",
    color: "rgba(255, 255, 255, 0.8)",
    maxWidth: "800px",
    margin: "0 auto 2rem",
    lineHeight: 1.6,
  },
  heroStats: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    marginBottom: "3rem",
    flexWrap: "wrap",
  },
  statCard: {
    padding: "1.5rem",
    background: "rgba(176, 140, 255, 0.1)",
    border: "1px solid rgba(176, 140, 255, 0.2)",
    borderRadius: "16px",
    minWidth: "150px",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "900",
    color: "#B08CFF",
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  heroCTA: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryCTA: {
    padding: "1rem 2rem",
    background: "linear-gradient(90deg, #B08CFF 0%, #9370DB 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 20px rgba(176, 140, 255, 0.3)",
  },
  secondaryCTA: {
    padding: "1rem 2rem",
    background: "transparent",
    color: "#B08CFF",
    border: "2px solid #B08CFF",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background 0.3s ease, color 0.3s ease",
  },
  
  // Timeline Section
  section: {
    padding: "4rem 2rem",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  timelineComparison: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "20px",
    padding: "2rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  expandButton: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(176, 140, 255, 0.1)",
    border: "1px solid rgba(176, 140, 255, 0.3)",
    color: "#B08CFF",
    fontSize: "1.5rem",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  },
  timelines: {
    display: "grid",
    gap: "2rem",
  },
  expanded: {
    marginBottom: "2rem",
  },
  timelineRow: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: "1rem",
    alignItems: "center",
  },
  timelineLabel: {
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
  },
  timelineBar: {
    height: "60px",
    position: "relative",
  },
  traditionalBar: {
    height: "100%",
    background: "linear-gradient(90deg, #ff6b6b 0%, #ff8787 100%)",
    borderRadius: "10px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "0 1rem",
  },
  hyperquoBar: {
    height: "100%",
    background: "linear-gradient(90deg, #B08CFF 0%, #9370DB 100%)",
    borderRadius: "10px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "0 1rem",
    maxWidth: "200px",
  },
  timelineYears: {
    position: "absolute",
    left: "1rem",
    fontWeight: "700",
    color: "#ffffff",
  },
  timelineWeeks: {
    fontWeight: "700",
    color: "#ffffff",
  },
  timelineSegments: {
    display: "flex",
    width: "100%",
    gap: "2px",
    marginLeft: "auto",
  },
  segment: {
    background: "rgba(0, 0, 0, 0.2)",
    padding: "0.5rem",
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginTop: "2rem",
  },
  detailCard: {
    background: "rgba(176, 140, 255, 0.1)",
    padding: "1.5rem",
    borderRadius: "12px",
    textAlign: "center",
  },
  detailValue: {
    fontSize: "1.5rem",
    fontWeight: "900",
    color: "#B08CFF",
    marginBottom: "0.5rem",
  },
  detailLabel: {
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.7)",
  },
  
  // Split Section
  splitSection: {
    padding: "4rem 2rem",
    background: "rgba(176, 140, 255, 0.02)",
  },
  splitGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  problemCard: {
    background: "rgba(255, 107, 107, 0.05)",
    border: "1px solid rgba(255, 107, 107, 0.2)",
    borderRadius: "20px",
    padding: "2rem",
  },
  solutionCard: {
    background: "rgba(176, 140, 255, 0.05)",
    border: "1px solid rgba(176, 140, 255, 0.2)",
    borderRadius: "20px",
    padding: "2rem",
  },
  problemItems: {
    display: "grid",
    gap: "1.5rem",
    marginTop: "1.5rem",
  },
  solutionItems: {
    display: "grid",
    gap: "1.5rem",
    marginTop: "1.5rem",
  },
  problemItem: {
    display: "flex",
    gap: "1rem",
  },
  solutionItem: {
    display: "flex",
    gap: "1rem",
  },
  problemIcon: {
    fontSize: "1.5rem",
  },
  solutionIcon: {
    fontSize: "1.5rem",
  },
  
  // Applications Section
  applicationsSection: {
    padding: "4rem 2rem",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "900",
    textAlign: "center",
    marginBottom: "3rem",
  },
  tabNav: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  tab: {
    padding: "0.75rem 1.5rem",
    background: "transparent",
    border: "1px solid rgba(176, 140, 255, 0.3)",
    borderRadius: "50px",
    color: "rgba(255, 255, 255, 0.7)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  active: {
    background: "rgba(176, 140, 255, 0.2)",
    borderColor: "#B08CFF",
    color: "#ffffff",
  },
  tabContent: {
    minHeight: "300px",
  },
  tabPanel: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "20px",
    padding: "2rem",
    animation: "fadeIn 0.5s ease",
  },
  tabMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginTop: "2rem",
  },
  tabMetric: {
    textAlign: "center",
    padding: "1rem",
    background: "rgba(176, 140, 255, 0.1)",
    borderRadius: "12px",
  },
  
  // Applications Grid
  applicationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  applicationCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "1.5rem",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },
  hovered: {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 30px rgba(176, 140, 255, 0.2)",
  },
  applicationIcon: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  applicationMetrics: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.5rem",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(176, 140, 255, 0.2)",
  },
  metric: {
    display: "flex",
    flexDirection: "column",
  },
  metricValue: {
    fontWeight: "700",
    color: "#B08CFF",
  },
  metricLabel: {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.6)",
  },
  
  // ROI Section
  roiSection: {
    padding: "4rem 2rem",
    background: "rgba(176, 140, 255, 0.02)",
  },
  roiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
  },
  roiCard: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    padding: "2rem",
    textAlign: "center",
  },
  roiChart: {
    height: "120px",
    marginBottom: "1rem",
  },
  chartSvg: {
    width: "100%",
    height: "100%",
  },
  roiValue: {
    fontSize: "3rem",
    fontWeight: "900",
    color: "#B08CFF",
    marginBottom: "1rem",
  },
  
  // Comparison Table
  comparisonWrapper: {
    overflowX: "auto",
  },
  comparisonTable: {
    width: "100%",
    borderCollapse: "collapse",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  
  // CTA Section
  ctaSection: {
    padding: "4rem 2rem",
    background: "linear-gradient(180deg, rgba(176, 140, 255, 0.05) 0%, rgba(176, 140, 255, 0.02) 100%)",
  },
  ctaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3rem",
    alignItems: "start",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  ctaContent: {
    
  },
  ctaBenefits: {
    display: "grid",
    gap: "1rem",
    marginTop: "2rem",
  },
  benefit: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  checkIcon: {
    color: "#B08CFF",
    fontSize: "1.25rem",
  },
  ctaForm: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "20px",
    padding: "2rem",
    border: "1px solid rgba(176, 140, 255, 0.2)",
  },
  formWrapper: {
    display: "grid",
    gap: "1rem",
  },
  input: {
    padding: "1rem",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  textarea: {
    padding: "1rem",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
    resize: "vertical",
    minHeight: "100px",
  },
  submitButton: {
    padding: "1rem 2rem",
    background: "linear-gradient(90deg, #B08CFF 0%, #9370DB 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  },
};

// Animated molecule visualization component
function MoleculeVisualization() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const moleculesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();

    // Initialize molecules
    const molecules = [];
    for (let i = 0; i < 12; i++) {
      molecules.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 2,
        connections: []
      });
    }
    
    // Create connections
    molecules.forEach((mol, i) => {
      const numConnections = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numConnections; j++) {
        const target = Math.floor(Math.random() * molecules.length);
        if (target !== i) {
          mol.connections.push(target);
        }
      }
    });
    
    moleculesRef.current = molecules;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Update and draw molecules
      molecules.forEach((mol, i) => {
        // Update position
        mol.x += mol.vx;
        mol.y += mol.vy;
        
        // Bounce off walls
        if (mol.x < 0 || mol.x > canvas.offsetWidth) mol.vx *= -1;
        if (mol.y < 0 || mol.y > canvas.offsetHeight) mol.vy *= -1;
        
        // Draw connections
        mol.connections.forEach(targetIndex => {
          const target = molecules[targetIndex];
          ctx.beginPath();
          ctx.moveTo(mol.x, mol.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = "rgba(176, 140, 255, 0.2)";
          ctx.stroke();
        });
        
        // Draw molecule
        ctx.beginPath();
        ctx.arc(mol.x, mol.y, mol.size, 0, Math.PI * 2);
        ctx.fillStyle = "#B08CFF";
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} style={styles.moleculeCanvas} />;
}

// Timeline comparison component
function TimelineComparison() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div style={styles.timelineComparison}>
      <div style={styles.timelineHeader}>
        <h3>Discovery Timeline Revolution</h3>
        <button 
          style={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>
      
      <div style={{...styles.timelines, ...(isExpanded ? styles.expanded : {})}}>
        <div style={styles.timelineRow}>
          <div style={styles.timelineLabel}>Traditional</div>
          <div style={styles.timelineBar}>
            <div style={styles.traditionalBar}>
              <span style={styles.timelineYears}>10-15 years</span>
              <div style={styles.timelineSegments}>
                <div style={{...styles.segment, width: "20%"}}>Discovery</div>
                <div style={{...styles.segment, width: "30%"}}>Preclinical</div>
                <div style={{...styles.segment, width: "35%"}}>Clinical</div>
                <div style={{...styles.segment, width: "15%"}}>Approval</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={styles.timelineRow}>
          <div style={styles.timelineLabel}>HyperQuo</div>
          <div style={styles.timelineBar}>
            <div style={styles.hyperquoBar}>
              <span style={styles.timelineWeeks}>Weeks</span>
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div style={styles.timelineDetails}>
          <div style={styles.detailCard}>
            <div style={styles.detailValue}>$2-3B</div>
            <div style={styles.detailLabel}>Traditional Cost</div>
          </div>
          <div style={styles.detailCard}>
            <div style={styles.detailValue}>60%</div>
            <div style={styles.detailLabel}>Time Reduction</div>
          </div>
          <div style={styles.detailCard}>
            <div style={styles.detailValue}>10-20×</div>
            <div style={styles.detailLabel}>ROI Improvement</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Interactive application card
function ApplicationCard({ title, description, metrics, icon, delay }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const cardStyle = {
    ...styles.applicationCard,
    ...(isHovered ? styles.hovered : {}),
    animationDelay: `${delay}ms`
  };
  
  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.applicationIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {isHovered && metrics && (
        <div style={styles.applicationMetrics}>
          {metrics.map((metric, i) => (
            <div key={i} style={styles.metric}>
              <span style={styles.metricValue}>{metric.value}</span>
              <span style={styles.metricLabel}>{metric.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main component
export default function Pharmaceuticals() {
  const [activeTab, setActiveTab] = useState("molecular");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    challenge: ""
  });

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Thank you for your interest! We'll contact you soon.");
  };

  return (
    <main style={styles.page}>
      {/* Hero Section with animated background */}
      <section style={styles.hero}>
        <div style={styles.heroBackground}>
          <MoleculeVisualization />
        </div>
        
        <div style={styles.heroContent}>
          <p style={styles.eyebrow}>NEOQUBIT • PHARMACEUTICALS & DRUG DISCOVERY</p>
          <h1 style={styles.title}>
            Accelerate Drug Discovery from
            <span style={styles.highlight}> Years to Weeks</span> with
            Quantum-Powered Optimization
          </h1>
          <p style={styles.subtitle}>
            Transform pharmaceutical R&D by combining quantum computing, AI automation, 
            and classical solvers to explore billions of molecular possibilities
          </p>
          
          <div style={styles.heroStats}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>10-20×</div>
              <div style={styles.statLabel}>ROI Improvement</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>Billions</div>
              <div style={styles.statLabel}>Molecules Explored</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>80%</div>
              <div style={styles.statLabel}>Automation</div>
            </div>
          </div>
          
          <div style={styles.heroCTA}>
            <button style={styles.primaryCTA}>
              Start Your Pilot Program
            </button>
            <button style={styles.secondaryCTA}>
              Request ROI Assessment
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Timeline Comparison */}
      <section style={styles.section}>
        <div style={styles.container}>
          <TimelineComparison />
        </div>
      </section>

      {/* Interactive Applications Showcase */}
      <section style={styles.applicationsSection}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Quantum-Enhanced Applications</h2>
          
          <div style={styles.tabNav}>
            <button 
              style={{...styles.tab, ...(activeTab === "molecular" ? styles.active : {})}}
              onClick={() => setActiveTab("molecular")}
            >
              Molecular Simulation
            </button>
            <button 
              style={{...styles.tab, ...(activeTab === "protein" ? styles.active : {})}}
              onClick={() => setActiveTab("protein")}
            >
              Protein Folding
            </button>
            <button 
              style={{...styles.tab, ...(activeTab === "admet" ? styles.active : {})}}
              onClick={() => setActiveTab("admet")}
            >
              ADMET Optimization
            </button>
            <button 
              style={{...styles.tab, ...(activeTab === "clinical" ? styles.active : {})}}
              onClick={() => setActiveTab("clinical")}
            >
              Clinical Trials
            </button>
          </div>
          
          <div style={styles.tabContent}>
            {activeTab === "molecular" && (
              <div style={styles.tabPanel}>
                <h3>Quantum-Enhanced Molecular Simulation</h3>
                <p>Transform protein-ligand binding calculations into QUBO matrices for precise affinity prediction in milliseconds.</p>
                <div style={styles.tabMetrics}>
                  <div style={styles.tabMetric}>
                    <span>8-100×</span>
                    <div>Speedup</div>
                  </div>
                  <div style={styles.tabMetric}>
                    <span>60%</span>
                    <div>Fewer Parameters</div>
                  </div>
                  <div style={styles.tabMetric}>
                    <span>Billions</span>
                    <div>Molecules Explored</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "protein" && (
              <div style={styles.tabPanel}>
                <h3>Protein Folding & Structure Prediction</h3>
                <p>Bifurcate NP-hard folding problems into subgraphs, solving with quantum-inspired machines for enhanced sampling.</p>
                <div style={styles.tabMetrics}>
                  <div style={styles.tabMetric}>
                    <span>Superior</span>
                    <div>vs Monte Carlo</div>
                  </div>
                  <div style={styles.tabMetric}>
                    <span>100K+</span>
                    <div>Variables</div>
                  </div>
                  <div style={styles.tabMetric}>
                    <span>Real-time</span>
                    <div>Adaptation</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "admet" && (
              <div style={styles.tabPanel}>
                <h3>ADMET Property Optimization</h3>
                <p>Balance absorption, distribution, metabolism, excretion, and toxicity through multi-objective QUBO formulations.</p>
                <div style={styles.tabMetrics}>
                  <div style={styles.tabMetric}>
                    <span>Multi-objective</span>
                    <div>Optimization</div>
                  </div>
                  <div style={styles.tabMetric}>
                    <span>Superior</span>
                    <div>Safety Profiles</div>
                  </div>
                  <div style={styles.tabMetric}>
                    <span>Automated</span>
                    <div>Trade-offs</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "clinical" && (
              <div style={styles.tabPanel}>
                <h3>Clinical Trial Optimization</h3>
                <p>Map site selection and patient stratification to QUBOs, maximizing recruitment speed and statistical power.</p>
                <div style={styles.tabMetrics}>
                  <div style={styles.tabMetric}>
                    <span>Faster</span>
                    <div>Recruitment</div>
                  </div>
                  <div style={styles.tabMetric}>
                    <span>Optimized</span>
                    <div>Site Selection</div>
                  </div>
                  <div style={styles.tabMetric}>
                    <span>Lower</span>
                    <div>Trial Costs</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Applications Grid */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Complete Drug Discovery Platform</h2>
          <div style={styles.applicationsGrid}>
            <ApplicationCard
              title="Lead Generation"
              description="De novo scaffold search with hybrid generative models for faster lead-optimization loops"
              metrics={[
                { value: "60%", label: "Faster" },
                { value: "Novel", label: "Scaffolds" }
              ]}
              icon="🧬"
              delay={0}
            />
            <ApplicationCard
              title="Retrosynthesis"
              description="Graph-cut selection via annealing with classical fallback for route expansion"
              metrics={[
                { value: "Optimal", label: "Routes" },
                { value: "Cost", label: "Reduced" }
              ]}
              icon="⚗️"
              delay={100}
            />
            <ApplicationCard
              title="QM/MM Analysis"
              description="Compute activation barriers and reactivity for prodrug & covalent designs"
              metrics={[
                { value: "Precise", label: "Barriers" },
                { value: "Covalent", label: "Support" }
              ]}
              icon="🔬"
              delay={200}
            />
            <ApplicationCard
              title="Library Prioritization"
              description="Similarity clustering as QUBOs to select diverse, high-potential subsets at scale"
              metrics={[
                { value: "Diverse", label: "Selection" },
                { value: "Scale", label: "Billions" }
              ]}
              icon="📚"
              delay={300}
            />
            <ApplicationCard
              title="Portfolio Management"
              description="Dynamically allocate R&D budgets across assets under risk/return constraints"
              metrics={[
                { value: "Dynamic", label: "Allocation" },
                { value: "Risk", label: "Optimized" }
              ]}
              icon="📊"
              delay={400}
            />
            <ApplicationCard
              title="AI Orchestration"
              description="Autonomous agents handle data prep, QUBO formulation, and solver selection"
              metrics={[
                { value: "80%", label: "Automated" },
                { value: "Zero", label: "Code" }
              ]}
              icon="🤖"
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ROI Evidence Section */}
      <section style={styles.roiSection}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Proven Enterprise ROI</h2>
          <div style={styles.roiGrid}>
            <div style={styles.roiCard}>
              <div style={styles.roiChart}>
                <svg viewBox="0 0 200 120" style={styles.chartSvg}>
                  <defs>
                    <linearGradient id="roiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#B08CFF" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#B08CFF" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  <path d="M 20 100 Q 60 80, 100 40 T 180 20" 
                        stroke="#B08CFF" 
                        strokeWidth="3" 
                        fill="none"/>
                  <path d="M 20 100 Q 60 80, 100 40 T 180 20 L 180 110 L 20 110 Z" 
                        fill="url(#roiGradient)"/>
                </svg>
              </div>
              <h3>Investment Returns</h3>
              <p>$3-6M quantum investment delivering $60-65M annual benefits</p>
            </div>
            
            <div style={styles.roiCard}>
              <div style={styles.roiValue}>81%</div>
              <h3>Hit Classical Limits</h3>
              <p>of pharma leaders report reaching computational boundaries</p>
            </div>
            
            <div style={styles.roiCard}>
              <div style={styles.roiValue}>21%</div>
              <h3>Production Ready</h3>
              <p>planning quantum deployment within 12-18 months</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why NeoQubit Wins</h2>
          <div style={styles.comparisonWrapper}>
            <table style={styles.comparisonTable}>
              <thead>
                <tr style={{ backgroundColor: "rgba(176, 140, 255, 0.1)" }}>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid rgba(176, 140, 255, 0.2)" }}>Capability</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid rgba(176, 140, 255, 0.2)", color: "#B08CFF" }}>HyperQuo</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid rgba(176, 140, 255, 0.2)" }}>Pure Quantum</th>
                  <th style={{ padding: "1rem", textAlign: "left", borderBottom: "1px solid rgba(176, 140, 255, 0.2)" }}>Classical Only</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Solver Coverage</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", color: "#B08CFF", fontWeight: "700" }}>Quantum + Classical + AI</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Quantum only</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Classical only</td>
                </tr>
                <tr>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Variable Capacity</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", color: "#B08CFF", fontWeight: "700" }}>100,000+</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Limited</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Moderate</td>
                </tr>
                <tr>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Deployment Time</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", color: "#B08CFF", fontWeight: "700" }}>Weeks</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Years</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Months</td>
                </tr>
                <tr>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Automation Level</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", color: "#B08CFF", fontWeight: "700" }}>80% (AI Agents)</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Manual</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Partial</td>
                </tr>
                <tr>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>ROI Timeline</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", color: "#B08CFF", fontWeight: "700" }}>Immediate</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Long-term</td>
                  <td style={{ padding: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Moderate</td>
                </tr>
                <tr>
                  <td style={{ padding: "1rem" }}>Fallback Options</td>
                  <td style={{ padding: "1rem", color: "#B08CFF", fontWeight: "700" }}>Classical failover</td>
                  <td style={{ padding: "1rem" }}>None</td>
                  <td style={{ padding: "1rem" }}>N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section with Form */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <div style={styles.ctaGrid}>
            <div style={styles.ctaContent}>
              <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Ready to Transform Your Drug Discovery?</h2>
              <p style={{ fontSize: "1.125rem", color: "rgba(255, 255, 255, 0.8)", marginBottom: "2rem" }}>
                Join leading pharmaceutical companies achieving breakthrough results with quantum optimization
              </p>
              
              <div style={styles.ctaBenefits}>
                <div style={styles.benefit}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Free technical consultation</span>
                </div>
                <div style={styles.benefit}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Custom ROI assessment</span>
                </div>
                <div style={styles.benefit}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Proof-of-concept deployment</span>
                </div>
                <div style={styles.benefit}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Industry-specific templates</span>
                </div>
              </div>
            </div>
            
            <div style={styles.ctaForm}>
              <h3 style={{ marginBottom: "1.5rem" }}>Get Started Today</h3>
              <div style={styles.formWrapper}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                />
                <input
                  type="email"
                  placeholder="Business Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  style={styles.input}
                />
                <textarea
                  placeholder="Describe your drug discovery challenges..."
                  value={formData.challenge}
                  onChange={(e) => setFormData({...formData, challenge: e.target.value})}
                  rows="4"
                  style={styles.textarea}
                />
                <button 
                  onClick={handleSubmit} 
                  style={styles.submitButton}
                  onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                >
                  Request Consultation →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}