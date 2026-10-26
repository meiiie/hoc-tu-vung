# Nội dung tiếng Anh – tiếng Việt

Snapshot 2026-10-26: danh mục tham chiếu Oxford 5000, phần tiếng Anh của Wiktionary tiếng Việt và phần biên tập của dự án. Xem [nguồn hiển thị cho người học](../CONTENT_SOURCES.html).

- `sources/oxford-20261026.json`: 5.975 cặp mục từ/từ loại; 4.960 cách viết phân biệt hoa/thường. Không chứa định nghĩa hoặc audio của Oxford.
- `sources/viwiktionary-20261002.jsonl`: chỉ `lang_code=en`; giữ nguyên nội dung các trường được chiếu từ dump. Không sửa nguồn để che lỗi; dùng override có thể kiểm toán.
- `legacy-p1.json`: 252 thẻ trước khi mở rộng. ID không được đổi.
- `ids.json`: sổ ID bền vững. Không tạo lại bằng cách đánh số theo thứ tự sắp xếp mới.
- `curated/*.tsv`: nghĩa chính và ví dụ song ngữ do AI biên tập.
- `primary.tsv`, `examples.tsv`: sửa riêng từng trường; không đánh dấu toàn bộ thẻ là đã duyệt chỉ vì một trường thay đổi.
- `overrides.json`: loại các nghĩa nguồn lỗi đã xác định, quy tắc biến hình và mẹo ngữ pháp đã sửa.
- `audio-manifest.json`: văn bản, voice/version, SHA-256, kích thước và kết quả giải mã của từng tệp được dùng.
- `sources/voices.json`: checksum model/config và người nói. Model được lưu ngoài Git.

Nội dung biên tập mới và dữ liệu từ điển chuyển thể: **CC BY-SA 4.0**, ghi công cộng đồng Wiktionary tiếng Việt và nhóm dự án Học Từ Vựng; liên kết giấy phép https://creativecommons.org/licenses/by-sa/4.0/. Giữ nguồn/ghi công khi phân phối lại. Metadata Oxford, audio cũ, công cụ và mô hình có điều kiện riêng; không gộp thành một giấy phép MIT cho mọi tài sản.

Chưa có chứng nhận duyệt chuyên gia cho toàn bộ bản dịch/audio. `contentReview` phân biệt nghĩa chính, ví dụ, nghĩa nhập bổ sung; `humanReviewed` luôn false ở bản này. Không dùng độ phủ 100% để suy ra độ chính xác ngôn ngữ 100%.

Đợt bổ sung PDF: `sources/oxford3000-pdf-additions-20261026.json` chứa 11 dòng
tham chiếu cho 10 dạng từ của PDF người dùng gửi. Không sửa snapshot web.
`sources/viwiktionary-pdf-additions-20261002.jsonl` chiếu thêm 15 bản ghi từ
cùng dump đã khóa checksum. `curated/pdf-additions.tsv` chứa nghĩa chính và
ví dụ mới, được đối chiếu với từ điển nhưng không sao chép ví dụ thương mại.
CEFR dùng PDF; Cambridge chỉ dùng để kiểm tra nghĩa, cách dùng và phát âm.
`learning-order-v2.json` giữ 4.961 tần suất cũ và thêm 10 mục dùng wordfreq 3.1.1.
