# CODEX PROMPT — EXPAND PRACTICE POOLS, SELECT-ALL, HISTORY, SCORING & GRADE-4 TEST MODE

Repository:

```text
D:\Math-app-class4
```

Use this document as the newest acceptance contract for the next implementation pass.

The current UI already has:
- Trang chủ
- Học theo dạng
- Ôn tập
- Của em
- topic/problem-type cards
- practice configuration with difficulty and question count
- practice completion screen
- existing content-bank/generator work in progress

This task adds five major product capabilities:
1. Larger question pools for every smallest selectable learning type.
2. More flexible practice configuration, including `Tất cả`.
3. `Chọn tất cả` for every topic/type group.
4. Full practice/test history with timestamps, correct/wrong counts and scoring.
5. A real Grade 4 `Bài kiểm tra` mode based on Vietnamese primary-school assessment patterns, with scoring and saved history.

Do NOT commit or push.
Do NOT add database, real AI or OCR unless explicitly approved.

---

# 0. IMPORTANT — NEWEST CONTENT COUNT RULE

The newest requirement is:

> Every SMALLEST CLICKABLE / SELECTABLE learning type shown to the student must have a pool of at least 30 and at most 50 valid unique questions.

Examples of leaf types visible in the current UI:
- Đọc và viết số
- Giá trị chữ số
- So sánh và sắp xếp số
- Làm tròn số
- Cộng nhẩm
- Đặt tính rồi cộng
- etc.

For these leaf types:

```text
MIN = 30
MAX = 50
```

This newest requirement supersedes the older `>=100 questions/type` requirement IF both refer to the same leaf entity.

If the architecture has:

```text
Topic
  → Problem Type
      → smaller leaf subtypes
```

then every student-selectable leaf subtype must contain 30–50 questions.

A parent/aggregate type may naturally contain more than 50 questions because it combines several leaf pools.

Quality still has priority over count.

---

# 1. CONTENT QUALITY REMAINS NON-NEGOTIABLE

Every question in the 30–50 pool must pass:
- schema validation,
- mathematical oracle validation,
- unique ID,
- unique meaningful fingerprint,
- unambiguous Vietnamese wording,
- correct expected answer,
- correct units,
- correct visual,
- valid options,
- age-appropriate difficulty,
- correct curriculum mapping,
- correct hints,
- correct explanation.

Invalid questions DO NOT count toward 30.

Hard final condition:

```text
leafTypesBelow30 = 0
leafTypesAbove50 = 0
```

---

# 2. DO NOT DESTROY EXISTING V2 WORK

First inspect the current worktree.

Run:

```powershell
git status --short
```

Preserve all valid work already created for:
- taxonomy,
- generators,
- bank builder,
- JSON shards,
- validators,
- randomization,
- history,
- tests,
- content versioning.

Do NOT:
- reset,
- checkout over user changes,
- delete v2 infrastructure,
- restart architecture from zero,
- commit,
- push.

Adapt the current work to this newest contract.

---

# 3. QUESTION POOL PER LEAF TYPE — 30 TO 50

For every smallest student-selectable type:

```text
30 <= validUniqueQuestions <= 50
```

Recommended target:

```text
40 questions / leaf type
```

unless a specific skill has a good pedagogical reason to use a different number.

---

# 4. DO NOT CREATE FAKE VARIETY

Do not make 40 questions that are really one question with a renamed child.

Meaningful variation should include some combination of:
- different numbers,
- different unknown,
- different direction of reasoning,
- different context,
- different visual arrangement,
- different answer format,
- different misconception/distractor,
- different reasoning depth,
- different difficulty.

Where appropriate, use several reviewed templates per leaf type.

Suggested:

```text
>= 4 meaningful templates per leaf type
```

where mathematically appropriate.

---

# 5. RANDOM PRACTICE FROM THE LEAF POOL

When the student starts practice for one type, questions must be randomly selected from that leaf type's validated pool.

Example:

```text
Đọc và viết số
Pool: 40 questions

Student chooses:
10 questions
```

The session should receive 10 randomly selected unique questions from those 40.

Starting another session should normally produce a different set.

Do NOT simply serve the first 10 items.

Do NOT use:

```ts
array.sort(() => Math.random() - 0.5)
```

Use proper sampling / Fisher-Yates / shuffle-bag logic.

---

# 6. RECENT-QUESTION AVOIDANCE

The product must remember recent question exposure on the current device.

For every leaf type track at least:

```text
questionId
fingerprint
lastSeenAt
```

Selection priority:
1. unseen questions first,
2. questions not seen recently,
3. oldest-seen questions when recycling becomes necessary.

Hard rules:
- no duplicate question in one session,
- no duplicate fingerprint in one session,
- do not immediately repeat the same set in the next session,
- when enough unseen questions remain, do not repeat seen questions.

Use current local persistence abstraction if no database exists.

Do NOT add a database solely for this.

---

# 7. PRACTICE QUESTION COUNT — INCREASE OPTIONS

The current question-count selector is too limited.

Expand it.

At minimum support:

```text
5 câu
10 câu
15 câu
20 câu
30 câu
40 câu
50 câu
Tất cả
```

Rules:
- never allow selection above the available eligible pool;
- hide or disable impossible options;
- if selected multiple leaf types, `Tất cả` means all currently eligible unique questions across those selected leaf pools;
- when difficulty filtering reduces the pool, count options must reflect the filtered pool;
- display the final available count clearly.

Example:

```text
3 dạng đã chọn
Có 92 câu phù hợp
```

---

# 8. DIFFICULTY SELECTOR — ADD "TẤT CẢ"

The current difficulty selector must support:

```text
Dễ
Vừa sức
Nâng cao
Tất cả
```

If current internal values are:

```text
EASY
MEDIUM
HARD
```

keep them internally.

`Tất cả` must include all eligible difficulties.

For mixed/all-difficulty sessions, balance the sample instead of accidentally returning mostly one level.

Suggested policy where enough questions exist:

```text
~30% EASY
~50% MEDIUM
~20% HARD
```

This is a practice distribution, not an official exam rule.

---

# 9. DIFFICULTY BADGE ON EVERY QUESTION

Every practice question screen must visibly show its difficulty.

Examples:

```text
Dễ
Vừa sức
Nâng cao
```

Use a compact badge near the question number or another visually appropriate location.

Requirements:
- visible before the student answers;
- child-friendly wording;
- not based only on color;
- accessible label;
- same styling across question formats.

Do NOT show raw enums like `MEDIUM` or `HARD`.

---

# 10. CHECK ALL — TOPIC PAGE

On every topic page like the supplied `Số tự nhiên` screen, add:

```text
☐ Chọn tất cả các dạng
```

It must select every leaf type in that current topic.

When all are selected:

```text
☑ Chọn tất cả các dạng
```

When only some are selected:
use indeterminate/partial state where practical.

Requirements:
- keyboard accessible;
- large touch target;
- state updates immediately;
- selection summary updates;
- `Luyện các dạng đã chọn` reflects the selected count.

---

# 11. CHECK ALL — GLOBAL "HỌC THEO DẠNG" PAGE

Also add a sensible global select-all behavior.

If the current page lists many leaf types from many topics, provide:

```text
Chọn tất cả kết quả đang hiển thị
```

when filtering/searching.

Do not unexpectedly select hidden items when the label says "đang hiển thị".

---

# 12. CARD COUNTS MUST SHOW REAL DATA

The screenshots currently show cards such as:

```text
5 câu
```

That is no longer acceptable.

Every leaf card must display the REAL validated pool count.

Example:

```text
40 câu
```

or:

```text
36 câu
```

Never hardcode `5 câu`.

The value must come from content metadata/manifest/API.

---

# 13. PRACTICE HISTORY — NEW FEATURE

Add a persistent practice history feature.

