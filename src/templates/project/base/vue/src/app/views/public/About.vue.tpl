<template>
  <div class="min-h-screen bg-[#FAFAF9] pt-32 md:pt-40 pb-24 md:pb-32 px-6 selection:bg-[var(--color-primary)] selection:text-white overflow-hidden">
    <!-- Ambient Background -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-0 left-[-10%] w-[40rem] h-[40rem] bg-[var(--color-primary)]/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-[-10%] w-[36rem] h-[36rem] bg-[var(--color-secondary)]/5 rounded-full blur-3xl"></div>
      <div
        class="absolute inset-0 opacity-[0.025]"
        style="background-image: linear-gradient(#1860A8 1px, transparent 1px), linear-gradient(90deg, #1860A8 1px, transparent 1px); background-size: 64px 64px;"
      ></div>
    </div>

    <div class="container relative z-10 mx-auto max-w-6xl">
      <!-- Hero -->
      <header class="mb-24 md:mb-32 reveal-hero text-center">
        <span class="text-[var(--color-secondary)] font-bold tracking-[0.4em] text-[10px] uppercase mb-6 block">
          About Totisoft
        </span>

        <h1 class="font-display text-5xl md:text-7xl lg:text-8xl tracking-tighter text-[var(--color-text)] mb-8 leading-[0.95] text-balance">
          Building digital systems
          <br />
          <span class="italic font-serif font-light text-[var(--color-primary)]">
            that make businesses stronger
          </span>
        </h1>

        <p class="text-lg md:text-2xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed">
          Totisoft CC is a Namibian digital development studio focused on professional websites,
          custom platforms, automation, and business systems built to improve credibility,
          efficiency, and growth.
        </p>
      </header>

      <!-- Founder + Brand Story -->
      <section class="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-12 mb-20 md:mb-28 reveal-section">
        <div class="bg-white rounded-[32px] p-8 md:p-10 border border-black/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <span class="text-xs uppercase tracking-[0.3em] font-bold text-[var(--color-secondary)] mb-4 block">
            Founder
          </span>

          <div class="flex items-center gap-5 mb-8">
            <div class="w-18 h-18 md:w-20 md:h-20 rounded-[24px] bg-[var(--color-primary)] text-white flex items-center justify-center font-display text-2xl md:text-3xl shadow-lg">
              SP
            </div>
            <div>
              <h2 class="text-2xl md:text-3xl font-display tracking-tight text-[var(--color-text)]">
                Sommo B. Petrus
              </h2>
              <p class="text-sm uppercase tracking-[0.25em] text-gray-400 mt-1">
                Founder · Totisoft CC
              </p>
            </div>
          </div>

          <p class="text-base md:text-lg text-gray-600 leading-relaxed font-light mb-5">
            Totisoft was established in October 2021 to give businesses a more practical way to
            access digital transformation. The aim was simple: create digital products that are not
            only visually strong, but genuinely useful to the businesses that depend on them.
          </p>

          <p class="text-base md:text-lg text-gray-600 leading-relaxed font-light">
            Instead of working like a fragmented agency, Totisoft keeps strategy, design,
            development, and implementation closely connected, so projects remain clear, focused,
            and accountable from start to finish.
          </p>
        </div>

        <div class="bg-[var(--color-text)] text-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
          <span class="text-xs uppercase tracking-[0.3em] font-bold text-white/60 mb-4 block">
            Studio Narrative
          </span>
          <h2 class="font-display text-3xl md:text-5xl tracking-tight mb-6 leading-tight">
            Built for businesses that need more than a basic website
          </h2>
          <p class="text-white/80 text-base md:text-lg leading-relaxed font-light mb-5">
            Totisoft exists for businesses that want digital systems to do real work. That could
            mean generating leads, building trust, streamlining internal processes, enabling
            customer access, or creating a stronger online presence that supports long-term growth.
          </p>
          <p class="text-white/80 text-base md:text-lg leading-relaxed font-light mb-5">
            We focus on clarity, structure, performance, and business relevance. Every project is
            approached with the belief that technology should simplify operations, improve
            communication, and create measurable value.
          </p>
          <p class="text-white/80 text-base md:text-lg leading-relaxed font-light">
            The result is work that feels modern, functions reliably, and is built with a clear
            understanding of where the business is now and where it wants to go next.
          </p>
        </div>
      </section>

      <!-- Stats -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-20 md:mb-28 reveal-section">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          class="bg-white p-6 md:p-8 rounded-[28px] border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
        >
          <h3 class="text-3xl md:text-5xl font-display font-bold tracking-tight text-[var(--color-text)] mb-2">
            {{ stat.value }}
          </h3>
          <p class="text-[10px] md:text-xs uppercase tracking-[0.22em] text-gray-400">
            {{ stat.label }}
          </p>
        </div>
      </section>

      <!-- Timeline -->
      <section class="mb-20 md:mb-28 reveal-section">
        <div class="max-w-3xl mb-10 md:mb-14">
          <span class="text-xs uppercase tracking-[0.3em] font-bold text-[var(--color-secondary)] mb-4 block">
            Journey
          </span>
          <h2 class="font-display text-4xl md:text-6xl tracking-tight text-[var(--color-text)] mb-5">
            A growing digital practice with a practical foundation
          </h2>
          <p class="text-lg text-gray-500 font-light leading-relaxed">
            Totisoft has grown by focusing on execution, direct client value, and digital solutions
            that respond to real business needs in Namibia and beyond.
          </p>
        </div>

        <div class="relative">
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[var(--color-primary)]/15"></div>

          <div class="space-y-8 md:space-y-10">
            <div
              v-for="(item, index) in timeline"
              :key="index"
              class="relative grid md:grid-cols-2 gap-5 md:gap-10 items-start"
            >
              <div
                :class="[
                  'md:text-right',
                  index % 2 === 0 ? 'md:pr-12' : 'md:order-2 md:pl-12 md:text-left'
                ]"
              >
                <div class="ml-12 md:ml-0 bg-white border border-black/5 rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                  <span class="text-[10px] uppercase tracking-[0.3em] text-[var(--color-secondary)] font-bold block mb-3">
                    {{ item.year }}
                  </span>
                  <h3 class="text-xl md:text-2xl font-display tracking-tight text-[var(--color-text)] mb-3">
                    {{ item.title }}
                  </h3>
                  <p class="text-gray-600 font-light leading-relaxed">
                    {{ item.text }}
                  </p>
                </div>
              </div>

              <div :class="[index % 2 === 0 ? 'md:order-2 md:pl-12' : 'md:pr-12']"></div>

              <div class="absolute left-4 md:left-1/2 top-8 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[var(--color-primary)] border-4 border-[#FAFAF9] shadow-md"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services -->
      <section class="mb-20 md:mb-28 reveal-section">
        <div class="max-w-3xl mb-10 md:mb-14">
          <span class="text-xs uppercase tracking-[0.3em] font-bold text-[var(--color-secondary)] mb-4 block">
            What We Build
          </span>
          <h2 class="font-display text-4xl md:text-6xl tracking-tight text-[var(--color-text)] mb-5">
            Digital products designed around business function
          </h2>
          <p class="text-lg text-gray-500 font-light leading-relaxed">
            We help businesses choose and build the right digital system for their current stage,
            operations, and long-term goals.
          </p>
        </div>

        <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          <article
            v-for="(service, index) in services"
            :key="index"
            class="bg-white rounded-[28px] p-7 border border-black/5 hover:-translate-y-1 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
          >
            <div class="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-5">
              <component :is="service.icon" class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-display tracking-tight text-[var(--color-text)] mb-3">
              {{ service.title }}
            </h3>
            <p class="text-gray-600 font-light leading-relaxed">
              {{ service.description }}
            </p>
          </article>
        </div>
      </section>

      <!-- Industries + Locations -->
      <section class="grid lg:grid-cols-2 gap-8 md:gap-10 mb-20 md:mb-28 reveal-section">
        <div class="bg-white rounded-[32px] p-8 md:p-10 border border-black/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <span class="text-xs uppercase tracking-[0.3em] font-bold text-[var(--color-secondary)] mb-4 block">
            Industries & Clients
          </span>
          <h2 class="font-display text-3xl md:text-5xl tracking-tight text-[var(--color-text)] mb-8">
            Flexible enough for different sectors
          </h2>

          <div class="flex flex-wrap gap-3">
            <span
              v-for="(industry, index) in industries"
              :key="index"
              class="px-4 py-3 rounded-2xl bg-[#F6F8FB] border border-black/5 text-sm md:text-base text-[var(--color-text)]"
            >
              {{ industry }}
            </span>
          </div>
        </div>

        <div class="bg-[var(--color-primary)] text-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_60px_rgba(24,96,168,0.2)]">
          <span class="text-xs uppercase tracking-[0.3em] font-bold text-white/70 mb-4 block">
            Service Area
          </span>
          <h2 class="font-display text-3xl md:text-5xl tracking-tight mb-8">
            Rooted in Namibia, built for broader growth
          </h2>

          <div class="grid grid-cols-2 gap-3 mb-8">
            <div
              v-for="(location, index) in locations"
              :key="index"
              class="rounded-2xl bg-white/10 border border-white/10 px-4 py-4 text-white/90"
            >
              {{ location }}
            </div>
          </div>

          <p class="text-white/80 font-light leading-relaxed">
            While Totisoft is proudly Namibian, our approach is built on standards that support
            both local businesses and companies that want a stronger regional digital presence.
          </p>
        </div>
      </section>

      <!-- Values -->
      <section class="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 mb-20 md:mb-28 reveal-section">
        <div class="bg-white rounded-[32px] p-8 md:p-12 border border-black/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <span class="text-xs uppercase tracking-[0.3em] font-bold text-[var(--color-secondary)] mb-4 block">
            Our Principles
          </span>
          <h2 class="font-display text-3xl md:text-5xl tracking-tight text-[var(--color-text)] mb-8">
            The standard behind our work
          </h2>

          <div class="space-y-7">
            <div
              v-for="(principle, index) in principles"
              :key="index"
              class="border-b border-black/5 pb-6 last:border-b-0 last:pb-0"
            >
              <h3 class="text-lg md:text-xl font-semibold text-[var(--color-text)] mb-2">
                {{ principle.title }}
              </h3>
              <p class="text-gray-600 font-light leading-relaxed">
                {{ principle.text }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-[#F3F6FB] rounded-[32px] p-8 md:p-10 border border-[var(--color-primary)]/10">
          <span class="text-xs uppercase tracking-[0.3em] font-bold text-[var(--color-secondary)] mb-4 block">
            Why Businesses Choose Totisoft
          </span>

          <div class="space-y-5">
            <div
              v-for="(point, index) in reasons"
              :key="index"
              class="flex items-start gap-4 bg-white/80 rounded-2xl p-5 border border-black/5"
            >
              <div class="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold flex items-center justify-center shrink-0">
                {{ index + 1 }}
              </div>
              <div>
                <h3 class="text-base md:text-lg font-semibold text-[var(--color-text)] mb-1">
                  {{ point.title }}
                </h3>
                <p class="text-gray-600 font-light leading-relaxed">
                  {{ point.text }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tech / Capabilities Strip -->
      <section class="mb-20 md:mb-28 reveal-section">
        <div class="bg-[var(--color-text)] text-white rounded-[36px] p-8 md:p-12 lg:p-14">
          <div class="max-w-3xl mb-8">
            <span class="text-xs uppercase tracking-[0.3em] font-bold text-white/60 mb-4 block">
              Capabilities
            </span>
            <h2 class="font-display text-3xl md:text-5xl tracking-tight mb-4">
              Modern tools, practical execution
            </h2>
            <p class="text-white/75 text-base md:text-lg font-light leading-relaxed">
              We combine design thinking, frontend development, backend logic, automation, and
              platform integration to build digital products that are both usable and scalable.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <span
              v-for="(tech, index) in technologies"
              :key="index"
              class="px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-sm md:text-base text-white/90"
            >
              {{ tech }}
            </span>
          </div>
        </div>
      </section>

      <!-- Process -->
      <section class="mb-20 md:mb-28 reveal-section">
        <div class="max-w-3xl mb-10 md:mb-14">
          <span class="text-xs uppercase tracking-[0.3em] font-bold text-[var(--color-secondary)] mb-4 block">
            Process
          </span>
          <h2 class="font-display text-4xl md:text-6xl tracking-tight text-[var(--color-text)] mb-5">
            A disciplined path from idea to launch
          </h2>
          <p class="text-lg text-gray-500 font-light leading-relaxed">
            Each project follows a practical structure that keeps communication clear, scope
            controlled, and delivery focused.
          </p>
        </div>

        <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div
            v-for="(step, index) in process"
            :key="index"
            class="bg-white rounded-[28px] p-7 border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
          >
            <div class="text-[10px] uppercase tracking-[0.3em] text-[var(--color-secondary)] font-bold mb-4">
              Step {{ index + 1 }}
            </div>
            <h3 class="text-xl font-display tracking-tight text-[var(--color-text)] mb-3">
              {{ step.title }}
            </h3>
            <p class="text-gray-600 font-light leading-relaxed">
              {{ step.text }}
            </p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <footer class="bg-[var(--color-primary)] text-white p-10 md:p-16 lg:p-20 rounded-[40px] text-center reveal-section shadow-[0_20px_60px_rgba(24,96,168,0.2)]">
        <span class="text-[10px] uppercase tracking-[0.35em] text-white/70 font-bold block mb-5">
          Start The Conversation
        </span>
        <h3 class="font-display text-3xl md:text-5xl tracking-tight mb-6">
          Ready to build a stronger digital foundation for your business?
        </h3>
        <p class="max-w-2xl mx-auto text-white/80 font-light text-base md:text-lg leading-relaxed mb-10">
          From professional websites to custom business systems, Totisoft helps ambitious
          businesses turn ideas into reliable digital products.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/assessment"
            class="inline-flex items-center justify-center px-8 py-4 bg-white text-[var(--color-primary)] text-[11px] uppercase tracking-[0.3em] font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300"
          >
            Start Your Assessment
          </a>
          <a
            href="mailto:sommo@totisoft.com"
            class="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white text-[11px] uppercase tracking-[0.3em] font-bold rounded-2xl hover:bg-white/10 transition-all duration-300"
          >
            Contact Totisoft
          </a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useHead } from '@vueuse/head';
import { gsap } from 'gsap';
import {
  Globe,
  MonitorSmartphone,
  Workflow,
  Mail,
} from 'lucide-vue-next';

const foundedYear = 2021;
const currentYear = new Date().getFullYear();
const yearsActive = computed(() => `${String(currentYear - foundedYear).padStart(2, '0')}+`);

useHead({
  title: 'About Totisoft CC | Website Development, Business Systems & Software in Namibia',
  meta: [
    {
      name: 'description',
      content:
        'Learn about Totisoft CC, a Namibian digital development studio founded in 2021. We build websites, software systems, automation tools, hosting solutions and digital platforms for modern businesses in Namibia.'
    },
    {
      property: 'og:title',
      content: 'About Totisoft CC | Website Development & Business Systems in Namibia'
    },
    {
      property: 'og:description',
      content:
        'Totisoft CC is a Namibian digital studio focused on websites, software platforms, automation systems and business-ready digital infrastructure.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: 'https://www.totisoft.com/about'
    },
    {
      property: 'og:image',
      content: 'https://www.totisoft.com/preview.png'
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:title',
      content: 'About Totisoft CC | Website Development & Business Systems in Namibia'
    },
    {
      name: 'twitter:description',
      content:
        'Namibian digital studio building websites, software platforms, automation systems and digital business infrastructure.'
    },
    {
      name: 'twitter:image',
      content: 'https://www.totisoft.com/preview.png'
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://www.totisoft.com/about'
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'AboutPage',
            '@id': 'https://www.totisoft.com/about#aboutpage',
            name: 'About Totisoft CC',
            url: 'https://www.totisoft.com/about',
            description: 'About page for Totisoft CC, a Namibian digital development studio.'
          },
          {
            '@type': 'Organization',
            '@id': 'https://www.totisoft.com/#organization',
            name: 'Totisoft CC',
            url: 'https://www.totisoft.com',
            logo: 'https://www.totisoft.com/logo.png',
            founder: {
              '@type': 'Person',
              name: 'Sommo B. Petrus'
            },
            foundingDate: '2021-10',
            description:
              'Totisoft CC is a Namibian digital development studio focused on websites, software systems, automation and digital business infrastructure.',
            areaServed: [
              { '@type': 'Country', name: 'Namibia' },
              { '@type': 'Country', name: 'Botswana' },
              { '@type': 'Country', name: 'Zambia' }
            ]
          }
        ]
      })
    }
  ]
});

