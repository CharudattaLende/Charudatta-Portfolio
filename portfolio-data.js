/**
 * PORTFOLIO DATA CONFIGURATION
 * All repeated content, projects, skills, and experience are centralized here.
 * You can easily customize or replace any of these values with your personal information later.
 */

const PORTFOLIO_DATA = {
  profile: {
    name: "Dominic Wagner",
    titlePrimary: "Software",
    titleSecondary: "Engineer",
    tagline: "Hey, I'm a",
    roleLabel: "Full-Stack & Systems Architect",
    availability: "Available for Q4 contracts & full-time roles",
    heroDescription: "Building resilient architectures and intuitive digital experiences that scale.",
    heroSubDescription: "From distributed backend systems to fluid, high-performance web applications, I design and engineer software that connects, performs, and endures.",
    email: "contact@dominicwagner.dev",
    location: "San Francisco, CA / Remote",
    resumeUrl: "#",
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      discord: "https://discord.com"
    }
  },

  navLinks: [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Journey", href: "#journey" },
    { label: "Milestones", href: "#milestones" },
    { label: "Pricing", href: "#pricing" }
  ],

  heroPillars: [
    { number: "01", title: "Distributed Systems", desc: "Fault-tolerant microservices & streaming" },
    { number: "02", title: "Full-Stack Web", desc: "Type-safe, accessible reactive interfaces" },
    { number: "03", title: "Cloud & DevOps", desc: "Kubernetes, Docker & CI/CD automation" },
    { number: "04", title: "Real-Time & AI", desc: "WebSockets, gRPC & LLM pipeline tooling" }
  ],

  trustStrip: {
    heading: "Trusted by Tech Teams I've Helped Build",
    brands: [
      { name: "Supa Blox", icon: "◉", role: "Cloud Infrastructure" },
      { name: "Hype Blox", icon: "⧖", role: "Frontend Architecture" },
      { name: "Frame Blox", icon: "⦿", role: "Distributed Databases" },
      { name: "Ultra Blox", icon: "◐", role: "Real-time Telemetry" }
    ],
    techStack: [
      "TypeScript", "React / Next.js", "Node.js", "Go", "Python", "Rust", "PostgreSQL", "Docker", "Kubernetes", "AWS"
    ]
  },

  introPreview: {
    tag: "Behind the Architecture",
    headline: "Shaping Scalable Systems That Make Life Simpler",
    description: "I'm a software engineer focused on building clean, intuitive interfaces backed by robust infrastructure that solves real-world technical problems.",
    subText: "Let's Build Something Meaningful Together",
    cards: [
      {
        id: "card-1",
        image: "assets/card_jacket.jpg",
        tag: "Modular Core",
        title: "Clean Architecture",
        desc: "Strict separation of concerns, test-driven domain models, and high-cohesion microservices built for long-term maintainability."
      },
      {
        id: "card-2",
        image: "assets/card_headphones.jpg",
        tag: "Sensory UX",
        title: "Microsecond Latency",
        desc: "Fluid user interfaces with sub-16ms frame rates, zero-lag client-side caching, and responsive web audio implementations."
      },
      {
        id: "card-3",
        image: "assets/card_bottle.jpg",
        tag: "System Purity",
        title: "Observable Telemetry",
        desc: "End-to-end tracing, metrics scraping, and automated alerting pipelines delivering 99.999% production uptime guarantees."
      }
    ]
  },

  showcase: {
    tag: "Behind the Repositories",
    headline: "Curious What Else I've Engineered?",
    subheadline: "Explore distributed tools, real-time protocols, and open-source packages in my extended portfolio.",
    ctaText: "See More Projects",
    ctaLink: "#projects",
    items: [
      {
        tag: "Real-Time Protocol",
        title: "SyncronMesh",
        desc: "Peer-to-peer WebRTC state synchronization engine with CRDT conflict resolution.",
        gradient: "linear-gradient(135deg, #1a162b, #2b1d3a)"
      },
      {
        tag: "Distributed DB",
        title: "AuraKV",
        desc: "High-throughput in-memory key-value cache built with Rust and Raft consensus.",
        gradient: "linear-gradient(135deg, #2a1420, #401b2c)"
      },
      {
        tag: "Developer Tooling",
        title: "Nexus CLI",
        desc: "Command-line scaffolding tool for multi-region cloud deployments with zero downtime.",
        gradient: "linear-gradient(135deg, #12232e, #1b3848)"
      },
      {
        tag: "AI Pipeline",
        title: "PromptStream",
        desc: "Streaming token gateway with dynamic semantic routing and fallback retry trees.",
        gradient: "linear-gradient(135deg, #2b1f14, #442a15)"
      },
      {
        tag: "Component System",
        title: "Chroma UI",
        desc: "Accessible, headless design system with token-driven theming and sub-pixel motion.",
        gradient: "linear-gradient(135deg, #1c261e, #29402e)"
      }
    ],
    processPillars: [
      { number: "01", title: "Strategy & Planning", desc: "Domain modeling & system RFCs" },
      { number: "02", title: "Design & Development", desc: "Type-safe implementation" },
      { number: "03", title: "Launch & Growth", desc: "Continuous deployment & Canary releases" },
      { number: "04", title: "Ongoing Support", desc: "Performance tuning & SLAs" }
    ]
  },

  featuredProject: {
    tag: "Selected Work",
    headline: "Apex Velocity Engine",
    subheadline: "Real brands, real results.",
    description: "A distributed real-time telemetry processing platform engineered for high-throughput sensor telemetry. Processes up to 250,000 events/sec with sub-5ms roundtrip latency across 12 distributed edge nodes.",
    image: "assets/project_rider.jpg",
    tags: ["Rust", "Kafka", "WebSockets", "TimescaleDB", "React", "Docker"],
    metrics: [
      { value: "250K+", label: "Events / Sec" },
      { value: "<4.2ms", label: "P99 Latency" },
      { value: "99.999%", label: "Uptime SLA" }
    ],
    liveUrl: "#",
    githubUrl: "https://github.com"
  },

  projectsGrid: [
    {
      id: "project-orange-blox",
      title: "Orange Blox",
      tag: "Distributed Analytics Engine",
      description: "Visual telemetry and streaming aggregation suite rendering interactive GPU-accelerated heatmaps and live cluster topologies.",
      image: "assets/project_orange.jpg",
      tags: ["TypeScript", "WebGL", "Go", "PostgreSQL", "Docker"],
      link: "#",
      github: "https://github.com"
    },
    {
      id: "project-nova-scene",
      title: "Nova Scene",
      tag: "Spatial 3D Asset Pipeline",
      description: "Web-based photorealistic 3D asset configurator utilizing hardware ray-tracing, WebAssembly shaders, and sub-second asset compilation.",
      image: "assets/project_nova.jpg",
      tags: ["Three.js", "Rust (WASM)", "Next.js", "Tailwind CSS"],
      link: "#",
      github: "https://github.com"
    },
    {
      id: "project-krypton",
      title: "Krypton Auth Core",
      tag: "Zero-Trust Identity Microservice",
      description: "Decentralized cryptographic auth gateway featuring biometric passkeys, instant token revocation, and multi-tenant audit streams.",
      image: "assets/card_jacket.jpg",
      tags: ["Go", "gRPC", "Redis", "Kubernetes", "OAuth 2.1"],
      link: "#",
      github: "https://github.com"
    },
    {
      id: "project-hyperflow",
      title: "HyperFlow Orchestrator",
      tag: "Cloud Workflow Engine",
      description: "DAG-based job scheduler executing parallel machine learning pipelines with dynamic resource provisioning across AWS and GCP.",
      image: "assets/card_bottle.jpg",
      tags: ["Python", "FastAPI", "Terraform", "AWS Lambda", "GraphQL"],
      link: "#",
      github: "https://github.com"
    }
  ],

  about: {
    tag: "About Me",
    headlinePrimary: "Designer.",
    headlineSecondary: "Strategist.",
    headlineTertiary: "Creative partner.",
    subheading: "Blending clarity and creativity to build systems with purpose.",
    bioParagraph1: "I'm Dominic Wagner, a freelance software engineer and systems architect with 10 years of experience helping startups, creative teams, and growing enterprises build digital products that feel effortless and perform at scale.",
    bioParagraph2: "With a strong background spanning systems design, modern full-stack development, and cloud-native architecture, I bring a rare balance of engineering rigor and user-first aesthetic precision to every codebase.",
    bioParagraph3: "Whether architecting your first MVP or modernizing legacy infrastructure for millions of active users, I guide teams through every technical decision with transparent communication and clean, maintainable code.",
    stats: [
      { number: "10+", label: "Years Experience" },
      { number: "60+", label: "Projects Shipped" },
      { number: "99.9%", label: "Average SLA Uptime" },
      { number: "15", label: "Industry Awards" }
    ],
    skillsCategories: [
      {
        title: "Frontend Engineering",
        items: ["React / Next.js", "TypeScript", "Tailwind CSS", "WebGL / Three.js", "State Machines", "Accessibility (a11y)"]
      },
      {
        title: "Backend & Systems",
        items: ["Node.js / Express", "Go (Golang)", "Python", "Rust", "GraphQL / gRPC", "RESTful APIs"]
      },
      {
        title: "Cloud & DevOps",
        items: ["Docker & Containers", "Kubernetes", "AWS Infrastructure", "Terraform", "CI/CD Pipelines", "Prometheus / Grafana"]
      },
      {
        title: "Databases & Storage",
        items: ["PostgreSQL", "Redis", "TimescaleDB", "MongoDB", "ElasticSearch", "Kafka / Event Streams"]
      }
    ],
    education: {
      degree: "B.S. in Computer Science & Engineering",
      institution: "State University of Technology",
      year: "Graduated with Honors · 2016"
    }
  },

  journey: [
    {
      role: "Lead Software Architect",
      company: "CloudScale Technologies",
      period: "2023 — Present",
      location: "San Francisco, CA",
      description: "Spearheaded the architecture of high-availability microservices serving 4.5M monthly active users. Reduced infrastructure costs by 38% through container orchestration.",
      highlights: [
        "Migrated monolith to 14 fault-tolerant Go microservices",
        "Engineered real-time notification engine with 99.999% delivery reliability",
        "Mentored a team of 8 full-stack engineers and conducted architecture RFCs"
      ],
      tags: ["Go", "Kubernetes", "Kafka", "AWS", "PostgreSQL"]
    },
    {
      role: "Senior Full-Stack Engineer",
      company: "Nexus Digital Studio",
      period: "2020 — 2023",
      location: "New York, NY",
      description: "Built scalable web applications and developer tools for venture-backed fintech startups. Led design system implementation across 6 product suites.",
      highlights: [
        "Created headless design system in TypeScript reducing UI delivery time by 50%",
        "Implemented end-to-end zero-trust authentication using WebAuthn passkeys",
        "Optimized client-side bundle size resulting in 72% faster LCP benchmarks"
      ],
      tags: ["TypeScript", "Next.js", "Node.js", "Redis", "GraphQL"]
    },
    {
      role: "Software Engineer",
      company: "Apex Informatics",
      period: "2017 — 2020",
      location: "Austin, TX",
      description: "Developed real-time data ingestion pipelines and responsive dashboards. Automated testing suites achieving 94% test coverage.",
      highlights: [
        "Architected distributed telemetry data ingestion worker in Python and Celery",
        "Refactored relational database indexing, reducing slow query frequencies by 80%",
        "Contributed to company-wide continuous integration deployment pipelines"
      ],
      tags: ["Python", "React", "Docker", "PostgreSQL", "GitLab CI"]
    }
  ],

  achievements: {
    tag: "Awards & Recognition",
    headline: "Proud Moments, Shared Success",
    description: "A few highlights from industry juries, open-source communities, and technical organizations recognizing the work.",
    items: [
      {
        title: "Site of the Day",
        organization: "Awwwards",
        year: "2024",
        desc: "Recognized for innovation and visual storytelling in the interactive web experience of a creative agency."
      },
      {
        title: "Indigo Design Award",
        organization: "Indigo Trophy",
        year: "2024",
        desc: "Gold Trophy winner for digital design excellence, accessibility, and high-performance interactive interfaces."
      },
      {
        title: "AWS Certified Solutions Architect",
        organization: "Amazon Web Services",
        year: "2023",
        desc: "Professional certification validating expertise in designing distributed, resilient cloud architectures."
      },
      {
        title: "Open Source Contributor of the Year",
        organization: "Dev Community",
        year: "2022",
        desc: "Honored for active maintainership of widely adopted open-source TypeScript and WebGL utility packages."
      }
    ]
  },

  pricing: {
    tag: "Pricing",
    headline: "Simple Packages for Every Stage",
    description: "Clear, flexible packages built to fit your brand's stage.",
    tiers: [
      {
        name: "Starter",
        price: "$1990",
        period: "/ month",
        subtitle: "Perfect for early-stage startups.",
        isPopular: false,
        features: [
          "Core MVP Architecture",
          "Frontend Web App (Next.js)",
          "RESTful API & Database Setup",
          "Basic CI/CD Pipeline",
          "Bi-weekly Sprint Syncs"
        ],
        buttonText: "Get in touch",
        buttonLink: "#contact"
      },
      {
        name: "Pro plan",
        price: "$2990",
        period: "/ month",
        subtitle: "Ideal for businesses ready to scale.",
        badge: "Popular",
        isPopular: true,
        features: [
          "Full-Stack Production System",
          "Microservices & Event Streaming",
          "Comprehensive Design System",
          "Cloud Infrastructure (AWS/K8s)",
          "Performance Optimization & SLAs",
          "Dedicated 24/7 Slack Channel"
        ],
        buttonText: "Get in touch",
        buttonLink: "#contact"
      },
      {
        name: "Enterprise plan",
        price: "$4990",
        period: "/ month",
        subtitle: "Complete branding & tech solution.",
        isPopular: false,
        features: [
          "Full Technical Leadership / Fractional CTO",
          "Custom Distributed Architecture",
          "Zero-Trust Security & Compliance Audit",
          "High-Throughput Telemetry & WebSockets",
          "Automated Multi-Region Disaster Recovery",
          "Dedicated Daily Engineering Sprints"
        ],
        buttonText: "Get in touch",
        buttonLink: "#contact"
      }
    ]
  },

  contact: {
    headline: "Let's Build Something Meaningful Together",
    subheadline: "Have an ambitious project in mind, need technical leadership, or want to discuss full-stack architecture? My inbox is always open.",
    ctaBadge: "Let's Connect",
    email: "contact@dominicwagner.dev"
  }
};

// Export to window for global access
if (typeof window !== 'undefined') {
  window.PORTFOLIO_DATA = PORTFOLIO_DATA;
}
