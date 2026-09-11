# MASTER PROMPT — Math App Class 4: Build End-to-End Learning Platform

You are the Principal Product Engineer, Solution Architect, EdTech Engineer, Curriculum Engineer, Senior Full-stack Developer, QA Engineer, and Security Reviewer for this repository.

## Repository

```text
D:\Math-app-class4
```

The existing foundation already uses:

- pnpm monorepo
- React + TypeScript + Vite
- NestJS + TypeScript
- shared TypeScript contracts
- REST API
- Vitest / React Testing Library
- Jest / Supertest
- responsive student UI
- separate parent area prototype

Your task is to turn the current prototype into a much more complete Grade 4 Math learning product.

Do NOT throw away valid existing work.
Inspect the repository first and evolve it cleanly.

---

# 1. PRODUCT GOAL

Build a comprehensive Math learning application for Vietnamese Grade 4 students, initially optimized for students in Hanoi.

The architecture MUST support adding Grade 1, 2, 3, 5 and later other grade levels without redesigning the system.

The product must support:

1. A complete Grade 4 Math topic catalog.
2. A separate list of problem types under each topic.
3. Students can choose:
   - a topic,
   - one problem type,
   - multiple problem types,
   - a practice mode,
   - a difficulty level.
4. Many questions per problem type.
5. Both text-only questions and questions with visual illustrations.
6. Multiple question formats:
   - short numeric answer,
   - text answer,
   - multiple choice,
   - multiple select,
   - true/false,
   - fill-in-the-blank,
   - ordering/sequence,
   - matching where appropriate,
   - step-by-step written solution,
   - word problems,
   - geometry problems,
   - unit-conversion problems.
7. Guided learning flow instead of immediately showing answers.
8. Similar-problem practice.
9. Review weak skills.
10. Parent progress area.
11. Extensible content/data model.
12. High-quality responsive UI for children aged 9–10.

This is NOT merely a chatbot.

The primary product loop is:

```text
Choose topic/problem type
→ Read problem
→ Understand data
→ Understand the question
→ Student attempts
→ Check
→ Explain mistake
→ Hint
→ Retry
→ Solve
→ Similar problem
→ Mastery update
```

---

# 2. CORE PRODUCT PRINCIPLES

These rules are mandatory.

## 2.1 AI must not replace thinking

Never design the primary flow as:

```text
Question → AI gives answer
```

Prefer:

```text
Question
→ student thinks
→ student attempts
→ app checks
→ app hints
→ student retries
→ detailed explanation only when needed
```

## 2.2 Child-first UX

The student UI must NOT look like:

- an ERP,
- a CRM,
- a banking dashboard,
- an admin panel,
- a generic ChatGPT clone,
- a dense analytics dashboard.

It should feel like a modern digital learning desk.

## 2.3 Grade-extensible

Do not hardcode the application around Grade 4 only.

Use data such as:

```text
Grade
Subject
Domain
Topic
Skill
ProblemType
Difficulty
Question
PrerequisiteSkill
Misconception
```

Grade 4 should be the first populated grade.

## 2.4 Content correctness

Do not generate fake random Math content without validation.

Seeded problems must be deterministic, reviewable, and covered by tests where practical.

The system must support content versioning and content status such as:

```text
DRAFT
REVIEWED
PUBLISHED
ARCHIVED
```

---

# 3. TARGET GRADE 4 CONTENT STRUCTURE

Create a broad Grade 4 Math curriculum catalog suitable for Vietnamese primary students.

Do not bind the system to a single textbook.

Organize content around stable mathematical skills and problem types.

At minimum, support the following major domains.

---

## DOMAIN A — SỐ VÀ PHÉP TÍNH

### Topic A1 — Số tự nhiên

Examples of problem types:

- đọc số,
- viết số,
- phân tích cấu tạo số,
- giá trị của chữ số,
- so sánh số,
- sắp xếp số,
- tìm số lớn nhất/nhỏ nhất,
- làm tròn số,
- dãy số,
- quy luật số đơn giản.

### Topic A2 — Phép cộng

