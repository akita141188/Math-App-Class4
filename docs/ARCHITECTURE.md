# Architecture

## Hiện tại

Đây là pnpm monorepo TypeScript gồm ba workspace:

- `apps/web`: React, Vite, React Router, TanStack Query, Tailwind CSS và Lucide.
- `apps/api`: NestJS REST API, cấu hình môi trường, validation và Swagger.
- `packages/shared`: các kiểu hợp đồng tối thiểu dùng ở cả web và API.

Frontend gọi REST qua `src/api/client.ts`. Vite chuyển tiếp `/api` tới NestJS khi phát triển. Khi API chưa sẵn sàng, màn học dùng bài mẫu cục bộ và báo trạng thái nhẹ nhàng để prototype vẫn dùng được.

API chia đúng theo năng lực đang tồn tại:

- `HealthModule`
- `CurriculumModule`
- `ProblemModule`
- `LearningSessionModule`

Dữ liệu hiện nằm trong bộ nhớ. Endpoint kiểm tra chỉ nhận bài demo đã biết và không gọi dịch vụ bên ngoài.

## Learning state

Hợp đồng `LearningState` hỗ trợ các trạng thái:

`UNDERSTAND_DATA`, `UNDERSTAND_QUESTION`, `STRATEGY`, `ATTEMPT`, `ERROR_DIAGNOSIS`, `HINT`, `FOUNDATION_REVIEW`, `RETRY`, `SOLVED`, `TRANSFER_TEST`, `COMPLETE`.

Prototype triển khai luồng chính bằng state cục bộ. Đây không phải giao diện chat.

## Ranh giới AI tương lai

Một `Tutor Orchestrator` trong tương lai sẽ điều phối:

```text
Student input
  -> Intent detection
  -> Learning state
  -> Curriculum context
  -> Tutor policy
  -> LLM draft
  -> Math validation
  -> Pedagogy validation
  -> Age-language validation
  -> Final response
```

Ranh giới này hiện chỉ là quyết định kiến trúc. Chưa có model client, provider key, prompt engine hay lớp giả lập không dùng đến.

## Bảo mật và dữ liệu trẻ em

- Biến cấu hình nằm trong môi trường; repository chỉ chứa `.env.example`.
- ValidationPipe loại bỏ hoặc từ chối trường ngoài DTO.
- API không ghi nội dung trả lời hay ảnh của trẻ vào log.
- Màn ảnh chỉ tạo object URL trong trình duyệt và thu hồi URL khi thay/xóa ảnh hoặc rời màn hình.
- Không có lưu trữ, tài khoản, analytics hoặc SDK theo dõi trong foundation.
