import type { ProblemBlueprint } from './catalog.data';
import { problemBlueprints as legacyBlueprints } from './catalog.data';

/**
 * Grade 4 practice taxonomy audited against:
 * - CTGDPT 2018
 * - Toán 4 - Kết nối tri thức với cuộc sống
 * - national textbook policy effective from school year 2026-2027
 *
 * Existing ids are retained where possible so saved progress remains useful.
 * New ids are only added for independently practicable skills that were missing.
 */
const narrowed: Record<string, Pick<ProblemBlueprint, 'name' | 'description'>> = {
  'multiplication-facts': {
    name: 'Bảng nhân (Ôn nền)',
    description:
      'Ôn lại bảng nhân đã học ở lớp dưới; dùng để củng cố lỗ hổng, không dùng làm câu đánh giá định kỳ lớp 4.',
  },
  'equal-groups': {
    name: 'Nhiều nhóm bằng nhau (Ôn nền)',
    description:
      'Ôn mô hình nhóm bằng nhau trước khi học phép nhân lớp 4; không dùng làm câu đánh giá định kỳ.',
  },
  'division-facts': {
    name: 'Bảng chia (Ôn nền)',
    description:
      'Ôn lại bảng chia đã học ở lớp dưới; dùng để củng cố lỗ hổng, không dùng làm câu đánh giá định kỳ lớp 4.',
  },
  'sharing-equally': {
    name: 'Chia đều (Ôn nền)',
    description: 'Ôn ý nghĩa phép chia qua chia đều; không dùng làm câu đánh giá định kỳ lớp 4.',
  },
  'recognize-shapes': {
    name: 'Nhận dạng hình cơ bản (Ôn nền)',
    description:
      'Ôn nhận biết hình cơ bản; phần hình học trọng tâm lớp 4 dùng các dạng góc, vuông góc, song song, hình bình hành và hình thoi.',
  },
  'read-clock': {
    name: 'Đọc đồng hồ (Ôn nền)',
    description:
      'Ôn đọc đồng hồ kim; bài lớp 4 trọng tâm hơn dùng đổi đơn vị và tính khoảng thời gian.',
  },
  'read-write-numbers': {
    name: 'Đọc số tự nhiên',
    description: 'Đọc đúng số tự nhiên theo lớp và hàng, gồm các số đến lớp triệu.',
  },
  'compare-numbers': {
    name: 'So sánh số tự nhiên',
    description: 'So sánh hai số tự nhiên có nhiều chữ số.',
  },
  'round-numbers': {
    name: 'Làm tròn số tự nhiên',
    description: 'Làm tròn số đến hàng chục, trăm, nghìn, chục nghìn hoặc trăm nghìn.',
  },
  'read-write-fraction': {
    name: 'Xác định tử số và mẫu số',
    description: 'Xác định đúng tử số, mẫu số của một phân số.',
  },
  'compare-fractions': {
    name: 'So sánh phân số',
    description: 'So sánh phân số bằng các cách phù hợp chương trình lớp 4.',
  },
  'classify-angles': {
    name: 'Góc nhọn, góc vuông, góc tù, góc bẹt',
    description: 'Phân loại góc dựa vào số đo và hình minh họa.',
  },
  'parallel-perpendicular': {
    name: 'Nhận biết hai đường thẳng song song',
    description: 'Nhận biết quan hệ song song trong hình quen thuộc.',
  },
  'two-step-problem': {
    name: 'Bài toán hai bước cộng và trừ',
    description: 'Giải bài toán thực tế bằng hai bước cộng, trừ.',
  },
  'read-bar-chart': {
    name: 'Đọc giá trị trên biểu đồ cột',
    description: 'Đọc và tổng hợp số liệu từ biểu đồ cột.',
  },
  'number-pattern': {
    name: 'Quy luật số (bổ trợ)',
    description: 'Bài luyện tư duy về quy luật số; dùng như học liệu bổ trợ.',
  },
};

