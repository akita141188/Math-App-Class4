# CODEX PROMPT — MATH CONTENT QUALITY LOCKDOWN + 100 QUESTIONS PER TYPE + NON-REPEATING RANDOMIZATION

Repository:

```text
D:\Math-app-class4
```

You previously reported that the Grade 4 bank currently contains approximately:
- 7 domains
- 14 topics
- 40 skills
- 40 problem types
- 200 reviewed questions
- about 5 questions per problem type

The owner has now manually tested the product and found multiple mathematically or pedagogically incorrect/ambiguous questions and visuals.

Examples already discovered:
1. Place-value ambiguity: `Trong số 44.525, chữ số 4 có giá trị là bao nhiêu?`
2. Fraction visual inconsistency: expected `1/6` while the old visual did not actually show six equal parts correctly.

These are unacceptable in a Math product for children.

From this point onward:

> MATHEMATICAL CORRECTNESS AND PEDAGOGICAL CORRECTNESS HAVE PRIORITY OVER FEATURE COUNT, UI POLISH, QUESTION COUNT, AND DELIVERY SPEED.

Do not blindly trust the existing bank merely because tests are green.

This task is a complete Grade 4 content-quality audit, curriculum audit, benchmark study, bank expansion, randomization redesign, and verification pass.

DO NOT commit or push.

---

## 1. FIRST PRINCIPLE — MATH MUST BE CORRECT

For every question verify:
1. unambiguous statement,
2. exactly one intended answer unless multi-answer format,
3. expected answer mathematically correct,
4. explanation matches,
5. hints lead toward correct reasoning,
6. visual matches data,
7. units correct,
8. Grade 4 appropriate,
9. Vietnamese natural and age-appropriate,
10. correct skill mapping,
11. reasonable difficulty,
12. distractors valid and unique,
13. wording acceptable to a competent Grade 4 teacher.

If uncertain, mark INVALID and do not expose to students.

---

## 2. DO NOT START BY ADDING MORE QUESTIONS

Before expanding to 100 questions per type, audit:
- curriculum definitions,
- problem types,
- templates,
- materialized questions,
- visual renderers,
- answer validators,
- explanations,
- hints,
- misconception mappings,
- randomization/session selection.

Produce an audit report before bulk expansion.

Do not assume the existing 40 problem types are complete or correct.

---

## 3. RESEARCH / BENCHMARK FIRST

Study official/public product pages and curriculum references.

Benchmark at minimum:

### Vietnam
- OLM: Grade 4 topic organization, lesson progression, practice after topics, coverage.
- VioEdu: skill-based practice, personalization, weak/strong skill detection, assessment.

### International
- IXL Grade 4 Math: granular skill taxonomy, mastery practice, adaptive difficulty.
- Matific: conceptual understanding, visual/manipulative representations, adaptive learning, formative assessment.
- Prodigy Math: adaptive skill practice, spiral review, curriculum-aligned delivery.

You may study other products if useful.

Do NOT copy proprietary questions or UI.
Extract only product patterns, pedagogy patterns, taxonomy ideas and UX lessons.

Create:

```text
docs/BENCHMARK_MATH_APPS.md
```

For each product record:
- strengths,
- what is relevant to our app,
- what not to copy,
- concrete decisions derived from the benchmark.

---

## 4. VIETNAMESE GRADE 4 CURRICULUM AUDIT

Canonical source:
1. current Vietnamese Grade 4 Mathematics curriculum / CTGDPT 2018 requirements,
2. cross-check with current Grade 4 resources,
3. optionally map to major textbook families without binding the core skill graph to one book.

Create:

```text
docs/GRADE4_CURRICULUM_AUDIT.md
```

Include:

```text
Domain
Topic
Skill
Problem Type
In curriculum?
Source/reference
Existing coverage
Missing?
Too advanced?
Too easy?
Action
```

Detect:
- missing Grade 4 content,
- content from other grades,
- wrong grouping,
- duplicate types,
- types too broad,
- types that should be split.

---

## 5. GRANULAR PROBLEM TYPES

A `ProblemType` must represent one coherent task.

Bad:
`Phân số`

