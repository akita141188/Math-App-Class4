# Rà soát chương trình Toán lớp 4

## Phạm vi và nguồn

Nguồn chuẩn là Chương trình giáo dục phổ thông môn Toán ban hành kèm Thông tư 32/2018/TT-BGDĐT và các văn bản điều chỉnh còn hiệu lực của Bộ Giáo dục và Đào tạo. Việc đối chiếu tiến trình sử dụng thêm trang Toán lớp 4 công khai của OLM; thứ tự bài học của từng bộ sách chỉ là tham khảo, không phải cấu trúc lõi của ứng dụng.

- Chương trình môn Toán: <https://moet.gov.vn/content/vanban/Lists/VBDT/Attachments/1559/2.%20Ch%C6%B0%C6%A1ng%20tr%C3%ACnh%20m%C3%B4n%20To%C3%A1n.pdf>
- Chương trình tổng thể CTGDPT 2018: <https://moet.gov.vn/content/tintuc/Lists/News/Attachments/8421/chuong-trinh-tong-the-ctgdpt-2018.pdf>
- Đối chiếu tiến trình lớp 4: <https://olm.vn/bg/toan-4?loai-xep-hang=0&week=-2763>

## Nguyên tắc khóa taxonomy

1. Một problem type là một nhiệm vụ có thể luyện độc lập, có oracle và lỗi sai đặc trưng.
2. Không tách type chỉ theo kích thước số hoặc chỉ để tăng số lượng.
3. Context không biến một phép tính giống nhau thành type mới.
4. Nội dung nâng cao chỉ được dùng trong phạm vi vận dụng của chuẩn lớp 4, không đưa đại số hình thức hoặc hình học suy diễn vào bank.
5. Mọi câu phải dùng thuật ngữ Toán học tiếng Việt phù hợp học sinh lớp 4.

## Kết quả audit

Taxonomy v1 có 40 type. Sáu type gộp nhiều nhiệm vụ đã được thu hẹp ý nghĩa; 24 type riêng biệt còn thiếu được bổ sung. Taxonomy v2 có 64 problem type.

