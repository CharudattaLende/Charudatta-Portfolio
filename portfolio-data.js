/**
 * PORTFOLIO DATA CONFIGURATION
 * Real data for Charudatta Lende — Computer Science Engineer & Full-Stack Developer
 */

const PORTFOLIO_DATA = {
  profile: {
    name: "Charudatta Lende",
    eyebrow: "COMPUTER SCIENCE ENGINEER",
    titlePrimary: "Computer Science",
    titleSecondary: "Engineer",
    positioning: "Full-Stack Developer · Data Engineering Enthusiast",
    heroHeadline: "Building software that solves real problems.",
    heroDescription: "I'm a CSE student building full-stack web applications with the MERN stack, while exploring data engineering and modern software systems.",
    availability: "Open to Collaborations & Projects",
    location: "YCCE, Nagpur, India",
    socials: {
      github: "https://github.com/CharudattaLende",
      linkedin: "https://www.linkedin.com/in/charudatta-lende-812009326",
      x: "https://x.com/Charudatta59"
    }
  },

  navLinks: [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Journey", href: "#journey" },
    { label: "Credentials", href: "#credentials" },
    { label: "Contact", href: "#contact" }
  ],

  heroPillars: [
    {
      number: "01",
      title: "Full-Stack Development",
      desc: "Building modern web applications with React, Node.js, Express and MongoDB."
    },
    {
      number: "02",
      title: "Product Development",
      desc: "Turning ideas into functional, responsive and usable applications."
    },
    {
      number: "03",
      title: "Backend & APIs",
      desc: "Working with REST APIs, databases, authentication and server-side logic."
    },
    {
      number: "04",
      title: "Data Engineering",
      desc: "Currently exploring data pipelines, data processing, databases and cloud technologies."
    }
  ],

  techStackArea: {
    heading: "What I Build With",
    subheading: "Technologies, tools, and systems I actively work with and explore.",
    groups: [
      {
        name: "BUILD",
        items: ["React", "JavaScript", "Node.js", "Express", "MongoDB", "Firebase"]
      },
      {
        name: "ENGINEERING",
        items: ["REST APIs", "Authentication", "Databases", "Git/GitHub", "API Integration"]
      },
      {
        name: "EXPLORING",
        items: ["Data Engineering", "Data Pipelines", "Data Processing", "Cloud Technologies", "AI/ML"]
      }
    ]
  },

  introPreview: {
    tag: "Behind the Developer",
    headline: "Building, learning, and improving through real projects.",
    description: "I'm a Computer Science and Engineering student focused on building full-stack applications and strengthening my software development fundamentals. I enjoy turning ideas into working products and I'm currently expanding my focus toward backend systems and data engineering.",
    subText: "Open to Collaborations & Projects",
    cards: [
      {
        id: "card-1",
        image: "assets/card_jacket.jpg",
        tag: "Core Focus",
        title: "Full-Stack Web",
        desc: "Building clean, responsive web applications using React, Node.js, Express, and MongoDB."
      },
      {
        id: "card-2",
        image: "assets/card_headphones.jpg",
        tag: "Engineering",
        title: "Backend & APIs",
        desc: "Structuring RESTful APIs, handling user authentication, and managing database integration."
      },
      {
        id: "card-3",
        image: "assets/card_bottle.jpg",
        tag: "Exploration",
        title: "Data Systems",
        desc: "Actively studying data processing, pipeline architectures, and cloud-native services."
      }
    ]
  },

  featuredProject: {
    tag: "Featured Project",
    headline: "Chat App",
    category: "Full-Stack / Real-Time Application",
    status: "Completed",
    description: "A real-time messaging application built with React and Firebase, enabling users to communicate through a responsive web interface.",
    image: "assets/project_rider.jpg",
    tags: ["React.js", "Firebase", "Real-Time Sync", "Responsive Web"],
    highlights: [
      { label: "Status", value: "Completed" },
      { label: "Type", value: "Real-Time Chat" },
      { label: "Stack", value: "React + Firebase" }
    ],
    githubUrl: "https://github.com/CharudattaLende/chat-app"
  },

  projectsGrid: [
    {
      id: "project-shopsphere",
      title: "ShopSphere",
      tag: "AI-Powered E-Commerce Platform",
      status: "In Development",
      description: "A full-stack e-commerce platform currently being developed with a focus on modern web architecture, backend APIs, authentication and data-driven features.",
      image: "assets/project_orange.jpg",
      tags: ["MERN Stack", "React", "Node.js", "Express", "MongoDB"],
      github: "",
      link: ""
    },
    {
      id: "project-future-1",
      title: "Upcoming Project",
      tag: "Full-Stack / Systems Exploration",
      status: "In Ideation",
      description: "Planned application exploring scalable backend services, custom API integrations, and robust database management.",
      image: "assets/project_nova.jpg",
      tags: ["Planned: Node.js", "Express", "Databases"],
      github: "",
      link: ""
    }
  ],

  about: {
    tag: "About Me",
    headlinePrimary: "Student.",
    headlineSecondary: "Builder.",
    headlineTertiary: "Problem Solver.",
    subheading: "Focused on engineering functional, scalable software.",
    bioParagraph1: "I'm Charudatta Lende, a Computer Science and Engineering student at Yeshwantrao Chavan College of Engineering (YCCE). I focus on building full-stack web applications using the MERN stack while actively expanding my skills toward data engineering and backend architectures.",
    bioParagraph2: "I enjoy turning ideas into working products and strengthening my core software development fundamentals. Whether developing responsive user interfaces or exploring data pipelines, I strive to write clean, maintainable code through consistent hands-on building.",
    academicBox: {
      badge: "Academic & Building Focus",
      title: "Grounded in fundamentals, driven by curiosity.",
      description: "Working with modern web technologies, strengthening algorithmic thinking, and building practical applications."
    },
    verifiedFacts: [
      { label: "Degree & Major", value: "B.Tech CSE (IoT)" },
      { label: "Institution", value: "YCCE" },
      { label: "Primary Stack", value: "MERN Stack" },
      { label: "Coding Club", value: "Codeware Club" }
    ],
    skillsCategories: [
      {
        title: "BUILD",
        items: ["React", "JavaScript", "Node.js", "Express", "MongoDB", "Firebase"]
      },
      {
        title: "ENGINEERING",
        items: ["REST APIs", "Authentication", "Databases", "Git / GitHub", "API Integration"]
      },
      {
        title: "EXPLORING",
        items: ["Data Engineering", "Data Pipelines", "Data Processing", "Cloud Technologies", "AI / ML"]
      }
    ],
    education: {
      degree: "B.Tech — Computer Science & Engineering (IoT)",
      institution: "Yeshwantrao Chavan College of Engineering (YCCE)",
      duration: "2024 — 2028"
    }
  },

  journey: [
    {
      role: "Application Developer",
      organization: "Codeware Coding Club · YCCE",
      period: "Feb 2026 — Present",
      description: "Contributing to application development within the college coding club, working on software projects and collaborating with other student developers.",
      tags: ["JavaScript", "Web Development", "Git/GitHub", "Team Collaboration"]
    },
    {
      role: "Hackathon Participant & Builder",
      organization: "Technical Hackathons",
      period: "Ongoing",
      description: "Actively participating in hackathons to develop practical software solutions under real-world constraints and collaborate with developer peers.",
      tags: ["Rapid Prototyping", "Full-Stack", "Problem Solving", "Teamwork"]
    }
  ],

  certifications: [
    {
      title: "Programming in Java",
      organization: "NPTEL / IIT Kharagpur",
      desc: "Course and certification covering core Java, object-oriented programming, and algorithmic concepts."
    },
    {
      title: "Data Analytics Job Simulation",
      organization: "Deloitte Australia",
      desc: "Practical job simulation covering data analysis, data-driven insights, and dashboard reporting."
    },
    {
      title: "Responsive Web Design",
      organization: "Developer Certification",
      desc: "Foundations of responsive web layout, CSS architecture, flexbox, and modern UI standards."
    }
  ],

  contact: {
    headline: "Let's build something meaningful.",
    subheadline: "I'm always open to interesting projects, collaborations, hackathons and opportunities to learn and build.",
    ctaBadge: "Open to Collaborations",
    socials: {
      github: "https://github.com/CharudattaLende",
      linkedin: "https://www.linkedin.com/in/charudatta-lende-812009326",
      x: "https://x.com/Charudatta59"
    }
  }
};

// Export to window for global access
if (typeof window !== 'undefined') {
  window.PORTFOLIO_DATA = PORTFOLIO_DATA;
}