Better:
- Nhận biết phân số từ hình
- Đọc phân số
- Viết phân số
- Phân số bằng nhau
- Rút gọn phân số
- Quy đồng mẫu số
- So sánh phân số
- Cộng/trừ/nhân/chia phân số phù hợp chương trình
- Tìm phân số của một số

Do the same granularity for natural numbers, operations, measurement, geometry, statistics, word problems, logic.

---

## 6. HARD REQUIREMENT — >=100 QUESTIONS PER FINALIZED PROBLEM TYPE

For every finalized Grade 4 problem type:

```text
minimum unique valid questions/variants = 100
```

If there are 40 types, minimum total = 4,000.
If audit produces 55 types, minimum total = 5,500.

Do not artificially keep type count low to reduce work.

---

## 7. WHAT COUNTS AS UNIQUE?

Do not cheat by changing only names.

Create a normalized fingerprint using:
- problemTypeId,
- normalized structure,
- parameter values,
- expected answer,
- visual spec,
- options.

Reject duplicate fingerprints.

Add:

```text
pnpm content:duplicates
```

It must report zero duplicate fingerprints.

---

## 8. QUESTION BANK ARCHITECTURE

Do NOT hand-write thousands of copy-pasted objects.

Use:

```text
REVIEWED TEMPLATES
→ DETERMINISTIC SAFE GENERATORS
→ MATERIALIZED / INSPECTABLE BANK
→ VALIDATION
```

Aim for multiple meaningful templates per problem type where appropriate.

Generation for QA should be reproducible via a fixed content seed.
Runtime selection must be randomized separately.

---

## 9. MATERIALIZED BANK MUST BE INSPECTABLE

Support:

```text
pnpm content:build-bank
pnpm content:validate
pnpm content:stats
pnpm content:duplicates
pnpm content:audit
pnpm content:review-export
```

Do not hide content behind runtime-only randomness.

---

## 10. HARD CONTENT GATE

`pnpm content:validate` must fail if any finalized problem type has fewer than 100 valid unique questions.

Critical acceptance line:

```text
Problem types below 100 questions: 0
```

---

## 11. CONTENT STATS

Show:
- domains,
- topics,
- skills,
- problem types,
- total questions,
- MIN/MAX/MEDIAN questions per type,
- counts by problem type,
- counts by difficulty,
- counts by format,
- counts by visual type,
- duplicate fingerprints,
- validation errors,
- ambiguity warnings.

---

## 12. DIFFICULTY DISTRIBUTION

Where meaningful, target roughly:

```text
EASY   >=25
MEDIUM >=50
HARD   >=25
```

Difficulty must come from reasoning complexity, not just bigger numbers.

---

## 13. RANDOMIZATION — EACH PRACTICE SHOULD FEEL DIFFERENT

Implement real non-repeating selection.

Do not use `array.sort(() => Math.random() - 0.5)`.

Concept:

```text
eligible pool
→ exclude recent questions
→ balanced select by difficulty/template
→ Fisher-Yates shuffle
→ session list
```

Hard rules:
- no repeated questionId within one session,
- no duplicate fingerprint in one session,
- avoid same questions in consecutive sessions,
- rotate through unseen/recently-unseen pool before recycling,
- recycle oldest-seen first when necessary.

Persist recent history per problem type in prototype local persistence if needed.

For a type with 100 questions and sessions of 10:
- session 1: 10 unique,
- session 2: another 10,
- continue rotating before substantial repetition.

---

## 14. RANDOM DOES NOT MEAN UNBALANCED

For MIXED 10-question sessions, use a controlled distribution such as:

```text
3 EASY
5 MEDIUM
2 HARD
```

Also balance templates so the session is not 10 near-identical variants.

---

## 15. TESTABLE RANDOMIZATION

Allow injected RNG/seed for tests.

Tests must prove:
- no duplicate IDs,
- no duplicate fingerprints,
- same test seed reproducible,
- different seeds differ,
- recent-history exclusion works,
- old items eventually recycle,
- difficulty mix respected,
- template diversity respected.

Do not expose test seed in student UI.

---

## 16. QUESTION-LEVEL MATHEMATICAL ORACLE

Generators must use shared parameters as the single source of truth:

```text
parameters
→ independent math oracle
→ expected answer
→ stem/visual from same parameters
```

Do not generate stem and answer independently.

