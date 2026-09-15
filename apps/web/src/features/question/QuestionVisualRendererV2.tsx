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
    const mode = visual.mode ?? 'CLASSIFY';
    const vertexLabel = visual.vertexLabel ?? 'O';
    const [firstRayLabel, secondRayLabel] = visual.rayLabels ?? ['A', 'B'];

    if (mode === 'MEASURE') {
      const cx = 210;
      const cy = 142;
      const radius = 94;
      const radians = (visual.degrees * Math.PI) / 180;
      const target = {
        x: cx + Math.cos(radians) * radius,
        y: cy - Math.sin(radians) * radius,
      };
      const arcRadius = 34;
      const arcTarget = {
        x: cx + Math.cos(radians) * arcRadius,
        y: cy - Math.sin(radians) * arcRadius,
      };

      return (
        <svg
          className={'question-visual'}
          viewBox={'0 0 420 240'}
          role={'img'}
          aria-label={visual.alt}
          data-angle-mode={'MEASURE'}
        >
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill={'none'}
            stroke={'#8fb8ad'}
            strokeWidth={'2'}
          />

          {Array.from({ length: 37 }, (_, index) => {
            const degree = index * 5;
            const tickRadians = (degree * Math.PI) / 180;
            const major = degree % 10 === 0;
            const inner = radius - (major ? 13 : 7);
            return (
              <line
                key={degree}
                data-protractor-tick={degree}
                x1={cx + Math.cos(tickRadians) * inner}
                y1={cy - Math.sin(tickRadians) * inner}
                x2={cx + Math.cos(tickRadians) * radius}
                y2={cy - Math.sin(tickRadians) * radius}
                stroke={major ? '#315c52' : '#8fb8ad'}
                strokeWidth={major ? 2 : 1}
              />
            );
          })}

          {[0, 30, 60, 90, 120, 150, 180].map((degree) => {
            const labelRadians = (degree * Math.PI) / 180;
            const labelRadius = radius - 25;
            return (
              <text
                key={degree}
                x={cx + Math.cos(labelRadians) * labelRadius}
                y={cy - Math.sin(labelRadians) * labelRadius + 4}
                textAnchor={'middle'}
                fontSize={'11'}
                fill={'#315c52'}
              >
                {degree}°
              </text>
            );
          })}

          <line x1={cx} y1={cy} x2={cx + radius} y2={cy} stroke={'#287c68'} strokeWidth={'5'} />
          <line x1={cx} y1={cy} x2={target.x} y2={target.y} stroke={'#287c68'} strokeWidth={'5'} />
          <path
            d={`M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 0 ${arcTarget.x} ${arcTarget.y}`}
            fill={'none'}
            stroke={'#e29b25'}
            strokeWidth={'3'}
          />
          <circle cx={cx} cy={cy} r={'5'} fill={'#315c52'} />

          <text x={cx - 4} y={cy + 19} textAnchor={'end'} fontWeight={'700'}>
            {vertexLabel}
          </text>
          <text x={cx + radius + 12} y={cy + 5} fontWeight={'700'}>
            {firstRayLabel}
          </text>
          <text x={target.x - 8} y={target.y - 8} textAnchor={'middle'} fontWeight={'700'}>
            {secondRayLabel}
          </text>

          <text x={'210'} y={'207'} textAnchor={'middle'} fontSize={'12'} fontWeight={'700'}>
            Thước đo góc
          </text>
          <text x={'210'} y={'225'} textAnchor={'middle'} fontSize={'12'} fill={'#60756f'}>
            Đặt OA trùng vạch 0° rồi đọc vạch mà OB đi qua
          </text>
        </svg>
      );
    }

    const length = 84;
    const radians = (visual.degrees * Math.PI) / 180;
    const end = { x: 210 + Math.cos(radians) * length, y: 120 - Math.sin(radians) * length };
    const arcRadius = 30;
    const arcEnd = {
      x: 210 + Math.cos(radians) * arcRadius,
      y: 120 - Math.sin(radians) * arcRadius,
    };

    return (
      <svg
        className={'question-visual'}
        viewBox={'0 0 420 220'}
        role={'img'}
        aria-label={visual.alt}
        data-angle-mode={'CLASSIFY'}
      >
        <g transform={`rotate(${visual.rotationDegrees ?? 0} 210 120)`}>
          <line x1={'210'} y1={'120'} x2={'310'} y2={'120'} stroke={'#287c68'} strokeWidth={'5'} />
          <line x1={'210'} y1={'120'} x2={end.x} y2={end.y} stroke={'#287c68'} strokeWidth={'5'} />
          {visual.degrees === 90 ? (
            <polyline
              points={'230,120 230,100 210,100'}
              fill={'none'}
              stroke={'#e29b25'}
              strokeWidth={'3'}
            />
          ) : (
            <path
              d={`M 240 120 A ${arcRadius} ${arcRadius} 0 0 0 ${arcEnd.x} ${arcEnd.y}`}
              fill={'none'}
              stroke={'#e29b25'}
              strokeWidth={'3'}
            />
          )}
          <circle cx={'210'} cy={'120'} r={'5'} fill={'#315c52'} />
          <text x={'204'} y={'143'} textAnchor={'end'} fontWeight={'700'}>
            {vertexLabel}
          </text>
          <text x={'320'} y={'125'} fontWeight={'700'}>
            {firstRayLabel}
          </text>
          <text x={end.x - 7} y={end.y - 7} textAnchor={'middle'} fontWeight={'700'}>
            {secondRayLabel}
          </text>
        </g>

        <g data-angle-reference={'RIGHT_ANGLE'} transform={'translate(300 22)'}>
          <rect
            x={'0'}
            y={'0'}
            width={'102'}
            height={'72'}
            rx={'12'}
            fill={'#fffaf0'}
            stroke={'#e8c66f'}
          />
          <text x={'51'} y={'18'} textAnchor={'middle'} fontSize={'11'} fontWeight={'700'}>
            Góc vuông
          </text>
          <line x1={'23'} y1={'53'} x2={'23'} y2={'29'} stroke={'#315c52'} strokeWidth={'3'} />
          <line x1={'23'} y1={'53'} x2={'47'} y2={'53'} stroke={'#315c52'} strokeWidth={'3'} />
          <polyline
            points={'23,42 34,42 34,53'}
            fill={'none'}
            stroke={'#e29b25'}
            strokeWidth={'2'}
          />
          <text x={'73'} y={'50'} textAnchor={'middle'} fontSize={'13'} fontWeight={'700'}>
            90°
          </text>
        </g>
      </svg>
    );
  }

  if (visual.type === 'TIME_LINE') {
    const formatTime = (hour: number, minute: number) =>
      `${hour}:${String(minute).padStart(2, '0')}`;
    const endText =
      visual.hideEnd || visual.endHour === undefined || visual.endMinute === undefined
        ? '?'
        : formatTime(visual.endHour, visual.endMinute);

    return (
      <svg
        className={'question-visual'}
        viewBox={'0 0 420 220'}
        role={'img'}
        aria-label={visual.alt}
        data-time-line={'true'}
      >
        <text x={'85'} y={'52'} textAnchor={'middle'} fontSize={'13'} fill={'#60756f'}>
          Bắt đầu
        </text>
        <text x={'335'} y={'52'} textAnchor={'middle'} fontSize={'13'} fill={'#60756f'}>
          Kết thúc
        </text>

        <line x1={'85'} y1={'110'} x2={'335'} y2={'110'} stroke={'#315c52'} strokeWidth={'4'} />
        <polygon points={'335,110 322,102 322,118'} fill={'#315c52'} />
        <circle cx={'85'} cy={'110'} r={'9'} fill={'#39a98d'} />
        <circle cx={'335'} cy={'110'} r={'9'} fill={'#e29b25'} />

        <rect x={'164'} y={'73'} width={'172'} height={'34'} rx={'17'} fill={'#fff4d6'} />
        <text x={'250'} y={'95'} textAnchor={'middle'} fontWeight={'700'} fill={'#8a5a00'}>
          +{visual.durationMinutes} phút
        </text>

        <text x={'85'} y={'145'} textAnchor={'middle'} fontSize={'20'} fontWeight={'700'}>
          {formatTime(visual.startHour, visual.startMinute)}
        </text>
        <text x={'335'} y={'145'} textAnchor={'middle'} fontSize={'20'} fontWeight={'700'}>
          {endText}
        </text>
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
