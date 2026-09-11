import type {
  CurriculumDomain,
  CurriculumSkill,
  CurriculumTopic,
  GradeSummary,
  MisconceptionCode,
} from '@math-app/shared';

export type TemplateFamily =
  | 'PLACE_VALUE'
  | 'COMPARE'
  | 'ROUND'
  | 'SEQUENCE'
  | 'ADD'
  | 'SUBTRACT'
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'EXPRESSION'
  | 'FRACTION'
  | 'LENGTH'
  | 'MASS'
  | 'UNIT_CONVERSION'
  | 'CLOCK'
  | 'MONEY'
  | 'DURATION'
  | 'SHAPE'
  | 'ANGLE'
  | 'PARALLEL'
  | 'PERIMETER'
  | 'AREA'
  | 'GEOMETRY_WORD'
  | 'WORD_PROBLEM'
  | 'DATA'
  | 'LOGIC';

export interface ProblemBlueprint {
  id: string;
  domainId: string;
  topicId: string;
  name: string;
  description: string;
  family: TemplateFamily;
}

export const grade4: GradeSummary = {
  id: 'grade-4',
  grade: 4,
  name: 'Toán lớp 4',
  description: 'Chương trình luyện tập kỹ năng Toán lớp 4 theo chủ đề.',
};

export const domains: CurriculumDomain[] = [
  {
    id: 'number-and-operations',
    gradeId: grade4.id,
    name: 'Số và phép tính',
    description: 'Số tự nhiên, bốn phép tính và biểu thức.',
    order: 1,
    topicCount: 6,
  },
  {
    id: 'fractions',
    gradeId: grade4.id,
    name: 'Phân số',
    description: 'Nhận biết, biểu diễn và so sánh phân số.',
    order: 2,
    topicCount: 1,
  },
  {
    id: 'measurement',
    gradeId: grade4.id,
    name: 'Đại lượng và đo lường',
    description: 'Độ dài, khối lượng, thời gian và tiền Việt Nam.',
    order: 3,
    topicCount: 2,
  },
  {
    id: 'geometry',
    gradeId: grade4.id,
    name: 'Hình học',
    description: 'Góc, đường thẳng, chu vi và diện tích.',
    order: 4,
    topicCount: 2,
  },
  {
    id: 'word-problems',
    gradeId: grade4.id,
    name: 'Bài toán có lời văn',
    description: 'Bài toán một bước, nhiều bước và bài toán thực tế.',
    order: 5,
    topicCount: 1,
  },
  {
    id: 'data-and-statistics',
    gradeId: grade4.id,
    name: 'Thống kê và dữ liệu',
    description: 'Đọc bảng và biểu đồ cột đơn giản.',
    order: 6,
    topicCount: 1,
  },
  {
    id: 'logic',
    gradeId: grade4.id,
    name: 'Logic và tư duy',
    description: 'Quy luật số và suy luận phù hợp lứa tuổi.',
    order: 7,
    topicCount: 1,
  },
];

export const topics: CurriculumTopic[] = [
  {
    id: 'natural-numbers',
    domainId: 'number-and-operations',
    name: 'Số tự nhiên',
    skill: 'Đọc, viết và so sánh số',
    order: 1,
  },
  {
    id: 'addition',
    domainId: 'number-and-operations',
    name: 'Phép cộng',
    skill: 'Cộng số tự nhiên',
    order: 2,
  },
  {
    id: 'subtraction',
    domainId: 'number-and-operations',
    name: 'Phép trừ',
    skill: 'Trừ số tự nhiên',
    order: 3,
  },
  {
    id: 'multiplication',
    domainId: 'number-and-operations',
    name: 'Phép nhân',
    skill: 'Nhân và vận dụng',
    order: 4,
  },
  {
    id: 'division',
    domainId: 'number-and-operations',
    name: 'Phép chia',
    skill: 'Chia và vận dụng',
    order: 5,
  },
  {
    id: 'expressions',
    domainId: 'number-and-operations',
    name: 'Biểu thức',
    skill: 'Thứ tự thực hiện phép tính',
    order: 6,
  },
  {
    id: 'grade-4-fractions',
    domainId: 'fractions',
    name: 'Phân số lớp 4',
    skill: 'Biểu diễn và so sánh phân số',
    order: 1,
  },
  {
    id: 'units',
    domainId: 'measurement',
    name: 'Đơn vị đo',
    skill: 'Đổi và so sánh đơn vị',
    order: 1,
  },
  {
    id: 'time-and-money',
    domainId: 'measurement',
    name: 'Thời gian và tiền',
    skill: 'Giải quyết tình huống thực tế',
    order: 2,
  },
  {
    id: 'geometry-basics',
    domainId: 'geometry',
    name: 'Hình và góc',
    skill: 'Nhận dạng tính chất hình học',
    order: 1,
  },
  {
    id: 'perimeter-and-area',
    domainId: 'geometry',
    name: 'Chu vi và diện tích',
    skill: 'Tính chu vi, diện tích',
    order: 2,
  },
  {
    id: 'multi-step-word-problems',
    domainId: 'word-problems',
    name: 'Bài toán thực tế',
    skill: 'Chọn phép tính và giải nhiều bước',
    order: 1,
  },
  {
    id: 'tables-and-charts',
    domainId: 'data-and-statistics',
    name: 'Bảng và biểu đồ',
    skill: 'Đọc và so sánh dữ liệu',
    order: 1,
  },
  {
    id: 'patterns',
    domainId: 'logic',
    name: 'Quy luật',
    skill: 'Tìm quy luật và số còn thiếu',
    order: 1,
  },
];

