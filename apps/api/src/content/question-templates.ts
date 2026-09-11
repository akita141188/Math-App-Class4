import type { ExpectedAnswer, QuestionVisual } from '@math-app/shared';
import type { ProblemBlueprint } from './catalog.data';

export interface QuestionCore {
  stem: string;
  answerText: string;
  numericValue: number;
  expectedAnswer?: ExpectedAnswer;
  distractors?: string[];
  explanation: string;
  hint: string;
  visual?: QuestionVisual;
}

const numberWords = [
  { value: 24_325, words: 'hai mươi bốn nghìn ba trăm hai mươi lăm' },
  { value: 36_408, words: 'ba mươi sáu nghìn bốn trăm linh tám' },
  { value: 105_214, words: 'một trăm linh năm nghìn hai trăm mười bốn' },
  { value: 270_036, words: 'hai trăm bảy mươi nghìn không trăm ba mươi sáu' },
  { value: 504_120, words: 'năm trăm linh bốn nghìn một trăm hai mươi' },
];

const fractions = [
  { numerator: 1, denominator: 6 },
  { numerator: 1, denominator: 2 },
  { numerator: 2, denominator: 3 },
  { numerator: 3, denominator: 4 },
  { numerator: 2, denominator: 5 },
];

function visualAlt(alt: string) {
  return { alt };
}

function numberCore(
  stem: string,
  answer: number,
  explanation: string,
  hint: string,
  visual?: QuestionVisual,
): QuestionCore {
  return {
    stem,
    answerText: String(answer),
    numericValue: answer,
    explanation,
    hint,
    visual,
  };
}

