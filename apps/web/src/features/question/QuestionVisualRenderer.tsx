import type { QuestionVisual } from '@math-app/shared';
import { useId } from 'react';
import { buildFractionCircleSectors } from './fractionCircleGeometry';

interface Props {
  visual: QuestionVisual;
}

const palette = ['#39a98d', '#f2b84b', '#5f79d8', '#d77783'];

export function QuestionVisualRenderer({ visual }: Props) {
  const clipId = `fraction-circle-${useId().replace(/:/g, '')}`;
  if (visual.type === 'TABLE') {
    return (
      <div className={'question-visual'} role={'img'} aria-label={visual.alt}>
        <table>
          <thead>
            <tr>
              {visual.headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visual.rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (visual.type === 'MONEY') {
    return (
      <div className={'question-visual money-visual'} role={'img'} aria-label={visual.alt}>
        {visual.notes.map((note, index) => (
          <span key={index}>{note.toLocaleString('vi-VN')}đ</span>
        ))}
      </div>
    );
  }

  return (
    <svg className={'question-visual'} viewBox={'0 0 420 220'} role={'img'} aria-label={visual.alt}>
      {visual.type === 'FRACTION_BAR' && (
        <>
          {Array.from({ length: visual.equalParts }, (_, index) => (
            <rect
              key={index}
              x={30 + index * (360 / visual.equalParts)}
              y={'70'}
              width={360 / visual.equalParts}
              height={'80'}
              fill={index < visual.shadedParts ? palette[0] : '#fff'}
              stroke={'#20443b'}
              strokeWidth={'2'}
              data-fraction-part={index + 1}
              data-shaded={index < visual.shadedParts ? 'true' : 'false'}
            />
          ))}
        </>
      )}
      {visual.type === 'FRACTION_CIRCLE' && (
        <>
          <defs>
            <clipPath id={clipId}>
              <circle cx={'210'} cy={'110'} r={'78'} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {buildFractionCircleSectors(visual.equalParts, visual.shadedParts).map((sector) => (
              <path
                key={sector.index}
                d={sector.path}
                fill={sector.shaded ? palette[0] : '#fff'}
                stroke={'#20443b'}
                strokeWidth={'2'}
                strokeLinejoin={'round'}
                data-fraction-sector={sector.index + 1}
                data-shaded={sector.shaded ? 'true' : 'false'}
                data-start-angle={sector.startAngle}
                data-end-angle={sector.endAngle}
              />
            ))}
          </g>
          <circle
            cx={'210'}
            cy={'110'}
            r={'78'}
            fill={'none'}
            stroke={'#20443b'}
            strokeWidth={'3'}
          />
        </>
      )}
      {visual.type === 'SHAPE' && (
        <>
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
              x={'130'}
              y={'30'}
              width={'160'}
              height={'160'}
              rx={'4'}
              fill={'#dff5ee'}
              stroke={'#287c68'}
              strokeWidth={'4'}
            />
          )}
          {visual.shape === 'RECTANGLE' && (
            <rect
              x={'80'}
              y={'55'}
              width={'260'}
              height={'120'}
              rx={'4'}
              fill={'#dff5ee'}
              stroke={'#287c68'}
              strokeWidth={'4'}
            />
          )}
        </>
      )}
      {visual.type === 'RECTANGLE_GRID' && (
        <>
          {Array.from({ length: visual.rows * visual.columns }, (_, index) => {
            const cellWidth = 300 / visual.columns;
            const cellHeight = 150 / visual.rows;
            return (
              <rect
                key={index}
                x={60 + (index % visual.columns) * cellWidth}
                y={35 + Math.floor(index / visual.columns) * cellHeight}
                width={cellWidth}
                height={cellHeight}
                fill={index < visual.shaded ? '#7ad0b8' : '#fff'}
                stroke={'#315c52'}
              />
            );
          })}
        </>
      )}
      {visual.type === 'NUMBER_LINE' && (
        <>
          <line x1={'35'} y1={'115'} x2={'385'} y2={'115'} stroke={'#315c52'} strokeWidth={'4'} />
          <circle
            cx={35 + ((visual.marker - visual.start) / (visual.end - visual.start)) * 350}
            cy={'115'}
            r={'10'}
            fill={'#e29b25'}
          />
          <text x={'35'} y={'150'} textAnchor={'middle'}>
            {visual.start}
          </text>
          <text x={'385'} y={'150'} textAnchor={'middle'}>
            {visual.end}
          </text>
        </>
      )}
      {visual.type === 'CLOCK' && (
        <>
          <circle
            cx={'210'}
            cy={'105'}
            r={'86'}
            fill={'#fff'}
            stroke={'#315c52'}
            strokeWidth={'4'}
          />

          {Array.from({ length: 60 }, (_, index) => {
            const angle = ((index - 15) * Math.PI) / 30;
            const major = index % 5 === 0;
            const outerRadius = 82;
            const innerRadius = major ? 72 : 77;
            return (
              <line
                key={index}
                data-clock-minute-tick={index}
                x1={210 + Math.cos(angle) * innerRadius}
                y1={105 + Math.sin(angle) * innerRadius}
                x2={210 + Math.cos(angle) * outerRadius}
                y2={105 + Math.sin(angle) * outerRadius}
                stroke={major ? '#315c52' : '#9bb8b1'}
                strokeWidth={major ? 2 : 1}
              />
            );
          })}

          {Array.from({ length: 12 }, (_, index) => {
            const number = index + 1;
            const angle = ((number - 3) * Math.PI) / 6;
            return (
              <text
                key={number}
                x={210 + Math.cos(angle) * 61}
                y={110 + Math.sin(angle) * 61}
                textAnchor={'middle'}
                fontWeight={'700'}
                fontSize={'13'}
              >
                {number}
              </text>
            );
          })}

          <line
            x1={'210'}
            y1={'105'}
            x2={210 + Math.sin((((visual.hour % 12) + visual.minute / 60) * Math.PI) / 6) * 42}
            y2={105 - Math.cos((((visual.hour % 12) + visual.minute / 60) * Math.PI) / 6) * 42}
            stroke={'#315c52'}
            strokeWidth={'7'}
            strokeLinecap={'round'}
          />
          <line
            x1={'210'}
            y1={'105'}
            x2={210 + Math.sin((visual.minute * Math.PI) / 30) * 67}
            y2={105 - Math.cos((visual.minute * Math.PI) / 30) * 67}
            stroke={'#d77783'}
            strokeWidth={'4'}
            strokeLinecap={'round'}
          />
          <circle cx={'210'} cy={'105'} r={'6'} fill={'#315c52'} />

          <line x1={'135'} y1={'204'} x2={'158'} y2={'204'} stroke={'#315c52'} strokeWidth={'6'} />
          <text x={'164'} y={'209'} fontSize={'12'}>
            Kim giờ
          </text>
          <line x1={'245'} y1={'204'} x2={'268'} y2={'204'} stroke={'#d77783'} strokeWidth={'4'} />
          <text x={'274'} y={'209'} fontSize={'12'}>
            Kim phút
          </text>
        </>
      )}
      {visual.type === 'RULER' && (
        <>
          <rect
            x={'35'}
            y={'75'}
            width={'350'}
            height={'70'}
            rx={'8'}
            fill={'#fff0b8'}
            stroke={'#8b6b1e'}
            strokeWidth={'3'}
          />
          {Array.from({ length: 11 }, (_, index) => (
            <g key={index}>
              <line
                x1={45 + index * 33}
                y1={'75'}
                x2={45 + index * 33}
                y2={index % 5 === 0 ? 115 : 100}
                stroke={'#5a481b'}
                strokeWidth={'2'}
              />
              <text x={45 + index * 33} y={'135'} textAnchor={'middle'}>
                {index}
              </text>
            </g>
          ))}
          <line
            x1={'45'}
            y1={'55'}
            x2={45 + visual.lengthCm * 33}
            y2={'55'}
            stroke={'#d77783'}
            strokeWidth={'6'}
          />
        </>
      )}
      {visual.type === 'BAR_CHART' && (
        <>
          <line x1={'45'} y1={'180'} x2={'390'} y2={'180'} stroke={'#315c52'} strokeWidth={'3'} />
          {visual.bars.map((bar, index) => (
            <g key={bar.label}>
              <rect
                x={70 + index * 80}
                y={180 - bar.value * 10}
                width={'48'}
                height={bar.value * 10}
                fill={palette[index % palette.length]}
                rx={'4'}
              />
              <text x={94 + index * 80} y={'200'} textAnchor={'middle'}>
                {bar.label}
              </text>
              <text x={94 + index * 80} y={170 - bar.value * 10} textAnchor={'middle'}>
                {bar.value}
              </text>
            </g>
          ))}
        </>
      )}
      {visual.type === 'OBJECT_GROUPS' && (
        <>
          {Array.from({ length: visual.groups }, (_, group) => (
            <g key={group}>
              <rect
                x={20 + group * 66}
                y={'50'}
                width={'56'}
                height={'120'}
                rx={'12'}
                fill={'#eef8f5'}
                stroke={'#72af9e'}
              />
              {Array.from({ length: visual.itemsPerGroup }, (_, item) => (
                <circle
                  key={item}
                  cx={48 + group * 66}
                  cy={67 + item * (88 / Math.max(1, visual.itemsPerGroup - 1))}
                  r={'7'}
                  fill={'#e29b25'}
                />
              ))}
            </g>
          ))}
        </>
      )}
      {visual.type === 'GEOMETRY_DIAGRAM' && (
        <>
          <rect
            x={'85'}
            y={'45'}
            width={'250'}
            height={'130'}
            fill={'#eef8f5'}
            stroke={'#287c68'}
            strokeWidth={'4'}
          />
          <text x={'210'} y={'205'} textAnchor={'middle'}>
            dài {visual.width} {visual.unit}
          </text>
          <text x={'55'} y={'115'} textAnchor={'middle'} transform={'rotate(-90 55 115)'}>
            rộng {visual.height} {visual.unit}
          </text>
        </>
      )}
    </svg>
  );
}
