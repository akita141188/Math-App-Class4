export interface FractionCircleSector {
  index: number;
  startAngle: number;
  endAngle: number;
  path: string;
  shaded: boolean;
}

function pointOnCircle(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function buildFractionCircleSectors(
  equalParts: number,
  shadedParts: number,
  cx = 210,
  cy = 110,
  radius = 78,
): FractionCircleSector[] {
  if (!Number.isInteger(equalParts) || equalParts < 2) return [];
  const sectorAngle = (Math.PI * 2) / equalParts;
  return Array.from({ length: equalParts }, (_, index) => {
    const startAngle = -Math.PI / 2 + index * sectorAngle;
    const endAngle = startAngle + sectorAngle;
    const start = pointOnCircle(cx, cy, radius, startAngle);
    const end = pointOnCircle(cx, cy, radius, endAngle);
    const path = [
      `M ${cx} ${cy}`,
      `L ${start.x.toFixed(6)} ${start.y.toFixed(6)}`,
      `A ${radius} ${radius} 0 ${sectorAngle > Math.PI ? 1 : 0} 1 ${end.x.toFixed(6)} ${end.y.toFixed(6)}`,
      'Z',
    ].join(' ');
    return { index, startAngle, endAngle, path, shaded: index < shadedParts };
  });
}
