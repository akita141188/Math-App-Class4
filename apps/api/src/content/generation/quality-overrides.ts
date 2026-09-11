import type { QuestionVisual } from '@math-app/shared';
import type { ProblemBlueprint } from '../catalog.data';
import { formatVi } from './content-math';
import type { GeneratedCore } from './generator-types';

function numberCore(
  blueprint: ProblemBlueprint,
  template: number,
  params: Record<string, string | number | boolean>,
  stem: string,
  answer: number,
  strategy: string,
  explanation: string,
  visual?: QuestionVisual,
): GeneratedCore {
  return {
    templateId: `${blueprint.id}-t${template + 1}`,
    params,
    stem,
    expectedAnswer: { kind: 'NUMBER', value: answer },
    answerLabel: String(answer),
    distractors: [String(answer + 1), String(Math.max(0, answer - 1)), String(answer + 10)],
    hints: [
      'Xác định chính xác dữ kiện được hỏi.',
      strategy,
      'Tính rồi đối chiếu lại với dữ kiện ban đầu.',
    ],
    explanation,
    visual,
  };
}

function textCore(
  blueprint: ProblemBlueprint,
  template: number,
  params: Record<string, string | number | boolean>,
  stem: string,
  answer: string,
  distractors: string[],
  explanation: string,
  visual?: QuestionVisual,
): GeneratedCore {
  return {
    templateId: `${blueprint.id}-t${template + 1}`,
    params,
    stem,
    expectedAnswer: { kind: 'TEXT', accepted: [answer] },
    answerLabel: answer,
    distractors,
    hints: [
      'Quan sát toàn bộ hình hoặc dữ kiện trước khi trả lời.',
      'Nhớ lại tính chất định nghĩa của đối tượng được hỏi.',
      'Loại các phương án trái với tính chất đó.',
    ],
    explanation,
    visual,
  };
}