---

## 17. PROPERTY / INVARIANT TESTS

Add exhaustive checks for generator families.

Examples:
- Addition: answer = a+b.
- Subtraction: no accidental negatives where not intended.
- Multiplication: answer = a*b.
- Division exact: dividend % divisor == 0.
- Division remainder: 0 <= remainder < divisor.
- Fractions: denominator > 0; visual matches numerator/denominator.
- Unit conversion: compatible units and exact conversion factor.
- Time: valid times and independently computed duration.
- Money: total/change correct.
- Geometry: positive dimensions; perimeter/area oracle; diagram labels match data.
- Statistics: chart and table data must match question.

---

## 18. PLACE VALUE STRICT RULES

Audit all place-value questions.

If a target digit occurs more than once, identify exact place or occurrence.

Invalid:
`Trong số 44.525, chữ số 4 có giá trị là bao nhiêu?`

Valid:
`Trong số 44.525, chữ số 4 ở hàng nghìn có giá trị là bao nhiêu?`

Validator must detect ambiguity automatically.

---

## 19. FRACTION STRICT RULES

For fraction visuals mechanically verify:

```text
equalParts == denominator
shadedParts == numerator
0 <= shadedParts <= equalParts
```

All parts must really be equal where wording says equal parts.

Visual geometry must derive from structured math data.

---

## 20. GEOMETRY STRICT RULES

Do not fake diagrams.

- right angle must actually be 90°,
- parallel lines mathematically parallel,
- square visibly square,
- rectangle dimensions match question,
- labels match underlying geometry.

---

## 21. MULTIPLE CHOICE QUALITY

Require:
- exactly one correct option for single-choice,
- no duplicate option values,
- no mathematically equivalent second correct option,
- distractors based on realistic misconceptions,
- shuffled option order.

Example: `1/2` and `2/4` cannot both appear as separate one-answer choices unless the question explicitly distinguishes form.

---

## 22. TRUE/FALSE QUALITY

Maintain balanced truth values where practical.
False items should reflect realistic misconceptions, not nonsense.

---

## 23. WORD PROBLEM AUDIT

Audit:
- natural Vietnamese,
- realistic contexts,
- complete data,
- no ambiguity,
- correct units,
- operation matches skill,
- answer unit included,
- no awkward machine-generated text.

---

## 24. HINT QUALITY

Hints must be question-specific.

Use progressive hints:
1. point to relevant data,
2. identify relationship/strategy,
3. guide setup.

Do not immediately reveal final answer.

---

## 25. EXPLANATION QUALITY

Explain WHY.

Bad:
`Đáp án là 36 vì kết quả bằng 36.`

Good:
`Có 6 hộp, mỗi hộp 6 chiếc nên ta tính 6 × 6 = 36.`

---

## 26. CONTENT AUDIT COMMAND

`pnpm content:audit` should detect:

```text
MATH_ERROR
AMBIGUOUS_WORDING
ANSWER_MISMATCH
VISUAL_MISMATCH
UNIT_ERROR
OPTION_COLLISION
DUPLICATE_QUESTION
INVALID_DIFFICULTY
BAD_HINT
BAD_EXPLANATION
GRADE_MISMATCH
CURRICULUM_GAP
```

Acceptance:

```text
ERRORS: 0
```

Warnings must be reviewed, not bulk ignored.

---

## 27. HUMAN REVIEW EXPORT

Create an easy review export, for example:

```text
.tmp/content-review/grade4-review.html
```

Group by:

```text
Domain → Topic → Problem Type
```

Show:
- question,
- visual,
- answer,
- options,
- hints,
- explanation,
- difficulty,
- template ID.

---

## 28. MANUAL REPRESENTATIVE REVIEW

After automated checks, manually inspect at least:

```text
5 EASY
5 MEDIUM
5 HARD
```

per problem type where available.

Record exact counts and fixes in:

```text
docs/CONTENT_QA_REPORT.md
```

Do not claim manual review without actual counts.

---

## 29. VISUAL QA MATRIX

For every supported visual type, inspect multiple rendered questions at:

```text
1440x900
1024x768
390x844
```

Check mathematical correctness, clipping, proportions, labels, responsiveness and accessibility.

---