Create a route such as:

```text
/history
```

or place it under `Của em` with a dedicated page.

Recommended navigation:

```text
Trang chủ
Học theo dạng
Kiểm tra
Ôn tập
Của em
```

Then `Của em` can contain:

```text
Tiến bộ
Lỗi em thường gặp
Lịch sử học
```

---

# 14. WHAT TO SAVE FOR EACH PRACTICE SESSION

Store a completed practice-session record.

At minimum:

```text
id
sessionType = PRACTICE
startedAt
completedAt
durationSeconds
contentVersion
selectedDomainIds
selectedTopicIds
selectedLeafTypeIds
difficultyMode
requestedQuestionCount
actualQuestionCount
correctCount
incorrectCount
unansweredCount
accuracyPercent
questionResults[]
```

For each question result:

```text
questionId
leafTypeId
difficulty
correct
hintCount
answeredAt
```

Do not store unnecessary sensitive personal data.

---

# 15. PRACTICE HISTORY UI

History list should show cards/rows such as:

```text
Luyện: Số tự nhiên
11/09/2026 · 20:14

10 câu
8 đúng
2 sai
80%

[ Xem chi tiết ]
```

Support:
- newest first,
- filter Practice / Test,
- filter by topic/type where useful,
- empty state,
- progressive loading if history grows.

No enterprise-style table is required for child view.

---

# 16. PRACTICE HISTORY DETAIL

A history detail page should show:

```text
Hoàn thành lúc
Thời gian làm
Số câu
Đúng
Sai
Bỏ qua
Độ chính xác
Các dạng đã luyện
```

Then per-question review:

```text
Câu 1 — Đúng
Câu 2 — Sai
...
```

Allow expanding a question to inspect:
- question summary,
- selected/student answer if safely stored,
- correct answer,
- concise explanation,
- skill/type,
- difficulty.

---

# 17. PRACTICE SCORE

For normal practice, do NOT overemphasize grades.

Show:

```text
8/10 câu đúng
80% chính xác
```

Practice is for learning.

---

# 18. NEW MAJOR FEATURE — "BÀI KIỂM TRA"

Add a real test/exam mode.

New route:

```text
/tests
```

Add child-facing navigation:

```text
Kiểm tra
```

The feature must be visually distinct from practice.

Practice:
- hints available,
- learning feedback can be immediate.

Test:
- no hints by default,
- do not reveal correctness immediately,
- answers can be changed before submission,
- score only after final submission.

---

# 19. RESEARCH REAL GRADE-4 TEST PATTERNS BEFORE CODING BLUEPRINTS

Before finalizing test blueprints, research current public/official Grade 4 Mathematics assessment patterns in Vietnam.

Use primary sources first:
- current Ministry of Education and Training regulations,
- CTGDPT 2018 Mathematics requirements,
- current primary-school assessment rules,
- publicly available Grade 4 sample/periodic tests from reputable education sources.

Also benchmark public Grade 4 test/practice patterns from:
- OLM,
- VioEdu,
- IXL or other mature products where useful.

DO NOT:
- copy proprietary questions,
- scrape closed question banks,
- clone another product's UI.

Extract only:
- test structure,
- question-type mix,
- cognitive-level mix,
- scoring conventions,
- review flow.

Create:

```text
docs/GRADE4_TEST_BENCHMARK.md
```

For every design choice record the source/reasoning.

---

# 20. ALIGN TEST MODE WITH VIETNAMESE PRIMARY ASSESSMENT

The test system should support the Vietnamese primary assessment concept of cognitive levels:

```text
Mức 1
Mức 2
Mức 3
```

Do NOT simply equate these blindly to EASY/MEDIUM/HARD without documenting the mapping.

Create an explicit mapping layer if needed.

For example:

```text
difficulty != assessmentLevel
```

A question may have:

```text
difficulty: MEDIUM
assessmentLevel: LEVEL_2
```

Keep the concepts separate where needed.

---

# 21. PERIODIC TEST TYPES

