# Chính sách chọn câu và xoay vòng

## Phân tách trách nhiệm

Bank generation là deterministic. Practice selection là randomized trên server. Frontend không nhận toàn bộ bank và không tự chọn câu.

## Luồng chọn

```text
lọc problem type
→ lọc difficulty nếu người học chọn rõ
→ loại ID/fingerprint trùng
→ ưu tiên câu chưa có trong recent history
→ cân bằng problem type và template
→ áp quota difficulty
→ Fisher–Yates thứ tự cuối
→ đóng băng snapshot session
```

Không dùng `array.sort(() => Math.random() - 0.5)`.

## Difficulty

Phiên MIXED 10 câu dùng 3 EASY, 5 MEDIUM, 2 HARD. Với kích thước khác, quota được tính gần tỷ lệ 30/50/20 và MEDIUM nhận phần dư làm tròn. Khi người học chọn một difficulty cụ thể, toàn bộ câu thuộc difficulty đó.

## Recent history

Prototype lưu localStorage theo khóa riêng cho V3, chỉ gồm:

- `problemTypeId`;
- `questionId`;
- `fingerprint`;
- `lastSeenAt`.

Không lưu tên, email hoặc dữ liệu cá nhân. Mỗi type giữ tối đa 50 mục, bằng trần pool leaf hiện hành. Frontend gửi danh sách lịch sử liên quan; API luôn chọn từ bank server-side.

Khi còn câu chưa thấy, selector không tái sử dụng câu recent. Khi đã đi gần hết pool, selector tái sử dụng các câu có `lastSeenAt` cũ nhất trước. Trong một session không lặp ID hoặc fingerprint.

## Tính kiểm thử được

Selector nhận `rng` qua dependency/function parameter trong test. Production dùng RNG runtime. Test seed không xuất hiện trong UI hoặc request công khai.

Test bắt buộc:

- cùng seed cho cùng kết quả;
- seed khác tạo thứ tự/tập khác;
- không trùng ID/fingerprint trong session;
- recent exclusion hoạt động;
- mô phỏng 20 phiên × 5 câu trên toàn bộ 64 leaf đạt đủ 40 câu mỗi leaf và không lặp ngay với phiên trước;
- sau khi hết pool, câu cũ nhất được phép trở lại;
- session mixed cân bằng difficulty, type và template.

## Snapshot

Session giữ `contentVersion`, ordered question IDs và toàn bộ immutable question snapshot cần để hiển thị/chấm. Option order nằm trong snapshot, không đổi khi React render lại, mở hint hay gửi đáp án.

Test mode dùng cùng nguyên tắc unseen-first và recent IDs nhưng áp thêm blueprint coverage, format và assessment level. Một attempt đã tạo luôn giữ nguyên câu và thứ tự khi GET/refresh.
