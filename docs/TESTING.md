# Testing

## Lệnh

- pnpm typecheck
- pnpm lint
- pnpm format:check
- pnpm test
- pnpm build
- pnpm content:build-bank
- pnpm content:validate
- pnpm content:audit
- pnpm content:duplicates
- pnpm content:stats
- pnpm content:review-export
- git diff --check

## Phạm vi tự động

- Content: unique ID và stem, hierarchy, format, choice, hint, difficulty, visual, place-value ambiguity, prerequisite, misconception và coverage.
- Validator: đáp án đúng của toàn bộ 2.560 câu được kiểm tra deterministic; schema, oracle, unit, wording, option, visual, duplicate ID/fingerprint và 30–50 câu/leaf được audit.
- API: catalog, question secrecy, practice ALL/count/difficulty/recent rotation, canonical fraction, frozen test attempt, coaching-data secrecy, deterministic score, unanswered và khóa sau submit.
- Web: catalog/select-all/filter/count, badge difficulty, practice complete/fresh set, history version/retention/completion, test no-hint/no-feedback, sửa đáp án, result/review/history, navigation và parent isolation.

## Manual QA

Kiểm tra 1440 × 900, 1024 × 768 và 390 × 844 cho home, catalog, topic, problem type, practice, review, me và parent. Xem overflow, wrapping tiếng Việt, focus, touch target, visual, câu dài và mobile navigation.

Không coi build pass là bằng chứng visual. Ảnh QA phải được tạo mới từ server hiện tại.
