> Cập nhật nội dung v23: 4.971 mục, vẫn 199 nhóm, nhóm cuối 21 mục.
> Mười mục được thêm ở cuối, không đổi thành viên của các nhóm trước.
> Xem [bổ sung từ PDF](PDF_ADDITIONS.md). Các quyết định lịch ôn v22 bên dưới giữ nguyên.

# Nhóm ngày học và lịch ôn v22

Yêu cầu người dùng ngày 26-10-2026: Ngày 1, Ngày 2 là tên nhóm tối đa 25 mục.
Học hết nhóm này có thể chọn nhóm khác và học ngay trong cùng ngày thực tế.
Không chia theo CEFR. Khôi phục thanh ngày và Chọn bộ từ của bản gốc v17.

## Thiết kế và phạm vi

Đã đọc app.js tại HEAD 8953b39, docs/LAYOUT.md và docs/LIFECYCLE.md.
Bản gốc có 252 mục: 9 nhóm 25 và nhóm 10 có 27. Bản này chia đúng tối đa 25:
250 ID đầu giữ nhóm cũ, p1-251 và p1-252 chuyển sang nhóm 11, không đổi ID
hay lịch sử. Với 4.961 mục có 199 nhóm, nhóm cuối 11; với 5.000 là 200 nhóm.

Hai phương án đã xét trực tiếp, không subagent theo yêu cầu người dùng:
1. Giữ hạn mức 25 toàn thư viện trong ngày thực tế. Không phù hợp câu trả lời
   của người dùng vì chọn nhóm khác vẫn không học được ngay.
2. Mỗi nhóm có hạn mức riêng theo ngày thực tế. Chọn phương án này.

Dữ liệu nhóm được suy ra một lần khi tải từ ID bền vững p1-001, p1-002,
p2-001... theo thứ tự số, chia 25. Không phụ thuộc CEFR, gắn sao, tần suất,
ngẫu nhiên, thứ tự trả về của mạng hoặc số từ đã học. Content allocator chỉ
cấp ID mới ở cuối; thêm mục mới tự tăng số nhóm, không chuyển nhóm cũ.

LearningPlan.groups(ids) trả [{id,number,wordIds}]. F().day chọn nhóm hoặc
rỗng cho tất cả. deck() áp dụng nhóm và bộ lọc. Hàng đợi lấy từ mới và chiều
mới trong deck(), nhưng vẫn gom thẻ đang học/đến hạn trên toàn thư viện.
Đây là lựa chọn của ứng dụng để không bỏ ôn khi đổi nhóm, không mô phỏng
nguyên xi phạm vi deck của Anki.

studyDay.words/directions giữ ID thật đã giới thiệu trong ngày học. usage
lọc theo toàn bộ thành viên nhóm, không theo bộ lọc CEFR/gắn sao hiện tại.
Do đó đổi bộ lọc, quay lại nhóm hoặc tải lại không xóa số đã dùng. Chọn nhóm
khác dùng hạn mức của nhóm đó. Tất cả dùng hạn mức chung, như học bộ cha.
Mỗi nhóm mặc định 25; có thể giảm 5/10 hoặc đặt 0. Chiều thẻ mới tính riêng,
không tăng số từ. Không cộng dồn ngày nghỉ; mốc ngày học vẫn 04:00.

Di trú 10→11 giữ SRS, introductions, studyDay, ghi chú, lịch sử và bộ lọc khác;
khôi phục lựa chọn ngày cũ nếu có. Goal 50/all về 25, 0 và mục tiêu nhỏ do
người học chọn được giữ. Mức 10 tự chuyển từ all ở v9 được trả về 25.
UI giữ một hàng ngày, Chọn bộ từ mở danh sách chọn có đủ 199 nhóm. Không
thêm thẻ lộ trình, giải thích dài hoặc lời hứa thành thạo sau 199 ngày.

## Tài liệu Anki chính thức đã đọc

- https://docs.ankiweb.net/manual/deck-options — giới hạn theo deck, bộ cha,
  New cards/day, không cộng dồn ngày nghỉ, FSRS và thẻ cùng note.
- https://docs.ankiweb.net/manual/studying — New/Learning/Review, bốn nút tự
  đánh giá, thời gian ôn theo thẻ, bury siblings.
- https://docs.ankiweb.net/manual/filtered-decks — Custom Study tăng giới hạn
  hoặc chọn nội dung chủ động; chọn thêm không đồng nghĩa xóa lịch ôn.

25 là giới hạn sản phẩm theo yêu cầu người dùng, không phải quy định cố định
hay liều học tối ưu được Anki xác nhận. 199 là số nhóm từ, không phải thời gian
để ghi nhớ bền vững; ôn vẫn tiếp tục theo phản hồi từng thẻ.

## Điểm kiểm chứng

- Nhóm đầy đủ, không trùng; thêm 39 mục thành 200 nhóm; tăng thêm vẫn tự chia.
- Học hết 25 nhóm 1, chọn nhóm 2 được học tiếp ngay; quay lại không lặp từ mới.
- Lịch ôn, hoàn tác, mốc 04:00, thẻ đảo, lọc bộ và offline giữ đúng trạng thái.
- Kiểm tra điện thoại/máy tính và nâng cấp tab thật, giữ nguyên tiến độ.

## Kết quả kiểm chứng

- 29 kiểm thử Node đạt, gồm 26 về hàng đợi/nhóm/di trú và 3 client nội dung.
- 23 kiểm thử SRS đạt; srs.js không thay đổi trong lần sửa này.
- Hai bộ hành trình Chromium đạt, không lỗi JavaScript:
  [nhóm ngày](audits/study-days-browser.json),
  [nội dung, audio và lưu trữ](audits/content-browser-2026-10-26.json).
- Ca thật: 25 mục mới ở nhóm 2 rồi 2 mục ở nhóm 3 ngay cùng ngày, hoàn tác,
  quay lại và tải lại vẫn giữ 27 mục đã giới thiệu và lịch ôn cũ.
- Nhóm cuối, bộ lọc, hạn mức nhỏ hơn, tạm dừng từ mới, ôn toàn thư viện,
  giữ log 20.000 lượt và offline đã được kiểm tra.
- Hồ sơ mới cũng đi qua onboarding: mặc định 25, chọn nhóm 199 có 11 mục.

pstack Model the Domain được áp dụng bằng nhóm ID và phép đếm theo thành viên
nhóm trong sổ lượt học sẵn có, không thêm bộ đếm song song. Prove It Works
được áp dụng bằng thao tác trình duyệt thật trong hồ sơ kiểm thử riêng và
kiểm tra trực tiếp tab người dùng. Không dùng subagent.

Đã áp dụng service worker v22 trong tab người dùng. Trang chủ hiển thị lại
Ngày 1 / 25 mục và thanh chọn ngày; giữ 9/100 câu, chuỗi 1 ngày và nút tiếp
tục phiên trước. Không trả lời thử thẻ hoặc xóa tiến độ trên hồ sơ thật.
[Ảnh xác nhận](audits/learner-home-v22.png).
