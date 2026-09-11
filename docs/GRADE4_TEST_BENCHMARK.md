# Benchmark bài kiểm tra Toán lớp 4

Ngày rà soát: 11/09/2026. Tài liệu này ghi lại căn cứ thiết kế, không sao chép câu hỏi từ nguồn ngoài.

## Nguồn chính thức

- [Thông tư 27/2020/TT-BGDĐT](https://vanban.chinhphu.vn/default.aspx?docid=201006&pageid=27160) áp dụng cho lớp 4 từ năm học 2023–2024. Điều 7 quy định lớp 4 có đánh giá định kỳ giữa học kỳ I, cuối học kỳ I, giữa học kỳ II và cuối năm; đề bám yêu cầu cần đạt, có Mức 1, 2, 3; bài được chấm theo thang 10 và không cho điểm thập phân.
- [Chương trình giáo dục phổ thông tổng thể](https://moet.gov.vn/content/vanban/Lists/VBPQ/Attachments/1483/vbhn-chuong-trinh-tong-the.pdf) xác định Toán là môn cốt lõi, phát triển tư duy, mô hình hóa, giải quyết vấn đề, giao tiếp và sử dụng công cụ; nội dung xoay quanh Số/Đại số, Hình học/Đo lường, Thống kê/Xác suất.
- [Chương trình môn Toán CTGDPT 2018](https://moet.gov.vn/content/vanban/Lists/VBDT/Attachments/1559/2.%20Ch%C6%B0%C6%A1ng%20tr%C3%ACnh%20m%C3%B4n%20To%C3%A1n.pdf) là căn cứ cho taxonomy và phạm vi yêu cầu cần đạt lớp 4.

## Mẫu và sản phẩm công khai dùng để đối chiếu

- [OLM: ma trận, đặc tả, đề và hướng dẫn chấm Toán 4](https://dgnl.olm.vn/tai-lieu/ma-tran-de-dac-ta-de-de-dap-an-huong-dan-cham.42b5703197c) cho thấy cách công khai ma trận nội dung, dạng câu và hướng dẫn chấm.
- [OLM Toán 4](https://olm.vn/bg/toan-4-29891?loai-xep-hang=1) tổ chức theo chủ đề, có luyện tập, phiếu ôn và đề giữa/cuối kỳ.
- [VioEdu](https://webm7.vio.edu.vn/) công khai luồng luyện tập, kiểm tra học kỳ và báo cáo điểm mạnh/yếu cho phụ huynh.
- [IXL Grade 4](https://www.ixl.com/math/grade-4/skills) là đối chiếu sản phẩm cho catalog kỹ năng nhỏ, luyện theo kỹ năng và tiến trình mastery; không dùng làm chuẩn chương trình Việt Nam.

## Quyết định triển khai

| Quyết định                                                           | Căn cứ                                                                                                                                               |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Có 5 blueprint: giữa kỳ I, cuối kỳ I, giữa kỳ II, cuối năm, tổng hợp | Bao phủ 4 mốc định kỳ của Thông tư 27 và thêm một chế độ tự đánh giá tổng hợp, không gắn số chương sách.                                             |
| Tách `assessmentLevel` khỏi `difficulty`                             | Mức 1–3 là mức yêu cầu nhận thức theo quy định; EASY/MEDIUM/HARD là độ khó luyện tập của sản phẩm.                                                   |
| Mỗi đề 20 câu, phân bố Mức 1/2/3 là 6/10/4                           | Đây là quyết định sản phẩm để tạo đề cân bằng, không tuyên bố là tỷ lệ bắt buộc của Bộ GDĐT.                                                         |
| Trộn 5 format, mỗi format 4 câu                                      | Kết hợp khách quan và câu cần nhập/trình bày; tránh đề chỉ có trắc nghiệm.                                                                           |
| Không đặt thời lượng                                                 | Không tìm thấy một thời lượng thống nhất, bắt buộc cho mọi đề Toán lớp 4 trong nguồn chính thức; ứng dụng hiển thị thời gian đã làm và không tự nộp. |
| Điểm nguyên trên thang 10                                            | Phù hợp Thông tư 27; server tính `round(rawPoints / possiblePoints * 10)`.                                                                           |
| Không hint, không đúng/sai tức thời                                  | Giữ tính chất đánh giá; đáp án và giải thích chỉ xuất hiện sau lần nộp cuối.                                                                         |
| Bộ đề lấy từ bank đã kiểm định và đóng băng theo attempt             | Giữ chất lượng nội dung, khả năng tái hiện và không đổi đề khi refresh.                                                                              |

Các tỷ lệ 20 câu và 6/10/4 là chính sách nội bộ có version, có thể thay đổi khi có ma trận chính thức cụ thể hơn. Không có câu hỏi, lời giải hay giao diện nguồn ngoài nào được sao chép.
