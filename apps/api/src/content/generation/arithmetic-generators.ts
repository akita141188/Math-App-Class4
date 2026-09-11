import type { ProblemBlueprint } from '../catalog.data';
import { formatVi, readNaturalNumber } from './content-math';
import type { GeneratedCore } from './generator-types';

function numericCore(
  blueprint: ProblemBlueprint,
  template: number,
  params: Record<string, string | number | boolean>,
  stem: string,
  answer: number,
  strategy: string,
  explanation: string,
  unit?: string,
): GeneratedCore {
  const answerLabel = String(answer);
  const gap = Math.max(1, Math.min(100, Math.floor(Math.abs(answer) / 10) || 1));
  return {
    templateId: `${blueprint.id}-t${template + 1}`,
    params,
    stem,
    expectedAnswer: { kind: 'NUMBER', value: answer, unit },
    answerLabel: `${answerLabel}${unit ? ` ${unit}` : ''}`,
    distractors: [answer + gap, Math.max(0, answer - gap), answer + 2 * gap].map(
      (value) => `${value}${unit ? ` ${unit}` : ''}`,
    ),
    hints: [
      'Xác định các số và điều đề bài yêu cầu.',
      strategy,
      'Lập phép tính, tính cẩn thận rồi kiểm tra lại kết quả.',
    ],
    explanation,
  };
}

function difficultyOffset(index: number) {
  return index < 25 ? 0 : index < 75 ? 1 : 2;
}

