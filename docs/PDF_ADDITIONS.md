# Bổ sung 10 mục từ Oxford 3000 PDF, v23

Yêu cầu: nhập blank, CD, chairman, disc, DVD, gentleman, policeman, sculpture,
stiff, tape vào thư viện cùng nghĩa Việt, ví dụ, IPA và audio UK/US. Giữ cách
chia Ngày tối đa 25 từ, không khóa việc chọn nhóm theo CEFR. Tự thực hiện.

## Nguồn và biên tập

Danh mục, từ loại và CEFR lấy từ PDF người dùng cung cấp, SHA-256
`ddaf936ef29f5e67c2df0ab3b547fd5bf9d9631f900c3cf55c195cb9c5ad0b40`.
Mười headword tạo 11 dòng tham chiếu vì blank có tính từ và danh từ. Giữ
snapshot web nguyên trạng; phần bổ sung ở tệp riêng với số trang của PDF.

Nghĩa mở rộng chiếu thêm 15 bản ghi tiếng Anh từ cùng dump Wiktionary tiếng
Việt 02-10-2026 đã khóa checksum. CD không có bản ghi tiếng Anh trong phần
chiếu này nên nghĩa là nội dung dự án biên tập. Cả 10 nghĩa chính và ví dụ
song ngữ là nội dung biên tập mới; không sao chép ví dụ thương mại.

Đã đọc các mục từ tương ứng ở Cambridge Dictionary để đối chiếu nghĩa,
cách dùng, số nhiều và phát âm; không dùng nhãn Cambridge ghi đè nhãn PDF:
[blank](https://dictionary.cambridge.org/dictionary/english/blank),
[CD](https://dictionary.cambridge.org/dictionary/english/cd),
[chairman](https://dictionary.cambridge.org/dictionary/english/chairman),
[disc](https://dictionary.cambridge.org/dictionary/english/disc),
[DVD](https://dictionary.cambridge.org/dictionary/english/dvd),
[gentleman](https://dictionary.cambridge.org/dictionary/english/gentleman),
[policeman](https://dictionary.cambridge.org/dictionary/english/policeman),
[sculpture](https://dictionary.cambridge.org/dictionary/english/sculpture),
[stiff](https://dictionary.cambridge.org/dictionary/english/stiff),
[tape](https://dictionary.cambridge.org/dictionary/english/tape).

Các loại bỏ được lưu ở overrides.json, không sửa dữ liệu nguồn: DVD mang
nghĩa y khoa không thuộc nghĩa đĩa quang đang học; gentleman bị gán nhà vệ sinh;
stiff có lỗi dịch “Lực lượng” và lỗi “Cứng, nhắc”; nghĩa chairman chỉ nghề khiêng
kiệu/ghế không thuộc nội dung phổ thông; hai nghĩa blank rời ngữ cảnh ít dùng.
Không tuyên bố việc lọc này bao phủ mọi nghĩa từng xuất hiện trong lịch sử.

Phát âm dùng CMUdict/Britfone và G2P có ghi nguồn. CD và DVD giữ cách viết hoa,
đọc từng chữ cái. Phiên âm GB của sculpture được ghi đè có nguồn đối chiếu thành
/ˈskʌlptʃə/; cùng transcription dùng cho hiển thị và tham chiếu chấm nói.
Nội dung vẫn ghi `humanReviewed: false`.

## Kiến trúc và giữ tiến độ

Chọn hợp nhất các nguồn riêng trong compiler thay vì sửa snapshot web cũ.
ID mới p20-210…p20-219 được cấp ở cuối sổ ID. Sổ từ đã học và lịch FSRS dùng ID,
không phụ thuộc tổng số mục hoặc vị trí trong tệp. Tần suất wordfreq v2 giữ
4.961 giá trị cũ và thêm đúng 10 mục. Bộ nhóm Ngày vẫn dùng ID bền vững.

Tổng sau bổ sung: 4.971 mục học, 4.970 dạng từ, 23.694 mục nghĩa và 4.971 ví dụ
hoặc cụm từ song ngữ. Có 199 nhóm; 198 nhóm đủ 25 và nhóm cuối 21 mục.
Cả 3.000 dòng mục từ trong PDF ánh xạ được theo dạng chữ; không suy ra rằng
mọi nghĩa và mọi cách phát âm đều đã đầy đủ.

## Audio và kiểm chứng

Piper tạo thêm 20 MP3 mỗi giọng, tổng 40 tệp từ/câu ví dụ. Các model, speaker,
config giữ nguyên và được khóa checksum. Đã giải mã toàn bộ 19.852 tệp được
tham chiếu, không có tệp lỗi/trống, tổng 172.938.583 byte. Đây là kiểm tra kỹ
thuật của giọng tổng hợp, không phải xác nhận chuyên gia đã nghe duyệt từng tệp.

Đợt này dùng pstack Sequence Work into Verifiable Units: kiểm tra nguồn và bản
nháp trước; kiểm tra phát âm cũ không đổi; tạo và xác minh audio; xuất snapshot;
cuối cùng mới kiểm tra UI/offline và kích hoạt cập nhật. Không dùng subagent.

Kết quả xác minh sau khi xuất bản cục bộ:

- 57 kiểm thử tự động đạt: 29 JavaScript về nội dung/lịch học, 11 compiler,
  4 thứ tự học, 4 đối chiếu Oxford và 9 phát âm.
- Hai hành trình trình duyệt đạt; không có lỗi JavaScript. Kiểm tra cả 40
  audio mới giải mã được và dùng được offline, nhóm cuối 21 từ, đổi nhóm
  trong cùng ngày, lịch ôn đến hạn toàn thư viện và giữ tiến độ khi nạp lại.
- So sánh SHA-256 xác nhận 4.961 mục cũ, 19.812 audio cũ và mọi tham chiếu
  phát âm cũ của hai giọng không đổi. Xem
  [kiểm kê bổ sung](audits/pdf-additions-2026-10-26.json),
  [hành trình dữ liệu](audits/content-browser-2026-10-26.json) và
  [hành trình nhóm Ngày](audits/study-days-browser.json).
- Tab thực tế tại localhost đã hiển thị tổng 4.971 từ, Ngày 199 có 21 từ,
  đủ 10 tên mới trong danh sách. Điểm hôm nay vẫn là 9/100, streak 1 ngày;
  không chấm thẻ hoặc đặt lại tiến độ của người dùng. Đã mở chi tiết sculpture
  và lưu [ảnh kiểm chứng](audits/learner-pdf-additions-v23.png).

Lần chạy kiểm tra trình duyệt đầu hoàn thành các assertion nhưng lỗi khi
in tiếng Việt vào stdout Windows cp1252. Chạy lại với
`PYTHONIOENCODING=utf-8` đã kết thúc với mã 0. Chưa triển khai website công khai.
