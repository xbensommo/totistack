/**
 * @file branding.config.js
 * @description Branding and theming configuration
 * @date 2026-03-22
 * @author Totistack Team
 */

export default {
  // Business identity
  appName: '{{appName}}',
  appShortName: '{{appShortName}}',
  description: '{{appDescription}}',
  
  // Color palette
  colors: {
    primary: '{{primaryColor}}',
    secondary: '{{secondaryColor}}',
    accent: '{{accentColor}}',
    warmGrey: '#6E6E73',
    text: '#1F2937',
    textLight: '#6B7280',
    neutral: '#F3F4F6',
    neutralDark: '#E5E7EB',
    background: '#FAFAF9',
    danger: '#EF4444',
    success: '#2E5B28',
    warning: '#F59E0B',
    info: '#3B82F6'
  },
  
  // Typography
  fonts: {
    sans: '{{fontSans}}',
    serif: '{{fontSerif}}',
    mono: 'Menlo, Monaco, Consolas, monospace'
  },
  
  // Spacing scale
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  
  // Animation presets
  animations: {
    float: 'float 6s ease-in-out infinite',
    breathe: 'breathe 8s ease-in-out infinite',
    slideUp: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    fadeIn: 'fadeIn 0.3s ease-out',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  },
  
  // Logo and assets
  logo: {
    light: '/assets/logo-light.svg',
    dark: '/assets/logo-dark.svg',
    favicon: '/favicon.ico'
  },
  
  // Social media
  social: {
    twitter: '{{twitterHandle}}',
    github: '{{githubRepo}}',
    website: '{{websiteUrl}}'
  }
};