| Domain          | Topic/Skill                | Problem type v2                                                                                       | Trong CT lớp 4?   | Coverage v1                    | Vấn đề                                       | Hành động                                |
| --------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------ | -------------------------------------------- | ---------------------------------------- |
| Số và phép tính | Đọc số                     | `read-write-numbers`                                                                                  | Có                | Có nhưng gộp                   | Gộp đọc/viết                                 | Thu hẹp thành đọc số                     |
| Số và phép tính | Viết số                    | `write-natural-numbers`                                                                               | Có                | Thiếu                          | Chưa luyện độc lập                           | Thêm type                                |
| Số và phép tính | Giá trị chữ số             | `digit-place-value`                                                                                   | Có                | Có                             | Có nguy cơ mơ hồ khi lặp chữ số              | Giữ, bắt buộc nêu hàng/vị trí            |
| Số và phép tính | So sánh số                 | `compare-numbers`                                                                                     | Có                | Có nhưng gộp                   | Gộp so sánh/sắp xếp                          | Thu hẹp thành so sánh hai số             |
| Số và phép tính | Sắp xếp số                 | `order-natural-numbers`                                                                               | Có                | Thiếu                          | Chưa luyện độc lập                           | Thêm type                                |
| Số và phép tính | Làm tròn                   | `round-numbers`                                                                                       | Có                | Có                             | Cần đa dạng hàng làm tròn                    | Giữ, mở rộng generator                   |
| Số và phép tính | Phép cộng                  | `mental-addition`, `column-addition`, `unknown-addend`                                                | Có                | Có                             | Chỉ 5 biến thể/type                          | Giữ, thêm template/oracle                |
| Số và phép tính | Phép trừ                   | `mental-subtraction`, `column-subtraction`, `unknown-subtraction-part`                                | Có                | Có                             | Type thành phần chưa biết cần nói rõ vai trò | Giữ, template nêu số bị trừ/số trừ       |
| Số và phép tính | Phép nhân                  | `multiplication-facts`, `multiply-one-digit`, `multiply-two-digits`, `equal-groups`, `missing-factor` | Có                | Thiếu tìm thừa số              | Coverage chưa đủ thao tác ngược              | Thêm `missing-factor`                    |
| Số và phép tính | Phép chia                  | `division-facts`, `divide-one-digit`, `divide-two-digits`, `division-remainder`, `sharing-equally`    | Có                | Thiếu chia hai chữ số          | Coverage chưa đủ                             | Thêm `divide-two-digits`; kiểm tra số dư |
| Số và phép tính | Biểu thức                  | `operation-order`, `parentheses-expression`                                                           | Có                | Có                             | Format matching cũ có thể đổi nhiệm vụ       | Giữ nhiệm vụ nhất quán                   |
| Phân số         | Nhận biết từ hình          | `identify-fraction`                                                                                   | Có                | Có                             | Visual từng lỗi hình học                     | Giữ; oracle visual bắt buộc              |
| Phân số         | Tử/mẫu                     | `read-write-fraction`                                                                                 | Có                | Có nhưng đặt tên rộng          | Không thực sự luyện đọc/viết                 | Thu hẹp thành tử số/mẫu số               |
| Phân số         | Đọc/viết                   | `read-fractions`, `write-fractions`                                                                   | Có                | Thiếu                          | Chưa luyện riêng                             | Thêm hai type                            |
| Phân số         | Bằng nhau/rút gọn/quy đồng | `equivalent-fractions`, `reduce-fractions`, `common-denominator`                                      | Có                | Thiếu 2 type                   | Coverage chưa đủ                             | Bổ sung oracle ƯCLN/BCNN                 |
| Phân số         | So sánh                    | `compare-fractions`                                                                                   | Có                | Có                             | Chỉ cùng mẫu                                 | Mở rộng cùng tử/quy đồng phù hợp         |
| Phân số         | Bốn phép tính              | `add-fractions`, `subtract-fractions`, `multiply-fractions`, `divide-fractions`                       | Có                | Thiếu                          | Bank v1 bỏ trống                             | Thêm; kết quả từ oracle phân số          |
| Phân số         | Phân số của một số         | `fraction-of-quantity`                                                                                | Có                | Thiếu                          | Chưa có vận dụng                             | Thêm; bảo đảm kết quả nguyên khi cần     |
| Đo lường        | Độ dài/khối lượng          | `length-conversion`, `mass-conversion`, `compare-measurements`                                        | Có                | Có                             | Thiếu dải đơn vị và compound values          | Giữ, mở rộng có kiểm soát                |
| Đo lường        | Diện tích                  | `area-conversion`                                                                                     | Có                | Thiếu                          | Chưa có đổi đơn vị diện tích                 | Thêm, dùng hệ số bình phương đúng        |
| Đo lường        | Đồng hồ/thời lượng         | `read-clock`, `calculate-duration`, `time-conversion`                                                 | Có                | Thiếu đổi đơn vị               | Cần xử lý qua ngày hợp lệ                    | Thêm type, dùng phút làm oracle          |
| Đo lường        | Tiền Việt Nam              | `money-change`, `count-money`                                                                         | Có                | Gộp                            | Tính tổng và tiền thừa là hai nhiệm vụ       | Giữ tiền thừa, thêm tổng tiền            |
| Hình học        | Hình phẳng                 | `recognize-shapes`, `recognize-parallelogram-rhombus`                                                 | Có                | Thiếu hình bình hành/hình thoi | Coverage chưa đủ                             | Thêm type                                |
| Hình học        | Góc                        | `classify-angles`                                                                                     | Có                | Có                             | Visual góc cần phản ánh đúng số đo           | Giữ, chỉ dùng geometry hợp lệ            |
| Hình học        | Song song/vuông góc        | `parallel-perpendicular`, `perpendicular-lines`                                                       | Có                | Gộp                            | Hai quan hệ khác nhau                        | Thu hẹp type cũ và thêm type vuông góc   |
| Hình học        | Chu vi/diện tích chữ nhật  | `rectangle-perimeter`, `rectangle-area`, `geometry-word-problem`                                      | Có                | Có                             | Type thực tế cần giữ một mục tiêu            | Giữ; visual cùng kích thước dữ liệu      |
| Hình học        | Chu vi/diện tích vuông     | `square-perimeter`, `square-area`                                                                     | Có                | Thiếu                          | Chưa luyện riêng                             | Thêm hai type                            |
| Bài toán        | Hai bước                   | `two-step-problem`                                                                                    | Có                | Có nhưng rộng                  | Tên không nói cấu trúc                       | Thu hẹp thành hai bước cộng/trừ          |
| Bài toán        | Trung bình cộng            | `average-problem`                                                                                     | Có                | Có                             | Cần tổng chia hết số nhóm                    | Giữ, oracle kiểm chia hết                |
| Bài toán        | Tổng và hiệu               | `sum-difference-problem`                                                                              | Có                | Thiếu                          | Nội dung trọng tâm                           | Thêm type; tổng/hiệu cùng tính chẵn lẻ   |
| Bài toán        | Rút về đơn vị              | `unit-rate-problem`                                                                                   | Có                | Thiếu                          | Nội dung trọng tâm                           | Thêm type; dữ liệu chia hết              |
| Thống kê        | Biểu đồ cột                | `read-bar-chart`, `compare-chart-data`                                                                | Có                | Chỉ tổng                       | Thiếu so sánh/chênh lệch                     | Giữ type đọc, thêm type so sánh          |
| Thống kê        | Bảng số liệu               | `read-data-table`                                                                                     | Có                | Thiếu                          | Chưa có                                      | Thêm type                                |
| Logic           | Quy luật số                | `number-pattern`                                                                                      | Có ở mức vận dụng | Có                             | Không được vượt sang dãy đại số              | Giữ quy luật cộng/nhân đơn giản          |

## Nội dung không đưa vào bank v2

- Số âm, số hữu tỉ ký hiệu đại số, phương trình nhiều ẩn.
- Tỉ số phần trăm và số thập phân nếu nhiệm vụ vượt chuẩn lớp 4.
- Chứng minh hình học suy diễn, tọa độ, lượng giác.
- Xác suất tính bằng phân số phức tạp; chỉ dùng nhận định trực quan nếu bổ sung ở phiên bản sau và có curriculum mapping rõ.
- Bài toán có dữ liệu thiếu, thừa gây nhiều cách hiểu, hoặc bối cảnh không tự nhiên với học sinh.

## Audit 200 câu v1

Bank v1 được xem là dữ liệu đầu vào chưa đáng tin cậy, không được grandfather. Các lỗi kiến trúc đã xác định:

- chỉ có 5 biến thể/type;
- format wrapper có thể làm thay đổi nhiệm vụ gốc (đặc biệt ordering/matching);
- `REVIEWED` được gán tự động;
- distractor số học được tạo theo phần trăm nên có thể không phản ánh lỗi sai thật;
- hint cấp 1 và 3 dùng chung cho mọi câu;
- một số visual trang trí không trực tiếp phục vụ câu hỏi;
- ID dựa vào chỉ số variant, không dựa vào tham số;
- không có template ID, fingerprint hoặc content version.

Vì vậy v2 được tái sinh từ generator đã kiểm định. Không sao chép nguyên trạng 200 câu cũ vào JSON canonical.
