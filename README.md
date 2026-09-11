# Math App Class 4

Nền tảng ban đầu cho ứng dụng Gia sư Toán có hướng dẫn dành cho học sinh lớp 4 tại Hà Nội.

## Yêu cầu

- Node.js 22 trở lên
- pnpm 11.9.0 trở lên

## Cài đặt trên Windows PowerShell

```powershell
git clone <repository-url> Math-app-class4
Set-Location Math-app-class4
Copy-Item .env.example .env
pnpm install
```

## Chạy phát triển

Chạy frontend và backend cùng lúc:

```powershell
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

Chỉ chạy frontend:

```powershell
pnpm dev:web
```

Chỉ chạy backend:

```powershell
pnpm dev:api
```

## Kiểm tra

Chạy toàn bộ kiểm thử:

```powershell
pnpm test
```

Chạy riêng từng phần:

```powershell
pnpm test:web
pnpm test:api
```

Kiểm tra TypeScript:

```powershell
pnpm typecheck
```

Kiểm tra mã nguồn:

```powershell
pnpm lint
pnpm format:check
```

## Build production

```powershell
pnpm build
```

Kết quả frontend nằm ở `apps/web/dist`; kết quả backend nằm ở `apps/api/dist`.

## Cấu trúc

```text
apps/
  web/      React + Vite
  api/      NestJS REST API
packages/
  shared/   Hợp đồng TypeScript dùng chung
docs/       Nguyên tắc sản phẩm và kiến trúc
```

Đây là bản foundation dùng dữ liệu mẫu trong bộ nhớ. Chưa có AI, OCR, cơ sở dữ liệu hoặc xác thực. Ảnh trẻ chọn trong màn hình thử nghiệm chỉ được xem trước trong trình duyệt và không được tải lên.
