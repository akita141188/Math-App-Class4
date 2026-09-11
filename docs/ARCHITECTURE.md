# Architecture

## Workspaces

- apps/web: React, Vite, route và UI học sinh/phụ huynh.
- apps/api: NestJS REST, content bank, validator và practice session.
- packages/shared: contract TypeScript tối thiểu, không chứa dữ liệu lớn.

## Luồng dữ liệu

Typed content bank → REST content endpoints → StudentQuestion không có đáp án → Answer UI → Practice answer endpoint → Deterministic validator → Learning feedback → Local progress repository.

Question bank không nằm trong client bundle. API giữ expectedAnswer. Practice session in-memory là adapter giai đoạn hiện tại, không giả làm persistence production.

## Boundary

Parent dùng ParentShell riêng. Ảnh chỉ preview trong browser. Không có AI, OCR, database, auth hay tracking. REST là transport MVP.

## Feature organization

Web có feature curriculum, question, learning-session và progress. API có content và practice module. Chỉ tách abstraction khi có ranh giới tái sử dụng rõ.