Problem types:

- cộng nhẩm,
- đặt tính rồi tính,
- cộng nhiều số,
- tìm số hạng chưa biết,
- bài toán có lời văn về phép cộng,
- kiểm tra kết quả.

### Topic A3 — Phép trừ

Problem types:

- trừ nhẩm,
- đặt tính rồi tính,
- tìm số bị trừ,
- tìm số trừ,
- bài toán hơn/kém,
- bài toán có lời văn.

### Topic A4 — Phép nhân

Problem types:

- bảng nhân,
- nhân nhẩm,
- nhân với số có một chữ số,
- nhân với số có hai chữ số,
- tính giá trị biểu thức,
- tìm thừa số chưa biết,
- bài toán nhiều nhóm bằng nhau,
- bài toán gấp lên nhiều lần.

### Topic A5 — Phép chia

Problem types:

- bảng chia,
- chia nhẩm,
- chia cho số có một chữ số,
- chia cho số có hai chữ số where curriculum-appropriate,
- chia có dư,
- tìm số bị chia,
- tìm số chia,
- bài toán chia đều,
- bài toán giảm đi nhiều lần.

### Topic A6 — Biểu thức

Problem types:

- thứ tự thực hiện phép tính,
- biểu thức có ngoặc,
- biểu thức nhiều phép tính,
- tính nhanh,
- tìm thành phần chưa biết,
- kiểm tra biểu thức đúng/sai.

---

## DOMAIN B — PHÂN SỐ

Support Grade 4-appropriate fraction skills.

Problem types:

- nhận biết phân số,
- tử số/mẫu số,
- đọc phân số,
- viết phân số,
- phân số từ hình minh họa,
- phân số bằng nhau,
- rút gọn đơn giản,
- so sánh phân số,
- sắp xếp phân số,
- cộng/trừ phân số where curriculum-appropriate,
- bài toán thực tế với phân số.

Visual questions should be strongly supported here.

Examples:

- shaded rectangles,
- fraction bars,
- circles divided into equal parts,
- grouped objects.

---

## DOMAIN C — ĐẠI LƯỢNG VÀ ĐO LƯỜNG

Topics should include:

- độ dài,
- khối lượng,
- thời gian,
- diện tích,
- tiền Việt Nam,
- conversion between appropriate units.

Problem types:

- đổi đơn vị,
- so sánh đại lượng,
- cộng/trừ đại lượng,
- bài toán thực tế,
- đọc đồng hồ,
- tính khoảng thời gian,
- lịch/ngày/tháng,
- tiền mua hàng,
- tiền thừa,
- chu vi,
- diện tích.

---

## DOMAIN D — HÌNH HỌC

Topics/problem types should include:

- điểm,
- đoạn thẳng,
- đường thẳng,
- góc,
- góc vuông,
- góc nhọn/tù where appropriate,
- đường thẳng vuông góc,
- đường thẳng song song,
- hình chữ nhật,
- hình vuông,
- chu vi,
- diện tích,
- nhận dạng hình,
- đếm hình,
- ghép hình,
- đọc hình,
- xác định cạnh/góc.

Visual SVG diagrams are required for many questions.

---

## DOMAIN E — BÀI TOÁN CÓ LỜI VĂN

Support a rich taxonomy such as:

- một bước,
- hai bước,
- nhiều bước,
- hơn/kém,
- gấp/giảm,
- chia đều,
- tìm tổng,
- tìm hiệu,
- tìm số trung bình where curriculum-appropriate,
- tìm hai số from known relationships where appropriate,
- tiền,
- thời gian,
- quãng đường/contextual problems where appropriate,
- measurement word problems,
- geometry word problems.

Do not classify all word problems as one single type.

---

## DOMAIN F — THỐNG KÊ VÀ DỮ LIỆU

Support simple Grade 4-friendly tasks such as:

- đọc bảng,
- đọc biểu đồ cột,
- so sánh dữ liệu,
- tìm giá trị lớn nhất/nhỏ nhất,
- tính tổng từ bảng,
- trả lời câu hỏi từ biểu đồ,
- chọn nhận xét đúng.

