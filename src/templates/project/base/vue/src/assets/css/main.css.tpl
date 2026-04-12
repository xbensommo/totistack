@import "tailwindcss";

@theme {
  /* Brand Colors Extracted from TotiSoft Logo */
  --color-primary: #1860A8; /* Deep Trust Blue (from the T and F) */
  --color-secondary: #4A90E2; /* Bright Tech Blue (from the O and nodes) */
  --color-accent: #000000; /* Sharp Black for grounding */
  
  /* Text & Background - Light Mode Optimization */
  --color-text: #0F172A; /* Rich Slate (Softer than pure black for reading) */
  --color-text-light: #64748B; /* Muted Text */
  --color-neutral: #F8FAFC; /* Crisp Light Grey backgrounds */
  --color-neutral-dark: #E2E8F0; /* Borders/Dividers */
  --color-background: #FFFFFF; /* Pure White for high contrast */

  /* Functional Colors */
  --color-danger: #EF4444;
  --color-success: #10B981;

  /* Typography */
  --font-sans: "Inter", sans-serif; /* Highly legible, modern, professional */
  --font-display: "Space Grotesk", sans-serif; /* Tech-forward for headings */
  
  /* Animation Tokens - Inspired by Logo Nodes */
  --animation-node-pulse: nodePulse 3s ease-in-out infinite;
  --animation-circuit-flow: circuitFlow 5s linear infinite;
  --animation-fade-up: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

html {
  scroll-behavior: smooth;
}

/* Base Styles */
body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-sans);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Custom Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--color-neutral); }
::-webkit-scrollbar-thumb { 
  background: var(--color-text-light); 
  border-radius: 8px; 
}
::-webkit-scrollbar-thumb:hover { background: var(--color-primary); }

/* Vue 3 / Tailwind Component Layers */
@layer components {
  
  /* The Main Card Container - Clean, Minimalist shadow */
  .tech-card {
    @apply bg-white border border-[var(--color-neutral-dark)] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500 rounded-xl overflow-hidden;
  }

  /* Consultative Input Fields */
  .input-field {
    @apply w-full bg-[var(--color-neutral)] border border-transparent rounded-lg px-5 py-4 text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:bg-white focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/10 focus:outline-none transition-all duration-300;
  }

  /* Primary Button - Partner Approach */
  .btn-primary {
    @apply bg-[var(--color-accent)] text-white px-8 py-4 hover:bg-[var(--color-primary)] hover:shadow-lg hover:shadow-[var(--color-primary)]/20 active:scale-95 transition-all duration-300 font-medium tracking-wide flex items-center justify-center gap-3 text-[1rem];
  }

  /* Display Typography for Awwwards Impact */
  .display-text {
    @apply font-[var(--font-display)] font-bold text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-[var(--color-text)];
  }
}