export function generateArithmeticCore(
  blueprint: ProblemBlueprint,
  index: number,
): GeneratedCore | null {
  const template = index % 5;
  const serial = Math.floor(index / 5) + 1;
  const level = difficultyOffset(index);
  const id = blueprint.id;

  if (id === 'read-write-numbers') {
    const value = 10_000 + serial * 3_127 + template * 101_003 + level * 1_000_000;
    const words = readNaturalNumber(value);
    return {
      templateId: `${id}-t${template + 1}`,
      params: { value },
      stem: `Số ${formatVi(value)} đọc là gì?`,
      expectedAnswer: { kind: 'TEXT', accepted: [words] },
      answerLabel: words,
      distractors: [
        `${words} đơn vị`,
        words.replace('nghìn', 'trăm'),
        words.replace('triệu', 'nghìn'),
      ],
      hints: [
        'Tách số thành từng lớp, mỗi lớp có ba chữ số.',
        'Đọc từ lớp có giá trị lớn nhất đến lớp đơn vị.',
        'Chú ý các tiếng “linh”, “mốt”, “lăm” khi cần.',
      ],
      explanation: `${formatVi(value)} được tách theo lớp và đọc là “${words}”.`,
    };
  }

  if (id === 'write-natural-numbers') {
    const value = 20_000 + serial * 4_019 + template * 110_003 + level * 900_000;
    const words = readNaturalNumber(value);
    return numericCore(
      blueprint,
      template,
      { value },
      `Viết bằng chữ số: ${words}.`,
      value,
      'Viết lần lượt từng lớp, đủ ba chữ số ở mỗi lớp sau lớp đầu.',
      `“${words}” được viết là ${formatVi(value)}.`,
    );
  }

  if (id === 'digit-place-value') {
    const places = [10, 100, 1_000, 10_000, 100_000] as const;
    const placeNames = ['chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn'];
    const place = places[template]!;
    const digit = 2 + ((serial + template) % 7);
    const value = 1_000_000 + serial * 10_111 + digit * place + digit * 1_000_000;
    const answer = digit * place;
    return numericCore(
      blueprint,
      template,
      { value, digit, place },
      `Trong số ${formatVi(value)}, chữ số ${digit} ở hàng ${placeNames[template]} có giá trị là bao nhiêu?`,
      answer,
      `Xác định hàng ${placeNames[template]} rồi nhân chữ số với giá trị của hàng.`,
      `Chữ số ${digit} ở hàng ${placeNames[template]} có giá trị ${formatVi(answer)}.`,
    );
  }

  if (id === 'compare-numbers') {
    const left = 100_000 + level * 1_000_000 + serial * 4_103 + template * 137;
    const delta = (template % 2 === 0 ? 1 : -1) * (13 + serial * 7);
    const right = left + delta;
    const answer = Math.max(left, right);
    return numericCore(
      blueprint,
      template,
      { left, right },
      `Số nào lớn hơn: ${formatVi(left)} hay ${formatVi(right)}?`,
      answer,
      'So sánh số chữ số, rồi so sánh lần lượt các hàng từ trái sang phải.',
      `${formatVi(answer)} lớn hơn vì tại hàng đầu tiên khác nhau, chữ số của số này lớn hơn.`,
    );
  }

  if (id === 'order-natural-numbers') {
    const base = 20_000 + level * 500_000 + serial * 1_003 + template * 29;
    const values = [base + 71, base - 13, base + 8, base + 102];
    const items = values.map((value, itemIndex) => ({
      id: `n${itemIndex + 1}`,
      label: formatVi(value),
    }));
    const ascending = template % 2 === 0;
    const ordered = [...items].sort((a, b) => {
      const av = Number(a.label.replace(/\D/g, ''));
      const bv = Number(b.label.replace(/\D/g, ''));
      return ascending ? av - bv : bv - av;
    });
    return {
      templateId: `${id}-t${template + 1}`,
      params: { base, ascending },
      stem: `Sắp xếp các số ${values.map(formatVi).join(', ')} theo thứ tự ${ascending ? 'từ bé đến lớn' : 'từ lớn đến bé'}.`,
      expectedAnswer: { kind: 'ORDER', itemIds: ordered.map((item) => item.id) },
      answerLabel: ordered.map((item) => item.label).join(' → '),
      distractors: [],
      hints: [
        'So sánh số chữ số của các số.',
        'Nếu cùng số chữ số, so sánh từ hàng lớn nhất.',
        'Đặt số nhỏ hơn/lớn hơn trước theo yêu cầu rồi kiểm tra từng cặp cạnh nhau.',
      ],
      explanation: `Thứ tự đúng là ${ordered.map((item) => item.label).join(', ')}.`,
    };
  }

  if (id === 'round-numbers') {
    const units = [10, 100, 1_000, 10_000, 100_000] as const;
    const names = ['chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn'];
    const unit = units[template]!;
    const value =
      unit * (20 + serial * 3 + level * 20) + Math.floor(unit * (0.2 + (serial % 7) / 10));
    const answer = Math.round(value / unit) * unit;
    const midpoint = Math.floor(value / unit) * unit + unit / 2;
    return {
      ...numericCore(
        blueprint,
        template,
        { value, unit },
        `Làm tròn số ${formatVi(value)} đến hàng ${names[template]}.`,
        answer,
        `Nhìn chữ số ngay bên phải hàng ${names[template]}.`,
        `${value < midpoint ? 'Chữ số xét nhỏ hơn 5 nên làm tròn xuống' : 'Chữ số xét từ 5 trở lên nên làm tròn lên'}, được ${formatVi(answer)}.`,
      ),
      visual: {
        type: 'NUMBER_LINE',
        alt: `Trục số từ ${answer - unit} đến ${answer + unit}, đánh dấu ${value}.`,
        start: answer - unit,
        end: answer + unit,
        marker: value,
      },
    };
  }

  const scale = 10 ** level;
  if (id === 'mental-addition' || id === 'column-addition') {
    const column = id === 'column-addition';
    const a = (column ? 2_345 : 120) * scale + serial * (column ? 137 : 10) + template * 11;
    const b = (column ? 1_276 : 230) * scale + serial * (column ? 83 : 10) + template * 7;
    const answer = a + b;
    return numericCore(
      blueprint,
      template,
      { a, b },
      `${column ? 'Đặt tính rồi tính' : 'Tính nhẩm'} ${formatVi(a)} + ${formatVi(b)}.`,
      answer,
      column
        ? 'Đặt các chữ số cùng hàng thẳng cột và cộng từ phải sang trái.'
        : 'Tách số theo trăm, chục và đơn vị thuận tiện.',
      `${formatVi(a)} + ${formatVi(b)} = ${formatVi(answer)}.`,
    );
  }

  if (id === 'unknown-addend') {
    const missing = 120 * scale + serial * 17 + template * 3;
    const known = 250 * scale + serial * 11;
    const total = missing + known;
    return numericCore(
      blueprint,
      template,
      { missing, known, total },
      `Tìm số hạng chưa biết: □ + ${formatVi(known)} = ${formatVi(total)}.`,
      missing,
      'Lấy tổng trừ số hạng đã biết.',
      `${formatVi(total)} − ${formatVi(known)} = ${formatVi(missing)}.`,
    );
  }

  if (id === 'mental-subtraction' || id === 'column-subtraction') {
    const column = id === 'column-subtraction';
    const b = (column ? 1_245 : 120) * scale + serial * 47 + template * 5;
    const answer = (column ? 2_103 : 210) * scale + serial * 31 + template * 7;
    const a = b + answer;
    return numericCore(
      blueprint,
      template,
      { a, b },
      `${column ? 'Đặt tính rồi tính' : 'Tính nhẩm'} ${formatVi(a)} − ${formatVi(b)}.`,
      answer,
      column
        ? 'Đặt các chữ số cùng hàng thẳng cột và trừ từ phải sang trái.'
        : 'Tách số thành phần tròn trăm, tròn chục thuận tiện.',
      `${formatVi(a)} − ${formatVi(b)} = ${formatVi(answer)}.`,
    );
  }

  if (id === 'unknown-subtraction-part') {
    const difference = 210 * scale + serial * 19;
    const known = 130 * scale + serial * 13 + template;
    const askMinuend = template % 2 === 0;
    const answer = askMinuend ? difference + known : known - difference;
    const safeAnswer = askMinuend ? answer : 100 * scale + serial * 17;
    const minuend = askMinuend ? safeAnswer : known + safeAnswer;
    const subtrahend = askMinuend ? known : safeAnswer;
    return numericCore(
      blueprint,
      template,
      { minuend, subtrahend, difference: minuend - subtrahend, askMinuend },
      askMinuend
        ? `Tìm số bị trừ: □ − ${formatVi(subtrahend)} = ${formatVi(minuend - subtrahend)}.`
        : `Tìm số trừ: ${formatVi(minuend)} − □ = ${formatVi(minuend - subtrahend)}.`,
      askMinuend ? minuend : subtrahend,
      askMinuend
        ? 'Muốn tìm số bị trừ, lấy hiệu cộng số trừ.'
        : 'Muốn tìm số trừ, lấy số bị trừ trừ hiệu.',
      askMinuend
        ? `${formatVi(minuend - subtrahend)} + ${formatVi(subtrahend)} = ${formatVi(minuend)}.`
        : `${formatVi(minuend)} − ${formatVi(minuend - subtrahend)} = ${formatVi(subtrahend)}.`,
    );
  }

  if (['multiplication-facts', 'multiply-one-digit', 'multiply-two-digits'].includes(id)) {
    const factor = id === 'multiply-two-digits' ? 12 + template * 3 : 2 + ((serial + template) % 8);
    const multiplicand =
      id === 'multiplication-facts' ? 2 + (serial % 8) : (125 + serial * 23 + template * 7) * scale;
    const answer = multiplicand * factor;
    return numericCore(
      blueprint,
      template,
      { multiplicand, factor },
      `${id === 'multiplication-facts' ? 'Tính nhẩm' : 'Đặt tính rồi tính'} ${formatVi(multiplicand)} × ${factor}.`,
      answer,
      id === 'multiply-two-digits'
        ? 'Tính các tích riêng đúng vị trí rồi cộng lại.'
        : 'Nhân lần lượt và nhớ khi cần.',
      `${formatVi(multiplicand)} × ${factor} = ${formatVi(answer)}.`,
    );
  }

  if (id === 'equal-groups') {
    const groups = 3 + ((serial + template) % 8);
    const each = 4 + serial + template;
    const answer = groups * each;
    return {
      ...numericCore(
        blueprint,
        template,
        { groups, each },
        `Có ${groups} nhóm, mỗi nhóm có ${each} chấm tròn. Có tất cả bao nhiêu chấm tròn?`,
        answer,
        'Lấy số nhóm nhân với số chấm trong mỗi nhóm.',
        `${groups} × ${each} = ${answer}, nên có tất cả ${answer} chấm tròn.`,
      ),
      visual: {
        type: 'OBJECT_GROUPS',
        alt: `${groups} nhóm bằng nhau, mỗi nhóm ${each} chấm tròn.`,
        groups,
        itemsPerGroup: each,
      },
    };
  }

  if (id === 'missing-factor') {
    const factor = 2 + ((serial + template) % 8);
    const missing = 5 + serial * (level + 1) + template;
    const product = factor * missing;
    return numericCore(
      blueprint,
      template,
      { factor, missing, product },
      `Tìm thừa số chưa biết: ${factor} × □ = ${product}.`,
      missing,
      'Lấy tích chia cho thừa số đã biết.',
      `${product} : ${factor} = ${missing}.`,
    );
  }

  if (['division-facts', 'divide-one-digit', 'divide-two-digits'].includes(id)) {
    const divisor = id === 'divide-two-digits' ? 12 + template * 4 : 2 + ((serial + template) % 8);
    const quotient =
      id === 'division-facts' ? 3 + (serial % 8) : (42 + serial * 7 + template) * scale;
    const dividend = divisor * quotient;
    return numericCore(
      blueprint,
      template,
      { dividend, divisor, quotient },
      `${id === 'division-facts' ? 'Tính nhẩm' : 'Đặt tính rồi tính'} ${formatVi(dividend)} : ${divisor}.`,
      quotient,
      'Dùng phép nhân ngược để ước lượng và kiểm tra thương.',
      `${formatVi(dividend)} : ${divisor} = ${formatVi(quotient)} vì ${formatVi(quotient)} × ${divisor} = ${formatVi(dividend)}.`,
    );
  }

  if (id === 'division-remainder') {
    const divisor = 3 + ((serial + template) % 8);
    const remainder = 1 + ((serial * 2 + template) % (divisor - 1));
    const quotient = 12 + serial * (level + 1) + template;
    const dividend = divisor * quotient + remainder;
    return numericCore(
      blueprint,
      template,
      { dividend, divisor, quotient, remainder },
      `${formatVi(dividend)} chia cho ${divisor} có số dư là bao nhiêu?`,
      remainder,
      'Tìm bội lớn nhất của số chia không vượt quá số bị chia.',
      `${dividend} = ${divisor} × ${quotient} + ${remainder}; ${remainder} < ${divisor} nên số dư là ${remainder}.`,
    );
  }

  if (id === 'sharing-equally') {
    const people = 3 + ((serial + template) % 7);
    const each = 8 + serial * (level + 1) + template;
    const total = people * each;
    return numericCore(
      blueprint,
      template,
      { people, each, total },
      `Chia đều ${total} quyển vở cho ${people} bạn. Mỗi bạn nhận được bao nhiêu quyển?`,
      each,
      'Lấy tổng số vở chia cho số bạn.',
      `${total} : ${people} = ${each}, nên mỗi bạn nhận ${each} quyển.`,
      'quyển',
    );
  }

  if (id === 'operation-order' || id === 'parentheses-expression') {
    const a = 12 + serial * (level + 1) + template;
    const b = 3 + ((serial + template) % 9);
    const c = 2 + (template % 4);
    const parentheses = id === 'parentheses-expression';
    const answer = parentheses ? (a + b) * c : a + b * c;
    const expression = parentheses ? `(${a} + ${b}) × ${c}` : `${a} + ${b} × ${c}`;
    return numericCore(
      blueprint,
      template,
      { a, b, c },
      `Tính giá trị biểu thức ${expression}.`,
      answer,
      parentheses
        ? 'Thực hiện phép tính trong ngoặc trước.'
        : 'Thực hiện phép nhân trước phép cộng.',
      `${expression} = ${answer}.`,
    );
  }

  return null;
}
