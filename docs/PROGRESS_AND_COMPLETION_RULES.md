# Progress và completion

Trạng thái leaf type:

- `NOT_STARTED`: chưa có kết quả.
- `PRACTICING`: đã luyện nhưng chưa đạt điều kiện hoàn thành.
- `COMPLETED`: đã đạt điều kiện; giữ `completedAt` đầu tiên.
- `NEEDS_REVIEW`: từng hoàn thành nhưng độ chính xác độc lập gần đây giảm dưới ngưỡng ôn lại.

Một leaf được hoàn thành khi có ít nhất 2 session, ít nhất 20 question ID khác nhau đã làm, ít nhất 15 kết quả độc lập trong cửa sổ 20 kết quả gần nhất, và độ chính xác độc lập ít nhất 80%. Kết quả độc lập là câu không bỏ trống và không dùng hint.

Sau khi đã hoàn thành, `completedAt` không bị xóa. Nếu ít nhất 10 kết quả độc lập gần đây có accuracy dưới 60%, current status chuyển sang `NEEDS_REVIEW` nhưng mốc hoàn thành lịch sử vẫn còn. Khoảng giữa 60% và 80% không tự xóa thành tích.

Completion được tính lại từ practice history sau mỗi lần lưu và hiển thị ở card leaf. Điểm test không trực tiếp đổi completion của leaf vì semantics test và practice khác nhau.