export const problemBlueprints: ProblemBlueprint[] = [
  {
    id: 'read-write-numbers',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'Đọc và viết số',
    description: 'Nhận biết cách đọc, viết số tự nhiên.',
    family: 'PLACE_VALUE',
  },
  {
    id: 'digit-place-value',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'Giá trị chữ số',
    description: 'Xác định giá trị của chữ số theo hàng.',
    family: 'PLACE_VALUE',
  },
  {
    id: 'compare-numbers',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'So sánh và sắp xếp số',
    description: 'So sánh các số có nhiều chữ số.',
    family: 'COMPARE',
  },
  {
    id: 'round-numbers',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'Làm tròn số',
    description: 'Làm tròn đến hàng chục hoặc hàng trăm.',
    family: 'ROUND',
  },
  {
    id: 'mental-addition',
    domainId: 'number-and-operations',
    topicId: 'addition',
    name: 'Cộng nhẩm',
    description: 'Cộng nhẩm các số tròn chục, tròn trăm.',
    family: 'ADD',
  },
  {
    id: 'column-addition',
    domainId: 'number-and-operations',
    topicId: 'addition',
    name: 'Đặt tính rồi cộng',
    description: 'Cộng số tự nhiên có nhớ.',
    family: 'ADD',
  },
  {
    id: 'unknown-addend',
    domainId: 'number-and-operations',
    topicId: 'addition',
    name: 'Tìm số hạng chưa biết',
    description: 'Vận dụng quan hệ giữa tổng và số hạng.',
    family: 'ADD',
  },
  {
    id: 'mental-subtraction',
    domainId: 'number-and-operations',
    topicId: 'subtraction',
    name: 'Trừ nhẩm',
    description: 'Trừ nhẩm số tròn chục, tròn trăm.',
    family: 'SUBTRACT',
  },
  {
    id: 'column-subtraction',
    domainId: 'number-and-operations',
    topicId: 'subtraction',
    name: 'Đặt tính rồi trừ',
    description: 'Trừ số tự nhiên có nhớ.',
    family: 'SUBTRACT',
  },
  {
    id: 'unknown-subtraction-part',
    domainId: 'number-and-operations',
    topicId: 'subtraction',
    name: 'Tìm thành phần chưa biết',
    description: 'Tìm số bị trừ hoặc số trừ.',
    family: 'SUBTRACT',
  },
  {
    id: 'multiplication-facts',
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    name: 'Bảng nhân',
    description: 'Củng cố các bảng nhân.',
    family: 'MULTIPLY',
  },
  {
    id: 'multiply-one-digit',
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    name: 'Nhân với số có một chữ số',
    description: 'Đặt tính và nhân lần lượt.',
    family: 'MULTIPLY',
  },
  {
    id: 'multiply-two-digits',
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    name: 'Nhân với số có hai chữ số',
    description: 'Nhân số tự nhiên theo từng hàng.',
    family: 'MULTIPLY',
  },
  {
    id: 'equal-groups',
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    name: 'Nhiều nhóm bằng nhau',
    description: 'Dùng phép nhân trong tình huống nhóm đều.',
    family: 'MULTIPLY',
  },
  {
    id: 'division-facts',
    domainId: 'number-and-operations',
    topicId: 'division',
    name: 'Bảng chia',
    description: 'Củng cố các bảng chia.',
    family: 'DIVIDE',
  },
  {
    id: 'divide-one-digit',
    domainId: 'number-and-operations',
    topicId: 'division',
    name: 'Chia cho số có một chữ số',
    description: 'Thực hiện phép chia theo từng hàng.',
    family: 'DIVIDE',
  },
  {
    id: 'division-remainder',
    domainId: 'number-and-operations',
    topicId: 'division',
    name: 'Chia có dư',
    description: 'Tìm thương và kiểm tra số dư.',
    family: 'DIVIDE',
  },
  {
    id: 'sharing-equally',
    domainId: 'number-and-operations',
    topicId: 'division',
    name: 'Bài toán chia đều',
    description: 'Chia đồ vật thành các phần bằng nhau.',
    family: 'DIVIDE',
  },
  {
    id: 'operation-order',
    domainId: 'number-and-operations',
    topicId: 'expressions',
    name: 'Thứ tự thực hiện phép tính',
    description: 'Tính biểu thức theo đúng thứ tự.',
    family: 'EXPRESSION',
  },
  {
    id: 'parentheses-expression',
    domainId: 'number-and-operations',
    topicId: 'expressions',
    name: 'Biểu thức có ngoặc',
    description: 'Thực hiện phép tính trong ngoặc trước.',
    family: 'EXPRESSION',
  },
  {
    id: 'identify-fraction',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Nhận biết phân số',
    description: 'Nhận biết phần đã tô trong một đơn vị.',
    family: 'FRACTION',
  },
  {
    id: 'read-write-fraction',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Đọc và viết phân số',
    description: 'Xác định tử số và mẫu số.',
    family: 'FRACTION',
  },
  {
    id: 'equivalent-fractions',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Phân số bằng nhau',
    description: 'Nhận biết các phân số bằng nhau.',
    family: 'FRACTION',
  },
  {
    id: 'compare-fractions',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'So sánh phân số',
    description: 'So sánh phân số cùng mẫu số.',
    family: 'FRACTION',
  },
  {
    id: 'length-conversion',
    domainId: 'measurement',
    topicId: 'units',
    name: 'Đổi đơn vị độ dài',
    description: 'Đổi giữa m, dm và cm.',
    family: 'LENGTH',
  },
  {
    id: 'mass-conversion',
    domainId: 'measurement',
    topicId: 'units',
    name: 'Đổi đơn vị khối lượng',
    description: 'Đổi giữa kg và g.',
    family: 'MASS',
  },
  {
    id: 'compare-measurements',
    domainId: 'measurement',
    topicId: 'units',
    name: 'So sánh đại lượng',
    description: 'Đổi về cùng đơn vị trước khi so sánh.',
    family: 'UNIT_CONVERSION',
  },
  {
    id: 'read-clock',
    domainId: 'measurement',
    topicId: 'time-and-money',
    name: 'Đọc đồng hồ',
    description: 'Đọc giờ và phút trên mặt đồng hồ.',
    family: 'CLOCK',
  },
  {
    id: 'calculate-duration',
    domainId: 'measurement',
    topicId: 'time-and-money',
    name: 'Tính khoảng thời gian',
    description: 'Tìm thời gian kết thúc hoặc kéo dài.',
    family: 'DURATION',
  },
  {
    id: 'money-change',
    domainId: 'measurement',
    topicId: 'time-and-money',
    name: 'Tiền mua hàng và tiền thừa',
    description: 'Tính tổng tiền và tiền thừa.',
    family: 'MONEY',
  },
  {
    id: 'recognize-shapes',
    domainId: 'geometry',
    topicId: 'geometry-basics',
    name: 'Nhận dạng hình',
    description: 'Nhận biết hình theo tính chất.',
    family: 'SHAPE',
  },
  {
    id: 'classify-angles',
    domainId: 'geometry',
    topicId: 'geometry-basics',
    name: 'Nhận biết góc',
    description: 'Phân biệt góc vuông, nhọn và tù.',
    family: 'ANGLE',
  },
  {
    id: 'parallel-perpendicular',
    domainId: 'geometry',
    topicId: 'geometry-basics',
    name: 'Song song và vuông góc',
    description: 'Nhận biết quan hệ giữa hai đường thẳng.',
    family: 'PARALLEL',
  },
  {
    id: 'rectangle-perimeter',
    domainId: 'geometry',
    topicId: 'perimeter-and-area',
    name: 'Chu vi hình chữ nhật',
    description: 'Tính chu vi từ chiều dài và chiều rộng.',
    family: 'PERIMETER',
  },
  {
    id: 'rectangle-area',
    domainId: 'geometry',
    topicId: 'perimeter-and-area',
    name: 'Diện tích hình chữ nhật',
    description: 'Tính diện tích theo số đo cạnh.',
    family: 'AREA',
  },
  {
    id: 'geometry-word-problem',
    domainId: 'geometry',
    topicId: 'perimeter-and-area',
    name: 'Bài toán hình học thực tế',
    description: 'Vận dụng chu vi hoặc diện tích.',
    family: 'GEOMETRY_WORD',
  },
  {
    id: 'two-step-problem',
    domainId: 'word-problems',
    topicId: 'multi-step-word-problems',
    name: 'Bài toán hai bước',
    description: 'Tìm dữ kiện trung gian rồi trả lời.',
    family: 'WORD_PROBLEM',
  },
  {
    id: 'average-problem',
    domainId: 'word-problems',
    topicId: 'multi-step-word-problems',
    name: 'Tìm số trung bình cộng',
    description: 'Tính trung bình từ các số liệu đơn giản.',
    family: 'WORD_PROBLEM',
  },
  {
    id: 'read-bar-chart',
    domainId: 'data-and-statistics',
    topicId: 'tables-and-charts',
    name: 'Đọc biểu đồ cột',
    description: 'Đọc, so sánh và tính tổng dữ liệu.',
    family: 'DATA',
  },
  {
    id: 'number-pattern',
    domainId: 'logic',
    topicId: 'patterns',
    name: 'Tìm quy luật số',
    description: 'Tìm số tiếp theo trong dãy.',
    family: 'SEQUENCE',
  },
];