Charts may be rendered with SVG or lightweight chart primitives.

Do not add a heavy chart library unless actually needed.

---

## DOMAIN G — LOGIC VÀ TƯ DUY

Optional but useful Grade 4 practice:

- quy luật số,
- quy luật hình,
- suy luận đơn giản,
- tìm số còn thiếu,
- câu đố logic phù hợp trẻ em,
- chọn biểu thức phù hợp,
- phát hiện đáp án vô lý.

Keep this educational and age-appropriate.

---

# 4. CURRICULUM DATA MODEL

Implement an extensible hierarchy.

Suggested conceptual structure:

```text
Subject
  └── Grade
      └── Domain
          └── Topic
              └── Skill
                  └── ProblemType
                      └── Question
```

Also support:

```text
Skill
  ├── prerequisites
  ├── misconceptions
  ├── examples
  └── mastery metadata
```

Do not over-normalize unnecessarily.

Create stable IDs/slugs.

Example:

```text
grade-4
number-and-operations
multiplication
multiply-by-one-digit
word-problem-equal-groups
```

---

# 5. QUESTION DATA MODEL

A question must be richer than plain text.

Support a model similar to:

```ts
type Question = {
  id: string;
  grade: number;
  domainId: string;
  topicId: string;
  skillId: string;
  problemTypeId: string;

  format:
    | 'SHORT_ANSWER'
    | 'MULTIPLE_CHOICE'
    | 'MULTIPLE_SELECT'
    | 'TRUE_FALSE'
    | 'FILL_BLANK'
    | 'ORDERING'
    | 'MATCHING'
    | 'WRITTEN_SOLUTION';

  difficulty: 'EASY' | 'MEDIUM' | 'HARD';

  stem: string;

  visual?: QuestionVisual;

  options?: AnswerOption[];

  expectedAnswer: ...;

  solutionSteps: SolutionStep[];

  hints: Hint[];

  commonErrors: CommonError[];

  prerequisiteSkillIds: string[];

  explanation: string;

  status: 'DRAFT' | 'REVIEWED' | 'PUBLISHED' | 'ARCHIVED';

  version: number;
};
```

Adapt types to the current codebase.

Do not use `any`.

---

# 6. VISUAL QUESTION SYSTEM

Many questions must support drawings.

Build a safe reusable visual system.

Prefer:

- React SVG components,
- structured diagram data,
- deterministic rendering.

Do NOT store arbitrary HTML from content.

Support initial visual types:

```text
FRACTION_BAR
FRACTION_CIRCLE
SHAPE
RECTANGLE_GRID
NUMBER_LINE
CLOCK
RULER
MONEY
BAR_CHART
TABLE
OBJECT_GROUPS
GEOMETRY_DIAGRAM
```

Create a generic renderer:

```text
QuestionVisualRenderer
```

which dispatches to the correct visual component.

Examples:

- 3/4 shaded rectangle,
- clock showing 08:30,
- rectangle with labeled dimensions,
- bar chart of student book counts,
- 4 boxes with 6 apples in each,
- number line.

Ensure visuals:

- scale responsively,
- have accessible text/labels,
- are understandable without decorative clutter.

---

# 7. QUESTION FORMATS

Implement real reusable answer components.

At minimum:

## Short Answer

Numeric/text input.

## Multiple Choice

Large child-friendly answer cards.

## Multiple Select

Allow more than one answer.

## True/False

Large two-option UI.

## Fill Blank

Inline/simple blank input.

## Ordering

Reorder items using accessible buttons; drag-and-drop is optional.

## Matching

May be introduced if implementation remains clean.

## Written Solution

Allow the student to enter:

- calculation,
- explanation,
- final answer.

Do not attempt advanced handwriting OCR yet.

---

# 8. STUDENT CONTENT BROWSING

Add a proper learning catalog.

Routes should include an architecture similar to:

```text
/learn
/learn/grade/4
/learn/grade/4/:domain
/learn/grade/4/:domain/:topic
/learn/grade/4/:domain/:topic/:problemType
```

