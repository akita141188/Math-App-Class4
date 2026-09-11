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

export const testBlueprints: TestBlueprint[] = [
  blueprint(
    'mid-term-1',
    'Giữa học kỳ I',
    'MID_TERM_1',
    ['natural-numbers', 'addition', 'subtraction', 'geometry-basics'],
    'Ôn số tự nhiên, cộng trừ và hình học cơ bản.',
  ),
  blueprint(
    'end-term-1',
    'Cuối học kỳ I',
    'END_TERM_1',
    ['natural-numbers', 'multiplication', 'division', 'units', 'multi-step-word-problems'],
    'Đánh giá tổng hợp kiến thức trọng tâm học kỳ I.',
  ),
  blueprint(
    'mid-term-2',
    'Giữa học kỳ II',
    'MID_TERM_2',
    ['grade-4-fractions', 'time-and-money', 'perimeter-and-area', 'tables-and-charts'],
    'Ôn phân số, đo lường, hình học và dữ liệu.',
  ),
  blueprint(
    'end-year',
    'Cuối năm',
    'END_YEAR',
    [
      'natural-numbers',
      'grade-4-fractions',
      'units',
      'perimeter-and-area',
      'multi-step-word-problems',
      'tables-and-charts',
    ],
    'Đánh giá tổng hợp các mạch kiến thức Toán lớp 4.',
  ),
  blueprint(
    'comprehensive',
    'Kiểm tra tổng hợp',
    'COMPREHENSIVE',
    ['expressions', 'grade-4-fractions', 'time-and-money', 'geometry-basics', 'patterns'],
    'Một đề tổng hợp để tự đánh giá trước khi ôn tiếp.',
  ),
];