const prerequisiteProblemTypes: Record<string, string[]> = {
  'column-addition': ['mental-addition'],
  'unknown-addend': ['column-addition'],
  'column-subtraction': ['mental-subtraction'],
  'unknown-subtraction-part': ['column-subtraction'],
  'multiply-one-digit': ['multiplication-facts'],
  'multiply-two-digits': ['multiply-one-digit'],
  'equal-groups': ['multiplication-facts'],
  'division-facts': ['multiplication-facts'],
  'divide-one-digit': ['division-facts'],
  'division-remainder': ['divide-one-digit'],
  'sharing-equally': ['division-facts'],
  'parentheses-expression': ['operation-order'],
  'read-write-fraction': ['identify-fraction'],
  'equivalent-fractions': ['read-write-fraction'],
  'compare-fractions': ['read-write-fraction'],
  'compare-measurements': ['length-conversion', 'mass-conversion'],
  'calculate-duration': ['read-clock'],
  'rectangle-perimeter': ['recognize-shapes'],
  'rectangle-area': ['recognize-shapes'],
  'geometry-word-problem': ['rectangle-perimeter', 'rectangle-area'],
  'average-problem': ['divide-one-digit'],
  'read-bar-chart': ['mental-addition'],
  'number-pattern': ['compare-numbers'],
};

