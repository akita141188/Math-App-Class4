# Content authoring

## Quy trình

1. Thêm domain, topic hoặc problem blueprint với slug ổn định.
2. Viết template deterministic bằng tiếng Việt tự nhiên.
3. Chọn số phù hợp học sinh lớp 4 và bảo đảm đơn vị nhất quán.
4. Thêm hints tăng dần; hint đầu không lộ đáp án.
5. Thêm explanation ngắn và misconception feedback thân thiện.
6. Dùng visual data có alt mô tả nếu câu cần hình.
7. Đặt status REVIEWED chỉ sau khi người biên soạn kiểm tra.
8. Chạy pnpm content:validate và pnpm test.

## Quy tắc giá trị hàng

Nếu chữ số được hỏi xuất hiện nhiều lần trong số, phải chỉ rõ lần xuất hiện bằng tên hàng hoặc vị trí. Ví dụ hợp lệ: Trong số 44.525, chữ số 4 ở hàng nghìn có giá trị là bao nhiêu?

## Quy tắc hình phân số

- FRACTION_CIRCLE và FRACTION_BAR phải có `equalParts >= 2`, `0 <= shadedParts <= equalParts` và các giá trị nguyên.
- `equalParts` phải bằng mẫu số; `shadedParts` phải bằng tử số của đáp án đúng.
- Câu nhận dạng phần tô dùng đáp án FRACTION với `requireExactForm: true`.
- Lời hỏi phải nêu rõ hình được chia bao nhiêu phần bằng nhau và bao nhiêu phần đã tô.
- `pnpm content:validate` phải thất bại nếu hình và đáp án mâu thuẫn.

## Cấm

- Không copy HTML tùy ý vào nội dung.
- Không tạo biến thể vô nghĩa chỉ để tăng số lượng.
- Không dùng số ngẫu nhiên không seed.
- Không đưa expectedAnswer xuống StudentQuestion.
- Không dùng enum kỹ thuật làm phản hồi cho trẻ.

## Checklist review

Kiểm tra lời văn, đáp án, độ khó, đơn vị, hình khớp đề, hint, explanation, skill mapping, ambiguity của chữ số lặp và common error.
