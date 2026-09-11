import type {
  CommonError,
  Difficulty,
  ExpectedAnswer,
  Question,
  QuestionFormat,
  QuestionVisual,
} from '@math-app/shared';
import {
  misconceptionCodeForFamily,
  problemBlueprints,
  type ProblemBlueprint,
} from './catalog.data';
import { buildQuestionCore } from './question-templates';

interface QuestionCore {
  stem: string;
  answerText: string;
  numericValue: number;
  explanation: string;
  hint: string;
  visual?: QuestionVisual;
  fraction?: { numerator: number; denominator: number };
}

const difficulties: Difficulty[] = ['EASY', 'EASY', 'MEDIUM', 'MEDIUM', 'HARD'];

function formatFor(
  blueprint: ProblemBlueprint,
  problemIndex: number,
  variant: number,
): QuestionFormat {
  if (blueprint.family === 'FRACTION') {
    return (
      (['FILL_BLANK', 'SHORT_ANSWER', 'TRUE_FALSE', 'FILL_BLANK', 'MULTIPLE_CHOICE'] as const)[
        variant
      ] ?? 'FILL_BLANK'
    );
  }
  if (variant === 0 || (variant === 1 && problemIndex % 2 === 0)) return 'MULTIPLE_CHOICE';
  if (variant === 1) return 'SHORT_ANSWER';
  if (variant === 2) return problemIndex % 2 === 0 ? 'TRUE_FALSE' : 'MULTIPLE_SELECT';
  if (variant === 3) return 'FILL_BLANK';
  if (['compare-numbers', 'number-pattern'].includes(blueprint.id)) return 'ORDERING';
  if (['operation-order', 'length-conversion'].includes(blueprint.id)) return 'MATCHING';
  return 'WRITTEN_SOLUTION';
}

