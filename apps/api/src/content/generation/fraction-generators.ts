import type { QuestionVisual } from '@math-app/shared';
import type { ProblemBlueprint } from '../catalog.data';
import { gcd, lcm, reduceFraction } from './content-math';
import type { GeneratedCore } from './generator-types';

const fractionWordNames: Record<number, string> = {
  1: 'một',
  2: 'hai',
  3: 'ba',
  4: 'bốn',
  5: 'năm',
  6: 'sáu',
  7: 'bảy',
  8: 'tám',
  9: 'chín',
  10: 'mười',
  11: 'mười một',
  12: 'mười hai',
};

function fractionText(numerator: number, denominator: number) {
  return `${numerator}/${denominator}`;
}

function fractionWords(numerator: number, denominator: number) {
  return `${fractionWordNames[numerator] ?? numerator} phần ${fractionWordNames[denominator] ?? denominator}`;
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
  requireExactForm = false,
  visual?: QuestionVisual,
): GeneratedCore {
  const answerLabel = fractionText(numerator, denominator);
  return {
    templateId: `${blueprint.id}-t${template + 1}`,
    params,
    stem,
    expectedAnswer: { kind: 'FRACTION', numerator, denominator, requireExactForm },
    answerLabel,
    distractors: [
      fractionText(denominator, numerator),
      fractionText(numerator + 1, denominator),
      fractionText(numerator, denominator + 1),
    ],
    hints: [
      'Xác định tử số, mẫu số và phép toán được hỏi.',
      strategy,
      'Thực hiện phép tính rồi kiểm tra lại bằng tính chất phân số.',
    ],
    explanation,
    visual,
  };
}

