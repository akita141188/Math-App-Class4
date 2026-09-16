import type { ProblemBlueprint } from '../catalog.data';
import { formatVi } from './content-math';
import type { GeneratedCore } from './generator-types';

function numeric(
  blueprint: ProblemBlueprint,
  template: number,
  params: Record<string, string | number | boolean>,
  stem: string,
  answer: number,
  strategy: string,
  explanation: string,
  unit?: string,
): GeneratedCore {
  const gap = Math.max(1, Math.floor(Math.abs(answer) / 10));
  return {
    templateId: `${blueprint.id}-t${template + 1}`,
    params,
    stem,
    expectedAnswer: { kind: 'NUMBER', value: answer, unit },
    answerLabel: `${answer}${unit ? ` ${unit}` : ''}`,
    distractors: [answer + gap, Math.max(0, answer - gap), answer + gap * 2].map(
      (value) => `${value}${unit ? ` ${unit}` : ''}`,
    ),
    hints: [
      'Xác định dữ kiện và đơn vị của từng đại lượng.',
      strategy,
      'Thực hiện phép tính rồi viết đáp số kèm đơn vị nếu đề yêu cầu.',
    ],
    explanation,
    answerUnit: unit,
  };
}

interface UnitConversionTemplate {
  majorUnit: string;
  targetUnit: string;
  majorFactor: number;
  minorUnit?: string;
  minorFactor?: number;
}

function unitConversion(
  blueprint: ProblemBlueprint,
  template: number,
  serial: number,
  level: number,
  spec: UnitConversionTemplate,
): GeneratedCore {
  const major = 2 + serial + level * 10;
  const minorFactor = spec.minorFactor ?? 0;
  const minorRange = spec.minorUnit
    ? Math.max(2, Math.floor(spec.majorFactor / Math.max(1, minorFactor)))
    : 1;
  const minor = spec.minorUnit
    ? 1 + (((serial - 1) * (template + 3) + level * 5) % (minorRange - 1))
    : 0;
  const answer = major * spec.majorFactor + minor * minorFactor;
  const source = spec.minorUnit
    ? `${major} ${spec.majorUnit} ${minor} ${spec.minorUnit}`
    : `${major} ${spec.majorUnit}`;
  const minorRelation = spec.minorUnit
    ? ` và 1 ${spec.minorUnit} = ${minorFactor} ${spec.targetUnit}`
    : '';
  const calculation = spec.minorUnit
    ? `${major} × ${formatVi(spec.majorFactor)} + ${minor} × ${formatVi(minorFactor)}`
    : `${major} × ${formatVi(spec.majorFactor)}`;

  return numeric(
    blueprint,
    template,
    {
      major,
      minor,
      majorFactor: spec.majorFactor,
      minorFactor,
      majorUnit: spec.majorUnit,
      minorUnit: spec.minorUnit ?? '',
      targetUnit: spec.targetUnit,
      mixed: Boolean(spec.minorUnit),
    },
    `${source} bằng bao nhiêu ${spec.targetUnit}?`,
    answer,
    `Đổi từng phần về ${spec.targetUnit}, rồi cộng các kết quả.`,
    `Vì 1 ${spec.majorUnit} = ${formatVi(spec.majorFactor)} ${spec.targetUnit}${minorRelation}, ta có ${calculation} = ${formatVi(answer)} ${spec.targetUnit}.`,
    spec.targetUnit,
  );
}

