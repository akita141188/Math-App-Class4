# Product baseline

## Mục tiêu

Math App Class 4 là bàn học Toán số có hướng dẫn cho học sinh 9–10 tuổi. Ứng dụng giúp học sinh đọc đề, tự thử, nhận phản hồi, xem gợi ý tăng dần và luyện bài tương tự. Luồng chính không phải chatbot và không đưa đáp án ngay.

## Phạm vi hiện tại

- Lớp 4 là grade đầu tiên; model không khóa vào riêng lớp 4.
- 7 domain, 14 topic, 64 skill/selectable leaf type.
- 2.560 câu deterministic, 40 câu mỗi leaf, có ID/fingerprint duy nhất và trạng thái REVIEWED.
- 8 format trả lời và 15 loại visual data typed.
- Catalog, select-all theo filter/topic, count 5–50/Tất cả, độ khó Tất cả và ba mode PRACTICE, LEARN, REVIEW.
- Phiên luyện tập in-memory phía API lưu lựa chọn topic, attempt đã làm sạch, lỗi và mức dùng hint; không lưu đáp án thô.
- Progress, question exposure và learning history V3 trong localStorage sau interface thay thế được; history giới hạn 200 session.
- 5 blueprint test mode, frozen attempt, chấm deterministic thang 10 và review sau submit.
- Bài hằng ngày ưu tiên kỹ năng yếu, ôn tập gọi đúng tên kỹ năng cần củng cố, tiếp tục từ kỹ năng gần nhất, sổ lỗi và tóm tắt phụ huynh.

## Không thuộc phạm vi

Chưa có AI, OCR, cơ sở dữ liệu, xác thực, tracking, đồng bộ đa thiết bị hay lưu ảnh. Bài tự nhập không được giả vờ chấm tự động.

## Nguyên tắc riêng tư

Không quảng cáo, hồ sơ trẻ em công khai, chat giữa trẻ hay upload ảnh. History cục bộ có thể giữ câu trả lời để xem lại nhưng không lưu danh tính; dữ liệu không đồng bộ khỏi thiết bị trong prototype.