Support test blueprints conceptually for Grade 4 such as:

```text
Giữa học kỳ I
Cuối học kỳ I
Giữa học kỳ II
Cuối năm
Kiểm tra tổng hợp
```

Do not hardcode textbook chapter numbering.

Use curriculum coverage / topic selection.

---

# 22. TEST BLUEPRINT MODEL

Create a typed blueprint model.

Example:

```ts
type TestBlueprint = {
  id: string;
  title: string;
  grade: number;
  durationMinutes?: number;
  totalScore: number;
  sections: TestSectionBlueprint[];
  topicCoverage: ...;
  assessmentLevelDistribution: ...;
  formatDistribution: ...;
};
```

Adapt to existing architecture.

Do not over-engineer.

---

# 23. TEST QUESTION MIX

A test should be capable of mixing:
- multiple choice,
- true/false,
- fill blank,
- short answer,
- written solution,
- visual/geometry/data questions.

Use formats appropriate to Vietnamese Grade 4 Math.

Do not create an exam containing only multiple choice unless the blueprint specifically calls for it.

---

# 24. TEST GENERATION FROM EXISTING VERIFIED BANK

Tests must be assembled from the existing validated question pools.

Flow:

```text
Test Blueprint
→ eligible verified questions
→ coverage constraints
→ assessment-level constraints
→ format constraints
→ non-repeating selection
→ frozen test attempt
```

Do not create a separate low-quality test bank if the same verified content can be reused.

Questions used in test mode may require metadata such as:

```text
assessmentLevel
scoreWeight
testEligible
```

Add such metadata cleanly.

---

# 25. TEST RANDOMIZATION

Each new test attempt should normally contain a different valid set of questions while preserving its blueprint.

Requirements:
- no duplicate IDs,
- no duplicate fingerprints,
- balanced coverage,
- avoid recently used test questions where enough alternatives exist,
- freeze order once attempt starts.

A refresh must NOT create a different exam.

---

# 26. TEST ATTEMPT UX

Before starting show:

```text
Tên bài kiểm tra
Số câu
Thời gian (if applicable)
Nội dung
Cách tính điểm
```

CTA:

```text
Bắt đầu làm bài
```

During test:
- question number,
- progress,
- difficulty badge may be hidden if it would influence test-taking;
- assessment level MUST NOT be shown to the student;
- no correctness feedback;
- no hints;
- previous/next navigation;
- unanswered marker;
- answer can be changed;
- submit confirmation.

Do not accidentally reveal the correct answer through UI state.

---

# 27. TEST TIMER

Only add a countdown timer when the chosen blueprint has a verified duration.

Do not invent arbitrary school-exam timing without research.

If duration is optional:
- show elapsed time,
- allow untimed practice tests.

Do not auto-submit unexpectedly without clear UX.

---

# 28. TEST SCORING

For official-style periodic-test simulation:

use a 10-point scale.

The final implementation must document the scoring algorithm.

Show after submission:

```text
Điểm: 8/10
Đúng: 16
Sai: 4
Thời gian: 27 phút
```

Also show performance by content area.

If following Vietnamese periodic-test conventions, ensure the final displayed school-style score follows the applicable primary-school assessment rule.

Raw statistics can still show:

```text
16/20
80%
```

separately.

---

# 29. SCORING MUST BE DETERMINISTIC

Do not let frontend decide score independently.

Use a shared/server-side scoring policy.

Input:

```text
frozen test snapshot
student answers
score weights
```

Output:

```text
rawCorrect
rawIncorrect
rawUnanswered
rawPoints
finalScore
```

Add tests.

---

# 30. TEST RESULT SCREEN

After final submission show:

```text
Hoàn thành bài kiểm tra

Điểm
Số câu đúng
Số câu sai
Số câu bỏ trống
Thời gian làm
Kết quả theo chủ đề
```

CTA:

```text
Xem lại bài
Làm bài khác
Về trang chủ
```