const additionalBlueprints: ProblemBlueprint[] = [
  {
    id: 'write-natural-numbers',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'Viết số tự nhiên',
    description: 'Viết số tự nhiên từ cách đọc hoặc cấu tạo theo hàng.',
    family: 'PLACE_VALUE',
  },
  {
    id: 'order-natural-numbers',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'Sắp xếp số tự nhiên',
    description: 'Sắp xếp một nhóm số theo thứ tự xác định.',
    family: 'COMPARE',
  },
  {
    id: 'missing-factor',
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    name: 'Tìm thừa số chưa biết',
    description: 'Tìm thừa số chưa biết từ tích và thừa số đã biết.',
    family: 'MULTIPLY',
  },
  {
    id: 'divide-two-digits',
    domainId: 'number-and-operations',
    topicId: 'division',
    name: 'Chia cho số có hai chữ số',
    description: 'Thực hiện phép chia số tự nhiên cho số có hai chữ số.',
    family: 'DIVIDE',
  },
  {
    id: 'read-fractions',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Đọc phân số',
    description: 'Đọc đúng phân số đã cho.',
    family: 'FRACTION',
  },
  {
    id: 'write-fractions',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Viết phân số',
    description: 'Viết phân số từ cách đọc hoặc mô tả tử số, mẫu số.',
    family: 'FRACTION',
  },
  {
    id: 'reduce-fractions',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Rút gọn phân số',
    description: 'Rút gọn phân số về dạng tối giản.',
    family: 'FRACTION',
  },
  {
    id: 'common-denominator',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Quy đồng mẫu số',
    description: 'Quy đồng mẫu số của hai phân số đơn giản.',
    family: 'FRACTION',
  },
  {
    id: 'add-fractions',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Cộng phân số',
    description: 'Cộng hai phân số theo phạm vi chương trình lớp 4.',
    family: 'FRACTION',
  },
  {
    id: 'subtract-fractions',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Trừ phân số',
    description: 'Trừ hai phân số và giữ kết quả không âm.',
    family: 'FRACTION',
  },
  {
    id: 'multiply-fractions',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Nhân phân số',
    description: 'Nhân hai phân số đơn giản.',
    family: 'FRACTION',
  },
  {
    id: 'divide-fractions',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Chia phân số',
    description: 'Chia hai phân số khác không.',
    family: 'FRACTION',
  },
  {
    id: 'fraction-of-quantity',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Tìm phân số của một số',
    description: 'Tìm một phân số của một số tự nhiên.',
    family: 'FRACTION',
  },
  {
    id: 'area-conversion',
    domainId: 'measurement',
    topicId: 'units',
    name: 'Đổi đơn vị diện tích',
    description: 'Đổi giữa đề-xi-mét vuông, mét vuông, mi-li-mét vuông và các đơn vị phù hợp.',
    family: 'UNIT_CONVERSION',
  },
  {
    id: 'time-conversion',
    domainId: 'measurement',
    topicId: 'time-and-money',
    name: 'Đổi đơn vị thời gian',
    description: 'Đổi giờ, phút, giây, ngày, tuần và thế kỉ trong tình huống phù hợp.',
    family: 'DURATION',
  },
  {
    id: 'count-money',
    domainId: 'measurement',
    topicId: 'time-and-money',
    name: 'Tính tổng tiền Việt Nam',
    description: 'Tính tổng giá trị các tờ tiền Việt Nam.',
    family: 'MONEY',
  },
  {
    id: 'perpendicular-lines',
    domainId: 'geometry',
    topicId: 'geometry-basics',
    name: 'Nhận biết hai đường thẳng vuông góc',
    description: 'Nhận biết hai đường thẳng tạo thành góc vuông.',
    family: 'PARALLEL',
  },
  {
    id: 'recognize-parallelogram-rhombus',
    domainId: 'geometry',
    topicId: 'geometry-basics',
    name: 'Nhận biết hình bình hành và hình thoi',
    description: 'Nhận biết hình bình hành và hình thoi qua đặc điểm cạnh.',
    family: 'SHAPE',
  },
  {
    id: 'square-perimeter',
    domainId: 'geometry',
    topicId: 'perimeter-and-area',
    name: 'Chu vi hình vuông',
    description: 'Tính chu vi hình vuông từ độ dài cạnh.',
    family: 'PERIMETER',
  },
  {
    id: 'square-area',
    domainId: 'geometry',
    topicId: 'perimeter-and-area',
    name: 'Diện tích hình vuông',
    description: 'Tính diện tích hình vuông từ độ dài cạnh.',
    family: 'AREA',
  },
  {
    id: 'sum-difference-problem',
    domainId: 'word-problems',
    topicId: 'multi-step-word-problems',
    name: 'Tìm hai số biết tổng và hiệu',
    description: 'Giải bài toán tìm hai số khi biết tổng và hiệu.',
    family: 'WORD_PROBLEM',
  },
  {
    id: 'unit-rate-problem',
    domainId: 'word-problems',
    topicId: 'multi-step-word-problems',
    name: 'Bài toán rút về đơn vị',
    description: 'Tìm giá trị một phần rồi tìm nhiều phần bằng nhau.',
    family: 'WORD_PROBLEM',
  },
  {
    id: 'read-data-table',
    domainId: 'data-and-statistics',
    topicId: 'tables-and-charts',
    name: 'Đọc bảng số liệu',
    description: 'Đọc, cộng và so sánh dữ liệu trong bảng.',
    family: 'DATA',
  },
  {
    id: 'compare-chart-data',
    domainId: 'data-and-statistics',
    topicId: 'tables-and-charts',
    name: 'So sánh dữ liệu trên biểu đồ',
    description: 'Tìm chênh lệch, lớn nhất hoặc nhỏ nhất trên biểu đồ cột.',
    family: 'DATA',
  },

  // Missing independently-practicable skills from Toán 4 Kết nối tri thức.
  {
    id: 'even-odd-numbers',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'Số chẵn, số lẻ',
    description: 'Nhận biết số chẵn, số lẻ dựa vào chữ số tận cùng.',
    family: 'PLACE_VALUE',
  },
  {
    id: 'variable-expression',
    domainId: 'number-and-operations',
    topicId: 'expressions',
    name: 'Biểu thức chứa chữ',
    description: 'Tính giá trị biểu thức chứa chữ khi biết giá trị của chữ.',
    family: 'EXPRESSION',
  },
  {
    id: 'three-step-word-problem',
    domainId: 'word-problems',
    topicId: 'multi-step-word-problems',
    name: 'Bài toán có ba bước tính',
    description: 'Giải bài toán thực tế cần ba bước tính liên tiếp.',
    family: 'WORD_PROBLEM',
  },
  {
    id: 'measure-angle-degrees',
    domainId: 'geometry',
    topicId: 'geometry-basics',
    name: 'Đo góc và đơn vị độ',
    description: 'Đọc số đo góc theo đơn vị độ trên hình minh họa.',
    family: 'ANGLE',
  },
  {
    id: 'place-and-class',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'Hàng và lớp',
    description: 'Xác định hàng và lớp của chữ số trong số có nhiều chữ số.',
    family: 'PLACE_VALUE',
  },
  {
    id: 'numbers-to-million',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'Số có sáu chữ số và số 1 000 000',
    description: 'Đọc, viết và cấu tạo số có sáu chữ số, số một triệu.',
    family: 'PLACE_VALUE',
  },
  {
    id: 'natural-number-sequence',
    domainId: 'number-and-operations',
    topicId: 'natural-numbers',
    name: 'Dãy số tự nhiên',
    description: 'Nhận biết số liền trước, số liền sau và điền số trong dãy số tự nhiên.',
    family: 'SEQUENCE',
  },
  {
    id: 'addition-properties',
    domainId: 'number-and-operations',
    topicId: 'addition',
    name: 'Tính chất giao hoán và kết hợp của phép cộng',
    description: 'Vận dụng tính chất phép cộng để tính thuận tiện.',
    family: 'ADD',
  },
  {
    id: 'multiplication-properties',
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    name: 'Tính chất giao hoán và kết hợp của phép nhân',
    description: 'Vận dụng tính chất phép nhân để tính thuận tiện.',
    family: 'MULTIPLY',
  },
  {
    id: 'multiply-divide-powers-of-ten',
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    name: 'Nhân, chia với 10, 100, 1 000',
    description: 'Nhân hoặc chia số tự nhiên với 10, 100, 1 000 và các lũy thừa 10 phù hợp.',
    family: 'MULTIPLY',
  },
  {
    id: 'distributive-property',
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    name: 'Tính chất phân phối của phép nhân đối với phép cộng',
    description: 'Vận dụng a × (b + c) = a × b + a × c để tính thuận tiện.',
    family: 'MULTIPLY',
  },
  {
    id: 'estimate-calculation',
    domainId: 'number-and-operations',
    topicId: 'multiplication',
    name: 'Ước lượng trong tính toán',
    description: 'Làm tròn các số thích hợp để ước lượng kết quả phép tính.',
    family: 'ROUND',
  },
  {
    id: 'statistical-data-series',
    domainId: 'data-and-statistics',
    topicId: 'tables-and-charts',
    name: 'Dãy số liệu thống kê',
    description: 'Đọc, nhận xét và khai thác dãy số liệu thống kê đơn giản.',
    family: 'DATA',
  },
  {
    id: 'event-frequency',
    domainId: 'data-and-statistics',
    topicId: 'tables-and-charts',
    name: 'Số lần xuất hiện của một sự kiện',
    description: 'Đếm và so sánh số lần một sự kiện xuất hiện trong phép thử đơn giản.',
    family: 'DATA',
  },
  {
    id: 'fraction-as-division',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Phân số và phép chia số tự nhiên',
    description: 'Viết thương của hai số tự nhiên dưới dạng phân số.',
    family: 'FRACTION',
  },
  {
    id: 'fraction-basic-property',
    domainId: 'fractions',
    topicId: 'grade-4-fractions',
    name: 'Tính chất cơ bản của phân số',
    description: 'Nhân hoặc chia cả tử số và mẫu số với cùng một số khác 0.',
    family: 'FRACTION',
  },
];

export const finalizedProblemBlueprints: ProblemBlueprint[] = [
  ...legacyBlueprints.map((blueprint) => ({ ...blueprint, ...narrowed[blueprint.id] })),
  ...additionalBlueprints,
];

export const GRADE4_CONTENT_VERSION = 'grade4-v3';
export const GRADE4_GENERATION_SEED = 'grade4-bank-v3-kntt2026-80x100';
export const MIN_QUESTIONS_PER_LEAF_TYPE = 100;
export const MAX_QUESTIONS_PER_LEAF_TYPE = 100;
export const QUESTIONS_PER_PROBLEM_TYPE = 100;
