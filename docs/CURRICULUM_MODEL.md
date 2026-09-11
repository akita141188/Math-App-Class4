# Curriculum model

## Cấu trúc

Grade → Domain → Topic → Skill → ProblemType → Question.

ID dùng slug ổn định. Mỗi question tham chiếu domain, topic, skill và problem type bằng ID; content validation kiểm tra toàn bộ quan hệ.

Skill có prerequisiteSkillIds và misconceptionCodes. Question có status và version để nội dung có thể đi qua DRAFT, REVIEWED, PUBLISHED, ARCHIVED mà không cần database.

## Mở rộng grade

API nhận grade ở route. Dữ liệu lớp 4 nằm trong catalog version-controlled. Khi thêm grade mới, tạo catalog riêng cùng contract; không đổi cấu trúc route, question hoặc practice session.

## Quyết định chuẩn hóa

Model giữ các thực thể học thuật riêng nhưng không tạo bảng liên kết hay repository phức tạp khi chưa có database. Problem type hiện ánh xạ một skill để authoring và báo cáo dễ kiểm tra.