/** @deprecated Kept temporarily as a migration reference; production generation uses question-templates. */
export function buildLegacyQuestionCore(
  blueprint: ProblemBlueprint,
  variant: number,
): QuestionCore {
  const a = 12 + variant * 7;
  const b = 4 + variant;
  const visualBase = { alt: 'Hình minh họa phục vụ trực tiếp cho câu hỏi.' };

  switch (blueprint.family) {
    case 'PLACE_VALUE': {
      const value = (variant + 2) * 10_000 + 4_000 + (variant + 3) * 100 + 20 + 5;
      return {
        stem: `Trong số ${value.toLocaleString('vi-VN')}, chữ số 4 ở hàng nghìn có giá trị là bao nhiêu?`,
        answerText: '4000',
        numericValue: 4000,
        explanation: 'Chữ số 4 đứng ở hàng nghìn nên có giá trị là 4 000.',
        hint: 'Em xác định hàng của chữ số 4 trước.',
      };
    }
    case 'COMPARE': {
      const first = 32_450 + variant * 110;
      const second = first + 90 - variant * 10;
      return {
        stem: `Số nào lớn hơn: ${first.toLocaleString('vi-VN')} hay ${second.toLocaleString('vi-VN')}?`,
        answerText: String(second),
        numericValue: second,
        explanation: `${second.toLocaleString('vi-VN')} lớn hơn vì các hàng lớn giống nhau và phần còn lại lớn hơn.`,
        hint: 'So sánh lần lượt từ hàng có giá trị lớn nhất.',
      };
    }
    case 'ROUND': {
      const value = 12_340 + variant * 137;
      const rounded = Math.round(value / 100) * 100;
      return {
        stem: `Làm tròn số ${value.toLocaleString('vi-VN')} đến hàng trăm.`,
        answerText: String(rounded),
        numericValue: rounded,
        explanation: `Nhìn chữ số hàng chục để làm tròn, ta được ${rounded.toLocaleString('vi-VN')}.`,
        hint: 'Nếu chữ số hàng chục từ 5 trở lên, tăng hàng trăm thêm 1.',
        visual: {
          type: 'NUMBER_LINE',
          ...visualBase,
          start: rounded - 100,
          end: rounded + 100,
          marker: value,
        },
      };
    }
    case 'SEQUENCE': {
      const start = 5 + variant * 3;
      const step = 4 + variant;
      const answer = start + step * 4;
      return {
        stem: `Tìm số tiếp theo: ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ...`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `Mỗi số tăng thêm ${step}, nên số tiếp theo là ${answer}.`,
        hint: 'Tìm hiệu giữa hai số đứng cạnh nhau.',
      };
    }
    case 'LOGIC': {
      const answer = a + b;
      return {
        stem: `Số nào còn thiếu để ${a} + □ = ${answer}?`,
        answerText: String(b),
        numericValue: b,
        explanation: `Lấy ${answer} − ${a} = ${b}.`,
        hint: 'Dùng phép trừ để tìm số còn thiếu.',
      };
    }
    case 'ADD': {
      const first = 1_240 + variant * 113;
      const second = 560 + variant * 47;
      const answer = first + second;
      return {
        stem: `Tính ${first.toLocaleString('vi-VN')} + ${second.toLocaleString('vi-VN')}.`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `Đặt các hàng thẳng cột rồi cộng, kết quả là ${answer.toLocaleString('vi-VN')}.`,
        hint: 'Cộng từ hàng đơn vị và nhớ sang hàng kế tiếp khi cần.',
      };
    }
    case 'SUBTRACT': {
      const first = 4_600 + variant * 137;
      const second = 1_240 + variant * 59;
      const answer = first - second;
      return {
        stem: `Tính ${first.toLocaleString('vi-VN')} − ${second.toLocaleString('vi-VN')}.`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `Đặt các hàng thẳng cột rồi trừ, kết quả là ${answer.toLocaleString('vi-VN')}.`,
        hint: 'Trừ từ hàng đơn vị; đổi một đơn vị ở hàng kế tiếp khi cần.',
      };
    }
    case 'MULTIPLY': {
      const groups = 18 + variant * 7;
      const items = 3 + variant;
      const answer = groups * items;
      return {
        stem: `Có ${groups} hộp, mỗi hộp có ${items} chiếc bút. Có tất cả bao nhiêu chiếc bút?`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `Các nhóm bằng nhau nên dùng phép nhân: ${groups} × ${items} = ${answer}.`,
        hint: 'Lấy số hộp nhân với số bút trong mỗi hộp.',
        visual:
          blueprint.id === 'equal-groups'
            ? {
                type: 'OBJECT_GROUPS',
                ...visualBase,
                groups: Math.min(groups, 6),
                itemsPerGroup: items,
              }
            : undefined,
      };
    }
    case 'DIVIDE': {
      const divisor = 3 + variant;
      const quotient = 12 + variant * 4;
      const remainder = blueprint.id === 'division-remainder' ? variant + 1 : 0;
      const dividend = divisor * quotient + remainder;
      return {
        stem:
          remainder > 0
            ? `${dividend} chia cho ${divisor} có số dư là bao nhiêu?`
            : `Chia đều ${dividend} quyển vở cho ${divisor} bạn. Mỗi bạn nhận được bao nhiêu quyển?`,
        answerText: String(remainder > 0 ? remainder : quotient),
        numericValue: remainder > 0 ? remainder : quotient,
        explanation:
          remainder > 0
            ? `${dividend} = ${divisor} × ${quotient} + ${remainder}, nên số dư là ${remainder}.`
            : `${dividend} : ${divisor} = ${quotient}.`,
        hint: 'Dùng bảng nhân để tìm thương gần nhất.',
      };
    }
    case 'EXPRESSION': {
      const answer = blueprint.id === 'parentheses-expression' ? (a + b) * 3 : a + b * 3;
      const expression =
        blueprint.id === 'parentheses-expression' ? `(${a} + ${b}) × 3` : `${a} + ${b} × 3`;
      return {
        stem: `Tính giá trị biểu thức: ${expression}.`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `Thực hiện phép tính theo đúng thứ tự, ta được ${answer}.`,
        hint:
          blueprint.id === 'parentheses-expression'
            ? 'Tính trong ngoặc trước.'
            : 'Thực hiện phép nhân trước phép cộng.',
      };
    }
    case 'FRACTION': {
      const examples = [
        { numerator: 1, denominator: 6 },
        { numerator: 1, denominator: 2 },
        { numerator: 2, denominator: 3 },
        { numerator: 3, denominator: 4 },
        { numerator: 2, denominator: 5 },
      ];
      const fraction = examples[variant] ?? examples[0]!;
      const { numerator, denominator } = fraction;
      const answerText = `${numerator}/${denominator}`;
      const visualType = variant % 2 === 0 ? 'FRACTION_CIRCLE' : 'FRACTION_BAR';
      const shapeName = visualType === 'FRACTION_CIRCLE' ? 'Hình tròn' : 'Hình chữ nhật';
      return {
        stem: `${shapeName} được chia thành ${denominator} phần bằng nhau. ${numerator === 1 ? 'Một phần' : `${numerator} phần`} đã được tô màu. Phần tô màu chiếm bao nhiêu phần của ${shapeName.toLocaleLowerCase('vi')}?`,
        answerText,
        numericValue: numerator / denominator,
        explanation: `Hình được chia thành ${denominator} phần bằng nhau và tô ${numerator} phần, nên phân số là ${answerText}.`,
        hint: 'Mẫu số là tổng số phần bằng nhau; tử số là số phần đã tô.',
        fraction,
        visual: {
          type: visualType,
          ...visualBase,
          alt: `${shapeName} chia ${denominator} phần bằng nhau, tô màu ${numerator} phần.`,
          equalParts: denominator,
          shadedParts: numerator,
        },
      };
    }
    case 'LENGTH': {
      const metres = 2 + variant;
      const answer = metres * 100;
      return {
        stem: `${metres} m bằng bao nhiêu xăng-ti-mét?`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `Vì 1 m = 100 cm nên ${metres} m = ${answer} cm.`,
        hint: 'Đổi từ mét sang xăng-ti-mét bằng cách nhân với 100.',
        visual: { type: 'RULER', ...visualBase, lengthCm: Math.min(10, metres + 3) },
      };
    }
    case 'MASS': {
      const kilograms = 2 + variant;
      const answer = kilograms * 1000;
      return {
        stem: `${kilograms} kg bằng bao nhiêu gam?`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `Vì 1 kg = 1 000 g nên ${kilograms} kg = ${answer.toLocaleString('vi-VN')} g.`,
        hint: 'Đổi ki-lô-gam sang gam bằng cách nhân với 1 000.',
      };
    }
    case 'UNIT_CONVERSION': {
      const metres = 3 + variant;
      const centimetres = 40 + variant * 5;
      const answer = metres * 100 + centimetres;
      return {
        stem: `${metres} m ${centimetres} cm bằng bao nhiêu xăng-ti-mét?`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `${metres} m = ${metres * 100} cm; cộng thêm ${centimetres} cm được ${answer} cm.`,
        hint: 'Đổi phần mét sang xăng-ti-mét rồi cộng phần còn lại.',
      };
    }
    case 'CLOCK': {
      const hour = 7 + variant;
      const minute = variant * 10;
      return {
        stem: `Đồng hồ chỉ ${hour} giờ bao nhiêu phút?`,
        answerText: String(minute),
        numericValue: minute,
        explanation: `Kim phút chỉ ${minute} phút, nên đồng hồ chỉ ${hour} giờ ${minute} phút.`,
        hint: 'Mỗi số trên mặt đồng hồ ứng với 5 phút.',
        visual: { type: 'CLOCK', ...visualBase, hour, minute },
      };
    }
    case 'DURATION': {
      const start = 8 + variant;
      const duration = 2 + (variant % 2);
      const answer = start + duration;
      return {
        stem: `Một hoạt động bắt đầu lúc ${start} giờ và kéo dài ${duration} giờ. Hoạt động kết thúc lúc mấy giờ?`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `${start} + ${duration} = ${answer}, nên hoạt động kết thúc lúc ${answer} giờ.`,
        hint: 'Lấy giờ bắt đầu cộng thời gian kéo dài.',
      };
    }
    case 'MONEY': {
      const paid = 100_000;
      const price = 42_000 + variant * 5_000;
      const answer = paid - price;
      return {
        stem: `Mẹ mua hàng hết ${price.toLocaleString('vi-VN')} đồng và trả 100 000 đồng. Mẹ nhận lại bao nhiêu đồng?`,
        answerText: String(answer),
        numericValue: answer,
        explanation: `Tiền thừa là 100 000 − ${price.toLocaleString('vi-VN')} = ${answer.toLocaleString('vi-VN')} đồng.`,
        hint: 'Lấy số tiền đã trả trừ số tiền mua hàng.',
        visual: { type: 'MONEY', ...visualBase, notes: [50_000, 20_000, 20_000, 10_000] },
      };
    }
    case 'SHAPE':
    case 'ANGLE':
    case 'PARALLEL': {
      const answer = blueprint.family === 'PARALLEL' ? 2 : 4;
      const stem =
        blueprint.family === 'ANGLE'
          ? 'Hình vuông có bao nhiêu góc vuông?'
          : blueprint.family === 'PARALLEL'
            ? 'Hình chữ nhật có bao nhiêu cặp cạnh song song?'
            : 'Hình vuông có bao nhiêu cạnh bằng nhau?';
      return {
        stem,
        answerText: String(answer),
        numericValue: answer,
        explanation:
          blueprint.family === 'PARALLEL'
            ? 'Hai cặp cạnh đối diện của hình chữ nhật song song.'
            : 'Hình vuông có 4 cạnh bằng nhau và 4 góc vuông.',
        hint: 'Quan sát lần lượt từng cạnh và từng góc của hình.',
        visual: {
          type: 'SHAPE',
          ...visualBase,
          shape: blueprint.family === 'PARALLEL' ? 'RECTANGLE' : 'SQUARE',
        },
      };
    }
    case 'PERIMETER':
    case 'AREA':
    case 'GEOMETRY_WORD': {
      const width = 4 + variant;
      const height = 3 + variant;
      const areaQuestion = blueprint.family !== 'PERIMETER';
      const answer = areaQuestion ? width * height : (width + height) * 2;
      return {
        stem: `Một hình chữ nhật dài ${width} cm, rộng ${height} cm. Tính ${areaQuestion ? 'diện tích' : 'chu vi'} hình đó.`,
        answerText: String(answer),
        numericValue: answer,
        explanation: areaQuestion
          ? `${width} × ${height} = ${answer} cm².`
          : `(${width} + ${height}) × 2 = ${answer} cm.`,
        hint: areaQuestion
          ? 'Diện tích hình chữ nhật bằng chiều dài nhân chiều rộng.'
          : 'Cộng chiều dài với chiều rộng rồi nhân 2.',
        visual: {
          type: 'GEOMETRY_DIAGRAM',
          ...visualBase,
          shape: 'RECTANGLE',
          width,
          height,
          unit: 'cm',
        },
      };
    }
    case 'WORD_PROBLEM': {
      const first = 24 + variant * 4;
      const second = 16 + variant * 3;
      const third = 20 + variant * 2;
      const isAverage = blueprint.id === 'average-problem';
      const answer = isAverage ? (first + second + third) / 3 : (first + second) * 2;
      return {
        stem: isAverage
          ? `Ba lớp trồng được lần lượt ${first}, ${second} và ${third} cây. Trung bình mỗi lớp trồng bao nhiêu cây?`
          : `Buổi sáng cửa hàng bán ${first} hộp, buổi chiều bán nhiều hơn ${second} hộp. Cả ngày bán bao nhiêu hộp?`,
        answerText: String(answer),
        numericValue: answer,
        explanation: isAverage
          ? `Cộng ba số rồi chia 3, kết quả là ${answer}.`
          : `Buổi chiều bán ${first + second} hộp; cả ngày bán ${answer} hộp.`,
        hint: isAverage ? 'Tính tổng rồi chia cho số lớp.' : 'Tìm số hộp buổi chiều trước.',
      };
    }
    case 'DATA': {
      const values = [5 + variant, 8 + variant, 6 + variant, 9 + variant];
      const answer = values.reduce((total, value) => total + value, 0);
      return {
        stem: 'Dựa vào biểu đồ, bốn tổ đã đọc tổng cộng bao nhiêu quyển sách?',
        answerText: String(answer),
        numericValue: answer,
        explanation: `Cộng số sách của bốn tổ: ${values.join(' + ')} = ${answer}.`,
        hint: 'Đọc giá trị từng cột rồi cộng lại.',
        visual: {
          type: 'BAR_CHART',
          ...visualBase,
          bars: values.map((value, index) => ({ label: `Tổ ${index + 1}`, value })),
        },
      };
    }
  }
}

