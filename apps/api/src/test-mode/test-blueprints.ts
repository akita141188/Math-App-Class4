import type { QuestionFormat, TestBlueprint } from '@math-app/shared';

const formats: Partial<Record<QuestionFormat, number>> = {
  SHORT_ANSWER: 4,
  FILL_BLANK: 4,
  MULTIPLE_CHOICE: 4,
  TRUE_FALSE: 4,
  WRITTEN_SOLUTION: 4,
};

function blueprint(
  id: string,
  title: string,
  kind: TestBlueprint['kind'],
  topicCoverage: string[],
  description: string,
): TestBlueprint {
  return {
    id,
    title,
    kind,
    grade: 4,
    description,
    totalScore: 10,
    questionCount: 20,
    sections: [
      {
        id: 'foundation',
        title: 'Kiến thức và kĩ năng cơ bản',
        questionCount: 10,
        scoreWeight: 5,
        topicIds: topicCoverage,
        formats: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK'],
        assessmentLevels: ['LEVEL_1', 'LEVEL_2'],
      },
      {
        id: 'application',
        title: 'Vận dụng',
        questionCount: 10,
        scoreWeight: 5,
        topicIds: topicCoverage,
        formats: ['SHORT_ANSWER', 'WRITTEN_SOLUTION'],
        assessmentLevels: ['LEVEL_2', 'LEVEL_3'],
      },
    ],
    topicCoverage,
    assessmentLevelDistribution: { LEVEL_1: 6, LEVEL_2: 10, LEVEL_3: 4 },
    formatDistribution: { ...formats },
  };
}

/**
 * The four periodic blueprints follow the Kết nối tri thức sequence used from
 * school year 2026-2027. Exact school test scope can still vary by local teaching pace,
 * so descriptions deliberately say "phạm vi tham khảo".
 */
export const testBlueprints: TestBlueprint[] = [
  blueprint(
    'mid-term-1',
    'Giữa học kỳ I',
    'MID_TERM_1',
    ['natural-numbers', 'expressions', 'geometry-basics', 'multi-step-word-problems'],
    'Phạm vi tham khảo theo tiến độ đầu học kỳ I: ôn tập, số chẵn/lẻ, biểu thức chứa chữ, bài toán nhiều bước, góc và số có nhiều chữ số.',
  ),
  blueprint(
    'end-term-1',
    'Cuối học kỳ I',
    'END_TERM_1',
    [
      'natural-numbers',
      'expressions',
      'addition',
      'subtraction',
      'units',
      'geometry-basics',
      'multi-step-word-problems',
    ],
    'Phạm vi tham khảo học kỳ I: số đến lớp triệu, đo lường, cộng trừ, tổng-hiệu, góc, vuông góc, song song, hình bình hành và hình thoi.',
  ),
  blueprint(
    'mid-term-2',
    'Giữa học kỳ II',
    'MID_TERM_2',
    ['multiplication', 'division', 'tables-and-charts', 'multi-step-word-problems'],
    'Phạm vi tham khảo đầu học kỳ II: phép nhân, phép chia, ước lượng, trung bình cộng, rút về đơn vị và thống kê - xác suất.',
  ),
  blueprint(
    'end-year',
    'Cuối năm',
    'END_YEAR',
    [
      'natural-numbers',
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'grade-4-fractions',
      'units',
      'geometry-basics',
      'perimeter-and-area',
      'multi-step-word-problems',
      'tables-and-charts',
    ],
    'Đánh giá tổng hợp cuối năm theo các mạch số và phép tính, phân số, hình học - đo lường, bài toán thực tế, thống kê và xác suất.',
  ),
  blueprint(
    'comprehensive',
    'Luyện đề tổng hợp',
    'COMPREHENSIVE',
    [
      'natural-numbers',
      'expressions',
      'multiplication',
      'division',
      'grade-4-fractions',
      'units',
      'geometry-basics',
      'multi-step-word-problems',
      'tables-and-charts',
    ],
    'Đề luyện tổng hợp để tự đánh giá; không đại diện cho phạm vi bắt buộc của một trường cụ thể.',
  ),
];
