import type { QuestionVisual } from '@math-app/shared';
import { QuestionVisualRenderer } from './QuestionVisualRenderer';
import { buildBarLayout, buildObjectGroupLayout, geometryDiagramBox } from './visualGeometry';

function ShapeVisual({
  visual,
}: {
  visual: Extract<QuestionVisual, { type: 'SHAPE' }> & { rotationDegrees?: number };
}) {
  const rotation = visual.rotationDegrees ?? 0;
  return (
    <svg className={'question-visual'} viewBox={'0 0 420 220'} role={'img'} aria-label={visual.alt}>
      <g transform={`rotate(${rotation} 210 110)`}>
        {visual.shape === 'CIRCLE' && (
          <circle
            cx={'210'}
            cy={'110'}
            r={'72'}
            fill={'#dff5ee'}
            stroke={'#287c68'}
            strokeWidth={'4'}
          />
        )}
        {visual.shape === 'TRIANGLE' && (
          <polygon
            points={'210,28 110,182 310,182'}
            fill={'#fff0c8'}
            stroke={'#9b6b12'}
            strokeWidth={'4'}
          />
        )}
        {visual.shape === 'SQUARE' && (
          <rect
            x={'145'}
            y={'45'}
            width={'130'}
            height={'130'}
            rx={'4'}
            fill={'#dff5ee'}
            stroke={'#287c68'}
            strokeWidth={'4'}
          />
        )}
        {visual.shape === 'RECTANGLE' && (
          <rect
            x={'105'}
            y={'65'}
            width={'210'}
            height={'90'}
            rx={'4'}
            fill={'#dff5ee'}
            stroke={'#287c68'}
            strokeWidth={'4'}
          />
        )}
      </g>
    </svg>
  );
}

export function QuestionVisualRendererV2({ visual }: { visual: QuestionVisual }) {
  if (visual.type === 'SHAPE') return <ShapeVisual visual={visual} />;

  if (visual.type === 'OBJECT_GROUPS') {
    const layout = buildObjectGroupLayout(visual.groups, visual.itemsPerGroup);
    return (
      <svg
        className={'question-visual'}
        viewBox={'0 0 420 220'}
        role={'img'}
        aria-label={visual.alt}
      >
        {layout.map((group, groupIndex) => (
          <g key={groupIndex}>
            <rect
              x={group.x}
              y={group.y}
              width={group.width}
              height={group.height}
              rx={'10'}
              fill={'#eef8f5'}
              stroke={'#72af9e'}
            />
            {group.points.map((point, pointIndex) => (
              <circle
                key={pointIndex}
                cx={point.x}
                cy={point.y}
                r={point.radius}
                fill={'#e29b25'}
              />
            ))}
          </g>
        ))}
      </svg>
    );
  }

  if (visual.type === 'BAR_CHART') {
    const layout = buildBarLayout(visual.bars.map((bar) => bar.value));
    return (
      <svg
        className={'question-visual'}
        viewBox={'0 0 420 220'}
        role={'img'}
        aria-label={visual.alt}
      >
        <line x1={'45'} y1={'180'} x2={'390'} y2={'180'} stroke={'#315c52'} strokeWidth={'3'} />
        {visual.bars.map((bar, index) => {
          const box = layout[index]!;
          return (
            <g key={bar.label}>
              <rect {...box} fill={'#39a98d'} rx={'4'} />
              <text x={box.x + box.width / 2} y={'202'} textAnchor={'middle'}>
                {bar.label}
              </text>
              <text x={box.x + box.width / 2} y={box.y - 7} textAnchor={'middle'}>
                {bar.value}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (visual.type === 'GEOMETRY_DIAGRAM') {
    const box = geometryDiagramBox(visual.shape);
    return (
      <svg
        className={'question-visual'}
        viewBox={'0 0 420 220'}
        role={'img'}
        aria-label={visual.alt}
      >
        <rect {...box} fill={'#eef8f5'} stroke={'#287c68'} strokeWidth={'4'} />
        <text x={'210'} y={'210'} textAnchor={'middle'}>
          {visual.shape === 'SQUARE' ? 'cạnh' : 'dài'} {visual.width} {visual.unit}
        </text>
        {visual.shape === 'RECTANGLE' && (
          <text x={'55'} y={'115'} textAnchor={'middle'} transform={'rotate(-90 55 115)'}>
            rộng {visual.height} {visual.unit}
          </text>
        )}
      </svg>
    );
  }

  if (visual.type === 'ANGLE') {
    const length = 78;
    const radians = (visual.degrees * Math.PI) / 180;
    const end = { x: 210 + Math.cos(radians) * length, y: 120 - Math.sin(radians) * length };
    return (
      <svg
        className={'question-visual'}
        viewBox={'0 0 420 220'}
        role={'img'}
        aria-label={visual.alt}
      >
        <g transform={`rotate(${visual.rotationDegrees} 210 120)`}>
          <line x1={'210'} y1={'120'} x2={'310'} y2={'120'} stroke={'#287c68'} strokeWidth={'5'} />
          <line x1={'210'} y1={'120'} x2={end.x} y2={end.y} stroke={'#287c68'} strokeWidth={'5'} />
          {visual.degrees === 90 && (
            <polyline
              points={'230,120 230,100 210,100'}
              fill={'none'}
              stroke={'#d77783'}
              strokeWidth={'3'}
            />
          )}
        </g>
      </svg>
    );
  }

  if (visual.type === 'LINE_RELATION') {
    const parallel = visual.relation === 'PARALLEL';
    const separation = visual.separation ?? 36;
    const firstLineY = 110 - separation / 2;
    const rotation = visual.rotationDegrees ?? 0;
    return (
      <svg
        className={'question-visual'}
        viewBox={'0 0 420 220'}
        role={'img'}
        aria-label={visual.alt}
      >
        <g transform={`rotate(${rotation} 210 110)`}>
          <line
            x1={'95'}
            y1={firstLineY}
            x2={'325'}
            y2={firstLineY}
            stroke={'#287c68'}
            strokeWidth={'5'}
          />
          <line
            x1={parallel ? 95 : 210}
            y1={parallel ? 110 + separation / 2 : 35}
            x2={parallel ? 325 : 210}
            y2={parallel ? 110 + separation / 2 : 185}
            stroke={'#287c68'}
            strokeWidth={'5'}
          />
          {!parallel && (
            <polyline
              points={`210,${firstLineY} 230,${firstLineY} 230,${firstLineY - 20} 210,${firstLineY - 20}`}
              fill={'none'}
              stroke={'#d77783'}
              strokeWidth={'3'}
            />
          )}
        </g>
      </svg>
    );
  }

  if (visual.type === 'QUADRILATERAL') {
    const skew = visual.skew ?? 24;
    const rotation = visual.rotationDegrees ?? 0;
    const points =
      visual.shape === 'RHOMBUS'
        ? '210,45 285,110 210,175 135,110'
        : `${135 + skew / 2},60 ${295 + skew / 4},60 ${275 - skew / 2},160 ${115 - skew / 4},160`;
    return (
      <svg
        className={'question-visual'}
        viewBox={'0 0 420 220'}
        role={'img'}
        aria-label={visual.alt}
      >
        <polygon
          points={points}
          transform={`rotate(${rotation} 210 110)`}
          fill={'#dff5ee'}
          stroke={'#287c68'}
          strokeWidth={'4'}
        />
      </svg>
    );
  }

  return <QuestionVisualRenderer visual={visual} />;
}