export function generateFractionCore(
  blueprint: ProblemBlueprint,
  index: number,
): GeneratedCore | null {
  if (blueprint.family !== 'FRACTION') return null;
  const template = index % 5;
  const serial = Math.floor(index / 5) + 1;
  const denominator = 3 + ((serial * 3 + template * 5) % 17);
  const numerator = 1 + ((serial + template * 2) % (denominator - 1));
  const id = blueprint.id;

  if (id === 'identify-fraction') {
    const candidates: Array<{ equalParts: number; shadedParts: number }> = [];
    for (let equalParts = 2; equalParts <= 12; equalParts += 1) {
      for (let shadedParts = 1; shadedParts < equalParts; shadedParts += 1) {
        // Reserve 1/6 for the explicit canonical regression case below.
        if (equalParts === 6 && shadedParts === 1) continue;
        candidates.push({ equalParts, shadedParts });
      }
    }
    const chosen =
      template === 0 && serial === 1
        ? { equalParts: 6, shadedParts: 1 }
        : candidates[((serial - 1) * 7 + template * 13) % candidates.length]!;
    const { equalParts, shadedParts } = chosen;
    const visualType = template % 2 === 0 ? 'FRACTION_CIRCLE' : 'FRACTION_BAR';
    const shape = visualType === 'FRACTION_CIRCLE' ? 'Hình tròn' : 'Hình chữ nhật';
    return fractionCore(
      blueprint,
      template,
      { equalParts, shadedParts, visualType },
      `${shape} được chia thành ${equalParts} phần bằng nhau. ${shadedParts} phần đã được tô màu. Phần tô màu chiếm bao nhiêu phần của ${shape.toLocaleLowerCase('vi')}?`,
      shadedParts,
      equalParts,
      'Mẫu số là tổng số phần bằng nhau; tử số là số phần đã tô.',
      `Có ${equalParts} phần bằng nhau và ${shadedParts} phần được tô nên phân số là ${shadedParts}/${equalParts}.`,
      true,
      {
        type: visualType,
        alt: `${shape} chia thành ${equalParts} phần bằng nhau, tô ${shadedParts} phần.`,
        equalParts,
        shadedParts,
      },
    );
  }

  if (id === 'read-write-fraction') {
    const askNumerator = template % 2 === 0;
    const answer = askNumerator ? numerator : denominator;
    return {
      templateId: `${id}-t${template + 1}`,
      params: { numerator, denominator, askNumerator },
      stem: `Trong phân số ${numerator}/${denominator}, ${askNumerator ? 'tử số' : 'mẫu số'} là số nào?`,
      expectedAnswer: { kind: 'NUMBER', value: answer },
      answerLabel: String(answer),
      distractors: [
        String(askNumerator ? denominator : numerator),
        String(answer + 1),
        String(Math.max(0, answer - 1)),
      ],
      hints: [
        'Quan sát vị trí hai số quanh gạch phân số.',
        'Số trên gạch là tử số; số dưới gạch là mẫu số.',
        'Đối chiếu vị trí được hỏi rồi trả lời một số.',
      ],
      explanation: `${numerator} là tử số và ${denominator} là mẫu số của ${numerator}/${denominator}.`,
    };
  }

  if (id === 'read-fractions') {
    const words = fractionWords(numerator, denominator);
    return {
      templateId: `${id}-t${template + 1}`,
      params: { numerator, denominator },
      stem: `Phân số ${numerator}/${denominator} đọc là gì?`,
      expectedAnswer: { kind: 'TEXT', accepted: [words] },
      answerLabel: words,
      distractors: [
        fractionWords(denominator, numerator),
        `${fractionWordNames[numerator] ?? numerator} trên ${fractionWordNames[denominator] ?? denominator}`,
        `${words} phần`,
      ],
      hints: ['Đọc tử số trước.', 'Đọc từ “phần” ở giữa.', 'Đọc mẫu số sau cùng.'],
      explanation: `Đọc tử số ${numerator}, từ “phần”, rồi mẫu số ${denominator}: “${words}”.`,
    };
  }

  if (id === 'write-fractions') {
    return fractionCore(
      blueprint,
      template,
      { numerator, denominator },
      `Viết phân số được đọc là “${fractionWords(numerator, denominator)}”.`,
      numerator,
      denominator,
      'Viết tử số ở trên và mẫu số ở dưới gạch phân số.',
      `“${fractionWords(numerator, denominator)}” được viết là ${numerator}/${denominator}.`,
      true,
    );
  }

  if (id === 'equivalent-fractions') {
    const factor = 2 + (template % 4);
    return fractionCore(
      blueprint,
      template,
      { numerator, denominator, factor },
      `Tìm phân số bằng ${numerator}/${denominator} có mẫu số là ${denominator * factor}.`,
      numerator * factor,
      denominator * factor,
      `Mẫu số được nhân với ${factor}; nhân tử số với cùng số đó.`,
      `Nhân cả tử và mẫu của ${numerator}/${denominator} với ${factor}, được ${numerator * factor}/${denominator * factor}.`,
      true,
    );
  }

  if (id === 'reduce-fractions') {
    const baseDenominator = 3 + serial + template;
    const baseNumerator = 1 + ((serial + template) % (baseDenominator - 1));
    const factor = 2 + (template % 4);
    const rawNumerator = baseNumerator * factor;
    const rawDenominator = baseDenominator * factor;
    const reduced = reduceFraction(rawNumerator, rawDenominator);
    return fractionCore(
      blueprint,
      template,
      { rawNumerator, rawDenominator },
      `Rút gọn phân số ${rawNumerator}/${rawDenominator} về dạng tối giản.`,
      reduced.numerator,
      reduced.denominator,
      'Chia cả tử số và mẫu số cho ước chung lớn nhất.',
      `Ước chung lớn nhất của ${rawNumerator} và ${rawDenominator} là ${gcd(rawNumerator, rawDenominator)}; rút gọn được ${reduced.numerator}/${reduced.denominator}.`,
      true,
    );
  }

  if (id === 'common-denominator') {
    const leftDenominator = 2 + ((serial + template) % 7);
    const rightDenominator = 3 + ((serial * 2 + template) % 8);
    const common = lcm(leftDenominator, rightDenominator);
    const leftNumerator = 1 + (serial % (leftDenominator - 1));
    const answerNumerator = leftNumerator * (common / leftDenominator);
    return fractionCore(
      blueprint,
      template,
      { leftNumerator, leftDenominator, rightDenominator, common },
      `Quy đồng ${leftNumerator}/${leftDenominator} theo mẫu số chung nhỏ nhất của ${leftDenominator} và ${rightDenominator}. Phân số mới là bao nhiêu?`,
      answerNumerator,
      common,
      'Tìm bội chung nhỏ nhất của hai mẫu rồi nhân cả tử và mẫu với cùng thừa số.',
      `Mẫu chung nhỏ nhất là ${common}; ${leftNumerator}/${leftDenominator} = ${answerNumerator}/${common}.`,
      true,
    );
  }

  if (id === 'compare-fractions') {
    const commonDenominator = 5 + serial + template;
    const leftNumerator = 1 + ((serial + template) % (commonDenominator - 2));
    const rightNumerator = leftNumerator + 1;
    return fractionCore(
      blueprint,
      template,
      { leftNumerator, rightNumerator, commonDenominator },
      `Hai phân số ${leftNumerator}/${commonDenominator} và ${rightNumerator}/${commonDenominator}, phân số nào lớn hơn?`,
      rightNumerator,
      commonDenominator,
      'Hai phân số cùng mẫu: so sánh hai tử số.',
      `Vì ${rightNumerator} > ${leftNumerator} nên ${rightNumerator}/${commonDenominator} lớn hơn.`,
      true,
    );
  }

  if (id === 'add-fractions' || id === 'subtract-fractions') {
    const commonDenominator = 6 + serial + template;
    const leftNumerator =
      1 + ((serial + template) % Math.max(2, Math.floor(commonDenominator / 2)));
    const rightNumerator =
      id === 'subtract-fractions'
        ? 1 + (template % leftNumerator)
        : 1 + ((serial * 2 + template) % Math.max(2, commonDenominator - leftNumerator));
    const rawNumerator =
      id === 'add-fractions' ? leftNumerator + rightNumerator : leftNumerator - rightNumerator;
    const safeLeft =
      id === 'subtract-fractions' && rawNumerator <= 0 ? rightNumerator + 1 : leftNumerator;
    const result = {
      numerator: id === 'add-fractions' ? safeLeft + rightNumerator : safeLeft - rightNumerator,
      denominator: commonDenominator,
    };
    const symbol = id === 'add-fractions' ? '+' : '−';
    return fractionCore(
      blueprint,
      template,
      { leftNumerator: safeLeft, rightNumerator, commonDenominator },
      `Tính ${safeLeft}/${commonDenominator} ${symbol} ${rightNumerator}/${commonDenominator}.`,
      result.numerator,
      result.denominator,
      'Hai phân số cùng mẫu: thực hiện phép tính với tử số, giữ nguyên mẫu rồi rút gọn.',
      `${safeLeft}/${commonDenominator} ${symbol} ${rightNumerator}/${commonDenominator} = ${result.numerator}/${result.denominator}.`,
    );
  }

  if (id === 'multiply-fractions') {
    const rightNumerator = 1 + (template % 4);
    const rightDenominator = rightNumerator + 2 + (serial % 5);
    const result = {
      numerator: numerator * rightNumerator,
      denominator: denominator * rightDenominator,
    };
    return fractionCore(
      blueprint,
      template,
      { numerator, denominator, rightNumerator, rightDenominator },
      `Tính ${numerator}/${denominator} × ${rightNumerator}/${rightDenominator}.`,
      result.numerator,
      result.denominator,
      'Nhân tử với tử, mẫu với mẫu rồi rút gọn.',
      `${numerator}/${denominator} × ${rightNumerator}/${rightDenominator} = ${result.numerator}/${result.denominator}.`,
    );
  }

  if (id === 'divide-fractions') {
    const rightNumerator = 1 + (template % 4);
    const rightDenominator = rightNumerator + 2 + (serial % 5);
    const result = {
      numerator: numerator * rightDenominator,
      denominator: denominator * rightNumerator,
    };
    return fractionCore(
      blueprint,
      template,
      { numerator, denominator, rightNumerator, rightDenominator },
      `Tính ${numerator}/${denominator} : ${rightNumerator}/${rightDenominator}.`,
      result.numerator,
      result.denominator,
      'Nhân phân số thứ nhất với phân số đảo ngược của phân số thứ hai.',
      `${numerator}/${denominator} : ${rightNumerator}/${rightDenominator} = ${result.numerator}/${result.denominator}.`,
    );
  }

  if (id === 'fraction-of-quantity') {
    const partDenominator = 2 + ((serial + template) % 9);
    const partNumerator = 1 + ((serial * 2 + template) % (partDenominator - 1));
    const unit = 4 + serial * 2 + template;
    const whole = unit * partDenominator;
    const answer = unit * partNumerator;
    return {
      templateId: `${id}-t${template + 1}`,
      params: { partNumerator, partDenominator, whole },
      stem: `Tìm ${partNumerator}/${partDenominator} của ${whole}.`,
      expectedAnswer: { kind: 'NUMBER', value: answer },
      answerLabel: String(answer),
      distractors: [
        String(whole / partDenominator),
        String(whole * partNumerator),
        String(answer + partDenominator),
      ],
      hints: [
        'Xác định số đã cho và phân số cần tìm.',
        `Chia ${whole} cho ${partDenominator} để tìm một phần.`,
        `Nhân giá trị một phần với ${partNumerator}.`,
      ],
      explanation: `${whole} : ${partDenominator} × ${partNumerator} = ${answer}.`,
    };
  }

  return null;
}