const stats = computed(() => [
  { value: yearsActive.value, label: 'Years Active' },
  { value: '100%', label: 'Hands-On Delivery' },
  { value: 'NA', label: 'Namibian Based' },
  { value: 'B2B', label: 'Business Focused' }
]);

const timeline = [
  {
    year: '2021',
    title: 'Foundation',
    text: 'Totisoft CC was established with a focus on making high-quality digital solutions more accessible, direct, and business-relevant.'
  },
  {
    year: '2022',
    title: 'Service Refinement',
    text: 'The studio sharpened its focus around website development, branding-aligned digital experiences, and practical technical delivery.'
  },
  {
    year: '2023',
    title: 'System Thinking',
    text: 'Work expanded beyond brochure-style websites into more structured digital systems, business workflows, and custom functionality.'
  },
  {
    year: '2024+',
    title: 'Growth-Focused Delivery',
    text: 'Totisoft continues to evolve into a stronger digital partner for businesses that want scalable platforms, automation, and credible online infrastructure.'
  }
];

const services = [
  {
    title: 'Business Websites',
    description:
      'Professional websites built to improve credibility, visibility, and conversion for companies that need a serious online presence.',
    icon: Globe
  },
  {
    title: 'Custom Platforms',
    description:
      'Portals, dashboards, booking systems, internal tools, and tailored business software built around operational needs.',
    icon: MonitorSmartphone
  },
  {
    title: 'Automation & Workflows',
    description:
      'Digital processes that reduce repetitive work, improve response times, and create more efficient business operations.',
    icon: Workflow
  },
  {
    title: 'Hosting & Email Setup',
    description:
      'Website hosting, domain-linked email setup, and technical support that keeps your digital foundation stable and professional.',
    icon: Mail
  }
];