export function generateQualityOverride(
  blueprint: ProblemBlueprint,
  index: number,
): GeneratedCore | null {
  const template = index % 5;
  const serial = Math.floor(index / 5) + 1;
  const id = blueprint.id;

  if (id === 'digit-place-value') {
    const placeValues = [10, 100, 1_000, 10_000, 100_000] as const;
    const placeNames = ['chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn'];
    const digit = 2 + ((serial + template) % 7);
    const place = placeValues[template]!;
    const digits = String(2_000_000 + serial * 31_337)
      .padStart(7, '0')
      .split('');
    const position = digits.length - 1 - Math.log10(place);
    digits[position] = String(digit);
    const value = Number(digits.join(''));
    return numberCore(
      blueprint,
      template,
      { value, digit, place },
      `Trong số ${formatVi(value)}, chữ số ${digit} ở hàng ${placeNames[template]} có giá trị là bao nhiêu?`,
      digit * place,
      `Nhân ${digit} với giá trị của hàng ${placeNames[template]}.`,
      `Chữ số ${digit} ở hàng ${placeNames[template]} có giá trị ${formatVi(digit * place)}.`,
    );
  }

  if (id === 'multiplication-facts' || id === 'division-facts') {
    const pairIndex = serial - 1 + template * 20;
    const left = 2 + (pairIndex % 8);
    const right = 2 + (Math.floor(pairIndex / 8) % 8);
    const product = left * right;
    if (id === 'multiplication-facts') {
      const stems = [
        `Tính nhẩm ${left} × ${right}.`,
        `Điền số thích hợp: ${left} × ${right} = □.`,
        `Có ${left} nhóm, mỗi nhóm ${right} đồ vật. Có tất cả bao nhiêu đồ vật?`,
        `Bạn An đang kiểm tra phép nhân ${left} × ${right}. Kết quả đúng là bao nhiêu?`,
        `Dùng quan hệ với phép chia để tìm tích ${left} × ${right}.`,
      ];
      return numberCore(
        blueprint,
        template,
        { left, right },
        stems[template]!,
        product,
        `Vận dụng bảng nhân ${left} hoặc ${right}.`,
        `${left} × ${right} = ${product}.`,
      );
    }
    const stems = [
      `Tính nhẩm ${product} : ${left}.`,
      `Điền số thích hợp: ${product} : ${left} = □.`,
      `Chia đều ${product} đồ vật thành ${left} nhóm. Mỗi nhóm có bao nhiêu đồ vật?`,
      `Bạn An đang kiểm tra phép chia ${product} : ${left}. Thương đúng là bao nhiêu?`,
      `Dùng phép nhân ${left} × □ = ${product} để tìm thương.`,
    ];
    return numberCore(
      blueprint,
      template,
      { dividend: product, divisor: left, quotient: right },
      stems[template]!,
      right,
      `Tìm số nhân với ${left} được ${product}.`,
      `Vì ${left} × ${right} = ${product} nên ${product} : ${left} = ${right}.`,
    );
  }

  if (id === 'recognize-shapes') {
    const shapes = ['SQUARE', 'RECTANGLE', 'TRIANGLE', 'CIRCLE'] as const;
    const shapeNames = ['hình vuông', 'hình chữ nhật', 'hình tam giác', 'hình tròn'];
    const shapeIndex = (serial - 1) % shapes.length;
    const rotationDegrees = ((serial - 1) * 17 + template * 11) % 180;
    const answers = [
      [4, 4, 3, 0],
      [4, 4, 3, 0],
      [4, 4, 0, 0],
      [4, 2, 0, 0],
      [2, 2, 0, 0],
    ];
    const questions = [
      'Hình trong minh họa có bao nhiêu cạnh thẳng?',
      'Hình trong minh họa có bao nhiêu đỉnh?',
      'Hình trong minh họa có bao nhiêu góc vuông?',
      'Hình trong minh họa có bao nhiêu cạnh bằng nhau?',
      'Hình trong minh họa có bao nhiêu cặp cạnh song song?',
    ];
    const visual = {
      type: 'SHAPE',
      alt: `${shapeNames[shapeIndex]} được xoay ${rotationDegrees} độ.`,
      shape: shapes[shapeIndex],
      rotationDegrees,
    } as unknown as QuestionVisual;
    const answer = answers[template]![shapeIndex]!;
    return numberCore(
      blueprint,
      template,
      { shape: shapes[shapeIndex]!, rotationDegrees },
      questions[template]!,
      answer,
      'Đếm đúng đặc điểm được hỏi, không phụ thuộc hướng đặt hình.',
      `${shapeNames[shapeIndex]} có ${answer} ${['cạnh thẳng', 'đỉnh', 'góc vuông', 'cạnh bằng nhau', 'cặp cạnh song song'][template]}.`,
      visual,
    );
  }

  if (id === 'classify-angles') {
    const degreesByTemplate = [
      15 + serial * 3,
      95 + serial * 3,
      90,
      20 + serial * 2,
      100 + serial * 2,
    ];
    const degrees = degreesByTemplate[template]!;
    const rotationDegrees = ((serial - 1) * 13 + template * 7) % 180;
    const answer = degrees < 90 ? 'góc nhọn' : degrees === 90 ? 'góc vuông' : 'góc tù';
    const visual = {
      type: 'ANGLE',
      alt: `Góc ${degrees} độ, được quay ${rotationDegrees} độ.`,
      degrees,
      rotationDegrees,
    } as unknown as QuestionVisual;
    return textCore(
      blueprint,
      template,
      { degrees, rotationDegrees },
      'Quan sát góc trong hình. Đây là góc nhọn, góc vuông hay góc tù?',
      answer,
      ['góc nhọn', 'góc vuông', 'góc tù'].filter((value) => value !== answer),
      `${degrees}° ${degrees < 90 ? 'bé hơn' : degrees === 90 ? 'bằng' : 'lớn hơn'} 90°, nên là ${answer}.`,
      visual,
    );
  }

  if (id === 'parallel-perpendicular' || id === 'perpendicular-lines') {
    const relation = id === 'perpendicular-lines' ? 'vuông góc' : 'song song';
    const rotationDegrees = ((serial - 1) * 9 + template * 5) % 180;
    const separation = 28 + serial + template;
    const visual = {
      type: 'LINE_RELATION',
      alt: `Hai đường thẳng ${relation}.`,
      relation: id === 'perpendicular-lines' ? 'PERPENDICULAR' : 'PARALLEL',
      rotationDegrees,
      separation,
    } as unknown as QuestionVisual;
    return textCore(
      blueprint,
      template,
      { relation, rotationDegrees, separation },
      'Quan sát hai đường thẳng trong hình. Chúng song song hay vuông góc với nhau?',
      relation,
      relation === 'song song'
        ? ['vuông góc', 'cắt nhau nhưng không vuông góc']
        : ['song song', 'cắt nhau nhưng không vuông góc'],
      `Hai đường trong hình ${relation === 'song song' ? 'có cùng phương và không cắt nhau' : 'cắt nhau tạo thành góc 90°'}, nên chúng ${relation}.`,
      visual,
    );
  }

  if (id === 'recognize-parallelogram-rhombus') {
    const rhombus = (serial + template) % 2 === 0;
    const rotationDegrees = ((serial - 1) * 11 + template * 7) % 180;
    const skew = 18 + ((serial * 3 + template) % 28);
    const answer = rhombus ? 'hình thoi' : 'hình bình hành';
    const visual = {
      type: 'QUADRILATERAL',
      alt: `${answer} được đặt nghiêng.`,
      shape: rhombus ? 'RHOMBUS' : 'PARALLELOGRAM',
      rotationDegrees,
      skew,
    } as unknown as QuestionVisual;
    return textCore(
      blueprint,
      template,
      { rhombus, rotationDegrees, skew },
      'Quan sát tứ giác trong hình. Đó là hình bình hành hay hình thoi?',
      answer,
      answer === 'hình thoi' ? ['hình bình hành', 'hình chữ nhật'] : ['hình thoi', 'hình vuông'],
      rhombus
        ? 'Tứ giác có bốn cạnh bằng nhau và hai cặp cạnh đối diện song song nên là hình thoi.'
        : 'Tứ giác có hai cặp cạnh đối diện song song nên là hình bình hành.',
      visual,
    );
  }

  return null;
}