function commonErrorFor(blueprint: ProblemBlueprint): CommonError {
  if (blueprint.family === 'DIVIDE') {
    return {
      code: misconceptionCodeForFamily(blueprint.family),
      feedback: 'Mình kiểm tra lại bảng chia và số dư nhé.',
    };
  }
  if (blueprint.family === 'FRACTION') {
    return {
      code: misconceptionCodeForFamily(blueprint.family),
      feedback: 'Em đếm lại tổng số phần bằng nhau và số phần đã tô.',
    };
  }
  if (['LENGTH', 'MASS', 'UNIT_CONVERSION'].includes(blueprint.family)) {
    return {
      code: misconceptionCodeForFamily(blueprint.family),
      feedback: 'Mình đổi về cùng một đơn vị trước khi tính nhé.',
    };
  }
  if (
    ['SHAPE', 'ANGLE', 'PARALLEL', 'PERIMETER', 'AREA', 'GEOMETRY_WORD'].includes(blueprint.family)
  ) {
    return {
      code: misconceptionCodeForFamily(blueprint.family),
      feedback: 'Em quan sát lại cạnh, góc và công thức phù hợp.',
    };
  }
  return {
    code: misconceptionCodeForFamily(blueprint.family),
    feedback: 'Em kiểm tra lại từng bước tính, bắt đầu từ hàng đơn vị.',
  };
}

