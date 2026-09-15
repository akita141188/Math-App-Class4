import type { ExpectedAnswer, QuestionVisual } from '@math-app/shared';
import type { ProblemBlueprint } from '../catalog.data';
import { formatVi } from './content-math';
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
  visual?: QuestionVisual,
): GeneratedCore {
  const gap = Math.max(1, Math.floor(Math.abs(answer) / 10));
  return {
    templateId: `${blueprint.id}-t${template + 1}`,
    params,
    stem,
    expectedAnswer: { kind: 'NUMBER', value: answer, unit },
    answerLabel: `${formatVi(answer)}${unit ? ` ${unit}` : ''}`,
    distractors: [
      `${formatVi(answer + gap)}${unit ? ` ${unit}` : ''}`,
      `${formatVi(Math.max(0, answer - gap))}${unit ? ` ${unit}` : ''}`,
      `${formatVi(answer + gap * 2)}${unit ? ` ${unit}` : ''}`,
    ],
    hints: [
      'Đọc kĩ dữ kiện và xác định điều đề bài đang hỏi.',
      strategy,
      'Thực hiện phép tính rồi kiểm tra lại kết quả.',
    ],
    explanation,
    answerUnit: unit,
    visual,
  };
}

function textCore(
  blueprint: ProblemBlueprint,
  template: number,
  params: Record<string, string | number | boolean>,
  stem: string,
  accepted: string[],
  answerLabel: string,
  distractors: string[],
  strategy: string,
  explanation: string,
  visual?: QuestionVisual,
): GeneratedCore {
  const expectedAnswer: ExpectedAnswer = { kind: 'TEXT', accepted };
  return {
    templateId: `${blueprint.id}-t${template + 1}`,
    params,
    stem,
    expectedAnswer,
    answerLabel,
    distractors,
    hints: [
      'Đọc kĩ từ khóa trong câu hỏi.',
      strategy,
      'Đối chiếu lại với quy tắc đã học trước khi trả lời.',
    ],
    explanation,
    visual,
  };
}

function fractionCore(
  blueprint: ProblemBlueprint,
  template: number,
  params: Record<string, string | number | boolean>,
  stem: string,
  numerator: number,
  denominator: number,
  strategy: string,
  explanation: string,
): GeneratedCore {
  const answerLabel = `${numerator}/${denominator}`;
  return {
    templateId: `${blueprint.id}-t${template + 1}`,
    params,
    stem,
    expectedAnswer: {
      kind: 'FRACTION',
      numerator,
      denominator,
      requireExactForm: true,
    },
    answerLabel,
    distractors: [
      `${denominator}/${numerator}`,
      `${numerator + 1}/${denominator}`,
      `${numerator}/${denominator + 1}`,
    ],
    hints: [
      'Xác định đúng tử số và mẫu số cần tìm.',
      strategy,
      'Kiểm tra lại bằng tính chất của phân số.',
    ],
    explanation,
  };
}

