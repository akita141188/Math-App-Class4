import type { QuestionVisual } from '@math-app/shared';
import type { ProblemBlueprint } from '../catalog.data';
import type { GeneratedCore } from './generator-types';

export const FOUNDATION_PRACTICE_ONLY_PROBLEM_TYPES = new Set<string>([
  'multiplication-facts',
  'equal-groups',
  'division-facts',
  'sharing-equally',
  'recognize-shapes',
  'read-clock',
]);

export function isGrade4TestEligible(problemTypeId: string): boolean {
  return !FOUNDATION_PRACTICE_ONLY_PROBLEM_TYPES.has(problemTypeId);
}

function upgradedAngleVisual(
  visual: QuestionVisual | undefined,
  mode: 'MEASURE' | 'CLASSIFY',
): QuestionVisual | undefined {
  if (!visual || visual.type !== 'ANGLE') return visual;

  return {
    ...visual,
    mode,
    vertexLabel: 'O',
    rayLabels: ['A', 'B'],
    alt:
      mode === 'MEASURE'
        ? 'Thước đo góc có đỉnh O, cạnh OA trùng vạch 0 độ và cạnh OB cần đọc số đo.'
        : 'Góc AOB cần phân loại bằng cách so sánh độ mở với góc vuông 90 độ tham chiếu.',
  };
}

function timeLineVisual(core: GeneratedCore): QuestionVisual | undefined {
  const startHour = Number(core.params.startHour);
  const startMinute = Number(core.params.startMinute);
  const durationMinutes = Number(core.params.duration);

  if (
    !Number.isInteger(startHour) ||
    !Number.isInteger(startMinute) ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  )
    return core.visual;

  const totalMinutes = startHour * 60 + startMinute + durationMinutes;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;

  return {
    type: 'TIME_LINE',
    alt: `Sơ đồ thời gian: bắt đầu ${startHour} giờ ${String(startMinute).padStart(2, '0')} phút, kéo dài ${durationMinutes} phút, cần tìm giờ kết thúc.`,
    startHour,
    startMinute,
    durationMinutes,
    endHour,
    endMinute,
    hideEnd: true,
  };
}

/**
 * Grade-4 content guardrail.
 *
 * Exact angle measurement is never inferred from a freehand drawing:
 * MEASURE questions must use the protractor scale. Classification questions use a
 * separate 90-degree reference and ask only for the angle type.
 */
export function applyGrade4RigorPolicy(
  blueprint: ProblemBlueprint,
  core: GeneratedCore,
): GeneratedCore {
  if (blueprint.id === 'measure-angle-degrees') {
    return {
      ...core,
      stem: 'Quan sát thước đo góc trong hình. Cạnh OA trùng với vạch 0°. Cạnh OB đi qua vạch bao nhiêu độ?',
      hints: [
        'Xác định đỉnh O và cạnh OA đang trùng với vạch 0° của thước đo góc.',
        'Theo đúng chiều của thang đo từ 0° trên cạnh OA đến vị trí cạnh OB.',
        'Đọc số ở vạch mà cạnh OB đi qua rồi kiểm tra đơn vị là độ.',
      ],
      explanation:
        core.expectedAnswer.kind === 'NUMBER'
          ? `Cạnh OA trùng vạch 0°, cạnh OB đi qua vạch ${core.expectedAnswer.value}°, nên góc AOB có số đo ${core.expectedAnswer.value}°.`
          : core.explanation,
      visual: upgradedAngleVisual(core.visual, 'MEASURE'),
    };
  }

  if (blueprint.id === 'classify-angles') {
    return {
      ...core,
      stem: 'Quan sát góc AOB trong hình. So sánh độ mở của góc AOB với góc vuông 90° ở ô tham chiếu. Góc AOB thuộc loại góc nào?',
      hints: [
        'Nhìn ô tham chiếu để nhớ độ mở của một góc vuông 90°.',
        'So sánh góc AOB với góc vuông: nhỏ hơn là góc nhọn, lớn hơn nhưng chưa bẹt là góc tù.',
        'Nếu hai cạnh vuông góc thì là góc vuông; nếu hai cạnh tạo thành một đường thẳng thì là góc bẹt.',
      ],
      visual: upgradedAngleVisual(core.visual, 'CLASSIFY'),
    };
  }

  if (blueprint.id === 'calculate-duration') {
    return {
      ...core,
      stem:
        core.expectedAnswer.kind === 'NUMBER'
          ? `Dựa vào sơ đồ thời gian. Hoạt động bắt đầu lúc ${String(core.params.startHour)} giờ ${String(core.params.startMinute).padStart(2, '0')} phút và kéo dài ${String(core.params.duration)} phút. Hoạt động kết thúc lúc mấy giờ mấy phút? Nhập theo dạng HHMM (ví dụ 9 giờ 05 phút nhập 905).`
          : core.stem,
      hints: [
        'Đọc thời điểm bắt đầu và thời lượng trên sơ đồ.',
        'Cộng thời lượng vào thời điểm bắt đầu; nếu số phút từ 60 trở lên thì đổi 60 phút thành 1 giờ.',
        'Đổi kết quả về giờ và phút rồi kiểm tra lại trên trục thời gian.',
      ],
      visual: timeLineVisual(core),
    };
  }

  return core;
}
