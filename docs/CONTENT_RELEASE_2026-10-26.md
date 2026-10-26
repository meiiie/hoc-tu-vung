> Cập nhật v23: đã bổ sung cả 10 dạng từ từng thiếu trong PDF; thư viện hiện có
> 4.971 mục. Các số liệu/chênh lệch cũ bên dưới là lịch sử trước đợt bổ sung.
> Xem [kết quả hiện tại](PDF_ADDITIONS.md).

# Bộ từ vựng Anh – Việt và audio, 26-10-2026

Đã triển khai cục bộ trên repository `meiiie/hoc-tu-vung`, mở rộng từ commit `8953b394657555ee07dd5bb32f30823829330032`. Chưa push hoặc triển khai lên website công khai. Toàn bộ công việc nghiên cứu, biên tập, lập trình và tự kiểm tra do một tác nhân thực hiện; không dùng subagent theo yêu cầu của người dùng.

## Độ phủ đã đo

| Hạng mục | Kết quả |
|---|---:|
| Cặp mục từ / từ loại trong snapshot Oxford | 5.975 |
| Mục từ tham chiếu, phân biệt May/may, March/march, IT/it | 4.960 |
| Thẻ giữ ID bền vững | 4.961 |
| Bộ dữ liệu | 20 |
| Thẻ có nghĩa chính, nghĩa mở rộng, ví dụ song ngữ, cloze, CEFR và phiên âm | 4.961 / 4.961 |
| Mục nghĩa Việt, gồm nghĩa nguồn và nghĩa chính đã biên tập | 23.646 |
| Nghĩa chính được AI biên tập | 2.253 |
| Ví dụ/cụm từ được AI biên tập | 1.962 |
| Tham chiếu audio: UK từ, UK ví dụ, US từ, US ví dụ | 19.844 / 19.844 |
| MP3 duy nhất, dùng chung khi văn bản và voice trùng nhau | 19.812 |
| Tổng dung lượng audio được tham chiếu | 172.486.579 byte (~164,5 MiB) |
| MP3 giải mã thành công | 19.812 / 19.812 |
| Tham chiếu âm vị US / UK | 4.961 / 4.961 mỗi giọng |
| Tham chiếu US / UK dùng G2P khi thiếu từ điển | 14 / 133 |

“Oxford 5000” là tên danh mục tham chiếu. Con số 4.960 được tính từ các nhãn mục từ trong snapshot thu ngày 26-10-2026, không từ số hàng từ loại. Giữ thẻ “a, an” gộp hai mục và hai cặp bank/bear của p1, nên có 4.961 thẻ. Bộ compiler kiểm tra bằng tập hợp để phát hiện bỏ sót danh mục, không chỉ kiểm tra tổng số dòng.

## Quyết định nội dung

Ưu tiên nguồn Anh–Việt trực tiếp, giữ từ loại và ngữ cảnh. Kaikki cung cấp bản trích xuất Wiktionary tiếng Việt ngày 02-10-2026; chỉ nhận `lang_code=en`. Bộ lọc ban đầu được phát hiện có thể trộn những từ đồng hình tiếng Việt, đã được thay bằng kiểm tra ngôn ngữ bắt buộc và kiểm thử hồi quy. WHO không nhập nhầm vào who; IT giữ riêng it. Nghĩa xuất bản được giới hạn theo từ loại trong danh mục, có ánh xạ khác biệt thuật ngữ ngữ pháp (ví dụ số từ được nguồn ghi dưới danh từ/tính từ). Bản nguồn đầy đủ vẫn được giữ để đối chiếu. Các lỗi OCR hoặc nghĩa sai đã nhận ra được loại qua override; không sửa âm thầm bản nguồn.

Biên tập nghĩa chính theo cách dùng phổ biến, ví dụ hoặc cụm từ tự nhiên; sửa các lỗi như ví dụ sai chính tả, nghĩa cổ được chọn làm nghĩa đầu, “table tennis” bị dịch thành bóng đá, “gift” bị dịch đảo nghĩa. Các trường nghĩa chính và ví dụ có trạng thái kiểm duyệt riêng. Phần nghĩa mở rộng vẫn ghi rõ nguồn nhập, không đánh dấu toàn bộ là đã duyệt.

Ví dụ chuối của p1 được thay để bỏ nhận định xuất khẩu không có nguồn. Mẹo `access` phân biệt danh từ `access to` và động từ `access something`. Cloze sử dụng vị trí của đúng từ/biến hình trong dữ liệu; không còn đoán bằng cắt gốc từ, có thể lấy nhầm beer cho be.

## Audio và nguồn phát âm

Piper 1.4.2 chạy tại máy, giọng UK VCTK medium/p225 và US LibriTTS-R medium/3922. Model, cấu hình, phiên bản, đầu vào và SHA-256 được ghi lại. URL audio mới phụ thuộc văn bản và voice/version; thay nội dung tạo URL mới để tránh cache phát câu cũ. Audio p1 không sửa được giữ nguyên; ví dụ mới của banana dùng URL mới.

Lượt thử Edge TTS gặp 403 nên chuyển sang pipeline offline. Các giọng thử không đạt hoặc có điều kiện NC không phù hợp cho bộ audio mới được loại. 1.095 tệp thử nghiệm/không còn được tham chiếu (10.313.302 byte) đã được xóa trong đúng thư mục audio/generated; không xóa tài sản đã xuất bản của p1.

