# Architecture decisions

## ADR-001 — TypeScript pnpm monorepo

Giữ apps/web, apps/api và packages/shared để dùng chung contract và quality gates.

## ADR-002 — Version-controlled content first

Curriculum và question bank là TypeScript deterministic có status/version. Chưa thêm PostgreSQL hoặc Prisma.

## ADR-003 — Deterministic validation

Math validator quyết định đúng sai. Không dùng AI làm nguồn chân lý Toán học.

## ADR-004 — REST MVP

REST đủ rõ cho catalog, question và practice session. Không thêm GraphQL, WebSocket hoặc event infrastructure.

## ADR-005 — Safe visual data

Visual là discriminated union và React SVG. Không render arbitrary HTML từ content, không thêm chart library.

## ADR-006 — Local progress adapter

Progress prototype dùng localStorage sau interface. Chỉ lưu counters, mastery và misconception code; không lưu raw child answer. Sẽ thay adapter khi có quyết định database.

## ADR-007 — Parent shell isolation

Route parent nằm ngoài AppShell của trẻ để tránh trộn navigation và ngữ cảnh.

## ADR-008 — Versioned local learning history

Prototype lưu tối đa 200 session practice/test đã hoàn thành trong localStorage schema V3. Hai loại record giữ semantics khác nhau; malformed/outdated data bị bỏ qua an toàn. Không thêm database khi chưa có account/sync requirement.

## ADR-009 — Frozen server-scored test attempts

Blueprint chỉ chọn từ bank REVIEWED/testEligible, áp coverage, format, assessment level và recent avoidance. API giữ snapshot bất biến, không gửi hint/assessment level/đáp án trước nộp, chấm deterministic và khóa attempt sau submit. Điểm hiển thị là số nguyên thang 10 theo Thông tư 27.

## Deferred

AI, OCR, authentication, database, analytics, payment, ads, social, leaderboard, voice tutor và teacher portal cần phê duyệt riêng.
