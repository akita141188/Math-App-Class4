# Question model

Question gồm metadata curriculum, `contentVersion`, `templateId`, `fingerprint`, `generatorParams`, format, difficulty, `assessmentLevel`, `testEligible`, `scoreWeight`, stem, visual có cấu trúc, options, expectedAnswer, solutionSteps, hints, commonErrors, explanation, status và version.

## Format

SHORT_ANSWER, MULTIPLE_CHOICE, MULTIPLE_SELECT, TRUE_FALSE, FILL_BLANK, ORDERING, MATCHING và WRITTEN_SOLUTION.

## Đáp án

ExpectedAnswer là discriminated union: NUMBER, FRACTION, TEXT, OPTION, OPTIONS, BOOLEAN, ORDER hoặc MATCHES. Không dùng any. FRACTION dùng tử số/mẫu số có kiểu; `requireExactForm` phân biệt bài nhận dạng hình (phải giữ đúng dạng được dạy) với bài chấp nhận phân số tương đương. API practice chuyển Question thành StudentQuestion trước khi trả về, loại bỏ expectedAnswer, solutionSteps, commonErrors, explanation và generatorParams. API test dùng TestQuestion chặt hơn: loại thêm hints và assessmentLevel; hai trường này không xuất hiện trước khi nộp bài.

## Visual

QuestionVisual là dữ liệu typed, không chứa HTML tùy ý. Renderer hỗ trợ FRACTION_BAR, FRACTION_CIRCLE, SHAPE, RECTANGLE_GRID, NUMBER_LINE, CLOCK, RULER, MONEY, BAR_CHART, TABLE, OBJECT_GROUPS, GEOMETRY_DIAGRAM, ANGLE, LINE_RELATION và QUADRILATERAL.

FRACTION_BAR và FRACTION_CIRCLE lưu `equalParts` và `shadedParts`. Renderer vòng tròn sinh các sector có góc ở tâm bằng nhau và clip toàn bộ phần tô trong đường tròn.

## Validation

Deterministic validator so sánh số, phân số, text chuẩn hóa, option, set, boolean, thứ tự và matching. Payload phân số của học sinh có dạng `{ kind: 'FRACTION', numerator, denominator }`. LLM không tham gia quyết định đúng sai.

Với câu giá trị hàng, nếu chữ số mục tiêu xuất hiện nhiều lần thì stem phải chỉ rõ hàng hoặc vị trí. Content validator từ chối câu mơ hồ.