function buildQuestion(
  blueprint: ProblemBlueprint,
  problemIndex: number,
  variant: number,
): Question {
  const core = buildQuestionCore(blueprint, variant);
  const format = formatFor(blueprint, problemIndex, variant);
  let stem = core.stem;
  let expectedAnswer: ExpectedAnswer = core.expectedAnswer ?? {
    kind: 'NUMBER',
    value: core.numericValue,
  };
  let options: Question['options'];
  let orderingItems: Question['orderingItems'];
  let matchingPairs: Question['matchingPairs'];

  if (format === 'MULTIPLE_CHOICE') {
    const distractors = core.distractors ?? [
      String(Math.round(core.numericValue + Math.max(1, Math.abs(core.numericValue) * 0.1))),
      String(Math.round(core.numericValue + Math.max(2, Math.abs(core.numericValue) * 0.2))),
      String(
        Math.max(0, Math.round(core.numericValue - Math.max(1, Math.abs(core.numericValue) * 0.1))),
      ),
    ];
    options = [
      { id: 'a', label: core.answerText },
      { id: 'b', label: distractors[0] ?? 'Chưa đúng' },
      { id: 'c', label: distractors[1] ?? 'Cần tính lại' },
      { id: 'd', label: distractors[2] ?? 'Không đủ dữ kiện' },
    ];
    expectedAnswer = { kind: 'OPTION', optionId: 'a' };
  } else if (format === 'MULTIPLE_SELECT') {
    stem += ' Chọn tất cả thẻ ghi đúng kết quả.';
    options = [
      { id: 'a', label: core.answerText },
      { id: 'b', label: String(Math.round(core.numericValue + 1)) },
      { id: 'c', label: `Kết quả: ${core.answerText}` },
      { id: 'd', label: String(Math.round(core.numericValue - 1)) },
    ];
    expectedAnswer = { kind: 'OPTIONS', optionIds: ['a', 'c'] };
  } else if (format === 'TRUE_FALSE') {
    const claimIsCorrect = (problemIndex + variant) % 4 !== 0;
    const claim = claimIsCorrect ? core.answerText : String(Math.round(core.numericValue + 1));
    stem += ` Bạn An nói kết quả là ${claim}. Bạn An nói đúng hay sai?`;
    expectedAnswer = { kind: 'BOOLEAN', value: claimIsCorrect };
  } else if (format === 'ORDERING') {
    const base = Math.max(3, Math.round(core.numericValue));
    orderingItems = [
      { id: 'third', label: String(base + 3) },
      { id: 'first', label: String(base - 2) },
      { id: 'second', label: String(base) },
    ];
    stem = `Sắp xếp ${base - 2}, ${base} và ${base + 3} theo thứ tự từ bé đến lớn.`;
    expectedAnswer = { kind: 'ORDER', itemIds: ['first', 'second', 'third'] };
  } else if (format === 'MATCHING') {
    const base = Math.max(4, Math.round(core.numericValue));
    matchingPairs = [
      {
        leftId: 'left-1',
        leftLabel: `${base - 1} + 1`,
        rightId: 'right-1',
        rightLabel: String(base),
      },
      {
        leftId: 'left-2',
        leftLabel: `${base + 3} − 2`,
        rightId: 'right-2',
        rightLabel: String(base + 1),
      },
    ];
    stem = `Nối mỗi phép tính với kết quả đúng trong bài ${blueprint.name.toLocaleLowerCase('vi')}.`;
    expectedAnswer = {
      kind: 'MATCHES',
      pairs: [
        { leftId: 'left-1', rightId: 'right-1' },
        { leftId: 'left-2', rightId: 'right-2' },
      ],
    };
  }

  return {
    id: `g4-${blueprint.id}-${String(variant + 1).padStart(2, '0')}`,
    contentVersion: 'legacy-grade4-v1',
    templateId: `${blueprint.id}-legacy-${variant + 1}`,
    fingerprint: `${blueprint.id}-legacy-${variant + 1}`,
    generatorParams: { problemIndex, variant },
    grade: 4,
    domainId: blueprint.domainId,
    topicId: blueprint.topicId,
    skillId: `${blueprint.id}-skill`,
    problemTypeId: blueprint.id,
    format,
    difficulty: difficulties[variant] ?? 'MEDIUM',
    assessmentLevel: variant < 2 ? 'LEVEL_1' : variant < 4 ? 'LEVEL_2' : 'LEVEL_3',
    testEligible: false,
    scoreWeight: 1,
    stem,
    visual: core.visual,
    options,
    orderingItems,
    matchingPairs,
    expectedAnswer,
    solutionSteps: [
      { id: 'understand', instruction: 'Xác định dữ kiện và điều cần tìm.' },
      { id: 'calculate', instruction: core.hint },
      { id: 'conclude', instruction: 'Kiểm tra và viết đáp số.', expression: core.answerText },
    ],
    hints: [
      { level: 1, text: 'Đọc chậm đề bài và gạch chân dữ kiện quan trọng.' },
      { level: 2, text: core.hint },
      { level: 3, text: 'Em thử viết phép tính trước, chưa cần tính ngay.' },
    ],
    commonErrors: [commonErrorFor(blueprint)],
    prerequisiteSkillIds: [],
    explanation: core.explanation,
    status: 'REVIEWED',
    version: 1,
  };
}

export const questionBank: Question[] = problemBlueprints.flatMap((blueprint, problemIndex) =>
  [0, 1, 2, 3, 4].map((variant) => buildQuestion(blueprint, problemIndex, variant)),
);
