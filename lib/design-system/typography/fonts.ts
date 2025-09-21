/**
 * Typography System
 * Based on Linear's approach using Inter Display for headings and Inter for body
 */

import { Inter } from 'next/font/google';

// Inter for body text - optimized for readability
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600'],
});

// Inter Display for headings - more expressive
// Note: Inter Display is part of Inter variable font
export const interDisplay = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-display',
  weight: ['500', '600', '700', '800'],
});

// Typography scale based on Linear's system
export const typographyScale = {
  // Display styles (Inter Display)
  displayLarge: {
    fontFamily: 'var(--font-inter-display)',
    fontSize: '3.5rem', // 56px
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontWeight: 700,
  },
  displayMedium: {
    fontFamily: 'var(--font-inter-display)',
    fontSize: '2.75rem', // 44px
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
    fontWeight: 700,
  },
  displaySmall: {
    fontFamily: 'var(--font-inter-display)',
    fontSize: '2.25rem', // 36px
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontWeight: 600,
  },
  
  // Heading styles (Inter Display)
  h1: {
    fontFamily: 'var(--font-inter-display)',
    fontSize: '1.875rem', // 30px
    lineHeight: '1.3',
    letterSpacing: '-0.01em',
    fontWeight: 600,
  },
  h2: {
    fontFamily: 'var(--font-inter-display)',
    fontSize: '1.5rem', // 24px
    lineHeight: '1.35',
    letterSpacing: '-0.01em',
    fontWeight: 600,
  },
  h3: {
    fontFamily: 'var(--font-inter-display)',
    fontSize: '1.25rem', // 20px
    lineHeight: '1.4',
    letterSpacing: '-0.005em',
    fontWeight: 600,
  },
  h4: {
    fontFamily: 'var(--font-inter-display)',
    fontSize: '1.125rem', // 18px
    lineHeight: '1.45',
    letterSpacing: '-0.005em',
    fontWeight: 600,
  },
  
  // Body styles (Inter)
  bodyLarge: {
    fontFamily: 'var(--font-inter)',
    fontSize: '1rem', // 16px
    lineHeight: '1.6',
    letterSpacing: '0',
    fontWeight: 400,
  },
  bodyBase: {
    fontFamily: 'var(--font-inter)',
    fontSize: '0.875rem', // 14px
    lineHeight: '1.6',
    letterSpacing: '0',
    fontWeight: 400,
  },
  bodySmall: {
    fontFamily: 'var(--font-inter)',
    fontSize: '0.8125rem', // 13px
    lineHeight: '1.6',
    letterSpacing: '0',
    fontWeight: 400,
  },
  
  // UI text styles
  labelLarge: {
    fontFamily: 'var(--font-inter)',
    fontSize: '0.875rem', // 14px
    lineHeight: '1.4',
    letterSpacing: '0.01em',
    fontWeight: 500,
  },
  labelBase: {
    fontFamily: 'var(--font-inter)',
    fontSize: '0.8125rem', // 13px
    lineHeight: '1.4',
    letterSpacing: '0.01em',
    fontWeight: 500,
  },
  labelSmall: {
    fontFamily: 'var(--font-inter)',
    fontSize: '0.75rem', // 12px
    lineHeight: '1.4',
    letterSpacing: '0.01em',
    fontWeight: 500,
  },
  
  // Caption styles
  caption: {
    fontFamily: 'var(--font-inter)',
    fontSize: '0.6875rem', // 11px
    lineHeight: '1.4',
    letterSpacing: '0.02em',
    fontWeight: 400,
  },
  
  // Code styles
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '0.8125rem', // 13px
    lineHeight: '1.6',
    letterSpacing: '0',
    fontWeight: 400,
  },
  
  // Button styles
  button: {
    fontFamily: 'var(--font-inter)',
    fontSize: '0.875rem', // 14px
    lineHeight: '1',
    letterSpacing: '0.02em',
    fontWeight: 500,
  },
  buttonSmall: {
    fontFamily: 'var(--font-inter)',
    fontSize: '0.8125rem', // 13px
    lineHeight: '1',
    letterSpacing: '0.02em',
    fontWeight: 500,
  },
};

/**
 * Generate CSS for typography system
 */
export function generateTypographyCss(): string {
  const styles: string[] = [];
  
  // Generate utility classes for each typography style
  Object.entries(typographyScale).forEach(([name, style]) => {
    const className = name.replace(/([A-Z])/g, '-$1').toLowerCase();
    const cssProperties = Object.entries(style)
      .map(([prop, value]) => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${cssProp}: ${value};`;
      })
      .join('\n');
    
    styles.push(`.text-${className} {\n${cssProperties}\n}`);
  });
  
  // Add responsive font size adjustments
  styles.push(`
@media (max-width: 768px) {
  .text-display-large { font-size: 2.5rem; }
  .text-display-medium { font-size: 2rem; }
  .text-display-small { font-size: 1.75rem; }
  .text-h1 { font-size: 1.5rem; }
  .text-h2 { font-size: 1.25rem; }
  .text-h3 { font-size: 1.125rem; }
}
  `);
  
  // Add text color utilities that use our color system
  styles.push(`
.text-base { color: var(--fg-base); }
.text-subtle { color: var(--fg-subtle); }
.text-muted { color: var(--fg-muted); }
.text-disabled { color: var(--fg-disabled); }
.text-accent { color: var(--accent-base); }
.text-success { color: var(--success); }
.text-warning { color: var(--warning); }
.text-danger { color: var(--danger); }
.text-info { color: var(--info); }
  `);
  
  // Add font weight utilities
  styles.push(`
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
  `);
  
  return styles.join('\n');
}

/**
 * Typography component props
 */
export interface TypographyProps {
  variant: keyof typeof typographyScale;
  color?: 'base' | 'subtle' | 'muted' | 'disabled' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  className?: string;
}