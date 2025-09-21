/**
 * Spacing System
 * Based on Linear's precise spacing and alignment principles
 * Uses a consistent 4px base unit
 */

// Base unit for spacing (4px)
const SPACE_UNIT = 4;

// Spacing scale
export const spacing = {
  0: '0',
  px: '1px',
  0.5: `${SPACE_UNIT * 0.5}px`,  // 2px
  1: `${SPACE_UNIT * 1}px`,      // 4px
  1.5: `${SPACE_UNIT * 1.5}px`,  // 6px
  2: `${SPACE_UNIT * 2}px`,      // 8px
  2.5: `${SPACE_UNIT * 2.5}px`,  // 10px
  3: `${SPACE_UNIT * 3}px`,      // 12px
  3.5: `${SPACE_UNIT * 3.5}px`,  // 14px
  4: `${SPACE_UNIT * 4}px`,      // 16px
  5: `${SPACE_UNIT * 5}px`,      // 20px
  6: `${SPACE_UNIT * 6}px`,      // 24px
  7: `${SPACE_UNIT * 7}px`,      // 28px
  8: `${SPACE_UNIT * 8}px`,      // 32px
  9: `${SPACE_UNIT * 9}px`,      // 36px
  10: `${SPACE_UNIT * 10}px`,    // 40px
  11: `${SPACE_UNIT * 11}px`,    // 44px
  12: `${SPACE_UNIT * 12}px`,    // 48px
  14: `${SPACE_UNIT * 14}px`,    // 56px
  16: `${SPACE_UNIT * 16}px`,    // 64px
  20: `${SPACE_UNIT * 20}px`,    // 80px
  24: `${SPACE_UNIT * 24}px`,    // 96px
  28: `${SPACE_UNIT * 28}px`,    // 112px
  32: `${SPACE_UNIT * 32}px`,    // 128px
  36: `${SPACE_UNIT * 36}px`,    // 144px
  40: `${SPACE_UNIT * 40}px`,    // 160px
  44: `${SPACE_UNIT * 44}px`,    // 176px
  48: `${SPACE_UNIT * 48}px`,    // 192px
  52: `${SPACE_UNIT * 52}px`,    // 208px
  56: `${SPACE_UNIT * 56}px`,    // 224px
  60: `${SPACE_UNIT * 60}px`,    // 240px
  64: `${SPACE_UNIT * 64}px`,    // 256px
  72: `${SPACE_UNIT * 72}px`,    // 288px
  80: `${SPACE_UNIT * 80}px`,    // 320px
  96: `${SPACE_UNIT * 96}px`,    // 384px
} as const;

// Border radius scale
export const radius = {
  none: '0',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const;

// Z-index scale for layering
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
  commandPalette: 2000,
} as const;

// Animation durations
export const duration = {
  instant: '0ms',
  fast: '100ms',
  base: '200ms',
  moderate: '300ms',
  slow: '400ms',
  slower: '600ms',
  slowest: '900ms',
} as const;

// Animation easings (matching Linear's smooth animations)
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Custom easings for specific interactions
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Container max widths
export const containers = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

// Layout grids
export const grid = {
  cols: {
    1: 'repeat(1, minmax(0, 1fr))',
    2: 'repeat(2, minmax(0, 1fr))',
    3: 'repeat(3, minmax(0, 1fr))',
    4: 'repeat(4, minmax(0, 1fr))',
    5: 'repeat(5, minmax(0, 1fr))',
    6: 'repeat(6, minmax(0, 1fr))',
    7: 'repeat(7, minmax(0, 1fr))',
    8: 'repeat(8, minmax(0, 1fr))',
    9: 'repeat(9, minmax(0, 1fr))',
    10: 'repeat(10, minmax(0, 1fr))',
    11: 'repeat(11, minmax(0, 1fr))',
    12: 'repeat(12, minmax(0, 1fr))',
    none: 'none',
  },
  gap: spacing,
} as const;

// Shadows (optimized for performance)
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 var(--shadow-base)',
  sm: '0 1px 3px 0 var(--shadow-base), 0 1px 2px -1px var(--shadow-base)',
  base: '0 4px 6px -1px var(--shadow-base), 0 2px 4px -2px var(--shadow-base)',
  md: '0 10px 15px -3px var(--shadow-base), 0 4px 6px -4px var(--shadow-base)',
  lg: '0 20px 25px -5px var(--shadow-base), 0 8px 10px -6px var(--shadow-base)',
  xl: '0 25px 50px -12px var(--shadow-elevated)',
  '2xl': '0 35px 60px -15px var(--shadow-elevated)',
  inner: 'inset 0 2px 4px 0 var(--shadow-base)',
  // Glass morphism shadow
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
} as const;

/**
 * Generate CSS custom properties for spacing system
 */
export function generateSpacingCss(): string {
  const properties: string[] = [];
  
  // Spacing properties
  Object.entries(spacing).forEach(([key, value]) => {
    properties.push(`  --space-${key}: ${value};`);
  });
  
  // Radius properties
  Object.entries(radius).forEach(([key, value]) => {
    properties.push(`  --radius-${key}: ${value};`);
  });
  
  // Duration properties
  Object.entries(duration).forEach(([key, value]) => {
    properties.push(`  --duration-${key}: ${value};`);
  });
  
  // Z-index properties
  Object.entries(zIndex).forEach(([key, value]) => {
    properties.push(`  --z-${key}: ${value};`);
  });
  
  return `:root {\n${properties.join('\n')}\n}`;
}

/**
 * Utility function to get spacing value
 */
export function getSpacing(value: keyof typeof spacing): string {
  return spacing[value];
}

/**
 * Utility function to create responsive spacing
 */
export function responsiveSpacing(
  base: keyof typeof spacing,
  sm?: keyof typeof spacing,
  md?: keyof typeof spacing,
  lg?: keyof typeof spacing,
  xl?: keyof typeof spacing
): string {
  let css = `${spacing[base]}`;
  
  if (sm) css += ` sm:${spacing[sm]}`;
  if (md) css += ` md:${spacing[md]}`;
  if (lg) css += ` lg:${spacing[lg]}`;
  if (xl) css += ` xl:${spacing[xl]}`;
  
  return css;
}

/**
 * Create consistent spacing for components
 */
export const componentSpacing = {
  // Padding
  button: {
    sm: { x: spacing[2], y: spacing[1] },
    base: { x: spacing[3], y: spacing[2] },
    lg: { x: spacing[4], y: spacing[2.5] },
  },
  input: {
    sm: { x: spacing[2.5], y: spacing[1.5] },
    base: { x: spacing[3], y: spacing[2] },
    lg: { x: spacing[3.5], y: spacing[2.5] },
  },
  card: {
    sm: spacing[3],
    base: spacing[4],
    lg: spacing[6],
  },
  modal: {
    sm: spacing[4],
    base: spacing[6],
    lg: spacing[8],
  },
  // Gaps
  stack: {
    xs: spacing[1],
    sm: spacing[2],
    base: spacing[3],
    md: spacing[4],
    lg: spacing[6],
    xl: spacing[8],
  },
  inline: {
    xs: spacing[0.5],
    sm: spacing[1],
    base: spacing[2],
    md: spacing[3],
    lg: spacing[4],
    xl: spacing[6],
  },
} as const;