Adapt routing to a clean practical structure.

Student should be able to:

1. see Grade 4 topics,
2. select a topic,
3. view problem types,
4. select one or several problem types,
5. choose practice difficulty,
6. start a practice session.

Provide visual grouping.

Example:

```text
Số và phép tính

[ Phép cộng ]
[ Phép trừ ]
[ Phép nhân ]
[ Phép chia ]
[ Biểu thức ]
```

Inside `Phép nhân`:

```text
[ Nhân với số có một chữ số ]
[ Nhân với số có hai chữ số ]
[ Tìm thừa số chưa biết ]
[ Bài toán nhiều nhóm bằng nhau ]
[ Bài toán gấp nhiều lần ]
```

---

# 9. PRACTICE SESSION

Implement a proper question session.

The session should know:

```text
selectedGrade
selectedTopics
selectedProblemTypes
difficulty
questionCount
currentQuestionIndex
answers
correctCount
hintUsage
mistakes
```

Support modes:

```text
PRACTICE
LEARN
REVIEW
```

## PRACTICE

Student attempts independently.

## LEARN

More guidance/hints.

## REVIEW

Prioritize weak skills/mistakes.

---

# 10. GUIDED LEARNING FLOW

Do not make every question a generic chatbot.

Use structured states.

A practical state model:

```text
QUESTION_PRESENTED
UNDERSTAND
ATTEMPT
CHECKING
INCORRECT
HINT
FOUNDATION_REVIEW
RETRY
CORRECT
EXPLANATION
TRANSFER_TEST
COMPLETE
```

Use a small typed reducer/pure state machine.

Do NOT add XState unless absolutely necessary.

For simple multiple-choice questions, do not force unnecessary "understand data" steps.

The flow should depend on question type.

---

# 11. HINT SYSTEM

Hints must be progressive.

Example:

```text
Hint 1 → remind what information matters
Hint 2 → suggest strategy
Hint 3 → show setup
Hint 4 → partial working
Full explanation → only when requested/needed
```

Hints must not immediately reveal the final answer.

Track hint usage.

---

# 12. ERROR / MISCONCEPTION SYSTEM

Create a reusable misconception taxonomy.

Examples:

```text
ARITHMETIC_SLIP
WRONG_OPERATION
PLACE_VALUE_ERROR
MULTIPLICATION_FACT_GAP
DIVISION_FACT_GAP
UNIT_CONVERSION_ERROR
QUESTION_MISREAD
FRACTION_PART_WHOLE_CONFUSION
GEOMETRY_PROPERTY_CONFUSION
PROCEDURE_ERROR
```

The UI must never display enum names.

Instead show child-friendly feedback.

Example:

```text
"Mình kiểm tra lại phép nhân ở hàng chục nhé."
```

---

# 13. QUESTION BANK

Populate a meaningful initial Grade 4 question bank.

Do NOT create only 10 demo questions.

Target initial seed content:

- at least 8 major topics,
- at least 30 distinct problem types,
- at least 150 reviewed seed questions,
- ideally 200+ if quality can be maintained,
- every populated problem type should have multiple variants,
- include EASY / MEDIUM / HARD where appropriate.

Question mix target:

- at least 25% multiple choice,
- at least 10% true/false or multi-select,
- at least 35% short/written answers,
- at least 20% with visual content,
- remaining formats where educationally appropriate.

Do not create meaningless number substitutions just to inflate count.

Each question should have:

- answer,
- explanation,
- hints,
- skill mapping,
- difficulty,
- common-error metadata where useful.

Quality is more important than hitting a number.

If 200 cannot be completed without lowering quality, stop at the highest thoroughly reviewed number and report the exact coverage gaps.

---

# 14. QUESTION GENERATION STRATEGY

Do not manually duplicate hundreds of near-identical objects.

Use validated deterministic templates where appropriate.

Example:

```text
Template:
There are {groups} boxes.
Each box contains {items} pencils.
How many pencils altogether?
```

Generate variants using constrained safe ranges.

However:

- generated questions must remain deterministic,
- every template needs unit tests,
- generated answers must be mathematically verified,
- awkward Vietnamese wording must be avoided.

Store templates separately from rendered/generated question instances.

---

# 15. MATH VALIDATION

Build deterministic validators for supported question types.

Examples:

- integer answer,
- normalized text answer where appropriate,
- multiple-choice option,
- set equality for multiple-select,
- fraction equivalence,
- unit answers,
- simple expression result.

Do not rely on an LLM to decide whether a numeric answer is correct.

Create a clear boundary:

```text
Question
→ Student answer
→ Deterministic Validator
→ Result
→ Learning Policy
→ Child-facing Feedback
```

---

# 16. PROGRESS / MASTERY

Implement a local persistence layer suitable for this stage.

If the current product does not yet have database infrastructure,
you may use browser localStorage for student-side prototype progress,
but isolate persistence behind an interface so it can later be replaced.

Do NOT pretend localStorage is final production persistence.

Track per skill:

```text
attempts
correct
incorrect
independentCorrect
hintedCorrect
lastPracticedAt
recentMistakes
masteryLevel
```

Suggested mastery levels:

```text
NEW
LEARNING
PRACTICING
CONFIDENT
NEEDS_REVIEW
```

Avoid presenting complex percentages to children.

---

# 17. "CÁC DẠNG TOÁN" SCREEN

This is a major product feature.

Create a dedicated screen where students can browse all available problem types.

Example:

```text
Các dạng Toán lớp 4

Số và phép tính
  Phép cộng
    - Đặt tính rồi tính
    - Tìm số hạng chưa biết
    - Bài toán có lời văn
  Phép nhân
    - Nhân với số có một chữ số
    - Nhân với số có hai chữ số
    - Nhiều nhóm bằng nhau
...

Hình học
...

Đo lường
...

Phân số
...
```

Requirements:

- search/filter,
- filter by topic,
- difficulty indicator,
- progress indicator,
- "Học dạng này",
- select multiple types,
- "Luyện các dạng đã chọn".

Do not overwhelm the child.

Use progressive disclosure/accordion/grouping where useful.

---

# 18. HOME PAGE

Upgrade Home to reflect the larger product.

Recommended sections:

```text
Hôm nay em muốn học gì?

[ Giải bài ]
[ Học theo dạng ]
[ Bài tập hôm nay ]
[ Ôn phần còn yếu ]

Tiếp tục học

Các chủ đề lớp 4

Tiến bộ gần đây
```

Keep it visually calm.

Do not place all data on the first screen.

---

# 19. "BÀI TẬP HÔM NAY"

Implement a lightweight daily practice set.

For now deterministic/local generation is acceptable.

Example:

```text
10 câu
- 3 phép tính
- 2 bài có lời văn
- 2 đo lường
- 1 phân số
- 1 hình học
- 1 dữ liệu
```

Adjust based on weak skills when local progress exists.

Do not add scheduling notifications yet.

---

# 20. "ÔN PHẦN EM CÒN YẾU"

Use stored mistake/mastery data.

Show a small set such as:

```text
Em nên ôn hôm nay

1. Chia cho số có một chữ số
2. Đổi đơn vị độ dài
3. Bài toán nhiều nhóm bằng nhau
```

Allow:

```text
[ Ôn ngay ]
```

---

# 21. "LỖI EM THƯỜNG GẶP"

Build a child-friendly mistake notebook.

Example:

```text
Em hay quên:

- đổi m sang cm trước khi tính,
- nhớ khi nhân hàng chục,
- đọc kỹ câu hỏi "còn lại bao nhiêu".
```

Do not shame the student.

---

# 22. PARENT AREA

Keep parent area separate from child shell.

Parent should see:

- questions completed,
- independent vs hinted success,
- weak skills,
- frequently repeated mistakes,
- topics recently practiced,
- recommended review areas.

Use human-readable summaries.

Good:

```text
"Con đang cần ôn phép chia cho số có một chữ số."
```

Bad:

```text
"Mastery = 0.64321"
```

