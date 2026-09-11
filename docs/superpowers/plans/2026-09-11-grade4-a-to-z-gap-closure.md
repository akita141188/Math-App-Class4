# Grade 4 A-to-Z Gap Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining evidence-backed gaps against `CODEX_MASTER_PROMPT_MATH_APP_CLASS4_A_TO_Z.md` without adding forbidden infrastructure or inflating question counts with duplicated content.

**Architecture:** Keep curriculum and reviewed question templates as version-controlled TypeScript on the API. Separate problem-specific template generation from question formatting, enrich in-memory practice sessions with typed attempt summaries, and keep student mastery behind the browser-local repository interface.

**Tech Stack:** pnpm, TypeScript, React, Vite, NestJS, Vitest/React Testing Library, Jest/Supertest, data-driven SVG.

**Spec:** `CODEX_MASTER_PROMPT_MATH_APP_CLASS4_A_TO_Z.md`

## Global Constraints

- Do not commit, push, reset, restore, clean, stash, or rewrite history.
- Do not add AI, OCR, Prisma, PostgreSQL, Redis, GraphQL, WebSockets, payments, ads, social features, leaderboards, voice tutor, or teacher portal.
- Preserve existing user work and existing supported routes.
- Content remains deterministic and reviewable; answer validation never depends on an LLM.
- Grade 4 remains the first populated grade while IDs and API contracts stay grade-extensible.

---

### Task 1: Content quality and template semantics

**Files:**

- Modify: `apps/api/src/content/catalog.data.ts`
- Create: `apps/api/src/content/question-templates.ts`
- Modify: `apps/api/src/content/question-bank.data.ts`
- Modify: `apps/api/src/content/content-validation.ts`
- Test: `apps/api/test/content.e2e-spec.ts`

**Interfaces:**

- Produces `buildQuestionCore(blueprint, variant)` with deterministic, problem-specific stems, answers, hints, explanations, and visuals.
- `questionBank` consumes the generated core and applies supported answer formats.

- [x] Add failing tests requiring unique stems, at least three variants per problem type, natural problem-specific signatures, valid hierarchy, and a representative breadth matrix across all seven domains.
- [x] Run the API content test and confirm failures point to repeated or semantically incorrect templates.
- [x] Move template generation into `question-templates.ts` and implement dedicated branches for each problem type.
- [x] Add focused problem types only where a domain is materially under-covered; retain at least 150 reviewed questions and at least 20% visual questions.
- [x] Reject exact duplicate stems in `content:validate`.
- [x] Run API tests, `content:validate`, and `content:stats` until green.

### Task 2: Complete typed practice-session state

**Files:**

- Modify: `packages/shared/src/practice.ts`
- Modify: `apps/api/src/practice/practice.service.ts`
- Test: `apps/api/test/content.e2e-spec.ts`

**Interfaces:**

- `PracticeSession` exposes selected topic IDs plus answer-attempt summaries and mistake codes without exposing expected answers.
- `PracticeService.answer()` appends a sanitized attempt summary and advances only on a correct result.

- [x] Add a failing API test that creates a multi-type session, submits wrong and correct answers, then retrieves topic selection, attempt counts, hint totals, and mistake summaries.
- [x] Run the targeted API test and verify the missing fields fail.
- [x] Extend shared contracts and service state with `selectedTopicIds`, `attempts`, and `mistakes`.
- [x] Store only question ID, correctness, hint count, misconception, and timestamp; do not retain the raw student answer.
- [x] Run targeted and full API tests until green.

### Task 3: Adaptive daily/review and human-readable progress

**Files:**

- Create: `apps/web/src/features/progress/practiceRecommendations.ts`
- Modify: `apps/web/src/pages/DailyPracticePage.tsx`
- Modify: `apps/web/src/pages/ReviewPage.tsx`
- Modify: `apps/web/src/pages/HomePage.tsx`
- Modify: `apps/web/src/pages/ParentPage.tsx`
- Test: `apps/web/src/features/progress/practiceRecommendations.test.ts`

**Interfaces:**

- `buildDailyProblemTypeIds(progress, catalog)` returns a deterministic ten-question mix with weak skills first and broad fallback coverage.
- `buildWeakSkillRecommendations(progress, catalog)` returns human-readable problem-type records.

- [x] Add failing pure-function tests for weak-skill prioritization, deterministic fallback, deduplication, and unknown skill IDs.
- [x] Run the targeted web test and verify failures.
- [x] Implement recommendation helpers and wire Daily, Review, Home continuation, and Parent summaries to them.
- [x] Keep all persistence through `ProgressRepository`; do not expose mastery decimals or enum names.
- [x] Run targeted and full web tests until green.

### Task 4: Frontend acceptance coverage

**Files:**

- Create: `apps/web/src/pages/LearnCatalogPage.test.tsx`
- Create: `apps/web/src/pages/PracticeSessionPage.test.tsx`
- Create: `apps/web/src/features/progress/progressRepository.test.ts`
- Modify only production files exposed by failing behavior tests.

**Interfaces:**

- Tests exercise real page components with complete API response fixtures and browser-local storage.

- [x] Add failing catalog tests for topic/problem-type rendering, search, topic filter, and multi-select practice URL.
- [x] Add failing practice tests for canonical submission, incorrect feedback, progressive hints, correct feedback, next question, completion, and progress persistence.
- [x] Add repository tests for independent/hinted mastery and recent mistakes without raw-answer persistence.
- [x] Run each focused test to observe the intended failure before any corresponding production edit.
- [x] Apply minimal production fixes and run the full web suite.

### Task 5: Documentation, route QA, and final gates

**Files:**

- Modify: `docs/GRADE4_CONTENT_MAP.md`
- Modify: `docs/PRODUCT_BASELINE.md`
- Modify: `docs/LEARNING_FLOW.md`
- Modify: `docs/TESTING.md`
- Modify: `README.md` only if commands or counts changed.

**Interfaces:**

- Documentation reports measured counts and current limitations rather than aspirational claims.

- [x] Regenerate the readable content matrix with exact problem-type counts, difficulty coverage, and visual coverage.
- [x] Run manual browser QA for `/`, `/learn`, `/learn/grade/4`, one domain, one topic, one problem type, `/practice`, `/daily`, `/review`, `/me`, and `/parent` at 1440x900, 1024x768, and 390x844.
- [x] Verify no horizontal overflow, meaningful Vietnamese wrapping, keyboard-operable controls, responsive diagrams, and parent-shell isolation.
- [x] Run `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build`, `pnpm content:validate`, `pnpm content:stats`, and `git diff --check`.
- [x] Record exact results, screenshots, limitations, `git status`, and `git diff --stat` in the final A-J report.
