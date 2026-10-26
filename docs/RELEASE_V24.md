# v24: thư viện Oxford và nhóm học 25 từ

Bản phát hành ngày 26-10-2026 mở rộng 252 mục cũ thành 4.971 mục học,
tương ứng 4.970 dạng từ tham chiếu. Có 23.694 mục nghĩa Việt, ví dụ hoặc
cụm từ song ngữ cho mỗi mục và 19.852 tệp audio UK/US.

## Người học nhận được gì

- 199 nhóm Ngày, mỗi nhóm tối đa 25 từ; nhóm cuối 21 từ. Chọn nhóm khác
  để học tiếp ngay trong cùng ngày thực tế. CEFR là nhãn và bộ lọc tùy chọn.
- Từ mới lấy trong nhóm đã chọn. FSRS/SM-2 lấy thẻ đến hạn từ toàn thư viện,
  giữ lịch sử từng từ, giới hạn từng nhóm và tránh hai chiều trong cùng ngày.
- Có đủ 10 mục bổ sung từ PDF: blank, CD, chairman, disc, DVD, gentleman,
  policeman, sculpture, stiff, tape. Xem [đối chiếu nguồn](PDF_ADDITIONS.md).
- Tiến độ chuyển từ localStorage sang IndexedDB, giữ ID, ghi chú và lịch ôn.
  Audio tải theo nhóm và giọng, tiếp tục được sau lỗi mạng, dùng được offline.

## Phát hành và giới hạn

Service worker dùng `htv-v24`; schema tiến độ giữ ở 11. Website tĩnh được
GitHub Pages triển khai từ `main`. Tệp `.nojekyll` giữ nguyên các tài nguyên
tĩnh. Quy trình Content integrity kiểm tra bản PR trước merge và bản main.

Nội dung và audio mới có nguồn, checksum và trạng thái biên tập. Audio mới
là giọng tổng hợp. Chưa có chuyên gia ngôn ngữ duyệt toàn bộ nghĩa và audio.
Đối chiếu PDF kiểm tra dạng chữ, không chứng minh bao phủ mọi nghĩa của từ.

## Kiểm chứng

Đã chạy đạt 80 kiểm thử: 29 về nội dung/lịch học, 23 FSRS/SM-2,
9 phát âm, 11 compiler, 4 thứ tự học và 4 đối chiếu Oxford.
Hai hành trình Chromium về lịch học, nội dung, sao lưu lớn và offline
đều đạt với cache `htv-v24`, không có lỗi JavaScript. Xem
[báo cáo nhóm Ngày](audits/study-days-browser.json),
[báo cáo nội dung](audits/content-browser-2026-10-26.json) và
[giải mã audio](audits/audio-2026-10-26.json).

Áp dụng pstack Prove It Works bằng cách kiểm tra bản xuất dữ liệu và website
thực tế. Toàn bộ việc kiểm tra do cùng người thực hiện thay đổi tự tiến hành,
theo yêu cầu không dùng subagent; không có đánh giá độc lập của người thứ hai.