export function generateKnttCore(blueprint: ProblemBlueprint, index: number): GeneratedCore | null {
  const id = blueprint.id;
  const template = index % 5;
  const serial = Math.floor(index / 5) + 1;

  if (id === 'even-odd-numbers') {
    const value = 100_000 + serial * 137 + template * 11 + (index % 2);
    const even = value % 2 === 0;
    const label = even ? 'số chẵn' : 'số lẻ';
    return textCore(
      blueprint,
      template,
      { value },
      `Số ${formatVi(value)} là số chẵn hay số lẻ?`,
      even ? ['số chẵn', 'chẵn'] : ['số lẻ', 'lẻ'],
      label,
      even
        ? ['số lẻ', 'không xác định', 'cả chẵn và lẻ']
        : ['số chẵn', 'không xác định', 'cả chẵn và lẻ'],
      'Quan sát chữ số tận cùng: 0, 2, 4, 6, 8 là chẵn; 1, 3, 5, 7, 9 là lẻ.',
      `Số ${formatVi(value)} có chữ số tận cùng là ${value % 10}, nên đây là ${label}.`,
    );
  }

  if (id === 'variable-expression') {
    const variable = ['a', 'b', 'm', 'n', 'x'][template]!;
    const value = 3 + serial + template;
    const factor = 2 + template;
    const offset = 10 + serial * 2 + template;
    let stem = '';
    let answer = 0;
    if (template === 0) {
      stem = `Tính giá trị biểu thức ${variable} + ${offset} khi ${variable} = ${value}.`;
      answer = value + offset;
    } else if (template === 1) {
      const minuend = offset + value + 20;
      stem = `Tính giá trị biểu thức ${minuend} − ${variable} khi ${variable} = ${value}.`;
      answer = minuend - value;
    } else if (template === 2) {
      stem = `Tính giá trị biểu thức ${variable} × ${factor} khi ${variable} = ${value}.`;
      answer = value * factor;
    } else if (template === 3) {
      stem = `Tính giá trị biểu thức ${variable} × ${factor} + ${offset} khi ${variable} = ${value}.`;
      answer = value * factor + offset;
    } else {
      stem = `Tính giá trị biểu thức (${variable} + ${offset}) × ${factor} khi ${variable} = ${value}.`;
      answer = (value + offset) * factor;
    }
    return numericCore(
      blueprint,
      template,
      { variable, value, factor, offset },
      stem,
      answer,
      `Thay ${variable} bằng ${value}, sau đó thực hiện phép tính theo đúng thứ tự.`,
      `Thay ${variable} = ${value} vào biểu thức và tính được ${formatVi(answer)}.`,
    );
  }

  if (id === 'three-step-word-problem') {
    const groups = 3 + (template % 3);
    const each = 10 + serial + template;
    const received = 5 + serial * 2 + template;
    const givenAway = 3 + serial + template;
    const answer = groups * each + received - givenAway;
    return numericCore(
      blueprint,
      template,
      { groups, each, received, givenAway },
      `Một thư viện có ${groups} giá sách, mỗi giá có ${each} quyển truyện. Thư viện nhận thêm ${received} quyển rồi tặng đi ${givenAway} quyển. Hỏi thư viện còn bao nhiêu quyển truyện?`,
      answer,
      'Bước 1 tìm số truyện ban đầu; bước 2 cộng số nhận thêm; bước 3 trừ số đã tặng.',
      `${groups} × ${each} = ${groups * each}; ${groups * each} + ${received} = ${groups * each + received}; ${groups * each + received} − ${givenAway} = ${answer} quyển.`,
      'quyển',
    );
  }

  if (id === 'measure-angle-degrees') {
    const degrees = 10 + ((index * 17 + template * 7) % 171);
    const rotationDegrees = (index * 23 + template * 19) % 360;
    return numericCore(
      blueprint,
      template,
      { degrees, rotationDegrees },
      'Quan sát góc trong hình. Góc có số đo bao nhiêu độ?',
      degrees,
      'Đọc một cạnh góc ở vạch 0° rồi xác định vị trí cạnh còn lại trên thước đo góc.',
      `Góc trong hình có số đo ${degrees}°, nên đáp án là ${degrees} độ.`,
      'độ',
      {
        type: 'ANGLE',
        alt: `Một góc có số đo ${degrees} độ.`,
        degrees,
        rotationDegrees,
      },
    );
  }

  if (id === 'place-and-class') {
    const number = 1_234_567 + serial * 10_101 + template * 1_003;
    const placeNames = ['hàng đơn vị', 'hàng chục', 'hàng trăm', 'hàng nghìn', 'hàng chục nghìn'];
    const classNames = ['lớp đơn vị', 'lớp đơn vị', 'lớp đơn vị', 'lớp nghìn', 'lớp nghìn'];
    const place = placeNames[template]!;
    const className = classNames[template]!;
    return textCore(
      blueprint,
      template,
      { number, place },
      `Trong số ${formatVi(number)}, ${place} thuộc lớp nào?`,
      [className],
      className,
      ['lớp triệu', 'lớp nghìn', 'lớp đơn vị'].filter((item) => item !== className),
      'Ba hàng đơn vị, chục, trăm tạo thành lớp đơn vị; ba hàng nghìn tạo thành lớp nghìn; tiếp theo là lớp triệu.',
      `${place} thuộc ${className}, nên đáp án là ${className}.`,
    );
  }

  if (id === 'numbers-to-million') {
    const hundredThousands = 1 + ((serial + template) % 9);
    const tenThousands = (serial * 2 + template) % 10;
    const thousands = (serial * 3 + template * 2) % 10;
    const hundreds = (serial * 5 + template) % 10;
    const tens = (serial * 7 + template) % 10;
    const ones = (serial * 9 + template) % 10;
    const value =
      hundredThousands * 100_000 +
      tenThousands * 10_000 +
      thousands * 1_000 +
      hundreds * 100 +
      tens * 10 +
      ones;
    return numericCore(
      blueprint,
      template,
      { hundredThousands, tenThousands, thousands, hundreds, tens, ones },
      `Viết số gồm ${hundredThousands} trăm nghìn, ${tenThousands} chục nghìn, ${thousands} nghìn, ${hundreds} trăm, ${tens} chục và ${ones} đơn vị.`,
      value,
      'Đặt từng chữ số vào đúng hàng rồi ghép lại thành số.',
      `Các chữ số theo thứ tự hàng là ${hundredThousands}, ${tenThousands}, ${thousands}, ${hundreds}, ${tens}, ${ones}; số cần viết là ${formatVi(value)}.`,
    );
  }

  if (id === 'natural-number-sequence') {
    const start = 100_000 + serial * 37 + template * 5;
    const missingPosition = template + 1;
    const values = Array.from({ length: 6 }, (_, i) => start + i);
    const answer = values[missingPosition]!;
    const shown = values.map((value, i) => (i === missingPosition ? '□' : formatVi(value)));
    return numericCore(
      blueprint,
      template,
      { start, missingPosition },
      `Điền số còn thiếu trong dãy số tự nhiên liên tiếp: ${shown.join(', ')}.`,
      answer,
      'Hai số tự nhiên liên tiếp hơn kém nhau 1 đơn vị.',
      `Dãy tăng mỗi lần 1 đơn vị, nên số còn thiếu là ${formatVi(answer)}.`,
    );
  }

  if (id === 'addition-properties') {
    const a = 100 + serial * 7 + template;
    const b = 500 - (serial * 3 + template);
    const c = 1000 - b;
    const answer = a + b + c;
    return numericCore(
      blueprint,
      template,
      { a, b, c },
      `Tính thuận tiện: ${formatVi(a)} + ${formatVi(b)} + ${formatVi(c)}.`,
      answer,
      `Đổi chỗ và nhóm ${formatVi(b)} với ${formatVi(c)} để được ${formatVi(b + c)}.`,
      `${formatVi(a)} + (${formatVi(b)} + ${formatVi(c)}) = ${formatVi(a)} + ${formatVi(b + c)} = ${formatVi(answer)}.`,
    );
  }

  if (id === 'multiplication-properties') {
    const a = 2 + (template % 4);
    const b = 20 + serial * 7 + template * 101;
    const c = template % 2 === 0 ? 10 : 4;
    const answer = a * b * c;
    return numericCore(
      blueprint,
      template,
      { a, b, c },
      `Tính thuận tiện: ${a} × ${b} × ${c}.`,
      answer,
      'Đổi chỗ hoặc nhóm các thừa số để tạo tích dễ tính trước.',
      `Vận dụng tính chất giao hoán và kết hợp của phép nhân, ta được kết quả ${formatVi(answer)}.`,
    );
  }

  if (id === 'multiply-divide-powers-of-ten') {
    const base = 12 + serial * 3 + template;
    const power = [10, 100, 1000, 10, 100][template]!;
    const divide = template >= 3;
    const source = divide ? base * power : base;
    const answer = divide ? base : base * power;
    return numericCore(
      blueprint,
      template,
      { base, power, divide, source },
      `Tính ${formatVi(source)} ${divide ? ':' : '×'} ${formatVi(power)}.`,
      answer,
      divide
        ? `Khi chia số tròn cho ${formatVi(power)}, bỏ số chữ số 0 tương ứng ở bên phải.`
        : `Khi nhân với ${formatVi(power)}, thêm số chữ số 0 tương ứng vào bên phải.`,
      `${formatVi(source)} ${divide ? ':' : '×'} ${formatVi(power)} = ${formatVi(answer)}.`,
    );
  }

  if (id === 'distributive-property') {
    const a = 2 + template;
    const b = 20 + serial * 2;
    const c = 5 + serial + template;
    const answer = a * (b + c);
    return numericCore(
      blueprint,
      template,
      { a, b, c },
      `Tính bằng tính chất phân phối: ${a} × (${b} + ${c}).`,
      answer,
      `Tính ${a} × ${b} và ${a} × ${c}, sau đó cộng hai tích.`,
      `${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c} = ${a * b} + ${a * c} = ${answer}.`,
    );
  }

  if (id === 'estimate-calculation') {
    const left = 1_000 + serial * 137 + template * 43 + 49;
    const right = 500 + serial * 83 + template * 29 + 51;
    const roundedLeft = Math.round(left / 100) * 100;
    const roundedRight = Math.round(right / 100) * 100;
    const answer = roundedLeft + roundedRight;
    return numericCore(
      blueprint,
      template,
      { left, right, roundedLeft, roundedRight },
      `Ước lượng tổng ${formatVi(left)} + ${formatVi(right)} bằng cách làm tròn mỗi số đến hàng trăm.`,
      answer,
      'Làm tròn từng số đến hàng trăm rồi cộng hai số đã làm tròn.',
      `${formatVi(left)} ≈ ${formatVi(roundedLeft)}, ${formatVi(right)} ≈ ${formatVi(roundedRight)}, nên tổng ước lượng là ${formatVi(answer)}.`,
    );
  }

  if (id === 'statistical-data-series') {
    const base = 10 + serial * 3 + template;
    const values = [base, base + 2, base - 1, base + 5, base + template + 1];
    const answer = Math.max(...values);
    return numericCore(
      blueprint,
      template,
      {
        a: values[0]!,
        b: values[1]!,
        c: values[2]!,
        d: values[3]!,
        e: values[4]!,
      },
      `Dãy số liệu cho biết số trang Minh đọc trong 5 ngày. Số lớn nhất trong dãy là bao nhiêu?`,
      answer,
      'So sánh lần lượt các số trong dãy để tìm giá trị lớn nhất.',
      `Dãy số liệu là ${values.join(', ')}; số lớn nhất là ${answer}.`,
      undefined,
      {
        type: 'TABLE',
        alt: `Dãy số liệu gồm ${values.join(', ')}.`,
        headers: ['Ngày', '1', '2', '3', '4', '5'],
        rows: [['Số trang', ...values.map(String)]],
      },
    );
  }

  if (id === 'event-frequency') {
    const total = 20 + serial + template;
    const red = 2 + ((serial * 3 + template * 2) % (total - 3));
    const blue = total - red;
    return numericCore(
      blueprint,
      template,
      { total, red, blue },
      'Bảng ghi kết quả một phép thử nhiều lần. Sự kiện “xuất hiện màu đỏ” xảy ra bao nhiêu lần?',
      red,
      'Đọc đúng hàng tương ứng với sự kiện màu đỏ.',
      `Trong bảng, màu đỏ xuất hiện ${red} lần, nên số lần xuất hiện của sự kiện là ${red}.`,
      'lần',
      {
        type: 'TABLE',
        alt: `Kết quả gồm màu đỏ ${red} lần và màu xanh ${blue} lần.`,
        headers: ['Kết quả', 'Số lần'],
        rows: [
          ['Đỏ', String(red)],
          ['Xanh', String(blue)],
        ],
      },
    );
  }

  if (id === 'fraction-as-division') {
    const divisor = 2 + template;
    const dividend = serial * 7 + template * 2 + 1;
    return fractionCore(
      blueprint,
      template,
      { dividend, divisor },
      `Viết thương ${dividend} : ${divisor} dưới dạng phân số.`,
      dividend,
      divisor,
      'Số bị chia viết ở tử số, số chia khác 0 viết ở mẫu số.',
      `${dividend} : ${divisor} = ${dividend}/${divisor}.`,
    );
  }

  if (id === 'fraction-basic-property') {
    const denominator = 10 + serial * 2 + template;
    const numerator = 1 + ((serial + template * 3) % (denominator - 1));
    const factor = 2 + template;
    const answer = numerator * factor;
    return numericCore(
      blueprint,
      template,
      { numerator, denominator, factor },
      `Điền số thích hợp: ${numerator}/${denominator} = □/${denominator * factor}.`,
      answer,
      `Mẫu số được nhân với ${factor}, vì vậy tử số cũng phải nhân với ${factor}.`,
      `${numerator} × ${factor} = ${answer}, nên ${numerator}/${denominator} = ${answer}/${denominator * factor}.`,
    );
  }

  // Improve two existing leaves so the generated bank matches the KNTT lesson scope.
  if (id === 'classify-angles') {
    const baseAngles = [25, 90, 120, 180, 45];
    const degrees =
      template === 3 ? 180 : baseAngles[template]! + (template === 1 ? 0 : (serial - 1) % 20);
    const kind =
      degrees < 90
        ? 'góc nhọn'
        : degrees === 90
          ? 'góc vuông'
          : degrees < 180
            ? 'góc tù'
            : 'góc bẹt';
    return textCore(
      blueprint,
      template,
      { degrees, serial },
      `Góc có số đo ${degrees}° là loại góc nào?`,
      [kind],
      kind,
      ['góc nhọn', 'góc vuông', 'góc tù', 'góc bẹt'].filter((value) => value !== kind),
      'So sánh số đo với 90° và 180°.',
      `Vì góc có số đo ${degrees}°, nên đây là ${kind}.`,
      {
        type: 'ANGLE',
        alt: `Góc có số đo ${degrees} độ.`,
        degrees,
        rotationDegrees: (serial * 13 + template * 29) % 360,
      },
    );
  }

  if (id === 'compare-fractions') {
    if (template <= 1) {
      const denominator = 20 + serial * 3 + template;
      const leftNumerator = 2 + serial + template;
      const rightNumerator = leftNumerator + 1;
      return fractionCore(
        blueprint,
        template,
        { leftNumerator, rightNumerator, denominator },
        `Hai phân số ${leftNumerator}/${denominator} và ${rightNumerator}/${denominator}, phân số nào lớn hơn?`,
        rightNumerator,
        denominator,
        'Hai phân số cùng mẫu số: phân số có tử số lớn hơn thì lớn hơn.',
        `Vì ${rightNumerator} > ${leftNumerator}, nên ${rightNumerator}/${denominator} lớn hơn.`,
      );
    }
    const numerator = 2 + serial + template;
    const leftDenominator = numerator + 5 + template * 3;
    const rightDenominator = leftDenominator + 1 + template;
    return fractionCore(
      blueprint,
      template,
      { numerator, leftDenominator, rightDenominator },
      `Hai phân số ${numerator}/${leftDenominator} và ${numerator}/${rightDenominator}, phân số nào lớn hơn?`,
      numerator,
      leftDenominator,
      'Hai phân số có cùng tử số dương: phân số có mẫu số nhỏ hơn thì lớn hơn.',
      `Hai phân số cùng tử ${numerator}; mẫu ${leftDenominator} nhỏ hơn ${rightDenominator} nên ${numerator}/${leftDenominator} lớn hơn.`,
    );
  }

  return null;
}
