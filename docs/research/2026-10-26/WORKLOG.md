# Nhật ký nghiên cứu phương án dữ liệu 5.000 từ

Ngày chốt tìm kiếm: 2026-10-26. Trạng thái: hoàn tất nghiên cứu và đề xuất; chưa triển khai kiến trúc đề xuất.

Phạm vi: thiết kế quy trình biên soạn, kiểm định, phát hành và lưu tiến độ cho hoc-tu-vung. Nền đối chiếu là commit `8953b394657555ee07dd5bb32f30823829330032` và `docs/PROJECT_AUDIT_5000.md`. Không nhập thêm từ hoặc thay đổi ứng dụng trong bước nghiên cứu.

Áp dụng bản Pstack/Poteto cài tại `C:/Users/Admin/.claude/skills/poteto-mode/SKILL.md`, bản port từ cursor/plugins, phiên bản 0.15.9. Không tìm thấy plugin Pstack riêng trong danh mục plugin Codex đang kết nối. Quy tắc trực tiếp của người dùng về tự thực hiện có ưu tiên: không dùng subagent, không chuyển việc sang chat khác; việc đối chiếu kết quả do chính tác nhân hiện tại thực hiện.

## Investigation playbook

Các bước dưới đây chép nguyên văn từ playbook đã đọc; trạng thái được cập nhật khi hoàn tất:

- [x] Route through the **how** skill. For motivation questions, also route through the **why** skill.
- [x] Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only investigation`.
- [x] Produce the `how`-shaped output (Overview / Key Concepts / How It Works / Where Things Live / Gotchas), or a recommendation with a tradeoffs table if the request is a decision between alternatives.
- [x] Apply the **unslop** skill to the reply.

throughput checkpoint: n/a, read-only investigation

Đây là điều tra để chọn phương án kỹ thuật, không phải điều tra động cơ một thay đổi lịch sử; nhánh `why` không áp dụng. Đọc `how`, `show-me-your-work`, `technical-writing`, `unslop` và các nguyên tắc liên quan trước khi viết đề xuất. Nhật ký quyết định ở `decisions.tsv` ghi lựa chọn và bằng chứng, không ghi suy luận nội bộ.

## Kiểm tra kết quả cần làm

- [x] Mỗi kết luận nghiên cứu có nguồn gốc, ngày và giới hạn áp dụng.
- [x] Phân biệt kết quả nghiên cứu, hiện trạng đo được và lựa chọn thiết kế của dự án.
- [x] Phân biệt bộ từ, nghĩa, bài tập và thẻ ôn; có chính sách giữ nguyên định danh cũ.
- [x] Có phương án migration, thử lỗi giữa chừng, khôi phục và rollback nội dung.
- [x] Có tiêu chí dừng nhập dữ liệu khi chất lượng hoặc quyền sử dụng chưa rõ.
- [x] Đối chiếu lại các đường dẫn mã nguồn được viện dẫn và xác nhận chưa thay đổi mã/dữ liệu học.

## Kết quả tự kiểm tra

Đầu ra chính: `docs/VOCABULARY_PRODUCTION_BLUEPRINT.md` (268 dòng ở lần kiểm tra), cùng `SOURCES.md` và `decisions.tsv`. Không có reviewer độc lập, không có subagent.

Kiểm tra một lần bằng Python đọc file thực tế đã qua: các liên kết tài liệu cục bộ tồn tại; UTF-8 không có ký tự thay thế; ví dụ JSON cloze parse được và span trỏ đúng `became`; mọi dòng nhật ký có sáu cột. Dữ liệu vẫn có 252 ID duy nhất và SHA-256 `e342bf10451e9735e0a09c924df7f0173800eee8b59aa2a1a99efe217ec28755` trùng baseline. `git diff HEAD --name-only` rỗng: mã và dữ liệu tracked không thay đổi.

Tự đối chiếu nguồn làm rõ hai điểm trong thiết kế: CacheStorage/IndexedDB không có transaction chung; tab v17 chưa cập nhật không tự hiểu cơ chế chặn ghi mới. Vì thế blueprint yêu cầu staging/khôi phục và kiểm tra các client trước migration. Nguồn giáo dục 2026 chưa đọc toàn văn được đánh dấu thay vì suy diễn thêm kết quả.

Không chạy lại test ứng dụng chỉ vì bổ sung tài liệu. Các kiểm thử migration, release và pipeline trong blueprint là điều kiện cho triển khai sau, chưa được báo là đã qua.


## Triển khai tiếp theo yêu cầu bổ sung dữ liệu

Các xác nhận “chưa thay đổi mã/dữ liệu” ở trên mô tả giai đoạn nghiên cứu trước triển khai. Bộ dữ liệu và ứng dụng đã được cập nhật theo yêu cầu tiếp theo của người dùng; báo cáo hoàn tất, nguồn, số đo và giới hạn nằm tại `../../CONTENT_RELEASE_2026-10-26.md`. Không dùng subagent.