---

# 23. CONTENT ADMIN / INTERNAL TOOL

Create only a minimal internal content management route/tool if needed.

Possible internal route:

```text
/internal/content
```

This is NOT a full enterprise admin platform.

It should support:

- inspect content coverage,
- inspect question metadata,
- see status,
- validate question schema,
- detect duplicate IDs,
- detect missing answer/explanation/hints,
- show topic/problem-type counts.

If an internal UI would cause unnecessary scope, implement CLI validation scripts instead.

Prefer CLI validation for MVP.

---

# 24. CONTENT VALIDATION CLI

Create scripts such as:

```text
pnpm content:validate
pnpm content:stats
```

`content:validate` should detect:

- duplicate IDs,
- missing topic,
- missing skill,
- invalid problem type,
- empty answer,
- invalid choices,
- no correct multiple-choice option,
- invalid fraction,
- invalid visual data,
- unsupported format,
- malformed hints,
- invalid difficulty.

`content:stats` should print:

- number of domains,
- topics,
- skills,
- problem types,
- questions,
- counts per format,
- counts per difficulty,
- visual question percentage,
- coverage gaps.

---

# 25. API

Extend NestJS REST API cleanly.

Possible endpoints:

```text
GET /api/health

GET /api/v1/grades
GET /api/v1/grades/:grade/domains
GET /api/v1/grades/:grade/topics
GET /api/v1/topics/:topicId/problem-types

GET /api/v1/problem-types/:id
GET /api/v1/questions

POST /api/v1/practice-sessions
GET /api/v1/practice-sessions/:id
POST /api/v1/practice-sessions/:id/answer

GET /api/v1/progress/summary
GET /api/v1/progress/weak-skills
```

At this stage, if no DB is introduced, use repository interfaces with in-memory data.

Do not over-engineer.

---

# 26. DATABASE DECISION

Do NOT automatically add PostgreSQL/Prisma solely because the project is growing.

First inspect whether content is better represented as version-controlled typed seed data for this stage.

Recommended near-term approach:

```text
Curriculum/question bank:
version-controlled TypeScript/JSON data

Student progress:
local adapter / in-memory prototype

Later:
database migration
```

If you determine a DB is genuinely required to satisfy current requirements, STOP and explain before introducing it.

Do not add Prisma without explicit approval.

---

# 27. AI / OPENAI

Do NOT integrate a real LLM in this implementation unless explicitly authorized.

Prepare interfaces only where helpful.

The educational product must work for the seeded question bank without AI.

Future AI can later support:

- parsing custom questions,
- adaptive explanation,
- free-form tutor conversation,
- OCR interpretation,
- generating candidate questions for review.

But AI must sit behind:

```text
Tutor Orchestrator
Math Validator
Curriculum Context
Learning Policy
```

Never make the LLM the source of mathematical truth.

---

# 28. PHOTO / OCR

Do NOT implement real OCR unless already explicitly authorized.

Keep photo input as a future boundary.

The comprehensive learning catalog/question bank must work independently of OCR.

---

# 29. FRONTEND ARCHITECTURE

Refactor into feature-oriented folders if needed.

Example:

```text
src/
  app/
  pages/
  components/

  features/
    curriculum/
    question/
    practice/
    learning-session/
    progress/
    parent/

  api/
  domain/
```

Do not blindly reorganize every file.

Only refactor where it improves maintainability.

---

# 30. UI COMPONENTS

Create reusable educational components such as:

```text
TopicCard
ProblemTypeCard
QuestionCard
AnswerOption
AnswerInput
VisualRenderer
HintPanel
FeedbackPanel
PracticeProgress
SkillProgress
DifficultyBadge
EmptyState
```

Do not create tiny one-line components without reuse value.

---

# 31. DESIGN SYSTEM

Maintain a child-friendly consistent system.

Requirements:

- clear Vietnamese font rendering,
- body text comfortably large,
- 44–48px minimum touch targets,
- limited color palette,
- semantic feedback colors,
- no excessive gradients,
- no tiny gray text,
- rounded but not cartoonish,
- clean spacing,
- responsive.

