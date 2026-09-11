export interface ObjectGroupLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  points: Array<{ x: number; y: number; radius: number }>;
}

export function buildObjectGroupLayout(groups: number, itemsPerGroup: number): ObjectGroupLayout[] {
  if (
    !Number.isInteger(groups) ||
    groups < 1 ||
    !Number.isInteger(itemsPerGroup) ||
    itemsPerGroup < 1
  )
    return [];
  const gap = 8;
  const availableWidth = 380;
  const width = Math.min(72, (availableWidth - gap * (groups - 1)) / groups);
  const startX = (420 - (width * groups + gap * (groups - 1))) / 2;
  const columns = Math.max(1, Math.ceil(Math.sqrt(itemsPerGroup)));
  const rows = Math.ceil(itemsPerGroup / columns);
  const cellWidth = width / (columns + 1);
  const cellHeight = 116 / (rows + 1);
  const radius = Math.max(2.5, Math.min(6, cellWidth * 0.28, cellHeight * 0.28));
  return Array.from({ length: groups }, (_, group) => ({
    x: startX + group * (width + gap),
    y: 48,
    width,
    height: 124,
    points: Array.from({ length: itemsPerGroup }, (_, item) => ({
      x: startX + group * (width + gap) + cellWidth * ((item % columns) + 1),
      y: 48 + cellHeight * (Math.floor(item / columns) + 1),
      radius,
    })),
  }));
}

export function buildBarLayout(values: readonly number[]) {
  const maximum = Math.max(1, ...values);
  const gap = 16;
  const availableWidth = 330;
  const width = Math.min(52, (availableWidth - gap * (values.length - 1)) / values.length);
  const startX = 55 + (availableWidth - (width * values.length + gap * (values.length - 1))) / 2;
  return values.map((value, index) => {
    const height = Math.max(2, (Math.max(0, value) / maximum) * 125);
    return { x: startX + index * (width + gap), y: 180 - height, width, height };
  });
}

export function geometryDiagramBox(shape: 'RECTANGLE' | 'SQUARE') {
  return shape === 'SQUARE'
    ? { x: 135, y: 30, width: 150, height: 150 }
    : { x: 85, y: 45, width: 250, height: 130 };
}
