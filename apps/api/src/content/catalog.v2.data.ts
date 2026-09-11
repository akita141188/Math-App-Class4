import type { ProblemBlueprint } from './catalog.data';
import { problemBlueprints as legacyBlueprints } from './catalog.data';

/**
 * Grade 4 taxonomy locked after the CTGDPT 2018 audit.
 * Existing ids are retained where possible so saved progress remains useful.
 * Broad legacy labels are narrowed here; separately practicable tasks get a new id.
 */
const narrowed: Record<string, Pick<ProblemBlueprint, 'name' | 'description'>> = {
  'read-write-numbers': {
    name: 'Đọc số tự nhiên',
    description: 'Đọc đúng số tự nhiên theo lớp và hàng.',
  },
  'compare-numbers': {
    name: 'So sánh số tự nhiên',
    description: 'So sánh hai số tự nhiên có nhiều chữ số.',
  },
  'read-write-fraction': {
    name: 'Xác định tử số và mẫu số',
    description: 'Xác định đúng tử số, mẫu số của một phân số.',
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
    description: 'Đổi các đơn vị diện tích liền kề phù hợp lớp 4.',
    family: 'UNIT_CONVERSION',
  },
  {
    id: 'time-conversion',
    domainId: 'measurement',
    topicId: 'time-and-money',
    name: 'Đổi đơn vị thời gian',
    description: 'Đổi giờ, phút, giây, ngày và tuần trong tình huống đơn giản.',
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
    description: 'Nhận biết hình qua các cặp cạnh và đặc điểm trực quan.',
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
];

export const finalizedProblemBlueprints: ProblemBlueprint[] = [
  ...legacyBlueprints.map((blueprint) => ({ ...blueprint, ...narrowed[blueprint.id] })),
  ...additionalBlueprints,
];

export const GRADE4_CONTENT_VERSION = 'grade4-v3';
export const GRADE4_GENERATION_SEED = 'grade4-bank-v3-reviewed-100';
export const MIN_QUESTIONS_PER_LEAF_TYPE = 100;
export const MAX_QUESTIONS_PER_LEAF_TYPE = 100;
export const QUESTIONS_PER_PROBLEM_TYPE = 100;
