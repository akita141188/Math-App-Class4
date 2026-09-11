# Benchmark các ứng dụng học Toán

Tài liệu này ghi lại các mẫu sản phẩm và nguyên tắc sư phạm có thể áp dụng cho Math App Class 4. Nội dung chỉ tổng hợp cách tổ chức công khai; không sao chép câu hỏi, giao diện hay học liệu độc quyền.

## OLM

- Điểm mạnh: nội dung Toán lớp 4 được tổ chức theo tiến trình chủ đề/bài học, sau bài học có luyện tập và đánh giá.
- Áp dụng: giữ cây `Domain → Topic → Skill → ProblemType`; cho phép luyện theo từng dạng và luyện tổng hợp.
- Không sao chép: câu hỏi, video, bố cục và cách trình bày của OLM.
- Quyết định: taxonomy của ứng dụng phải bám chuẩn cần đạt nhưng không phụ thuộc thứ tự của một bộ sách.

Nguồn: <https://olm.vn/bg/toan-4?loai-xep-hang=0&week=-2763>

## VioEdu

- Điểm mạnh: luyện tập theo kỹ năng, nhận diện điểm mạnh/yếu và gợi ý lộ trình cá nhân hóa.
- Áp dụng: lưu tiến độ và lịch sử câu hỏi tối thiểu trên thiết bị; dùng sai lầm gần đây để ưu tiên ôn tập.
- Không sao chép: thuật toán thích ứng, nội dung và cơ chế thi đấu.
- Quyết định: tách lịch sử nhìn thấy câu hỏi khỏi dữ liệu cá nhân; prototype không cần tài khoản hay database.

Nguồn: <https://vio.edu.vn/>

## IXL Grade 4 Math

- Điểm mạnh: taxonomy kỹ năng chi tiết, mỗi kỹ năng là một nhiệm vụ luyện tập rõ ràng; theo dõi mức thành thạo liên tục.
- Áp dụng: một `ProblemType` phải là một nhiệm vụ riêng có thể luyện độc lập; không dùng các nhãn quá rộng như “Phân số”.
- Không sao chép: skill list nguyên văn, câu hỏi, scoring và adaptive engine.
- Quyết định: chỉ tách type khi thao tác toán học, oracle hoặc lỗi sai điển hình khác nhau có ý nghĩa.

Nguồn: <https://www.ixl.com/math/grade-4/skills>

## Matific

- Điểm mạnh: đi từ thao tác/trực quan cụ thể đến biểu diễn trừu tượng; nhiều mô hình cho cùng một khái niệm; phản hồi nằm trong ngữ cảnh.
- Áp dụng: hình phân số, nhóm đồ vật, trục số và sơ đồ phải được tạo từ cùng tham số toán học với đáp án.
- Không sao chép: trò chơi, nhân vật, hình ảnh hay activity độc quyền.
- Quyết định: visual là dữ liệu có schema và oracle, không phải hình trang trí.

Nguồn: <https://www.matific.com/au/en-au/home/pedagogy/principles/>

## Prodigy Math

- Điểm mạnh: luyện tập thích ứng, ôn xoắn ốc, lùi về prerequisite khi phát hiện lỗ hổng.
- Áp dụng: phiên hỗn hợp cân bằng độ khó, tránh câu vừa gặp và xoay vòng kho trước khi tái sử dụng.
- Không sao chép: game loop, nội dung, hệ thống phần thưởng hoặc thuật toán độc quyền.
- Quyết định: randomization là bước server-side tách biệt hoàn toàn khỏi deterministic bank generation.

Nguồn: <https://www.prodigygame.com/main-en/blog/is-prodigy-math-adaptive>

## Các quyết định chung

1. Chuẩn chương trình Việt Nam là cổng bắt buộc; benchmark không được dùng để đưa nội dung vượt lớp.
2. Taxonomy đủ chi tiết để luyện độc lập nhưng không tách giả tạo nhằm tăng số type.
3. Mỗi câu được materialize, kiểm định và có fingerprint ổn định trước khi API phục vụ.
4. Generator và oracle dùng chung tham số; visual, stem, expected answer, hint và explanation không được phát sinh độc lập.
5. Bank deterministic; chọn câu trong session mới là randomized.