## 30. EXISTING 200 QUESTIONS ARE NOT GRANDFATHERED

Re-audit all existing questions from zero.

A previous `REVIEWED` label is not proof of correctness.

If an item fails, move it back to DRAFT/INVALID until fixed.

---

## 31. CONTENT VERSIONING

Version the new bank, e.g.:

```text
grade4-content-version = 2
```

Sessions should know which content version produced their questions.

---

## 32. SESSION SNAPSHOT INTEGRITY

Once a session starts, question IDs/version/order remain stable.

Do not regenerate different random numbers/options/visuals on React re-render or repeated API calls.

---

## 33. NO LIVE AI QUESTION GENERATION

Do not use LLM-generated live questions for students.

If AI is ever used later:

```text
AI candidate
→ deterministic validation
→ human/content review
→ publish
```

---

## 34. PERFORMANCE WITH 4,000+ QUESTIONS

Do not ship the entire question bank in the initial React bundle.

Keep full bank server/content side and request only what a session needs.

Measure production bundle size.

---

## 35. WHOLE-BANK ACCEPTANCE

Final bank must satisfy:

```text
problemTypesBelow100 = 0
mathErrors = 0
visualMismatches = 0
ambiguousQuestions = 0
duplicateQuestionIds = 0
duplicateFingerprints = 0
brokenReferences = 0
```

---

## 36. RANDOMIZATION ACCEPTANCE

Simulate repeated sessions.

For a 100-question problem type:

```text
10 sessions × 10 questions
```

Verify:
- no duplicates inside each session,
- no immediate repeated set,
- history avoidance,
- pool rotation before heavy recycling.

Also simulate mixed multi-type sessions.

---

## 37. REQUIRED DOCUMENTS

Create/update:

```text
docs/BENCHMARK_MATH_APPS.md
docs/GRADE4_CURRICULUM_AUDIT.md
docs/GRADE4_CONTENT_MAP.md
docs/CONTENT_GENERATION_RULES.md
docs/CONTENT_QA_REPORT.md
docs/RANDOMIZATION_POLICY.md
docs/QUESTION_MODEL.md
docs/LEARNING_FLOW.md
docs/DECISIONS.md
```

---

## 38. FINAL QUALITY GATES

Run:

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

Do not claim complete if any required gate fails.

---

## 39. FINAL REPORT — EXACT NUMBERS

Report:

### Curriculum
```text
Domains:
Topics:
Skills:
Problem types:
```

### Question bank
```text
Total questions:
Minimum questions/problem type:
Maximum questions/problem type:
Median questions/problem type:
Problem types below 100:
```

### Quality
```text
Math errors:
Ambiguous questions:
Visual mismatches:
Unit errors:
Broken references:
Duplicate IDs:
Duplicate fingerprints:
```

### Manual review
```text
Problem types reviewed:
Rendered questions manually inspected:
Issues found:
Issues corrected:
Remaining issues:
```

### Randomization
Show:
- session size,
- number of simulation runs,
- duplicate results,
- recent-history behavior.

### Tests
Show exact test counts.

### Git
Show:
```text
git status
git diff --stat
```

---

## 40. DO NOT HIDE FAILURE

If you cannot finish everything in one run, report exactly:

```text
Completed problem types: X/Y
Problem types with >=100 valid questions: X/Y
Remaining types:
Known math/content issues:
```

Accuracy is more important than saying DONE.

---

## 41. DO NOT COMMIT OR PUSH

Do not commit, push, reset, discard user changes, or hide errors.

---

## 42. EXECUTION ORDER

1. Inspect current repo.
2. Read current master requirements and existing content.
3. Benchmark established Math learning products.
4. Audit Vietnamese Grade 4 curriculum.
5. Audit/finalize problem-type taxonomy.
6. Re-audit all existing questions.
7. Fix critical math/content/visual defects.
8. Build deep validators/audit tools.
9. Finalize templates/generators.
10. Expand every finalized type to >=100 unique valid questions.
11. Implement non-repeating randomization.
12. Add review export and QA tools.
13. Run exhaustive automated validation.
14. Perform representative manual review.
15. Perform visual QA.
16. Run all engineering gates.
17. Report exact results.

Do NOT bulk-generate questions before Steps 3–8 are complete.

Start now.