export function buildQuestionCore(blueprint: ProblemBlueprint, variant: number): QuestionCore {
  const a = 12 + variant * 7;
  const b = 4 + variant;

  switch (blueprint.id) {
    case 'read-write-numbers': {
      const example = numberWords[variant] ?? numberWords[0]!;
      return {
        stem: `Số ${example.value.toLocaleString('vi-VN')} đọc là gì?`,
        answerText: example.words,
        numericValue: example.value,
        expectedAnswer: { kind: 'TEXT', accepted: [example.words] },
        distractors: [
          `${example.words} đơn vị`,
          example.words.replace('nghìn', 'trăm'),
          example.words.replace('mươi', 'trăm'),
        ],
        explanation: `${example.value.toLocaleString('vi-VN')} đọc là “${example.words}”.`,
        hint: 'Đọc lần lượt từ lớp nghìn đến lớp đơn vị.',
      };
    }
    case 'digit-place-value': {
      const examples = [
        { value: 44_325, digit: 4, place: 'chục nghìn', answer: 40_000 },
        { value: 64_442, digit: 4, place: 'trăm', answer: 400 },
        { value: 242_418, digit: 2, place: 'trăm nghìn', answer: 200_000 },
        { value: 505_250, digit: 5, place: 'nghìn', answer: 5_000 },
        { value: 818_081, digit: 8, place: 'trăm', answer: 800 },
      ];
      const example = examples[variant] ?? examples[0]!;
      return numberCore(
        `Trong số ${example.value.toLocaleString('vi-VN')}, chữ số ${example.digit} ở hàng ${example.place} có giá trị là bao nhiêu?`,
        example.answer,
        `Chữ số ${example.digit} ở hàng ${example.place} có giá trị ${example.answer.toLocaleString('vi-VN')}.`,
        `Xác định đúng hàng ${example.place} trước khi viết giá trị.`,
      );
    }
    case 'compare-numbers': {
      const first = 32_450 + variant * 211;
      const second = first + 90 - variant * 17;
      const answer = Math.max(first, second);
      return numberCore(
        `Số nào lớn hơn: ${first.toLocaleString('vi-VN')} hay ${second.toLocaleString('vi-VN')}?`,
        answer,
        `${answer.toLocaleString('vi-VN')} lớn hơn khi so sánh lần lượt từ hàng có giá trị lớn nhất.`,
        'So sánh lần lượt từ trái sang phải.',
      );
    }
    case 'round-numbers': {
      const value = 12_340 + variant * 137;
      const rounded = Math.round(value / 100) * 100;
      return numberCore(
        `Làm tròn số ${value.toLocaleString('vi-VN')} đến hàng trăm.`,
        rounded,
        `Nhìn chữ số hàng chục, ta làm tròn được ${rounded.toLocaleString('vi-VN')}.`,
        'Nếu chữ số hàng chục từ 5 trở lên, tăng hàng trăm thêm 1.',
        {
          type: 'NUMBER_LINE',
          ...visualAlt(`Trục số từ ${rounded - 100} đến ${rounded + 100}, đánh dấu ${value}.`),
          start: rounded - 100,
          end: rounded + 100,
          marker: value,
        },
      );
    }
    case 'mental-addition': {
      const first = 1_200 + variant * 300;
      const second = 400 + variant * 100;
      const answer = first + second;
      return numberCore(
        `Tính nhẩm ${first.toLocaleString('vi-VN')} + ${second.toLocaleString('vi-VN')}.`,
        answer,
        `Cộng số trăm: ${first.toLocaleString('vi-VN')} + ${second.toLocaleString('vi-VN')} = ${answer.toLocaleString('vi-VN')}.`,
        'Nhẩm theo số trăm trước.',
      );
    }
    case 'column-addition': {
      const first = 2_468 + variant * 173;
      const second = 1_357 + variant * 89;
      const answer = first + second;
      return numberCore(
        `Đặt tính rồi tính ${first.toLocaleString('vi-VN')} + ${second.toLocaleString('vi-VN')}.`,
        answer,
        `Đặt thẳng các hàng rồi cộng từ phải sang trái, được ${answer.toLocaleString('vi-VN')}.`,
        'Viết các chữ số cùng hàng thẳng cột.',
      );
    }
    case 'unknown-addend': {
      const missing = 325 + variant * 47;
      const known = 480 + variant * 35;
      const total = missing + known;
      return numberCore(
        `Tìm số hạng chưa biết: □ + ${known} = ${total}.`,
        missing,
        `Số hạng chưa biết bằng tổng trừ số hạng đã biết: ${total} − ${known} = ${missing}.`,
        'Lấy tổng trừ số hạng đã biết.',
      );
    }
    case 'mental-subtraction': {
      const first = 2_600 + variant * 400;
      const second = 500 + variant * 100;
      const answer = first - second;
      return numberCore(
        `Tính nhẩm ${first.toLocaleString('vi-VN')} − ${second.toLocaleString('vi-VN')}.`,
        answer,
        `Trừ số trăm: kết quả là ${answer.toLocaleString('vi-VN')}.`,
        'Nhẩm theo số trăm trước.',
      );
    }
    case 'column-subtraction': {
      const first = 5_204 + variant * 193;
      const second = 1_876 + variant * 67;
      const answer = first - second;
      return numberCore(
        `Đặt tính rồi tính ${first.toLocaleString('vi-VN')} − ${second.toLocaleString('vi-VN')}.`,
        answer,
        `Đặt thẳng các hàng rồi trừ từ phải sang trái, được ${answer.toLocaleString('vi-VN')}.`,
        'Đổi một đơn vị ở hàng liền trước khi không đủ để trừ.',
      );
    }
    case 'unknown-subtraction-part': {
      const missing = 730 + variant * 61;
      const subtrahend = 245 + variant * 28;
      const difference = missing - subtrahend;
      return numberCore(
        `Tìm số bị trừ chưa biết: □ − ${subtrahend} = ${difference}.`,
        missing,
        `Số bị trừ bằng hiệu cộng số trừ: ${difference} + ${subtrahend} = ${missing}.`,
        'Muốn tìm số bị trừ, lấy hiệu cộng số trừ.',
      );
    }
    case 'multiplication-facts': {
      const first = 4 + variant;
      const second = 6 + (variant % 3);
      const answer = first * second;
      return numberCore(
        `Dùng bảng nhân để tính ${first} × ${second}.`,
        answer,
        `${first} × ${second} = ${answer}.`,
        `Nhớ lại bảng nhân ${first}.`,
      );
    }
    case 'multiply-one-digit': {
      const first = 245 + variant * 137;
      const second = 3 + variant;
      const answer = first * second;
      return numberCore(
        `Đặt tính rồi nhân ${first} với số có một chữ số ${second} (${first} × ${second}).`,
        answer,
        `${first} × ${second} = ${answer}.`,
        'Nhân lần lượt từ hàng đơn vị sang trái và nhớ khi cần.',
      );
    }
    case 'multiply-two-digits': {
      const first = 123 + variant * 41;
      const second = 12 + variant * 3;
      const answer = first * second;
      return numberCore(
        `Đặt tính rồi nhân ${first} với số có hai chữ số ${second} (${first} × ${second}).`,
        answer,
        `${first} × ${second} = ${answer}; tích riêng thứ hai lùi sang trái một cột.`,
        'Tính hai tích riêng rồi cộng lại.',
      );
    }
    case 'equal-groups': {
      const groups = 3 + variant;
      const items = 4 + variant;
      const answer = groups * items;
      return numberCore(
        `Có ${groups} hộp, mỗi hộp có ${items} chiếc bút. Có tất cả bao nhiêu chiếc bút?`,
        answer,
        `${groups} nhóm bằng nhau, mỗi nhóm ${items} chiếc nên ${groups} × ${items} = ${answer}.`,
        'Lấy số hộp nhân với số bút trong mỗi hộp.',
        {
          type: 'OBJECT_GROUPS',
          ...visualAlt(`${groups} nhóm, mỗi nhóm có ${items} chấm tròn.`),
          groups,
          itemsPerGroup: items,
        },
      );
    }
    case 'division-facts': {
      const divisor = 3 + variant;
      const quotient = 6 + variant;
      const dividend = divisor * quotient;
      return numberCore(
        `Dùng bảng chia để tính ${dividend} : ${divisor}.`,
        quotient,
        `Vì ${divisor} × ${quotient} = ${dividend} nên ${dividend} : ${divisor} = ${quotient}.`,
        `Nhớ lại bảng nhân ${divisor}.`,
      );
    }
    case 'divide-one-digit': {
      const divisor = 3 + variant;
      const quotient = 124 + variant * 37;
      const dividend = divisor * quotient;
      return numberCore(
        `Đặt tính rồi chia ${dividend.toLocaleString('vi-VN')} cho số có một chữ số ${divisor}.`,
        quotient,
        `${dividend.toLocaleString('vi-VN')} : ${divisor} = ${quotient}.`,
        'Chia lần lượt từ hàng có giá trị lớn nhất.',
      );
    }
    case 'division-remainder': {
      const divisor = 4 + variant;
      const quotient = 11 + variant * 3;
      const remainder = 1 + (variant % (divisor - 1));
      const dividend = divisor * quotient + remainder;
      return numberCore(
        `${dividend} chia cho ${divisor} có số dư là bao nhiêu?`,
        remainder,
        `${dividend} = ${divisor} × ${quotient} + ${remainder}; số dư ${remainder} bé hơn ${divisor}.`,
        'Tìm bội lớn nhất của số chia không vượt quá số bị chia.',
      );
    }
    case 'sharing-equally': {
      const friends = 3 + variant;
      const each = 8 + variant * 2;
      const total = friends * each;
      return numberCore(
        `Chia đều ${total} quyển vở cho ${friends} bạn. Mỗi bạn nhận được bao nhiêu quyển?`,
        each,
        `${total} : ${friends} = ${each}, nên mỗi bạn nhận ${each} quyển.`,
        'Lấy tổng số vở chia cho số bạn.',
      );
    }
    case 'operation-order': {
      const answer = a + b * 3;
      return numberCore(
        `Tính giá trị biểu thức ${a} + ${b} × 3 theo đúng thứ tự.`,
        answer,
        `Nhân trước: ${b} × 3, rồi cộng ${a}, được ${answer}.`,
        'Thực hiện phép nhân trước phép cộng.',
      );
    }
    case 'parentheses-expression': {
      const answer = (a + b) * 3;
      return numberCore(
        `Tính giá trị biểu thức (${a} + ${b}) × 3.`,
        answer,
        `Tính trong ngoặc trước rồi nhân 3, được ${answer}.`,
        'Tính trong ngoặc trước.',
      );
    }
    case 'identify-fraction': {
      const fraction = fractions[variant] ?? fractions[0]!;
      const { numerator, denominator } = fraction;
      const visualType = variant % 2 === 0 ? 'FRACTION_CIRCLE' : 'FRACTION_BAR';
      const shapeName = visualType === 'FRACTION_CIRCLE' ? 'Hình tròn' : 'Hình chữ nhật';
      return {
        stem: `${shapeName} được chia thành ${denominator} phần bằng nhau. ${numerator === 1 ? 'Một phần' : `${numerator} phần`} đã được tô màu. Phần tô màu chiếm bao nhiêu phần của ${shapeName.toLocaleLowerCase('vi')}?`,
        answerText: `${numerator}/${denominator}`,
        numericValue: numerator / denominator,
        expectedAnswer: { kind: 'FRACTION', numerator, denominator, requireExactForm: true },
        distractors: [
          `${denominator}/${numerator}`,
          `${numerator}/${denominator + 1}`,
          `${Math.max(0, numerator - 1)}/${denominator}`,
        ],
        explanation: `Có ${denominator} phần bằng nhau và tô ${numerator} phần, nên phân số là ${numerator}/${denominator}.`,
        hint: 'Mẫu số là tổng số phần bằng nhau; tử số là số phần đã tô.',
        visual: {
          type: visualType,
          ...visualAlt(
            `${shapeName} chia ${denominator} phần bằng nhau, tô màu ${numerator} phần.`,
          ),
          equalParts: denominator,
          shadedParts: numerator,
        },
      };
    }
    case 'read-write-fraction': {
      const { numerator, denominator } = fractions[variant] ?? fractions[0]!;
      const askNumerator = variant % 2 === 0;
      const answer = askNumerator ? numerator : denominator;
      return numberCore(
        `Trong phân số ${numerator}/${denominator}, ${askNumerator ? 'tử số' : 'mẫu số'} là số nào?`,
        answer,
        `${numerator} là tử số và ${denominator} là mẫu số của phân số ${numerator}/${denominator}.`,
        'Số viết trên gạch ngang là tử số; số viết dưới là mẫu số.',
      );
    }
    case 'equivalent-fractions': {
      const numerator = 1 + (variant % 3);
      const denominator = numerator + 2 + variant;
      const factor = 2 + (variant % 2);
      const answer = numerator * factor;
      return numberCore(
        `Tìm số thích hợp để hai phân số bằng nhau: ${numerator}/${denominator} = □/${denominator * factor}.`,
        answer,
        `Nhân cả tử số và mẫu số với ${factor}, nên số cần điền là ${answer}.`,
        `Mẫu số đã được nhân với ${factor}; hãy làm giống vậy với tử số.`,
      );
    }
    case 'compare-fractions': {
      const denominator = 5 + variant;
      const first = 1 + (variant % 2);
      const second = first + 2;
      return {
        stem: `So sánh hai phân số cùng mẫu ${first}/${denominator} và ${second}/${denominator}. Phân số nào lớn hơn?`,
        answerText: `${second}/${denominator}`,
        numericValue: second / denominator,
        expectedAnswer: {
          kind: 'FRACTION',
          numerator: second,
          denominator,
          requireExactForm: true,
        },
        distractors: [`${first}/${denominator}`, `${denominator}/${second}`, `${first}/${second}`],
        explanation: `Hai phân số cùng mẫu; ${second} > ${first} nên ${second}/${denominator} lớn hơn.`,
        hint: 'Hai phân số cùng mẫu số thì phân số có tử số lớn hơn sẽ lớn hơn.',
      };
    }
    case 'length-conversion': {
      const metres = 2 + variant;
      const answer = metres * 100;
      return numberCore(
        `${metres} m bằng bao nhiêu xăng-ti-mét?`,
        answer,
        `Vì 1 m = 100 cm nên ${metres} m = ${answer} cm.`,
        'Đổi mét sang xăng-ti-mét bằng cách nhân với 100.',
        {
          type: 'RULER',
          ...visualAlt(`Thước minh họa độ dài ${Math.min(10, metres + 3)} xăng-ti-mét.`),
          lengthCm: Math.min(10, metres + 3),
        },
      );
    }
    case 'mass-conversion': {
      const kilograms = 2 + variant;
      const answer = kilograms * 1_000;
      return numberCore(
        `${kilograms} kg bằng bao nhiêu gam?`,
        answer,
        `Vì 1 kg = 1 000 g nên ${kilograms} kg = ${answer.toLocaleString('vi-VN')} g.`,
        'Đổi ki-lô-gam sang gam bằng cách nhân với 1 000.',
      );
    }
    case 'compare-measurements': {
      const metres = 3 + variant;
      const centimetres = metres * 100 + 20 + variant;
      const answer = centimetres;
      return numberCore(
        `Đại lượng nào dài hơn: ${metres} m hay ${centimetres} cm? Trả lời bằng số xăng-ti-mét của đại lượng dài hơn.`,
        answer,
        `${metres} m = ${metres * 100} cm, nên ${centimetres} cm dài hơn.`,
        'Đổi cả hai đại lượng về xăng-ti-mét trước khi so sánh.',
      );
    }
    case 'read-clock': {
      const hour = 7 + variant;
      const minute = variant * 10;
      return numberCore(
        `Quan sát đồng hồ: kim phút chỉ bao nhiêu phút khi giờ là ${hour}?`,
        minute,
        `Kim phút chỉ ${minute} phút, nên đồng hồ là ${hour} giờ ${minute} phút.`,
        'Mỗi số trên mặt đồng hồ ứng với 5 phút.',
        {
          type: 'CLOCK',
          ...visualAlt(`Đồng hồ chỉ ${hour} giờ ${minute} phút.`),
          hour,
          minute,
        },
      );
    }
    case 'calculate-duration': {
      const start = 8 + variant;
      const duration = 2 + (variant % 2);
      const answer = start + duration;
      return numberCore(
        `Một hoạt động bắt đầu lúc ${start} giờ và kéo dài ${duration} giờ. Hoạt động kết thúc lúc mấy giờ?`,
        answer,
        `${start} + ${duration} = ${answer}, nên hoạt động kết thúc lúc ${answer} giờ.`,
        'Lấy giờ bắt đầu cộng thời gian kéo dài.',
      );
    }
    case 'money-change': {
      const paid = 100_000;
      const price = 42_000 + variant * 5_000;
      const answer = paid - price;
      return numberCore(
        `Mẹ mua hàng hết ${price.toLocaleString('vi-VN')} đồng và trả 100.000 đồng. Mẹ nhận lại bao nhiêu đồng?`,
        answer,
        `Tiền thừa là 100.000 − ${price.toLocaleString('vi-VN')} = ${answer.toLocaleString('vi-VN')} đồng.`,
        'Lấy số tiền đã trả trừ số tiền mua hàng.',
        {
          type: 'MONEY',
          ...visualAlt('Các tờ tiền có tổng giá trị 100.000 đồng.'),
          notes: [50_000, 20_000, 20_000, 10_000],
        },
      );
    }
    case 'recognize-shapes': {
      const examples = [
        { shape: 'SQUARE' as const, name: 'hình vuông', answer: 4 },
        { shape: 'RECTANGLE' as const, name: 'hình chữ nhật', answer: 4 },
        { shape: 'TRIANGLE' as const, name: 'hình tam giác', answer: 3 },
        { shape: 'SQUARE' as const, name: 'hình vuông', answer: 4 },
        { shape: 'CIRCLE' as const, name: 'hình tròn', answer: 0 },
      ];
      const example = examples[variant] ?? examples[0]!;
      const qualifier = variant === 3 ? 'thẳng' : '';
      return numberCore(
        `${example.name[0]?.toLocaleUpperCase('vi')}${example.name.slice(1)} có bao nhiêu cạnh ${qualifier}?`.replace(
          '  ',
          ' ',
        ),
        example.answer,
        `${example.name} có ${example.answer} cạnh.`,
        'Quan sát đường bao quanh hình và đếm từng cạnh.',
        {
          type: 'SHAPE',
          ...visualAlt(`Minh họa ${example.name}.`),
          shape: example.shape,
        },
      );
    }
    case 'classify-angles': {
      const degrees = [30, 45, 90, 120, 150][variant] ?? 30;
      const name = degrees < 90 ? 'góc nhọn' : degrees === 90 ? 'góc vuông' : 'góc tù';
      return {
        stem: `Góc có số đo ${degrees}° là góc gì?`,
        answerText: name,
        numericValue: degrees,
        expectedAnswer: { kind: 'TEXT', accepted: [name] },
        distractors: ['góc nhọn', 'góc vuông', 'góc tù'].filter((item) => item !== name),
        explanation: `${degrees}° là ${name}.`,
        hint: 'So sánh số đo với 90°.',
      };
    }
    case 'parallel-perpendicular': {
      const examples = [
        { shape: 'hình chữ nhật', relation: 'song song', answer: 2 },
        { shape: 'hình vuông', relation: 'vuông góc', answer: 4 },
        { shape: 'hình chữ nhật', relation: 'vuông góc', answer: 4 },
        { shape: 'hình vuông', relation: 'song song', answer: 2 },
        { shape: 'hình chữ nhật ABCD', relation: 'song song', answer: 2 },
      ];
      const example = examples[variant] ?? examples[0]!;
      return numberCore(
        `${example.shape} có bao nhiêu cặp cạnh ${example.relation}?`,
        example.answer,
        `${example.shape} có ${example.answer} cặp cạnh ${example.relation}.`,
        'Xét từng cặp cạnh kề nhau và đối diện.',
        {
          type: 'SHAPE',
          ...visualAlt(`Minh họa ${example.shape}.`),
          shape: example.shape.includes('vuông') ? 'SQUARE' : 'RECTANGLE',
        },
      );
    }
    case 'rectangle-perimeter': {
      const width = 7 + variant;
      const height = 3 + variant;
      const answer = (width + height) * 2;
      return numberCore(
        `Hình chữ nhật dài ${width} cm, rộng ${height} cm. Tính chu vi.`,
        answer,
        `(${width} + ${height}) × 2 = ${answer} cm.`,
        'Cộng chiều dài với chiều rộng rồi nhân 2.',
        {
          type: 'GEOMETRY_DIAGRAM',
          ...visualAlt(`Hình chữ nhật dài ${width} cm, rộng ${height} cm.`),
          shape: 'RECTANGLE',
          width,
          height,
          unit: 'cm',
        },
      );
    }
    case 'rectangle-area': {
      const width = 6 + variant;
      const height = 4 + variant;
      const answer = width * height;
      return numberCore(
        `Hình chữ nhật dài ${width} cm, rộng ${height} cm. Tính diện tích.`,
        answer,
        `${width} × ${height} = ${answer} cm².`,
        'Diện tích hình chữ nhật bằng chiều dài nhân chiều rộng.',
        {
          type: 'GEOMETRY_DIAGRAM',
          ...visualAlt(`Hình chữ nhật dài ${width} cm, rộng ${height} cm.`),
          shape: 'RECTANGLE',
          width,
          height,
          unit: 'cm',
        },
      );
    }
    case 'geometry-word-problem': {
      const width = 9 + variant;
      const height = 5 + variant;
      const answer = width * height;
      return numberCore(
        `Một mảnh vườn hình chữ nhật dài ${width} m, rộng ${height} m. Diện tích mảnh vườn là bao nhiêu mét vuông?`,
        answer,
        `${width} × ${height} = ${answer} m².`,
        'Dùng công thức diện tích hình chữ nhật.',
        {
          type: 'GEOMETRY_DIAGRAM',
          ...visualAlt(`Mảnh vườn hình chữ nhật dài ${width} m, rộng ${height} m.`),
          shape: 'RECTANGLE',
          width,
          height,
          unit: 'm',
        },
      );
    }
    case 'two-step-problem': {
      const morning = 24 + variant * 4;
      const extra = 16 + variant * 3;
      const answer = morning * 2 + extra;
      return numberCore(
        `Buổi sáng cửa hàng bán ${morning} hộp, buổi chiều bán nhiều hơn ${extra} hộp. Cả ngày bán bao nhiêu hộp?`,
        answer,
        `Buổi chiều bán ${morning + extra} hộp; cả ngày bán ${answer} hộp.`,
        'Tìm số hộp buổi chiều trước rồi tính tổng cả ngày.',
      );
    }
    case 'average-problem': {
      const first = 24 + variant * 6;
      const second = first + 6;
      const third = first + 12;
      const answer = first + 6;
      return numberCore(
        `Ba lớp trồng lần lượt ${first}, ${second} và ${third} cây. Trung bình mỗi lớp trồng bao nhiêu cây?`,
        answer,
        `(${first} + ${second} + ${third}) : 3 = ${answer}.`,
        'Tính tổng số cây rồi chia cho 3 lớp.',
      );
    }
    case 'read-bar-chart': {
      const values = [5 + variant, 8 + variant, 6 + variant, 9 + variant];
      const answer = values.reduce((total, value) => total + value, 0);
      return numberCore(
        `Biểu đồ cho biết bốn tổ lần lượt đọc ${values.join(', ')} quyển sách. Cả bốn tổ đọc bao nhiêu quyển?`,
        answer,
        `${values.join(' + ')} = ${answer}.`,
        'Đọc giá trị từng cột rồi cộng lại.',
        {
          type: 'BAR_CHART',
          ...visualAlt(`Biểu đồ cột bốn tổ có các giá trị ${values.join(', ')}.`),
          bars: values.map((value, index) => ({ label: `Tổ ${index + 1}`, value })),
        },
      );
    }
    case 'number-pattern': {
      const start = 5 + variant * 3;
      const step = 4 + variant;
      const answer = start + step * 4;
      return numberCore(
        `Tìm số tiếp theo trong dãy tăng đều: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ...`,
        answer,
        `Mỗi số tăng thêm ${step}, nên số tiếp theo là ${answer}.`,
        'Tìm hiệu giữa hai số đứng cạnh nhau.',
      );
    }
    default:
      throw new Error(`Missing reviewed template for ${blueprint.id}`);
  }
}
