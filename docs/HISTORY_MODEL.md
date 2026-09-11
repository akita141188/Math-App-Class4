# History model

History học tập là local adapter có version, không chứa tên, email hay dữ liệu định danh. Khóa hiện tại là `math-app-class4-learning-history-v3`, `storage version = 3`.

## Hai loại bản ghi

- `PRACTICE`: thời gian bắt đầu/hoàn thành, duration, content version, domain/topic/leaf đã chọn, difficulty mode, số câu yêu cầu/thực tế, đúng/sai/bỏ trống, accuracy và kết quả từng câu.
- `TEST`: blueprint, thời gian bắt đầu/nộp, duration, content version, đúng/sai/bỏ trống, raw percent, điểm /10, breakdown topic và kết quả từng câu.

Kết quả từng câu có ID, leaf/topic, difficulty, assessment level nếu an toàn, format, trạng thái, số hint, câu trả lời học sinh, tóm tắt câu hỏi, đáp án đúng khi đã được phép công bố và giải thích.

## Chính sách dữ liệu

- Chỉ lưu session đã hoàn thành/nộp.
- Sắp mới nhất trước, upsert theo ID.
- Giữ tối đa 200 session mới nhất.
- JSON lỗi, record sai hình dạng hoặc storage version cũ được bỏ qua an toàn.
- Practice và Test dùng chung container nhưng giữ discriminator và semantics điểm riêng.

Route `/history` có filter Tất cả/Luyện tập/Kiểm tra; `/history/:sessionId` hiển thị summary và review từng câu. `Của em` và khu vực phụ huynh đọc cùng repository này.
