# Báo cáo QA Grade 4 V3

Ngày kiểm tra: 12/09/2026.

Trạng thái: **PASS các gate tự động và các luồng UI live được liệt kê bên dưới**.

## Phạm vi bắt buộc

- 64 leaf type, mỗi leaf có đúng 40 câu; tổng cộng 2.560 câu.
- Phân bố mỗi leaf: 12 EASY + 20 MEDIUM + 8 HARD.
- `content:validate`, `content:audit` và `content:duplicates`: PASS.
- 0 leaf dưới 30, 0 leaf trên 50, 0 ID trùng, 0 fingerprint trùng.

## Số liệu kiểm duyệt

Các con số dưới đây là audit tự động toàn bank, không được mô tả thành kiểm duyệt thủ công từng câu.

```text
Leaf types validated: 64/64
Questions validated: 2560/2560
Automated validation issues: 0
Duplicate IDs: 0
Duplicate fingerprints: 0
```

## Bảng theo problem type

`pnpm content:review-export` tạo:

- `.tmp/content-review/grade4-review.html` để lọc và xem toàn bank;
- worksheet đại diện để ghi nhận chính xác ID đã kiểm tra.

| Phạm vi      | EASY | MEDIUM | HARD |  Tổng | Kết quả |
| ------------ | ---: | -----: | ---: | ----: | ------- |
| 64 leaf type |  768 |  1.280 |  512 | 2.560 | PASS    |

## Visual QA

| Visual / luồng                   | 1440×900 | 1024×768 | 390×844 | Kết quả                            |
| -------------------------------- | -------- | -------- | ------- | ---------------------------------- |
| FRACTION_CIRCLE 1/6              | PASS     | PASS     | PASS    | 6 sector, tô 1, góc `π/3`, có clip |
| Practice question/completion     | PASS     | PASS     | PASS    | Không tràn ngang                   |
| History list/detail              | PASS     | PASS     | PASS    | Không tràn ngang                   |
| Tests list/attempt/result/review | PASS     | PASS     | PASS    | Không tràn ngang                   |
| Của em / Parent                  | PASS     | PASS     | PASS    | Không tràn ngang                   |

## Request và phản hồi phân số

- `1/5`: HTTP 201, chấm sai.
- `2/6`: HTTP 201, chấm sai vì bài nhận biết phần tô yêu cầu đúng teaching form.
- `1/6`: HTTP 201, chấm đúng và hiện “Chính xác! Em đã tự tìm được đáp án.”
- Payload canonical: `{"kind":"FRACTION","numerator":1,"denominator":6}`.

## V3 live smoke

- Global select-all chọn 64 dạng / 2.560 câu.
- Topic select-all Số tự nhiên chọn 6 dạng / 240 câu.
- Danh sách đề hiển thị rõ cách tính điểm: mỗi câu 0,5 điểm, điểm cuối làm tròn số nguyên.
- Nút “Bắt đầu làm bài” tạo attempt và điều hướng thành công vào test workspace.
- Test attempt 20 câu giữ nguyên ID/thứ tự khi tải lại.
- Trước nộp không có hints, assessmentLevel hoặc đáp án đúng.
- Sau nộp attempt bị khóa; review hiện đáp án đúng; history được lưu.
- Topic breakdown hiển thị tên tiếng Việt.

## Bằng chứng

- `docs/qa/fraction-1-6-1440.png`
- `docs/qa/fraction-1-6-1024.png`
- `docs/qa/fraction-1-6-390.png`
- `docs/qa/live-browser-qa.json`

Computer Use UI helper không khởi tạo được do lỗi sandbox Windows. QA live được thực hiện bằng
Microsoft Edge headless qua Chrome DevTools Protocol trên cùng frontend/API localhost.