Giải mã, độ dài, năng lượng tín hiệu và checksum kiểm tra toàn bộ MP3. Đây không phải kiểm định phát âm của chuyên gia. Từ đồng hình có nhiều cách phát âm theo nghĩa; một audio từ riêng lẻ không thể đại diện mọi cách đọc trong mọi ngữ cảnh. Hệ thống luyện nói giữ các biến thể từ CMUdict/Britfone và đánh dấu phần tự động.

## Tích hợp ứng dụng

- `content.js` quản lý URL audio hợp lệ, cloze và tải offline có thống kê lỗi/tiếp tục.
- `storage.js` lưu tiến độ trong IndexedDB và đọc dữ liệu localStorage cũ. Nhập bản sao lưu giữ bản trước nhập; chỉ đổi state đang học sau khi ghi thành công. ID và công thức FSRS không đổi.
- Danh sách hiển thị 100 từ mỗi lượt, tìm cả nghĩa mở rộng; Map tra ID thay cho quét toàn bộ khi xử lý sự kiện. Có bộ lọc C1 và xem nguồn từng nghĩa.
- Service worker v18 cài đủ shell và 20 bộ từ trước khi kích hoạt, giữ audio và cache mô hình; chỉ dọn cache phiên bản thuộc ứng dụng. Hỗ trợ Range cho audio offline.
- CI kiểm tra dữ liệu, checksum, giải mã, build, các test JS và Playwright; action được khóa bằng commit. Workflow mới chưa chạy trên GitHub, các lệnh tương ứng đã chạy cục bộ.

## Bằng chứng kiểm thử

- `tests/content_test.py`: 10 kiểm thử pipeline; giữ ID p1, đối chiếu toàn bộ danh mục, đúng ngôn ngữ, tách từ đồng hình, cloze, trường bắt buộc và định danh audio.
- `tests/content.test.js`: 3 kiểm thử; URL audio, cloze chính xác, tải lỗi và tiếp tục không tải lại file đã có.
- `tests/srs.test.js`: 23 kiểm thử, so sánh ts-fsrs 5.4.2; `tests/pron.test.js`: 9 kiểm thử chấm âm vị và inventory.
- `tests/content_browser_test.py`: Playwright 1.62.0 với Chromium trên mobile và desktop; schema 7→8 giữ ghi chú và số lần ôn, C1 1.314 thẻ, tra nghĩa/phân trang, các chế độ học, audio hai giọng, lưu/tải lại dữ liệu hơn 8 MB, nhập hơn 8 MB và lỗi ghi không thay state, offline đủ 20 bộ, Range 206/2 byte, giữ cache khác, không có lỗi JavaScript.
- Số liệu máy đọc được: `docs/audits/content-2026-10-26.json`, `audio-2026-10-26.json`, `pronunciations-2026-10-26.json`, `content-browser-2026-10-26.json`.

## Giới hạn và vận hành

Đã hoàn thành độ phủ của danh mục/snapshot đã chọn; chưa có cơ sở tuyên bố “mọi nghĩa tiếng Anh” hoặc chất lượng ngôn ngữ 100%. Phần từ điển còn cách dùng cũ/chuyên ngành; nên tổ chức kiểm duyệt giáo viên theo mức độ người học sử dụng, ghi lỗi và cập nhật từng trường. TTS có thể đọc không phù hợp một số từ đồng hình; kiểm tra giải mã không phát hiện được mọi lỗi đó.

Danh mục/CEFR Oxford có nguồn và quyền riêng, không được tự coi là giấy phép mở. Wiktionary và nội dung chuyển thể có nghĩa vụ CC BY-SA 4.0. ZIPA hiện hữu là CC BY-NC-SA 4.0. Model card TTS có lịch sử fine-tune từ Lessac; cần kiểm tra điều kiện phân phối theo mục đích triển khai. Các giới hạn này được công bố ở `CONTENT_SOURCES.html`.

Trước khi triển khai thật: giữ bản phát hành cũ và export tiến độ, đóng các tab phiên bản cũ khi chuyển đổi. Bản này chưa có cơ chế hợp nhất các thay đổi đồng thời từ nhiều tab/thiết bị, hoặc đồng bộ tài khoản. CacheStorage và IndexedDB không có transaction chung; service worker chỉ chịu trách nhiệm snapshot nội dung, tiến độ được ghi riêng. Rollback giao diện không được lấy bản localStorage cũ thay cho tiến độ IndexedDB mới; cần export/import khi chuyển phiên bản lưu trữ.

Không thay FSRS bằng một mô hình mới chỉ để gắn nhãn SOTA. Sự bền vững ở bản này đến từ nguồn khóa phiên bản, định danh ổn định, dữ liệu kiểm được, audio có checksum, kiểm tra lỗi và đường khôi phục tiến độ.

## Bổ sung đối chiếu nguồn và UX v21

Kiểm kê này áp dụng cho snapshot web đang đóng băng. PDF Oxford 3000 do người
dùng cung cấp có 10 dạng từ chưa có trong thư viện; xem
[đối chiếu nguồn](OXFORD_AND_LEARNER_UX.md). Không coi release là bản sao đầy
đủ của PDF đó. v21 bỏ chia bài CEFR, dùng gợi ý từ toàn thư viện và giữ lịch ôn
cá nhân. Audio và ID được giữ nguyên.
