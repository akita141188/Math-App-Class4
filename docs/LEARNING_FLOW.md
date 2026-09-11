# Learning flow

## Practice flow

Reducer thuần dùng các state QUESTION_PRESENTED, ATTEMPT, CHECKING, INCORRECT, HINT, CORRECT, EXPLANATION, TRANSFER_TEST và COMPLETE.

Hint tăng từng mức và không vượt số hint của câu. Câu sai ở lại câu hiện tại. Câu đúng mới tăng currentQuestionIndex. Từ câu thứ hai trở đi được xem là transfer practice.

Mỗi session lưu `selectedTopicIds`, lịch sử attempt đã làm sạch và danh sách mistake. `hintUsage` chỉ tăng theo số hint mới đã mở cho cùng một câu, nên gửi lại đáp án không làm đếm trùng. Attempt chỉ chứa question ID, đúng/sai, số hint, misconception và thời điểm; payload đáp án của học sinh không được ghi lại.

## Mode

- PRACTICE: học sinh tự làm độc lập.
- LEARN: nhấn mạnh gợi ý tăng dần.
- REVIEW: ưu tiên skill có lịch sử sai hoặc NEEDS_REVIEW.

Daily, Review, Home và Parent cùng đọc progress qua adapter. Daily xếp kỹ năng yếu trước rồi bổ sung danh sách ổn định; Review và Parent hiển thị tên kỹ năng từ catalog; Home tiếp tục từ kỹ năng hợp lệ gần nhất.

## Legacy guided problem

Luồng bài demo vẫn giữ các bước hiểu dữ kiện, hiểu câu hỏi, chiến lược và tự giải. Transfer retry ở lại transfer; COMPLETE có màn riêng. Đề tự nhập được ghi rõ là chưa thể tự chấm.

## Ranh giới AI

Không có hội thoại tự do hay lịch sử chat. AI tương lai chỉ đứng sau curriculum context, deterministic math validator và learning policy.
