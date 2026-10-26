# Thực hiện bộ từ vựng và audio đầy đủ

Yêu cầu ngày 26-10-2026: tiếp tục đến khi phủ danh mục, nghĩa Việt và audio; giữ tiến độ người học. Tự thực hiện, không dùng subagent. Đã triển khai; xem báo cáo thực tế tại CONTENT_RELEASE_2026-10-26.md.

## Kế hoạch

- [x] Ground: xác minh nguồn, quyền sử dụng, độ phủ và các luồng đọc dữ liệu/audio trong ứng dụng.
- [x] Sketch: chọn hợp đồng bản ghi và pipeline có thể chạy lại, lập mapping ID cũ.
- [x] Agree: tự quyết định các lựa chọn trong phạm vi ủy quyền; không yêu cầu xác nhận lại.
- [x] Implement: kiểm thử hành vi, nhập và chuẩn hóa nội dung, tạo audio, tích hợp và kiểm tra ứng dụng.
- [x] Scrap: đổi thiết kế nếu nguồn/mô hình không đáp ứng; ghi rõ bằng chứng.

## Throughput checkpoint

- **Blocking first steps.** Xác minh nguồn dữ liệu và nguồn âm thanh trước khi nhập/phân phối.
- **Independent workstreams.** Tìm nguồn từ điển và chuẩn bị TTS có thể chạy I/O song song; mọi quyết định và thay đổi mã do một tác nhân thực hiện.
- **Shared mutable state.** Nội dung nguồn tạm tách khỏi artifact xuất bản; ghi mỗi file qua file tạm và thay thế sau xác minh, không có hai bộ sinh cùng sửa một đầu ra.
- **Smallest safe decomposition.** Một người thực hiện theo yêu cầu trực tiếp; dùng công cụ xác định và job có resume cho nhiều nghìn bản ghi/audio, kiểm tra từng đơn vị trước khi mở rộng.

## Lựa chọn kiến trúc

| Phương án | Kết quả đánh giá |
|---|---|
| Gọi API từ điển/TTS khi học | Phụ thuộc mạng, giới hạn dịch vụ, nguồn thay đổi; không phù hợp mục tiêu offline hiện tại |
| Snapshot nguồn có giấy phép, compiler cục bộ và audio đã tạo | Chọn: có thể kiểm tra đủ từng ID, tái dựng, tiếp tục sau gián đoạn; giữ giao diện dữ liệu tương thích và thêm metadata/nghĩa có cấu trúc |

Hợp đồng dự kiến: mỗi mục giữ `id,w,ipa,pos,lv,cefr,vi,ex,exvi,col,tags`; bổ sung danh sách nghĩa có từ loại/nguồn, thông tin bản dịch và tài nguyên audio. Một nghĩa chưa được kiểm định không được ghi thành đã duyệt bởi người. Các mục thiếu trường phục vụ một chế độ phải được sửa hoặc báo rõ, không lấp bằng placeholder.

Đầu ra và số liệu thực tế nằm trong CONTENT_RELEASE_2026-10-26.md và docs/audits/. Không tự coi mọi nghĩa trong mọi từ điển là phạm vi hữu hạn có thể chứng minh đầy đủ; báo độ phủ theo danh mục và nguồn đã chọn.
