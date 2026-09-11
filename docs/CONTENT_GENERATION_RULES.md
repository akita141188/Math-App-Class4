# Quy tắc sinh ngân hàng nội dung Grade 4 V3

## Nguồn sự thật

`reviewed generator → deterministic materialization → canonical JSON → validation/audit → API`.

- Generator chứa phạm vi tham số, oracle, stem, expected answer, visual, hints và explanation.
- JSON trong `apps/api/src/content/banks/grade-4/v3` là bank canonical mà API đọc.
- Không sửa tay đáp án trong JSON. Mọi sửa lỗi toán học phải bắt đầu từ generator rồi build lại.
- `contentVersion`: `grade4-v3`.
- `generationSeed`: `grade4-bank-v3`.
- `generatedAt` chỉ là metadata và không tham gia ID/fingerprint.

## Phân bố bắt buộc mỗi selectable leaf type

- Từ 30 đến 50 câu hợp lệ và duy nhất; bank hiện hành có đúng 40 câu mỗi leaf.
- 12 EASY, 20 MEDIUM, 8 HARD (30/50/20).
- Template và tham số phải tạo biến thể nhiệm vụ có ý nghĩa, không chỉ đổi số bề mặt.
- Độ khó thay đổi theo số bước suy luận, dạng biểu diễn, quan hệ cần nhận ra và mức kết hợp dữ kiện; không chỉ tăng chữ số.

## ID và fingerprint

ID ổn định được băm từ:

```text
grade + problemTypeId + templateId + normalized generatorParams
```

Fingerprint được băm từ:

```text
problemTypeId + templateId + normalized params + normalized stem
+ expectedAnswer + visual + frozen options
```

Object được canonicalize bằng cách sắp xếp key trước khi SHA-256. Timestamp và vị trí mảng không tham gia danh tính câu hỏi.

## Oracle

Mọi generator phải bắt đầu từ một bộ tham số duy nhất. Oracle tính kết quả từ tham số đó; stem, visual và explanation chỉ được dựng từ cùng tham số.

Các bất biến tối thiểu:

- cộng: `answer = a + b`;
- trừ: `answer = a - b`, không âm khi đề không dạy số âm;
- nhân: `answer = a × b`;
- chia hết: `dividend = divisor × quotient`;
- chia có dư: `dividend = divisor × quotient + remainder`, `0 ≤ remainder < divisor`;
- phân số: mẫu dương; phân số kết quả được rút gọn khi không kiểm tra teaching form;
- hình phân số: `equalParts = denominator`, `shadedParts = numerator`;
- độ dài/khối lượng/thời gian/diện tích: chỉ đổi giữa đơn vị tương thích với hệ số chính xác;
- chu vi/diện tích: kích thước dương, đơn vị đáp án phù hợp;
- bảng/biểu đồ: dữ liệu trong visual là dữ liệu dùng bởi oracle.

## Format và phương án nhiễu

- Single-choice có đúng bốn lựa chọn, đúng một đáp án, nhãn không trùng.
- Hai phân số tương đương không được cùng xuất hiện như hai lựa chọn khác nhau trong câu single-choice.
- Lựa chọn được xáo bằng RNG deterministic khi materialize và sau đó đóng băng trong JSON/session.
- True/false cân bằng theo chu kỳ template; mệnh đề sai dựa trên lỗi gần đáp án, không dùng nội dung vô nghĩa.
- Ordering chỉ dùng khi thao tác cần luyện thật sự là sắp xếp.

## Ngôn ngữ và sư phạm

- Dùng dấu chấm khi trình bày hàng nghìn theo tiếng Việt; dữ liệu số trong JSON vẫn là number.
- Nêu rõ hàng/vị trí nếu chữ số mục tiêu xuất hiện nhiều lần.
- Bài toán có lời văn phải đủ dữ kiện, có ngữ cảnh tự nhiên và đáp số đúng đơn vị.
- Ba hint theo tiến trình: nhận diện dữ kiện → chọn quan hệ/chiến lược → hướng dẫn thiết lập/kiểm tra; không tiết lộ nguyên đáp án.
- Explanation phải giải thích vì sao và thể hiện phép tính hoặc quan hệ dùng để kết luận.

## Build và phát hành

1. Sửa generator và test oracle.
2. Chạy `pnpm content:build-bank`.
3. Chạy `content:validate`, `content:audit`, `content:duplicates`, `content:stats`.
4. Tạo `content:review-export` và kiểm duyệt mẫu đại diện.
5. Không phục vụ bank nếu một shard sai schema, thiếu bản ghi hoặc không khớp manifest.
