# Báo cáo audit nền tảng nội dung trước khi mở rộng bank

Đây là audit lịch sử trước V3. Quy tắc 100 câu/type đã được hợp đồng V3 thay thế bằng 30–50 câu/selectable leaf; nhãn `REVIEWED` của 200 câu V1 không được dùng làm bằng chứng chất lượng hiện hành.

## Hiện trạng v1

| Hạng mục               | Hiện trạng                                                                           | Mức độ              | Quyết định v2                                               |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------- | ----------------------------------------------------------- |
| Curriculum hierarchy   | 7 domain, 14 topic, 40 skill/type                                                    | Cần sửa             | Giữ domain/topic để tương thích; khóa lại 64 type sau audit |
| Số lượng               | 5 câu/type, 200 câu                                                                  | Không đạt           | 100 câu hợp lệ/type                                         |
| Template               | Một switch lớn, `variant` 0–4                                                        | Không đạt           | Registry theo family và task, 5 template/type               |
| ID                     | `problemType + array index`                                                          | Không đạt           | Hash ổn định từ type/template/params                        |
| Fingerprint            | Không có                                                                             | Không đạt           | SHA-256 trên cấu trúc canonical                             |
| Answer oracle          | Có phép tính cục bộ nhưng wrapper có thể đổi nhiệm vụ                                | Rủi ro              | Oracle từ shared params; property tests                     |
| Place value            | Validator đã nhận biết chữ số lặp mơ hồ                                              | Một phần đạt        | Giữ gate; generator luôn nêu hàng/vị trí                    |
| Fraction visual        | Structured data và sector renderer đã được sửa                                       | Một phần đạt        | Audit JSON và geometry invariant bắt buộc                   |
| Geometry visual        | Một số hình chỉ mang tính minh họa, square diagram có nguy cơ bị kéo thành rectangle | Không đạt           | Geometry data/renderer phải bảo toàn tính chất              |
| Multiple choice        | Distractor số học theo phần trăm; chưa loại phân số tương đương                      | Không đạt           | Unique/equivalence collision gate                           |
| True/false             | Sinh từ wrapper chung                                                                | Cần sửa             | Mệnh đề sai gần lỗi thực, cân bằng truth values             |
| Hints                  | Cấp 1 và 3 dùng chung cho hầu hết câu                                                | Không đạt           | Ba hint từ generator, gắn dữ kiện/chiến lược                |
| Explanation            | Nhiều câu chỉ nêu thủ tục/kết quả                                                    | Cần sửa             | Bắt buộc có quan hệ/phép tính giải thích vì sao             |
| Units                  | Có trong text nhưng contract answer chưa nhất quán                                   | Cần sửa             | Oracle gắn unit, audit compatibility                        |
| Random selection       | Lấy tuần tự theo index                                                               | Không đạt           | Exclude recent → balance → Fisher–Yates                     |
| Recent history         | Không có                                                                             | Không đạt           | Local device history tối thiểu, giới hạn 100/type           |
| Session version        | Không có                                                                             | Không đạt           | `contentVersion = grade4-v2`                                |
| Session answer source  | Tra lại global bank khi submit                                                       | Rủi ro              | Chấm trên immutable question snapshot                       |
| Materialized bank      | Không có                                                                             | Không đạt           | 64 JSON shard + manifest                                    |
| Runtime bank ownership | API                                                                                  | Đạt hướng kiến trúc | Chỉ API nạp full bank; React nhận session subset            |
| Audit tooling          | Chỉ validate/stats cơ bản                                                            | Không đạt           | Thêm build, duplicates, audit, review-export                |
| Human review           | Không có số liệu chứng minh                                                          | Không đạt           | 15 mẫu/type và worksheet có từng ID                         |

## Lỗi cụ thể đã biết

1. Câu giá trị chữ số có thể mơ hồ nếu chữ số lặp mà không nêu hàng.
2. Visual phân số cũ từng không biểu diễn đúng 1/6; visual và expected answer phải cùng nguồn tham số.
3. `formatFor` v1 có thể biến một type thành bài ordering/matching không còn cùng nhiệm vụ.
4. Multiple-select v1 tạo hai nhãn biểu diễn cùng một kết quả, không phải hai mệnh đề toán học độc lập.
5. Dữ liệu chỉ có năm phần tử khiến nhiều generator fallback lặp lại phần tử đầu nếu tăng variant ngây thơ.
6. `status: REVIEWED` được gán bằng code, không có log kiểm duyệt theo ID.
7. Session v1 lấy `group[variant]`, vì vậy hai phiên cùng lựa chọn nhận cùng thứ tự câu.

## Cổng trước bulk generation

- [x] Benchmark công khai và quyết định áp dụng.
- [x] Curriculum/taxonomy audit.
- [x] Không grandfather 200 câu v1.
- [x] Thiết kế ID/fingerprint và JSON shards.
- [x] Thiết kế oracle/property tests và audit categories.
- [ ] Chạy generator test đỏ/xanh trên toàn taxonomy.
- [ ] Sửa mọi duplicate student-visible và mọi oracle/visual failure.
- [ ] Materialize canonical bank chỉ sau khi các mục trên đạt.

Các mục chưa đánh dấu không được mô tả là đã hoàn tất.
