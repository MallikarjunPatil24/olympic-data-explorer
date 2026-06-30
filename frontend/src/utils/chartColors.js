// Shared Olympic colors mapped directly to theme CSS variables.
// This allows SVG elements in Recharts to dynamically transition colors when the theme shifts.
export const CHART_COLORS = [
  'var(--accent-blue)',   // Blue (#0085C7)
  'var(--accent-gold)',   // Yellow (#F4C300)
  'var(--accent-red)',    // Red (#DF0024)
  'var(--accent-green)',  // Green (#009F3D)
  'var(--accent-silver)', // Silver (#C8C8C8)
  'var(--accent-bronze)', // Bronze (#CD7F32)
];

export function getChartColors(theme) {
  const isDark = theme === 'dark';
  return [
    '#0085C7',
    '#F4C300',
    '#DF0024',
    '#009F3D',
    '#C8C8C8',
    '#CD7F32'
  ];
}

export default CHART_COLORS;
