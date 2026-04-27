@import "tailwindcss";

@theme {
  
  /* =========================
     BRAND CORE — change these only
     ========================= */
  --color-primary: #6d5efc;
  --color-secondary: #8b7bff;
  --color-accent: #17181d;

  --color-success: #16c784;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;

  /* =========================
     SURFACES / TEXT / BORDERS
     ========================= */
  --color-background: #f7f8fc;
  --color-surface: #ffffff;
  --color-surface-2: #f3f5fb;
  --color-surface-3: #eceff7;
  --color-surface-dark: #111318;
  --color-surface-dark-2: #171a21;

  --color-text: #0f172a;
  --color-text-soft: #475569;
  --color-text-muted: #64748b;
  --color-text-inverse: #ffffff;

  --color-border: #e7eaf3;
  --color-border-strong: #d5dbea;
  --color-ring: rgba(109, 94, 252, 0.2);

  /* =========================
     GRADIENTS / FX
     ========================= */
  --gradient-brand: linear-gradient(135deg, #6d5efc 0%, #8b7bff 48%, #b8afff 100%);
  --gradient-brand-strong: linear-gradient(135deg, #5642ff 0%, #7a68ff 50%, #a896ff 100%);
  --gradient-hero: radial-gradient(circle at top left, rgba(139, 123, 255, 0.25), transparent 28%),
    radial-gradient(circle at top right, rgba(109, 94, 252, 0.2), transparent 32%),
    linear-gradient(180deg, #ffffff 0%, #f7f8fc 100%);
  --gradient-dark: linear-gradient(180deg, #17181d 0%, #111318 100%);

  --shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-sm: 0 6px 18px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 12px 30px rgba(15, 23, 42, 0.07);
  --shadow-lg: 0 24px 60px rgba(15, 23, 42, 0.12);
  --shadow-glow: 0 18px 48px rgba(109, 94, 252, 0.22);

  /* =========================
     TYPOGRAPHY
     ========================= */
  --font-sans: "Inter", "Segoe UI", sans-serif;
  --font-display: "Space Grotesk", "Inter", sans-serif;

  /* =========================
     RADII
     ========================= */
  --radius-xs: 0.5rem;
  --radius-sm: 0.75rem;
  --radius-md: 1rem;
  --radius-lg: 1.25rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-pill: 999px;

  /* =========================
     SPACING TOKENS
     ========================= */
  --space-section: 6rem;
  --space-card: 1.5rem;
  --space-card-lg: 2rem;

  /* =========================
     MOTION
     ========================= */
  --ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 160ms;
  --duration-normal: 240ms;
  --duration-slow: 420ms;

  /* =========================
     COMPONENT TOKENS
     ========================= */
  --btn-height-sm: 2.5rem;
  --btn-height-md: 3rem;
  --btn-height-lg: 3.5rem;

  --input-height: 3.125rem;
  --sidebar-width: 17.5rem;
  --topbar-height: 4.5rem;
}

html {
  scroll-behavior: smooth;
}

:root {
  color-scheme: light;
}

.dark {
  color-scheme: dark;

  --color-background: #0d1016;
  --color-surface: #11141b;
  --color-surface-2: #151922;
  --color-surface-3: #1a2030;
  --color-surface-dark: #0d1016;
  --color-surface-dark-2: #11141b;

  --color-text: #f8fafc;
  --color-text-soft: #cbd5e1;
  --color-text-muted: #94a3b8;
  --color-text-inverse: #0f172a;

  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-strong: rgba(255, 255, 255, 0.14);
  --color-ring: rgba(139, 123, 255, 0.28);

  --gradient-hero: radial-gradient(circle at top left, rgba(139, 123, 255, 0.2), transparent 30%),
    radial-gradient(circle at top right, rgba(109, 94, 252, 0.18), transparent 36%),
    linear-gradient(180deg, #0d1016 0%, #11141b 100%);

  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-sm: 0 8px 18px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 16px 32px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 32px 64px rgba(0, 0, 0, 0.36);
  --shadow-glow: 0 20px 52px rgba(109, 94, 252, 0.24);
}

@layer base {
  * {
    border-color: var(--color-border);
  }

  html,
  body,
  #app {
    min-height: 100%;
  }

  body {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
      var(--gradient-hero);
    background-color: var(--color-background);
    color: var(--color-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }

  .dark body {
    background:
      linear-gradient(180deg, rgba(13, 16, 22, 0.78), rgba(13, 16, 22, 0.86)),
      var(--gradient-hero);
  }

  ::selection {
    background: rgba(109, 94, 252, 0.2);
    color: var(--color-text);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-display);
    letter-spacing: -0.03em;
    color: var(--color-text);
  }

  h1 {
    @apply text-4xl font-bold leading-[1.02] md:text-5xl xl:text-6xl;
  }

  h2 {
    @apply text-3xl font-bold leading-tight md:text-4xl;
  }

  h3 {
    @apply text-2xl font-semibold leading-tight md:text-3xl;
  }

  h4 {
    @apply text-xl font-semibold leading-snug md:text-2xl;
  }

  h5 {
    @apply text-lg font-semibold leading-snug;
  }

  h6 {
    @apply text-base font-semibold leading-snug;
  }

  p {
    @apply leading-7;
    color: var(--color-text-soft);
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  hr {
    border-color: var(--color-border);
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  :focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px var(--color-ring);
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.35);
    border-radius: 999px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(109, 94, 252, 0.52);
  }
}

@layer components {
  /* =========================
     LAYOUT / APP SHELL
     ========================= */
  .app-shell {
    @apply min-h-screen;
    background-color: var(--color-background);
  }

  .app-sidebar {
    @apply fixed inset-y-0 left-0 z-40 hidden flex-col border-r lg:flex;
    width: var(--sidebar-width);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.94)),
      var(--gradient-hero);
    border-color: var(--color-border);
    backdrop-filter: blur(24px);
  }

  .dark .app-sidebar {
    background:
      linear-gradient(180deg, rgba(17, 20, 27, 0.86), rgba(17, 20, 27, 0.96)),
      var(--gradient-hero);
  }

  .app-sidebar-inner {
    @apply flex h-full flex-col gap-4 p-4;
  }

  .app-main {
    @apply min-h-screen lg:pl-[17.5rem];
  }

  .app-topbar {
    @apply sticky top-0 z-30 flex items-center justify-between border-b px-4 md:px-6;
    min-height: var(--topbar-height);
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(22px);
    border-color: var(--color-border);
  }

  .dark .app-topbar {
    background: rgba(17, 20, 27, 0.8);
  }

  .app-content {
    @apply px-4 py-6 md:px-6 md:py-8 xl:px-8;
  }

  .page-wrap {
    @apply mx-auto w-full max-w-[1600px];
  }

  .page-header {
    @apply mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between;
  }

  .page-title {
    @apply text-3xl font-bold tracking-[-0.04em] md:text-4xl;
    font-family: var(--font-display);
    color: var(--color-text);
  }

  .page-subtitle {
    @apply max-w-3xl text-sm md:text-base;
    color: var(--color-text-muted);
  }

  .section-title {
    @apply text-xl font-semibold md:text-2xl;
    font-family: var(--font-display);
    color: var(--color-text);
  }

  .section-label {
    @apply inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em];
    background: rgba(109, 94, 252, 0.08);
    color: var(--color-primary);
  }

  /* =========================
     SURFACES
     ========================= */
  .surface-base {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-xs);
  }

  .surface-glass {
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(22px);
    box-shadow: var(--shadow-md);
  }

  .dark .surface-glass {
    background: rgba(17, 20, 27, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .card {
    @apply rounded-[1.5rem] p-5 md:p-6;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    transition:
      transform var(--duration-normal) var(--ease-premium),
      box-shadow var(--duration-normal) var(--ease-premium),
      border-color var(--duration-normal) var(--ease-premium);
  }

  .card-hover {
    @apply hover:-translate-y-1;
    box-shadow: var(--shadow-sm);
  }

  .card-hover:hover {
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-md);
  }

  .card-soft {
    @apply rounded-[1.5rem] p-5 md:p-6;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
  }

  .card-dark {
    @apply rounded-[1.5rem] p-5 md:p-6;
    background: var(--gradient-dark);
    color: var(--color-text-inverse);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: var(--shadow-md);
  }

  .metric-card {
    @apply relative overflow-hidden rounded-[1.75rem] p-5 md:p-6;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .metric-card::before {
    content: "";
    @apply absolute inset-x-6 top-0 h-px;
    background: linear-gradient(90deg, transparent 0%, rgba(109, 94, 252, 0.45) 50%, transparent 100%);
  }

  .hero-panel {
    @apply relative overflow-hidden rounded-[2rem] p-6 md:p-8 lg:p-10;
    background:
      radial-gradient(circle at top left, rgba(139, 123, 255, 0.16), transparent 30%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 248, 252, 0.96));
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
  }

  .dark .hero-panel {
    background:
      radial-gradient(circle at top left, rgba(139, 123, 255, 0.16), transparent 30%),
      linear-gradient(180deg, rgba(17, 20, 27, 0.98), rgba(13, 16, 22, 0.96));
  }

 /* =========================
     BUTTONS
     ========================= */
  .btn,
  .btn-primary,
  .btn-secondary,
  .btn-ghost,
  .btn-dark,
  .btn-success,
  .btn-danger,
  .btn-outline {
    @apply inline-flex items-center justify-center gap-2 rounded-[999px] px-5 text-sm font-semibold whitespace-nowrap select-none;
    min-height: var(--btn-height-md);
    transition:
      transform var(--duration-fast) var(--ease-premium),
      box-shadow var(--duration-fast) var(--ease-premium),
      background-color var(--duration-fast) var(--ease-premium),
      color var(--duration-fast) var(--ease-premium),
      border-color var(--duration-fast) var(--ease-premium);
  }

  .btn:active,
  .btn-primary:active,
  .btn-secondary:active,
  .btn-ghost:active,
  .btn-dark:active,
  .btn-success:active,
  .btn-danger:active,
  .btn-outline:active {
    transform: translateY(1px) scale(0.985);
  }

  .btn-sm {
    min-height: var(--btn-height-sm);
    @apply px-4 text-xs;
  }

  .btn-lg {
    min-height: var(--btn-height-lg);
    @apply px-6 text-base;
  }

  .btn-primary {
    color: #fff;
    background: var(--gradient-brand);
    box-shadow: var(--shadow-glow);
  }

  .btn-primary:hover {
    background: var(--gradient-brand-strong);
    transform: translateY(-1px);
  }

  .btn-secondary {
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-xs);
  }

  .btn-secondary:hover {
    background: var(--color-surface-2);
    border-color: var(--color-border-strong);
  }

  .btn-ghost {
    color: var(--color-text);
    background: transparent;
  }

  .btn-ghost:hover {
    background: rgba(109, 94, 252, 0.08);
    color: var(--color-primary);
  }

  .btn-dark {
    color: #fff;
    background: var(--color-accent);
    box-shadow: var(--shadow-sm);
  }

  .btn-dark:hover {
    background: #0f1116;
  }

  .btn-success {
    color: #fff;
    background: var(--color-success);
  }

  .btn-danger {
    color: #fff;
    background: var(--color-danger);
  }

  .btn-outline {
    color: var(--color-primary);
    background: transparent;
    border: 1px solid rgba(109, 94, 252, 0.24);
  }

  .btn-outline:hover {
    background: rgba(109, 94, 252, 0.08);
  }

  .icon-btn {
    @apply inline-flex items-center justify-center rounded-full;
    width: 2.75rem;
    height: 2.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-xs);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .icon-btn:hover {
    transform: translateY(-1px);
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-sm);
  }

  /* =========================
     INPUTS / FORMS
     ========================= */
  .field-label {
    @apply mb-2 block text-sm font-semibold;
    color: var(--color-text);
  }

  .field-hint {
    @apply mt-2 text-xs;
    color: var(--color-text-muted);
  }

  .field-error {
    @apply mt-2 text-xs font-medium;
    color: var(--color-danger);
  }

  .input-field,
  .select-field,
  .textarea-field {
    @apply w-full rounded-[1rem] border px-4 text-sm outline-none;
    background: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border);
    box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.02);
    transition:
      border-color var(--duration-fast) var(--ease-premium),
      box-shadow var(--duration-fast) var(--ease-premium),
      background-color var(--duration-fast) var(--ease-premium);
  }

  .input-field,
  .select-field {
    min-height: var(--input-height);
  }

  .textarea-field {
    @apply min-h-[130px] py-3;
    resize: vertical;
  }

  .input-field::placeholder,
  .textarea-field::placeholder {
    color: var(--color-text-muted);
  }

  .input-field:hover,
  .select-field:hover,
  .textarea-field:hover {
    border-color: var(--color-border-strong);
  }

  .input-field:focus,
  .select-field:focus,
  .textarea-field:focus {
    border-color: rgba(109, 94, 252, 0.45);
    box-shadow:
      0 0 0 4px var(--color-ring),
      0 1px 2px rgba(15, 23, 42, 0.02);
  }

  .input-filled {
    background: var(--color-surface-2);
  }

  .input-invalid,
  .select-invalid,
  .textarea-invalid {
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
  }

  .input-group {
    @apply relative flex items-center;
  }

  .input-group .input-field {
    @apply pl-11;
  }

  .input-prefix,
  .input-suffix {
    @apply pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm;
    color: var(--color-text-muted);
  }

  .input-prefix {
    @apply left-4;
  }

  .input-suffix {
    @apply right-4;
  }

  .checkbox-field,
  .radio-field {
    @apply inline-flex items-center gap-3 text-sm;
    color: var(--color-text-soft);
  }

  .checkbox-ui,
  .radio-ui {
    @apply inline-flex shrink-0 items-center justify-center border;
    width: 1.15rem;
    height: 1.15rem;
    background: var(--color-surface);
    border-color: var(--color-border-strong);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .checkbox-ui {
    border-radius: 0.38rem;
  }

  .radio-ui {
    border-radius: 999px;
  }

  .checkbox-field:hover .checkbox-ui,
  .radio-field:hover .radio-ui {
    border-color: rgba(109, 94, 252, 0.45);
  }

  .switch {
    @apply relative inline-flex h-7 w-12 items-center rounded-full border;
    background: var(--color-surface-3);
    border-color: var(--color-border);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .switch::after {
    content: "";
    @apply absolute left-1 top-1 h-5 w-5 rounded-full;
    background: #fff;
    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.16);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .switch-active {
    background: var(--gradient-brand);
    border-color: transparent;
  }

  .switch-active::after {
    transform: translateX(1.25rem);
  }

  /* =========================
     TYPOGRAPHY UTILS
     ========================= */
  .display-hero {
    @apply text-4xl font-bold leading-[0.98] tracking-[-0.05em] md:text-6xl xl:text-7xl;
    font-family: var(--font-display);
    color: var(--color-text);
  }

  .display-section {
    @apply text-3xl font-bold tracking-[-0.04em] md:text-5xl;
    font-family: var(--font-display);
    color: var(--color-text);
  }

  .text-lead {
    @apply text-base leading-8 md:text-lg;
    color: var(--color-text-soft);
  }

  .text-caption {
    @apply text-xs font-medium uppercase tracking-[0.22em];
    color: var(--color-text-muted);
  }

  /* =========================
     BADGES / CHIPS / TAGS
     ========================= */
  .badge {
    @apply inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold;
    background: var(--color-surface-2);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  .badge-primary {
    background: rgba(109, 94, 252, 0.1);
    color: var(--color-primary);
    border-color: rgba(109, 94, 252, 0.18);
  }

  .badge-success {
    background: rgba(22, 199, 132, 0.12);
    color: #108b5e;
    border-color: rgba(22, 199, 132, 0.18);
  }

  .badge-warning {
    background: rgba(245, 158, 11, 0.12);
    color: #b56d05;
    border-color: rgba(245, 158, 11, 0.18);
  }

  .badge-danger {
    background: rgba(239, 68, 68, 0.12);
    color: #c03535;
    border-color: rgba(239, 68, 68, 0.18);
  }

  .chip {
    @apply inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-soft);
  }

  /* =========================
     NAVIGATION
     ========================= */
  .nav-section-label {
    @apply px-3 pt-3 text-[11px] font-semibold uppercase tracking-[0.24em];
    color: var(--color-text-muted);
  }

  .nav-item {
    @apply flex items-center gap-3 rounded-[1rem] px-3 py-3 text-sm font-medium;
    color: var(--color-text-soft);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .nav-item:hover {
    background: rgba(109, 94, 252, 0.08);
    color: var(--color-text);
  }

  .nav-item-active {
    background: linear-gradient(135deg, rgba(109, 94, 252, 0.14), rgba(139, 123, 255, 0.12));
    color: var(--color-primary);
    box-shadow: inset 0 0 0 1px rgba(109, 94, 252, 0.12);
  }

  .breadcrumb {
    @apply flex flex-wrap items-center gap-2 text-sm;
    color: var(--color-text-muted);
  }

  .breadcrumb-separator {
    @apply opacity-50;
  }

  /* =========================
     TABLES / LISTS
     ========================= */
  .table-wrap {
    @apply overflow-hidden rounded-[1.5rem] border;
    background: var(--color-surface);
    border-color: var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .table-base {
    @apply w-full border-collapse text-left text-sm;
  }

  .table-base thead th {
    @apply px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em];
    color: var(--color-text-muted);
    background: var(--color-surface-2);
    border-bottom: 1px solid var(--color-border);
  }

  .table-base tbody td {
    @apply px-5 py-4 align-middle;
    color: var(--color-text-soft);
    border-top: 1px solid var(--color-border);
  }

  .table-base tbody tr {
    transition: background-color var(--duration-fast) var(--ease-premium);
  }

  .table-base tbody tr:hover {
    background: rgba(109, 94, 252, 0.04);
  }

  .list-row {
    @apply flex items-center justify-between gap-4 rounded-[1.25rem] px-4 py-4;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .list-row:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  /* =========================
     CRM / DASHBOARD
     ========================= */
  .stat-title {
    @apply text-sm font-medium;
    color: var(--color-text-muted);
  }

  .stat-value {
    @apply mt-3 text-3xl font-bold tracking-[-0.04em] md:text-4xl;
    font-family: var(--font-display);
    color: var(--color-text);
  }

  .stat-delta {
    @apply mt-2 inline-flex items-center gap-2 text-xs font-semibold;
  }

  .stat-delta-up {
    color: var(--color-success);
  }

  .stat-delta-down {
    color: var(--color-danger);
  }

  .pipeline-board {
    @apply grid gap-4 xl:grid-cols-4;
  }

  .pipeline-column {
    @apply rounded-[1.5rem] border p-4;
    background: var(--color-surface);
    border-color: var(--color-border);
    box-shadow: var(--shadow-xs);
  }

  .pipeline-column-title {
    @apply mb-4 flex items-center justify-between text-sm font-semibold;
    color: var(--color-text);
  }

  .pipeline-card {
    @apply rounded-[1.25rem] border p-4;
    background: var(--color-surface-2);
    border-color: var(--color-border);
    box-shadow: var(--shadow-xs);
  }

  .kpi-grid {
    @apply grid gap-4 sm:grid-cols-2 xl:grid-cols-4;
  }

  .chart-card {
    @apply rounded-[1.75rem] border p-5 md:p-6;
    background: var(--color-surface);
    border-color: var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  /* =========================
     FORMS / SURVEYS / BOOKING
     ========================= */
  .form-shell {
    @apply mx-auto w-full max-w-4xl rounded-[2rem] border p-5 md:p-8;
    background: rgba(255, 255, 255, 0.84);
    border-color: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(24px);
    box-shadow: var(--shadow-lg);
  }

  .dark .form-shell {
    background: rgba(17, 20, 27, 0.82);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .form-section {
    @apply rounded-[1.5rem] border p-5 md:p-6;
    background: var(--color-surface);
    border-color: var(--color-border);
  }

  .question-card {
    @apply rounded-[1.5rem] border p-5 md:p-6;
    background: var(--color-surface);
    border-color: var(--color-border);
    box-shadow: var(--shadow-xs);
  }

  .option-card {
    @apply flex items-center gap-3 rounded-[1rem] border px-4 py-4 text-sm font-medium;
    background: var(--color-surface);
    border-color: var(--color-border);
    color: var(--color-text-soft);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .option-card:hover {
    border-color: rgba(109, 94, 252, 0.26);
    background: rgba(109, 94, 252, 0.04);
  }

  .option-card-active {
    background: rgba(109, 94, 252, 0.08);
    border-color: rgba(109, 94, 252, 0.32);
    color: var(--color-primary);
    box-shadow: inset 0 0 0 1px rgba(109, 94, 252, 0.1);
  }

  .stepper {
    @apply flex flex-wrap items-center gap-3;
  }

  .stepper-item {
    @apply inline-flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium;
    color: var(--color-text-muted);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
  }

  .stepper-item-active {
    color: var(--color-primary);
    background: rgba(109, 94, 252, 0.08);
    border-color: rgba(109, 94, 252, 0.2);
  }

  .calendar-shell {
    @apply rounded-[1.75rem] border p-5 md:p-6;
    background: var(--color-surface);
    border-color: var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .calendar-day {
    @apply flex aspect-square items-center justify-center rounded-[1rem] text-sm font-medium;
    color: var(--color-text-soft);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .calendar-day:hover {
    background: rgba(109, 94, 252, 0.08);
    color: var(--color-primary);
  }

  .calendar-day-active {
    background: var(--gradient-brand);
    color: #fff;
    box-shadow: var(--shadow-glow);
  }

  .time-slot {
    @apply inline-flex items-center justify-center rounded-[999px] px-4 py-3 text-sm font-semibold;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-soft);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .time-slot:hover {
    border-color: rgba(109, 94, 252, 0.26);
    color: var(--color-primary);
    background: rgba(109, 94, 252, 0.04);
  }

  .time-slot-active {
    background: var(--gradient-brand);
    color: #fff;
    border-color: transparent;
    box-shadow: var(--shadow-glow);
  }

  /* =========================
     MODALS / DRAWERS / DROPDOWNS
     ========================= */
  .overlay {
    @apply fixed inset-0 z-50;
    background: rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(8px);
  }

  .modal-panel {
    @apply relative mx-auto w-full max-w-2xl rounded-[2rem] border p-6 md:p-8;
    background: var(--color-surface);
    border-color: var(--color-border);
    box-shadow: var(--shadow-lg);
  }

  .drawer-panel {
    @apply fixed right-0 top-0 z-[60] h-screen w-full max-w-xl border-l p-5 md:p-6;
    background: var(--color-surface);
    border-color: var(--color-border);
    box-shadow: var(--shadow-lg);
  }

  .dropdown-panel {
    @apply rounded-[1.25rem] border p-2;
    background: rgba(255, 255, 255, 0.92);
    border-color: var(--color-border);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(16px);
  }

  .dark .dropdown-panel {
    background: rgba(17, 20, 27, 0.92);
  }

  .dropdown-item {
    @apply flex items-center gap-3 rounded-[0.9rem] px-3 py-3 text-sm font-medium;
    color: var(--color-text-soft);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .dropdown-item:hover {
    background: rgba(109, 94, 252, 0.08);
    color: var(--color-text);
  }

  /* =========================
     TABS / FILTERS
     ========================= */
  .tabs {
    @apply inline-flex flex-wrap gap-2 rounded-[999px] p-1;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
  }

  .tab {
    @apply inline-flex min-h-[2.5rem] items-center justify-center rounded-[999px] px-4 text-sm font-semibold;
    color: var(--color-text-muted);
    transition: all var(--duration-fast) var(--ease-premium);
  }

  .tab:hover {
    color: var(--color-text);
  }

  .tab-active {
    background: var(--color-surface);
    color: var(--color-primary);
    box-shadow: var(--shadow-xs);
  }

  .filter-pill {
    @apply inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-soft);
  }

  /* =========================
     ALERTS / FEEDBACK
     ========================= */
  .alert {
    @apply flex items-start gap-3 rounded-[1.25rem] border px-4 py-4 text-sm;
    background: var(--color-surface);
  }

  .alert-info {
    border-color: rgba(59, 130, 246, 0.2);
    background: rgba(59, 130, 246, 0.08);
    color: #1858c8;
  }

  .alert-success {
    border-color: rgba(22, 199, 132, 0.18);
    background: rgba(22, 199, 132, 0.1);
    color: #0f8f60;
  }

  .alert-warning {
    border-color: rgba(245, 158, 11, 0.18);
    background: rgba(245, 158, 11, 0.1);
    color: #b56d05;
  }

  .alert-danger {
    border-color: rgba(239, 68, 68, 0.18);
    background: rgba(239, 68, 68, 0.1);
    color: #c03535;
  }

  .empty-state {
    @apply flex flex-col items-center justify-center rounded-[2rem] border px-6 py-14 text-center;
    background: var(--color-surface);
    border-color: var(--color-border);
    box-shadow: var(--shadow-xs);
  }

  .skeleton {
    @apply animate-pulse rounded-[1rem];
    background: linear-gradient(
      90deg,
      rgba(148, 163, 184, 0.12) 0%,
      rgba(148, 163, 184, 0.2) 50%,
      rgba(148, 163, 184, 0.12) 100%
    );
    background-size: 200% 100%;
  }

  .progress-bar {
    @apply h-2 w-full overflow-hidden rounded-full;
    background: var(--color-surface-3);
  }

  .progress-bar > span {
    @apply block h-full rounded-full;
    background: var(--gradient-brand);
  }

/* =========================
     AVATAR / MEDIA
     ========================= */
  .avatar,
  .avatar-sm,
  .avatar-md,
  .avatar-lg {
    @apply inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold;
    background: linear-gradient(135deg, rgba(109, 94, 252, 0.14), rgba(139, 123, 255, 0.18));
    color: var(--color-primary);
  }

  .avatar-sm {
    @apply h-8 w-8 text-xs;
  }

  .avatar-md {
    @apply h-10 w-10 text-sm;
  }

  .avatar-lg {
    @apply h-14 w-14 text-base;
  }
  /* =========================
     TOAST / STATUS STRIPS
     ========================= */
  .toast-panel {
    @apply rounded-[1.25rem] border px-4 py-4;
    background: rgba(255, 255, 255, 0.92);
    border-color: var(--color-border);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(18px);
  }

  .dark .toast-panel {
    background: rgba(17, 20, 27, 0.92);
  }

  .status-strip {
    @apply flex items-center justify-between gap-3 rounded-[1rem] px-4 py-3 text-sm;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
  }

  /* =========================
     AUTH PAGES / HEROES
     ========================= */
  .auth-shell {
    @apply grid min-h-screen lg:grid-cols-[1.05fr_0.95fr];
    background: var(--color-background);
  }

  .auth-brand-panel {
    @apply relative hidden overflow-hidden p-10 lg:flex;
    background:
      radial-gradient(circle at 15% 15%, rgba(139, 123, 255, 0.22), transparent 25%),
      radial-gradient(circle at 85% 20%, rgba(109, 94, 252, 0.2), transparent 28%),
      linear-gradient(180deg, #0f1118 0%, #17181d 100%);
    color: #fff;
  }

  .auth-form-panel {
    @apply flex items-center justify-center p-4 md:p-6 lg:p-10;
  }

  /* =========================
     UTILITY PANELS
     ========================= */
  .divider-text {
    @apply relative my-6 text-center text-xs font-semibold uppercase tracking-[0.22em];
    color: var(--color-text-muted);
  }

  .divider-text::before {
    content: "";
    @apply absolute left-0 right-0 top-1/2 h-px -translate-y-1/2;
    background: var(--color-border);
  }

  .divider-text > span {
    @apply relative px-3;
    background: var(--color-surface);
  }
}

@layer utilities {
  .bg-brand-gradient {
    background: var(--gradient-brand);
  }

  .bg-brand-gradient-strong {
    background: var(--gradient-brand-strong);
  }

  .bg-hero-gradient {
    background: var(--gradient-hero);
  }

  .text-primary {
    color: var(--color-primary);
  }

  .text-soft {
    color: var(--color-text-soft);
  }

  .text-muted {
    color: var(--color-text-muted);
  }

  .bg-surface {
    background: var(--color-surface);
  }

  .bg-surface-2 {
    background: var(--color-surface-2);
  }

  .bg-surface-3 {
    background: var(--color-surface-3);
  }

  .border-theme {
    border-color: var(--color-border);
  }

  .border-theme-strong {
    border-color: var(--color-border-strong);
  }

  .shadow-theme-xs {
    box-shadow: var(--shadow-xs);
  }

  .shadow-theme-sm {
    box-shadow: var(--shadow-sm);
  }

  .shadow-theme-md {
    box-shadow: var(--shadow-md);
  }

  .shadow-theme-lg {
    box-shadow: var(--shadow-lg);
  }

  .shadow-theme-glow {
    box-shadow: var(--shadow-glow);
  }

  .rounded-theme {
    border-radius: var(--radius-lg);
  }

  .rounded-theme-xl {
    border-radius: var(--radius-xl);
  }

  .rounded-theme-2xl {
    border-radius: var(--radius-2xl);
  }

  .transition-theme {
    transition: all var(--duration-normal) var(--ease-premium);
  }

  .container-premium {
    @apply mx-auto w-full max-w-[1600px] px-4 md:px-6 xl:px-8;
  }

  .grid-auto-fit-card {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}