/** Points for a starburst polygon, used by the tabloid artwork. */
export function burst(cx: number, cy: number, outer: number, inner: number, spikes: number, turn = 0) {
  return Array.from({ length: spikes * 2 }, (_, i) => {
    const radius = i % 2 ? inner : outer;
    const angle = (Math.PI * i) / spikes + turn;
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}
