# Test mode

## Luồng

`GET /api/v1/test-blueprints` trả 5 blueprint. `POST /api/v1/test-attempts` lọc câu `testEligible`, áp coverage/format/assessment-level, loại ID và fingerprint trùng, ưu tiên câu chưa dùng gần đây rồi đóng băng thứ tự và snapshot. `GET` trả lại đúng attempt đó; refresh không tạo đề mới.

Trong khi làm, học sinh đi trước/sau, sửa đáp án và thấy câu bỏ trống cùng thời gian đã làm. API không trả `expectedAnswer`, `solutionSteps`, `explanation`, `hints`, `commonErrors`, `generatorParams` hoặc `assessmentLevel`. UI không hiển thị đúng/sai hay hint.

`PUT /api/v1/test-attempts/:id/answers/:questionId` cập nhật đáp án trước khi nộp. `POST /api/v1/test-attempts/:id/submit` nhận snapshot đáp án cuối, chấm server-side và khóa attempt. Sau nộp, response mới chứa kết quả, đáp án đúng tóm tắt và giải thích.

## Blueprint tích hợp

- `mid-term-1`
- `end-term-1`
- `mid-term-2`
- `end-year`
- `comprehensive`

Mỗi blueprint có 20 câu, tổng 10 điểm, phân bố LEVEL_1/LEVEL_2/LEVEL_3 là 6/10/4 và 4 câu cho mỗi format: `SHORT_ANSWER`, `FILL_BLANK`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `WRITTEN_SOLUTION`. `difficulty` và `assessmentLevel` là hai chiều metadata độc lập.

## Chấm điểm

Mỗi câu hiện có `scoreWeight = 1`. Server dùng frozen question snapshot và validator deterministic, tính đúng/sai/bỏ trống, điểm thô và breakdown theo topic. Điểm trường học là `Math.round(rawPoints / possiblePoints * 10)`, một số nguyên từ 0 đến 10. Frontend không tự chấm.

Attempt hiện lưu trong memory của API vì sản phẩm chưa có tài khoản/database. Kết quả đã nộp được lưu vào local history có version trên thiết bị. Đây là ranh giới prototype đã chủ ý; không thêm database chỉ cho tính năng này.