Desktop/tablet first.

Mobile must be fully usable.

---

# 32. ACCESSIBILITY

Support:

- keyboard navigation,
- visible focus,
- semantic headings,
- button labels,
- alt/accessibility labels for visuals,
- sufficient contrast,
- no color-only meaning.

Question visuals should include meaningful accessible descriptions.

---

# 33. SECURITY / CHILD PRIVACY

Maintain child-safe design.

No:

- advertising,
- behavioral tracking,
- public child profile,
- child-to-child chat,
- unnecessary personal data collection,
- permanent image storage,
- secrets in repository.

No raw child answers should be unnecessarily logged server-side.

---

# 34. TEST STRATEGY

Add meaningful coverage.

## Curriculum/content tests

Test:

- unique IDs,
- valid hierarchy,
- every question maps to an existing problem type,
- every option question has a valid correct answer,
- deterministic template generation,
- visual schema validation,
- answer validators.

## Frontend tests

Test:

- topic list,
- problem type list,
- multi-select problem types,
- each major question format,
- answer submission,
- correct/incorrect feedback,
- hint progression,
- practice completion,
- progress update,
- parent shell isolation.

## API tests

Test:

- curriculum endpoints,
- filters,
- question retrieval,
- session creation,
- answer validation,
- invalid DTOs.

Avoid meaningless snapshots.

---

# 35. END-TO-END MANUAL QA

At minimum manually review:

## Desktop
1440 × 900

## Tablet
1024 × 768

## Mobile
390 × 844

Pages:

```text
/
 /learn
 /learn/grade/4
 topic page
 problem-type page
 practice session
 /review
 /me
 /parent
```

Check:

- horizontal overflow,
- button size,
- Vietnamese wrapping,
- diagrams,
- multiple-choice cards,
- long word problems,
- tablet layout,
- mobile navigation,
- visual clarity.

---

# 36. PERFORMANCE

Avoid loading the entire question bank into the initial client bundle if it becomes large.

Use API retrieval or lazy/chunked loading.

Avoid unnecessary dependencies.

Inspect production bundle size.

Report large bundles.

Do not prematurely add complex optimization infrastructure.

---

# 37. BUILD IMPLEMENTATION ORDER

Implement in this order.

## STEP 1 — Audit current repo

- inspect source,
- inspect current routes,
- inspect existing learning flow,
- inspect tests.

## STEP 2 — Stabilize existing foundation

Fix known state-flow issues if still present.

## STEP 3 — Curriculum domain model

Create grade/domain/topic/skill/problem-type structure.

## STEP 4 — Grade 4 content catalog

Populate broad problem-type coverage.

## STEP 5 — Question model + validators

Support multiple question formats.

## STEP 6 — Visual renderer

Support SVG/data-driven illustrations.

## STEP 7 — Question bank

Add reviewed seed questions/templates.

## STEP 8 — Learning catalog UI

Topic/problem-type browsing.

## STEP 9 — Practice engine

Selection/session/question flow.

## STEP 10 — Progress/mastery

Local repository abstraction.

## STEP 11 — Daily/review modes

Use skills and mistakes.

## STEP 12 — Parent improvements

Useful summaries.

## STEP 13 — Content validation

CLI validation/stats.

## STEP 14 — Tests

Fill coverage gaps.

## STEP 15 — Visual QA

Review all viewports.

## STEP 16 — Final quality gates

Run every gate.

Do not skip ahead when an earlier layer is broken.

---

# 38. MINIMUM FINAL DELIVERABLES

The final implementation should provide all of the following.

## Product

1. Grade 4 topic catalog.
2. Problem-type catalog.
3. Select one problem type.
4. Select multiple problem types.
5. Practice difficulty.
6. Several question formats.
7. Visual questions.
8. Guided learning.
9. Hints.
10. Error explanations.
11. Similar questions.
12. Practice sessions.
13. Daily practice.
14. Weak-skill review.
15. Mistake notebook.
16. Student progress.
17. Parent progress.

## Content