const industries = [
  'Startups',
  'SMEs',
  'Professional Services',
  'Retail & Commerce',
  'Consulting Firms',
  'Health & Care Services',
  'Education & Training',
  'Community Organizations'
];

const locations = [
  'Windhoek',
  'Rundu',
  'Walvis Bay',
  'Swakopmund',
  'Ongwediva',
  'Namibia'
];

const principles = [
  {
    title: 'Business relevance before visual trends',
    text: 'A polished interface matters, but only when it supports trust, usability, and action. We design for credibility, usability, and outcomes.'
  },
  {
    title: 'Clear communication from start to finish',
    text: 'Clients should understand what is being built, why it matters, and how the system supports the business. We aim for clarity, not confusion.'
  },
  {
    title: 'Scalable thinking',
    text: 'Even smaller projects should be structured with future growth in mind, so the business is not forced to rebuild too soon.'
  }
];

const reasons = [
  {
    title: 'Direct collaboration',
    text: 'You work closer to the builder, not through layers of account managers and unnecessary handoffs.'
  },
  {
    title: 'Practical solutions',
    text: 'We focus on what the business needs now, while still keeping space for future growth and expansion.'
  },
  {
    title: 'Modern implementation',
    text: 'Our work is built with current tools, strong structure, and real-world usability in mind.'
  },
  {
    title: 'Local understanding',
    text: 'We understand the pace, constraints, and opportunities of businesses operating in Namibia.'
  }
];

const technologies = [
  'Vue',
  'Firebase',
  'Frontend Architecture',
  'Custom CMS Logic',
  'Business Automation',
  'Email Setup',
  'Hosting Workflows',
  'SEO Structure',
  'Client Dashboards',
  'Responsive Design'
];

const process = [
  {
    title: 'Discovery',
    text: 'We learn about your business, goals, users, and what the digital solution needs to achieve.'
  },
  {
    title: 'Planning',
    text: 'We define the structure, pages, features, and technical direction before development begins.'
  },
  {
    title: 'Build',
    text: 'Design, content integration, development, and system implementation are executed with close attention to quality.'
  },
  {
    title: 'Launch & Support',
    text: 'After approval, the project is launched and supported so your business can move forward with confidence.'
  }
];

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.05 } });

  tl.from('.reveal-hero', {
    y: 50,
    opacity: 0
  }).from(
    '.reveal-section',
    {
      y: 35,
      opacity: 0,
      stagger: 0.14
    },
    '-=0.55'
  );
});
</script>