No exaggerated gamification.

---

# 31. TEST REVIEW MODE

After submission, allow review of each question.

Show:
- student's answer,
- correct answer,
- explanation,
- topic/type,
- result.

Do not permit changing answers after submission.

---

# 32. TEST HISTORY

Every completed test must be saved to history.

Record:

```text
id
sessionType = TEST
testBlueprintId
testTitle
startedAt
submittedAt
durationSeconds
contentVersion
questionCount
correctCount
incorrectCount
unansweredCount
rawPercent
finalScore10
topicBreakdown
questionResults
```

Display test history separately/filterable from practice history.

---

# 33. "CỦA EM" SHOULD SURFACE HISTORY

Upgrade `Của em`.

Suggested cards:

```text
Tiến bộ của em
Lỗi em thường gặp
Lịch sử học
Kết quả kiểm tra
```

Recent activity example:

```text
Hôm nay
- Luyện Số tự nhiên: 8/10
- Kiểm tra tổng hợp: 9/10 điểm
```

Keep it child-friendly.

---

# 34. PARENT AREA — USE THE SAME HISTORY

Parent area should summarize stored activity.

Show:

```text
Buổi luyện gần đây
Bài kiểm tra gần đây
Điểm kiểm tra
Dạng hay sai
Tiến bộ theo thời gian
```

No need for complex charts unless they clearly help.

---

# 35. COMPLETION STATUS

The owner wants to know which types are completed and when.

For each leaf type derive:

```text
CHƯA HỌC
ĐANG LUYỆN
ĐÃ HOÀN THÀNH
CẦN ÔN LẠI
```

Do not mark `ĐÃ HOÀN THÀNH` merely because the student opened the type once.

Document the deterministic rule in:

```text
docs/PROGRESS_AND_COMPLETION_RULES.md
```

Use factors such as:
- minimum attempted questions,
- recent accuracy,
- independent performance,
- repeated sessions.

---

# 36. COMPLETION TIMESTAMP

When a leaf type first achieves `ĐÃ HOÀN THÀNH`, store:

```text
completedAt
```

If it later becomes `CẦN ÔN LẠI`, preserve the historical completion record while showing current status separately.

---

# 37. TOPIC CARD UI

On cards like those shown in the screenshots, replace simplistic:

```text
5 câu
Cần ôn lại
```

with real data.

Example:

```text
40 câu
Đã làm 18
Đã hoàn thành
```

Keep the card compact.

Potential footer:

```text
40 câu · Đã làm 18     [Đã hoàn thành]
```

---

# 38. TYPE DETAIL PAGE

`Xem dạng` should show:

```text
Tên dạng
Mô tả ngắn
Số câu trong kho
Phân bố Dễ / Vừa sức / Nâng cao
Tiến độ
Lần học gần nhất
Kết quả gần đây
```

Actions:

```text
Luyện ngay
Luyện lại câu sai
Xem lịch sử dạng này
```

---

# 39. "LUYỆN BỘ TƯƠNG TỰ" AFTER COMPLETION

Make `Luyện bộ tương tự` functional.

It should create a fresh randomized session using the same selected leaf types and difficulty policy, excluding the immediately completed questions as much as the pool allows.

It must NOT simply replay the same session.

---

# 40. PRACTICE COMPLETION SCREEN

Improve the completion screen.

Show:

```text
Hoàn thành

8/10 câu đúng
2 câu cần xem lại
80% chính xác
```

Actions:

```text
Luyện bộ tương tự
Xem câu sai
Xem lịch sử
Chọn dạng khác
```

---

# 41. PERSISTENCE ARCHITECTURE

No database is currently authorized.

Use the existing local repository/storage abstraction.

Do not scatter raw `localStorage` calls throughout components.

All stored structures require a version.

Example:

```text
storageSchemaVersion: 1
```

Handle malformed/outdated local data safely.

---

# 42. HISTORY RETENTION

For prototype stage, keep a bounded local history.

Example:

```text
max 200 completed sessions
```

or another justified limit.

Preserve newest entries.

Document policy.

---

# 43. PRACTICE AND TEST HISTORY ARE DIFFERENT

Do not mix scoring semantics.

Practice:

```text
8/10 correct
80% accuracy
```

Test:

```text
8/10 points
```

Both may live in one Activity History page with a clear type badge.

---

# 44. ROUTE SUGGESTION

Adapt to existing routing cleanly.

Suggested:

```text
/history
/history/:sessionId

/tests
/tests/:blueprintId
/tests/:blueprintId/start
/tests/attempt/:attemptId
/tests/result/:attemptId
```

Do not create unnecessarily deep routes if a simpler existing pattern works.

---

# 45. TEST BLUEPRINTS — INITIAL SET

After researching actual Grade 4 public assessment patterns, create a small set of useful built-in blueprints.

At minimum consider:

```text
Kiểm tra tổng hợp lớp 4
Giữa học kỳ I
Cuối học kỳ I
Giữa học kỳ II
Cuối năm
```

Only enable a periodic blueprint if content coverage exists.

If current bank cannot support a valid blueprint, mark it unavailable rather than fake coverage.

---

# 46. DO NOT COPY INTERNET QUESTIONS

Online research is for:
- blueprint,
- structure,
- cognitive level distribution,
- scoring convention,
- common formats.

Do NOT paste/copy copyrighted test questions into the bank.

Our questions must come from our reviewed generators/content system.

---

# 47. TEST QUALITY VALIDATION

Add a blueprint validator.

It must detect:

```text
not enough eligible questions
topic coverage missing
assessment-level imbalance
duplicate questions
duplicate fingerprints
invalid score total
unsupported format
```

A test should fail to generate rather than silently violate its blueprint.

---

# 48. HISTORY TESTS

Add tests for:
- completed practice saved;
- timestamp saved;
- correct/wrong/unanswered counts;
- newest-first sorting;
- history survives app reload;
- invalid data handling;
- retention limit;
- practice/test distinction;
- completion status update;
- completedAt behavior.

---

# 49. PRACTICE RANDOMIZATION TESTS

Add tests proving:
- leaf pool has 30–50 valid items;
- random session uses the selected leaf pool;
- no duplicate in session;
- second session avoids previous IDs where possible;
- `Tất cả` selects all eligible items;
- question-count options respect actual pool;
- multi-type session combines selected pools;
- difficulty `Tất cả` includes multiple levels;
- badge uses actual question difficulty.

Use injected RNG/seed for deterministic tests.

---

# 50. SELECT-ALL TESTS

Test:
- topic Check All selects all leaf types;
- second click deselects all;
- partial selection shows partial state;
- global select-all respects search/filter;
- selected count updates correctly;
- session starts with exactly the selected types.

---

# 51. TEST MODE TESTS

At minimum test:
- blueprint loads;
- attempt freezes question set;
- no hints during test;
- no immediate correctness feedback;
- answers can change before submission;
- unanswered count works;
- final submit locks attempt;
- score is deterministic;
- result persisted;
- test history displays;
- review shows correct answer only after submission;
- refresh does not regenerate test;
- multiple attempts get different sets when pool permits.

---

# 52. MANUAL UX QA

Review at:

```text
1440×900
1024×768
390×844
```

Pages/features:

```text
Học theo dạng
Topic page
Select all
Practice configuration
Question with difficulty badge
Practice completion
History
History detail
Tests list
Test start
Test attempt
Test result
Test review
Của em
Parent
```

Check:
- no overflow;
- controls large enough;
- Vietnamese wrapping;
- visible selected state;
- count selectors;
- mobile navigation;
- test answer navigation;
- no accidental answer disclosure.

---

# 53. ONLINE BENCHMARK DOCUMENT

Create:

```text
docs/GRADE4_TEST_BENCHMARK.md
```

It must list:
- sources studied;
- access date;
- assessment structure observed;
- what we adopt;
- what we reject;
- why.