export function generateAppliedCore(
  blueprint: ProblemBlueprint,
  index: number,
): GeneratedCore | null {
  const template = index % 5;
  const serial = Math.floor(index / 5) + 1;
  const level = index < 30 ? 0 : index < 80 ? 1 : 2;
  const id = blueprint.id;

  if (id === 'length-conversion') {
    const specs: UnitConversionTemplate[] = [
      { majorUnit: 'dm', targetUnit: 'cm', majorFactor: 10 },
      { majorUnit: 'm', minorUnit: 'cm', targetUnit: 'cm', majorFactor: 100, minorFactor: 1 },
      { majorUnit: 'km', minorUnit: 'm', targetUnit: 'm', majorFactor: 1_000, minorFactor: 1 },
      { majorUnit: 'cm', targetUnit: 'mm', majorFactor: 10 },
      { majorUnit: 'dm', minorUnit: 'mm', targetUnit: 'mm', majorFactor: 100, minorFactor: 1 },
    ];
    return unitConversion(blueprint, template, serial, level, specs[template]!);
  }

  if (id === 'mass-conversion') {
    const specs: UnitConversionTemplate[] = [
      { majorUnit: 'kg', targetUnit: 'g', majorFactor: 1_000 },
      { majorUnit: 'yến', minorUnit: 'kg', targetUnit: 'kg', majorFactor: 10, minorFactor: 1 },
      { majorUnit: 'tạ', minorUnit: 'yến', targetUnit: 'kg', majorFactor: 100, minorFactor: 10 },
      { majorUnit: 'tạ', targetUnit: 'kg', majorFactor: 100 },
      { majorUnit: 'tấn', minorUnit: 'yến', targetUnit: 'kg', majorFactor: 1_000, minorFactor: 10 },
    ];
    return unitConversion(blueprint, template, serial, level, specs[template]!);
  }

  if (id === 'area-conversion') {
    const specs: UnitConversionTemplate[] = [
      { majorUnit: 'm²', targetUnit: 'dm²', majorFactor: 100 },
      { majorUnit: 'dm²', minorUnit: 'cm²', targetUnit: 'cm²', majorFactor: 100, minorFactor: 1 },
      { majorUnit: 'cm²', minorUnit: 'mm²', targetUnit: 'mm²', majorFactor: 100, minorFactor: 1 },
      { majorUnit: 'm²', targetUnit: 'cm²', majorFactor: 10_000 },
      {
        majorUnit: 'dm²',
        minorUnit: 'mm²',
        targetUnit: 'mm²',
        majorFactor: 10_000,
        minorFactor: 1,
      },
    ];
    return unitConversion(blueprint, template, serial, level, specs[template]!);
  }

  if (id === 'compare-measurements') {
    const specs: UnitConversionTemplate[] = [
      { majorUnit: 'm', minorUnit: 'cm', targetUnit: 'cm', majorFactor: 100, minorFactor: 1 },
      { majorUnit: 'tạ', minorUnit: 'kg', targetUnit: 'kg', majorFactor: 100, minorFactor: 1 },
      { majorUnit: 'dm²', minorUnit: 'cm²', targetUnit: 'cm²', majorFactor: 100, minorFactor: 1 },
      { majorUnit: 'giờ', minorUnit: 'phút', targetUnit: 'phút', majorFactor: 60, minorFactor: 1 },
      { majorUnit: 'tuần', minorUnit: 'ngày', targetUnit: 'ngày', majorFactor: 7, minorFactor: 1 },
    ];
    const spec = specs[template]!;
    const major = 2 + serial + level * 5;
    const minorRange = Math.floor(spec.majorFactor / (spec.minorFactor ?? 1));
    const minor = 1 + (((serial - 1) * (template + 2)) % (minorRange - 1));
    const converted = major * spec.majorFactor + minor * (spec.minorFactor ?? 1);
    const delta = 2 + serial + level;
    const comparison = template % 2 === 0 ? converted + delta : converted - delta;
    const answer = Math.max(converted, comparison);
    return numeric(
      blueprint,
      template,
      {
        major,
        minor,
        majorFactor: spec.majorFactor,
        minorFactor: spec.minorFactor ?? 1,
        majorUnit: spec.majorUnit,
        minorUnit: spec.minorUnit!,
        comparison,
        targetUnit: spec.targetUnit,
      },
      `Đại lượng nào lớn hơn: ${major} ${spec.majorUnit} ${minor} ${spec.minorUnit} hay ${formatVi(comparison)} ${spec.targetUnit}? Trả lời bằng số ${spec.targetUnit} của đại lượng lớn hơn.`,
      answer,
      `Đổi đại lượng ghép về ${spec.targetUnit}, rồi so sánh hai số.`,
      `${major} ${spec.majorUnit} ${minor} ${spec.minorUnit} = ${formatVi(converted)} ${spec.targetUnit}; so sánh với ${formatVi(comparison)} ${spec.targetUnit}, đại lượng lớn hơn là ${formatVi(answer)} ${spec.targetUnit}.`,
      spec.targetUnit,
    );
  }

  if (id === 'read-clock') {
    // 12 hours x 12 five-minute positions = 144 distinct clock states.
    // Step 7 is coprime with 144, so every template gets 20 distinct states.
    const slot = ((serial - 1) * 7 + template * 29) % 144;
    const hour = Math.floor(slot / 12) + 1;
    const minute = (slot % 12) * 5;
    return {
      ...numeric(
        blueprint,
        template,
        { hour, minute },
        `Đồng hồ trong hình chỉ bao nhiêu phút sau ${hour} giờ?`,
        minute,
        'Mỗi số kim phút đi qua tương ứng 5 phút.',
        `Kim phút chỉ ${minute} phút; đồng hồ chỉ ${hour} giờ ${String(minute).padStart(2, '0')} phút.`,
        'phút',
      ),
      visual: { type: 'CLOCK', alt: `Đồng hồ chỉ ${hour} giờ ${minute} phút.`, hour, minute },
    };
  }

  if (id === 'calculate-duration') {
    const startHour = 6 + ((serial + template) % 10);
    const startMinute = [0, 10, 15, 20, 30][template]!;
    const duration = 20 + serial * 5 + level * 30;
    const totalMinutes = startHour * 60 + startMinute + duration;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    const answer = endHour * 100 + endMinute;
    return numeric(
      blueprint,
      template,
      { startHour, startMinute, duration },
      `Một hoạt động bắt đầu lúc ${startHour} giờ ${startMinute} phút và kéo dài ${duration} phút. Hãy viết giờ kết thúc dưới dạng HHMM (ví dụ 9 giờ 05 phút viết 905).`,
      answer,
      'Đổi giờ bắt đầu ra phút, cộng thời lượng rồi đổi lại ra giờ và phút.',
      `${startHour} giờ ${startMinute} phút cộng ${duration} phút là ${endHour} giờ ${String(endMinute).padStart(2, '0')} phút, nên nhập ${answer}.`,
    );
  }

  if (id === 'time-conversion') {
    const specs: UnitConversionTemplate[] = [
      { majorUnit: 'giờ', targetUnit: 'phút', majorFactor: 60 },
      { majorUnit: 'phút', minorUnit: 'giây', targetUnit: 'giây', majorFactor: 60, minorFactor: 1 },
      { majorUnit: 'ngày', minorUnit: 'giờ', targetUnit: 'giờ', majorFactor: 24, minorFactor: 1 },
      { majorUnit: 'tuần', targetUnit: 'ngày', majorFactor: 7 },
      {
        majorUnit: 'thế kỉ',
        minorUnit: 'năm',
        targetUnit: 'năm',
        majorFactor: 100,
        minorFactor: 1,
      },
    ];
    return unitConversion(blueprint, template, serial, level, specs[template]!);
  }

  if (id === 'money-change') {
    // Keep the amount paid realistic while guaranteeing 20 distinct prices per template.
    const paidByTemplate = [50_000, 200_000, 500_000, 1_000_000, 500_000];
    const stepByTemplate = [1_000, 5_000, 10_000, 20_000, 5_000];
    const paid = paidByTemplate[template]!;
    const step = stepByTemplate[template]!;
    const price = step * (serial + template + 2);
    const answer = paid - price;
    return {
      ...numeric(
        blueprint,
        template,
        { paid, price },
        `Một món hàng giá ${formatVi(price)} đồng. Khách trả ${formatVi(paid)} đồng. Người bán trả lại bao nhiêu đồng?`,
        answer,
        'Lấy số tiền khách đưa trừ giá món hàng.',
        `${formatVi(paid)} − ${formatVi(price)} = ${formatVi(answer)} đồng.`,
        'đồng',
      ),
      visual: {
        type: 'MONEY',
        alt: `Số tiền khách đưa có tổng giá trị ${formatVi(paid)} đồng.`,
        notes: [paid],
      },
    };
  }

  if (id === 'count-money') {
    const denominations = [1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000, 200_000, 500_000];
    const variant = serial - 1;
    const baseIndex = template % denominations.length;
    const secondIndex = (template + 1 + (variant % 8)) % denominations.length;
    const repeatCount = 1 + Math.floor(variant / 8);
    const notes = [
      denominations[baseIndex]!,
      ...Array.from({ length: repeatCount }, () => denominations[secondIndex]!),
      ...(variant >= 16 ? [denominations[(template + 5) % denominations.length]!] : []),
    ];
    const answer = notes.reduce((sum, note) => sum + note, 0);
    return {
      ...numeric(
        blueprint,
        template,
        { notes: notes.join('-'), serial },
        'Các tờ tiền trong hình có tổng giá trị bao nhiêu đồng?',
        answer,
        'Cộng giá trị từng tờ tiền, có thể nhóm các tờ cùng mệnh giá.',
        `${notes.map(formatVi).join(' + ')} = ${formatVi(answer)} đồng.`,
        'đồng',
      ),
      visual: {
        type: 'MONEY',
        alt: `Các tờ tiền có mệnh giá ${notes.map(formatVi).join(', ')} đồng.`,
        notes,
      },
    };
  }

  if (id === 'recognize-shapes') {
    const shapes = ['SQUARE', 'RECTANGLE', 'TRIANGLE', 'CIRCLE', 'RECTANGLE'] as const;
    const names = ['hình vuông', 'hình chữ nhật', 'hình tam giác', 'hình tròn', 'hình chữ nhật'];
    const sides = [4, 4, 3, 0, 4];
    return {
      ...numeric(
        blueprint,
        template,
        { shape: shapes[template]!, serial },
        `${names[template]} có bao nhiêu cạnh?`,
        sides[template]!,
        'Quan sát đường bao quanh hình và đếm từng đoạn thẳng.',
        `${names[template]} có ${sides[template]} cạnh.`,
      ),
      visual: { type: 'SHAPE', alt: `Minh họa ${names[template]}.`, shape: shapes[template]! },
    };
  }

  if (id === 'recognize-parallelogram-rhombus') {
    const rhombus = template % 2 === 0;
    const answer = 2;
    return numeric(
      blueprint,
      template,
      { rhombus, serial },
      `${rhombus ? 'Hình thoi' : 'Hình bình hành'} có bao nhiêu cặp cạnh đối diện song song?`,
      answer,
      'Xét từng cặp cạnh đối diện của hình.',
      `${rhombus ? 'Hình thoi' : 'Hình bình hành'} có 2 cặp cạnh đối diện song song.`,
    );
  }

  if (id === 'classify-angles') {
    const degrees = [25, 60, 90, 110, 145][template]! + (template === 2 ? 0 : serial % 5);
    const name =
      degrees < 90
        ? 'góc nhọn'
        : degrees === 90
          ? 'góc vuông'
          : degrees < 180
            ? 'góc tù'
            : 'góc bẹt';
    return {
      templateId: `${id}-t${template + 1}`,
      params: { degrees },
      stem: `Góc có số đo ${degrees}° là góc gì?`,
      expectedAnswer: { kind: 'TEXT', accepted: [name] },
      answerLabel: name,
      distractors: ['góc nhọn', 'góc vuông', 'góc tù', 'góc bẹt'].filter((value) => value !== name),
      hints: [
        'So sánh số đo góc với 90° và 180°.',
        'Góc nhọn bé hơn 90°; góc vuông bằng 90°; góc tù lớn hơn 90° và bé hơn 180°.',
        'Chọn đúng tên theo khoảng chứa số đo đã cho.',
      ],
      explanation: `${degrees}° ${degrees < 90 ? 'bé hơn' : degrees === 90 ? 'bằng' : 'lớn hơn'} 90°, nên đây là ${name}.`,
    };
  }

  if (id === 'parallel-perpendicular' || id === 'perpendicular-lines') {
    const perpendicular = id === 'perpendicular-lines';
    const shape = template % 2 === 0 ? 'hình chữ nhật' : 'hình vuông';
    const answer = perpendicular ? 4 : 2;
    return {
      ...numeric(
        blueprint,
        template,
        { shape, perpendicular, serial },
        `${shape[0]!.toLocaleUpperCase('vi')}${shape.slice(1)} có bao nhiêu cặp cạnh ${perpendicular ? 'vuông góc' : 'song song'}?`,
        answer,
        perpendicular
          ? 'Hai cạnh kề nhau tạo góc vuông.'
          : 'Hai cạnh đối diện có cùng phương và không gặp nhau.',
        `${shape} có ${answer} cặp cạnh ${perpendicular ? 'vuông góc' : 'song song'}.`,
      ),
      visual: {
        type: 'SHAPE',
        alt: `Minh họa ${shape}.`,
        shape: shape === 'hình vuông' ? 'SQUARE' : 'RECTANGLE',
      },
    };
  }

  if (['rectangle-perimeter', 'rectangle-area', 'geometry-word-problem'].includes(id)) {
    const width = 8 + serial + template + level * 4;
    const height = 3 + ((serial + template) % 7);
    const area = id !== 'rectangle-perimeter';
    const answer = area ? width * height : 2 * (width + height);
    const unit = id === 'geometry-word-problem' ? 'm' : 'cm';
    const resultUnit = area ? `${unit}²` : unit;
    const stem =
      id === 'geometry-word-problem'
        ? `Một mảnh vườn hình chữ nhật dài ${width} m, rộng ${height} m. Diện tích mảnh vườn là bao nhiêu mét vuông?`
        : `Hình chữ nhật dài ${width} ${unit}, rộng ${height} ${unit}. Tính ${area ? 'diện tích' : 'chu vi'}.`;
    return {
      ...numeric(
        blueprint,
        template,
        { width, height, area },
        stem,
        answer,
        area ? 'Lấy chiều dài nhân chiều rộng.' : 'Cộng chiều dài và chiều rộng rồi nhân 2.',
        area
          ? `${width} × ${height} = ${answer} ${resultUnit}.`
          : `(${width} + ${height}) × 2 = ${answer} ${resultUnit}.`,
        resultUnit,
      ),
      visual: {
        type: 'GEOMETRY_DIAGRAM',
        alt: `Hình chữ nhật dài ${width} ${unit}, rộng ${height} ${unit}.`,
        shape: 'RECTANGLE',
        width,
        height,
        unit,
      },
    };
  }

  if (id === 'square-perimeter' || id === 'square-area') {
    const side = 3 + serial + template + level * 3;
    const area = id === 'square-area';
    const answer = area ? side * side : side * 4;
    return {
      ...numeric(
        blueprint,
        template,
        { side, area },
        `Hình vuông có cạnh ${side} cm. Tính ${area ? 'diện tích' : 'chu vi'} hình vuông.`,
        answer,
        area ? 'Lấy độ dài cạnh nhân với chính nó.' : 'Lấy độ dài cạnh nhân 4.',
        area ? `${side} × ${side} = ${answer} cm².` : `${side} × 4 = ${answer} cm.`,
        area ? 'cm²' : 'cm',
      ),
      visual: {
        type: 'GEOMETRY_DIAGRAM',
        alt: `Hình vuông có cạnh ${side} cm.`,
        shape: 'SQUARE',
        width: side,
        height: side,
        unit: 'cm',
      },
    };
  }

  if (id === 'two-step-problem') {
    const morning = 20 + serial * 3 + template;
    const more = 8 + serial + level * 4;
    const answer = morning + (morning + more);
    return numeric(
      blueprint,
      template,
      { morning, more },
      `Buổi sáng cửa hàng bán ${morning} hộp. Buổi chiều bán nhiều hơn buổi sáng ${more} hộp. Cả ngày cửa hàng bán bao nhiêu hộp?`,
      answer,
      'Tìm số hộp buổi chiều trước, rồi cộng hai buổi.',
      `Buổi chiều bán ${morning} + ${more} = ${morning + more} hộp; cả ngày bán ${morning} + ${morning + more} = ${answer} hộp.`,
      'hộp',
    );
  }

  if (id === 'average-problem') {
    const average = 20 + serial * 2 + template + level * 5;
    const delta = 2 + template;
    const values = [average - delta, average, average + delta];
    return numeric(
      blueprint,
      template,
      { first: values[0]!, second: values[1]!, third: values[2]! },
      `Ba lớp trồng lần lượt ${values.join(', ')} cây. Trung bình mỗi lớp trồng bao nhiêu cây?`,
      average,
      'Cộng số cây của ba lớp rồi chia cho 3.',
      `(${values.join(' + ')}) : 3 = ${average} cây.`,
      'cây',
    );
  }

  if (id === 'sum-difference-problem') {
    const smaller = 12 + serial * 2 + template + level * 5;
    const difference = 4 + 2 * template;
    const larger = smaller + difference;
    const total = smaller + larger;
    return numeric(
      blueprint,
      template,
      { total, difference },
      `Tổng của hai số là ${total}, hiệu của hai số là ${difference}. Tìm số lớn.`,
      larger,
      'Số lớn bằng (tổng + hiệu) chia 2.',
      `(${total} + ${difference}) : 2 = ${larger}.`,
    );
  }

  if (id === 'unit-rate-problem') {
    const groups = 2 + ((serial + template) % 7);
    const each = 5 + serial + level * 3;
    const total = groups * each;
    const targetGroups = groups + 2 + (template % 3);
    const answer = each * targetGroups;
    return numeric(
      blueprint,
      template,
      { groups, each, total, targetGroups },
      `${groups} hộp như nhau có ${total} chiếc bút. Hỏi ${targetGroups} hộp như thế có bao nhiêu chiếc bút?`,
      answer,
      `Tìm một hộp có bao nhiêu bút bằng ${total} : ${groups}, rồi nhân với ${targetGroups}.`,
      `${total} : ${groups} = ${each}; ${each} × ${targetGroups} = ${answer} chiếc bút.`,
      'chiếc bút',
    );
  }

  if (id === 'read-bar-chart' || id === 'compare-chart-data') {
    const values = [
      5 + serial,
      8 + serial + template,
      6 + serial + level,
      10 + serial + template * 2,
    ];
    const bars = values.map((value, i) => ({ label: `Tổ ${i + 1}`, value }));
    const compare = id === 'compare-chart-data';
    const answer = compare
      ? Math.max(...values) - Math.min(...values)
      : values.reduce((sum, value) => sum + value, 0);
    return {
      ...numeric(
        blueprint,
        template,
        { a: values[0]!, b: values[1]!, c: values[2]!, d: values[3]! },
        compare
          ? 'Trên biểu đồ, tổ đọc nhiều sách nhất hơn tổ đọc ít sách nhất bao nhiêu quyển?'
          : 'Biểu đồ cho biết số sách bốn tổ đã đọc. Cả bốn tổ đọc bao nhiêu quyển?',
        answer,
        compare
          ? 'Đọc cột cao nhất và thấp nhất rồi tính hiệu.'
          : 'Đọc giá trị từng cột rồi cộng lại.',
        compare
          ? `${Math.max(...values)} − ${Math.min(...values)} = ${answer} quyển.`
          : `${values.join(' + ')} = ${answer} quyển.`,
        'quyển',
      ),
      visual: {
        type: 'BAR_CHART',
        alt: `Biểu đồ cột có các giá trị ${values.join(', ')} quyển.`,
        bars,
      },
    };
  }

  if (id === 'read-data-table') {
    const values = [7 + serial, 9 + serial + template, 6 + serial + level];
    const answer = values.reduce((sum, value) => sum + value, 0);
    return {
      ...numeric(
        blueprint,
        template,
        { a: values[0]!, b: values[1]!, c: values[2]! },
        'Bảng cho biết số cây ba lớp đã trồng. Cả ba lớp trồng bao nhiêu cây?',
        answer,
        'Đọc đúng từng hàng rồi cộng ba số liệu.',
        `${values.join(' + ')} = ${answer} cây.`,
        'cây',
      ),
      visual: {
        type: 'TABLE',
        alt: `Bảng số cây ba lớp: ${values.join(', ')}.`,
        headers: ['Lớp', 'Số cây'],
        rows: values.map((value, i) => [`4${String.fromCharCode(65 + i)}`, String(value)]),
      },
    };
  }

  if (id === 'number-pattern') {
    const start = 2 + serial + template;
    const step = 2 + template + level;
    const answer = start + step * 4;
    return numeric(
      blueprint,
      template,
      { start, step },
      `Tìm số tiếp theo: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ...`,
      answer,
      'Tìm hiệu giữa hai số đứng cạnh nhau.',
      `Mỗi số tăng thêm ${step}, nên số tiếp theo là ${answer}.`,
    );
  }

  return null;
}
