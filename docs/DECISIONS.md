# Decisions

## ADR-001 — TypeScript pnpm monorepo

**Status:** Accepted

Dùng một repository với `apps/web`, `apps/api` và `packages/shared`. pnpm workspace giữ lệnh cài đặt, test và build nhất quán mà không tạo thêm package không cần thiết.

## ADR-002 — React + Vite cho frontend

**Status:** Accepted

React phù hợp với giao diện nhiều trạng thái; Vite cung cấp vòng lặp phát triển và production build nhỏ gọn. React Router quản lý bảy route hiện tại. TanStack Query quản lý trạng thái máy chủ. Chưa cần Zustand vì prototype không có global client state đủ lớn.

## ADR-003 — NestJS cho backend

**Status:** Accepted

NestJS cung cấp module boundary, DTO validation, cấu hình và Swagger trực tiếp. Mỗi module hiện tại có endpoint hoặc logic thật; không tạo module dự phòng.

## ADR-004 — REST cho MVP

**Status:** Accepted

REST đủ rõ cho curriculum, problem và learning-session prototype. Hợp đồng tối thiểu được chia sẻ bằng TypeScript.

## ADR-005 — Guided workspace, không phải chat

**Status:** Accepted

Màn học hiển thị đề, bước hiện tại, ô suy nghĩ, gợi ý và kiểm tra. State machine có tên rõ ràng để sau này Tutor Orchestrator có thể điều khiển mà không thay đổi mô hình trải nghiệm.

## ADR-006 — Công nghệ chưa đưa vào

**Status:** Accepted

Chủ động chưa dùng GraphQL, WebSocket, PostgreSQL, Prisma, Redis, Kafka, CQRS, event bus, microservices, Kubernetes, authentication, payment, OCR provider hoặc LLM provider. Chỉ xem xét khi có yêu cầu sản phẩm và quyết định kiến trúc tương ứng.
