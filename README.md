# Math App Class 4

Nền tảng học Toán có hướng dẫn cho học sinh lớp 4 Việt Nam. Sản phẩm ưu tiên học sinh tự suy nghĩ, deterministic math validation và nội dung version-controlled.

## Yêu cầu

- Node.js 22 trở lên
- pnpm 11.9.0

## PowerShell

Cài dependencies:

    pnpm install

Chạy web và API:

    pnpm dev

Chỉ frontend:

    pnpm dev:web

Chỉ API:

    pnpm dev:api

TypeScript:

    pnpm typecheck

Lint:

    pnpm lint

Kiểm tra format:

    pnpm format:check

Test:

    pnpm test

Build:

    pnpm build

Kiểm định nội dung:

    pnpm content:build-bank
    pnpm content:validate
    pnpm content:audit
    pnpm content:duplicates

Thống kê nội dung:

    pnpm content:stats

Xuất trang review nội dung:

    pnpm content:review-export

## URL phát triển

- Web: http://localhost:5173
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

## Cấu trúc

- apps/web — React, Vite, student UI, parent shell, local progress adapter.
- apps/api — NestJS REST, curriculum, question bank, validator, practice và test attempt đóng băng trong memory.
- packages/shared — contract TypeScript.
- docs — product, architecture, content map và authoring.

## Nội dung hiện tại

Grade 4 V3 có 7 domain, 14 topic, 64 selectable leaf type và 2.560 câu REVIEWED. Mỗi leaf có đúng 40 câu (12 EASY, 20 MEDIUM, 8 HARD), ID/fingerprint duy nhất và visual có cấu trúc. Ứng dụng có practice, lịch sử/completion cục bộ và 5 blueprint bài kiểm tra.

## Ranh giới

Chưa tích hợp AI, OCR, database, authentication hoặc tracking. Ảnh không được upload. Bài tự nhập không được tự chấm giả. Progress/history localStorage và attempt in-memory là adapter prototype, không phải persistence production hay đồng bộ đa thiết bị.