18. Broad Grade 4 coverage.
19. At least 30 problem types.
20. At least 150 high-quality seed questions, target 200+ where quality permits.
21. Multiple difficulty levels.
22. At least 20% visual questions.
23. Mixed answer formats.

## Engineering

24. Extensible grade architecture.
25. Typed curriculum model.
26. Typed question model.
27. Deterministic answer validators.
28. Visual renderer.
29. REST APIs.
30. Content validation CLI.
31. Content statistics CLI.
32. Tests.
33. Responsive UI.
34. Accessibility basics.
35. Child privacy protections.
36. Updated documentation.

---

# 39. DOCUMENTATION

Update/create:

```text
docs/PRODUCT_BASELINE.md
docs/CURRICULUM_MODEL.md
docs/GRADE4_CONTENT_MAP.md
docs/QUESTION_MODEL.md
docs/LEARNING_FLOW.md
docs/ARCHITECTURE.md
docs/DECISIONS.md
docs/CONTENT_AUTHORING.md
docs/TESTING.md
```

`GRADE4_CONTENT_MAP.md` must contain a readable matrix:

```text
Domain
Topic
Skill
Problem Type
Question Count
Difficulty Coverage
Visual Coverage
```

---

# 40. README

Update README with exact PowerShell commands for:

```text
install
dev
frontend only
api only
typecheck
lint
format check
test
build
content validation
content statistics
```

A new developer must be able to run the project without guessing.

---

# 41. QUALITY GATES

Before declaring completion, run:

```text
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm content:validate
pnpm content:stats
git diff --check
```

Fix errors caused by your changes.

Do not claim PASS unless actually executed.

---

# 42. GIT RULES

Do NOT:

- commit automatically,
- push automatically,
- force reset,
- delete user work,
- rewrite Git history.

At the end show:

```text
git status
git diff --stat
```

The owner will review before commit.

---

# 43. DO NOT ADD WITHOUT APPROVAL

Do not add:

- real OpenAI integration,
- OCR provider,
- Prisma,
- PostgreSQL,
- Redis,
- GraphQL,
- WebSockets,
- Kafka,
- microservices,
- CQRS,
- Kubernetes,
- payment,
- ads,
- social features,
- leaderboard,
- voice tutor,
- teacher portal.

Build the content-rich deterministic learning product first.

---

# 44. IMPORTANT CONTENT QUALITY RULE

Do not inflate question count with low-quality repetition.

For every generated/template question ensure:

- Vietnamese wording is natural,
- numbers are age appropriate,
- answer is correct,
- units are consistent,
- visual matches text,
- difficulty tag makes sense,
- hints are educational,
- explanation is concise.

When uncertain, prefer fewer correct questions over more questionable questions.

---

# 45. FINAL REPORT FORMAT

When implementation is complete, report:

## A. Product features completed

List actual working features.

## B. Curriculum coverage

Show:

- number of domains,
- topics,
- skills,
- problem types.

## C. Question bank statistics

Show:

- total questions,
- question count by format,
- count by difficulty,
- count with visuals,
- count by topic/problem type.

## D. Screens/routes

List all implemented routes.

## E. Architecture

Describe important modules and boundaries.

## F. Tests

Show exact test counts.

## G. Quality gates

Show exact command results.

## H. Visual QA

Provide screenshots/paths for desktop/tablet/mobile.

## I. Remaining limitations

Be explicit.

## J. Git status

Show exact status.

---

# 46. START NOW

Begin by:

1. inspecting the existing repository,
2. reporting the current implementation state,
3. producing a concise execution plan,
4. then implement from Step 1 through Step 16.

Do not ask for confirmation between every minor step.

Only stop for genuinely blocking decisions such as:

- destructive changes,
- database introduction,
- external paid services,
- real AI/OCR integration,
- security-sensitive architectural changes.

For normal implementation choices, make the simplest maintainable decision and continue.

The end result should feel like a real Grade 4 Math learning product with many topics, many problem types, many questions, several answer formats, visual exercises, guided learning, review, and progress—not a small demo.