Prefer official/public sources.

---

# 54. DOCUMENTATION

Create/update:

```text
docs/GRADE4_TEST_BENCHMARK.md
docs/TEST_MODE.md
docs/HISTORY_MODEL.md
docs/PROGRESS_AND_COMPLETION_RULES.md
docs/RANDOMIZATION_POLICY.md
docs/QUESTION_MODEL.md
docs/DECISIONS.md
docs/TESTING.md
```

Update README commands if new scripts are introduced.

---

# 55. CONTENT STATS UPDATE

`pnpm content:stats` must report leaf-pool statistics.

Required:

```text
Leaf types:
Total questions:
Minimum questions/leaf type:
Maximum questions/leaf type:
Median questions/leaf type:
Leaf types below 30:
Leaf types above 50:
```

Acceptance:

```text
Leaf types below 30: 0
Leaf types above 50: 0
```

Also show EASY / MEDIUM / HARD counts.

---

# 56. FINAL QUALITY GATES

Run all existing gates plus new tests.

At minimum:

```text
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build

pnpm content:build-bank
pnpm content:validate
pnpm content:audit
pnpm content:duplicates
pnpm content:stats
pnpm content:review-export

git diff --check
```

Fix failures.

Do not claim PASS without actual execution.

---

# 57. FINAL ACCEPTANCE CRITERIA

Do not report DONE unless all are true.

## Content

```text
every selectable leaf type >= 30 valid questions
every selectable leaf type <= 50 valid questions
0 invalid counted questions
0 duplicate IDs
0 duplicate fingerprints
0 math errors
0 visual mismatches
0 ambiguous questions
```

## Practice

```text
question count selector expanded
difficulty supports Tất cả
difficulty badge shown on every practice question
select-all implemented
randomized selection implemented
recent repetition avoidance implemented
Luyện bộ tương tự produces a fresh set
```

## History

```text
practice history saved
completion timestamp saved
correct/wrong/unanswered saved
history list works
history detail works
completion status works
```

## Test mode

```text
test list works
test blueprint works
test attempt works
test scoring works
test result works
test review works
test history saved
```

---

# 58. FINAL REPORT — EXACT NUMBERS

At completion report:

## Content

```text
Domains:
Topics:
Skills:
Selectable leaf types:
Total questions:
Min/leaf:
Max/leaf:
Median/leaf:
Leaf types below 30:
Leaf types above 50:
```

## Difficulty

```text
EASY:
MEDIUM:
HARD:
```

## Practice

```text
Question-count options:
Difficulty options:
Select-all locations:
Recent-history window:
Randomization simulations:
Duplicate-within-session incidents:
Immediate-repeat incidents:
```

## History

```text
Practice-history tests:
Storage version:
Retention limit:
Completion rule:
```

## Tests

```text
Available test blueprints:
Question counts/blueprint:
Assessment level distribution:
Formats:
Scoring method:
```

## Automated validation

```text
API tests:
Web tests:
Content tests:
Total tests:
```

## QA

```text
Desktop pages checked:
Tablet pages checked:
Mobile pages checked:
Known issues:
```

## Git

```text
git status
git diff --stat
```

---

# 59. EXECUTION ORDER

Proceed in this order:

1. inspect current worktree;
2. reconcile current taxonomy with the new 30–50 leaf rule;
3. fix/generate content pools;
4. expose true counts in API/UI;
5. expand practice count/difficulty controls;
6. implement difficulty badge;
7. implement select-all;
8. finish random/recent-history logic;
9. implement practice history;
10. implement completion rules;
11. research Grade 4 test patterns;
12. document test blueprint decisions;
13. implement test mode;
14. implement scoring;
15. implement test history/review;
16. update Parent/Của em summaries;
17. tests;
18. content validation;
19. visual QA;
20. final report.

Do NOT stop after planning.

Implement the approved scope.

Do NOT commit.
Do NOT push.