export function misconceptionCodeForFamily(family: TemplateFamily): MisconceptionCode {
  if (family === 'PLACE_VALUE') return 'PLACE_VALUE_ERROR';
  if (family === 'MULTIPLY') return 'MULTIPLICATION_FACT_GAP';
  if (family === 'DIVIDE') return 'DIVISION_FACT_GAP';
  if (family === 'FRACTION') return 'FRACTION_PART_WHOLE_CONFUSION';
  if (['LENGTH', 'MASS', 'UNIT_CONVERSION', 'CLOCK', 'DURATION', 'MONEY'].includes(family)) {
    return 'UNIT_CONVERSION_ERROR';
  }
  if (['SHAPE', 'ANGLE', 'PARALLEL', 'PERIMETER', 'AREA', 'GEOMETRY_WORD'].includes(family)) {
    return 'GEOMETRY_PROPERTY_CONFUSION';
  }
  if (family === 'WORD_PROBLEM') return 'WRONG_OPERATION';
  if (family === 'DATA' || family === 'SEQUENCE' || family === 'LOGIC') {
    return 'QUESTION_MISREAD';
  }
  if (family === 'EXPRESSION') return 'PROCEDURE_ERROR';
  return 'ARITHMETIC_SLIP';
}

export const skills: CurriculumSkill[] = problemBlueprints.map((problemType) => ({
  id: `${problemType.id}-skill`,
  topicId: problemType.topicId,
  name: problemType.name,
  prerequisiteSkillIds: (prerequisiteProblemTypes[problemType.id] ?? []).map((id) => `${id}-skill`),
  misconceptionCodes: [misconceptionCodeForFamily(problemType.family)],
}));
