# Build nội dung

Python 3.13. Không cần backend, API trả phí hoặc khóa bí mật khi người học dùng ứng dụng. Model TTS chỉ phục vụ công đoạn build.

```powershell
py -3.13 -m venv .venv-content
.venv-content/Scripts/python.exe -m pip install -r tools/content/requirements.txt
.venv-content/Scripts/python.exe -m unittest discover -s tests -p content_test.py
.venv-content/Scripts/python.exe tools/content/build.py --draft
.venv-content/Scripts/python.exe tools/content/pronunciations.py
.venv-content/Scripts/python.exe tools/content/audio.py --models <model-directory> --voice gb
.venv-content/Scripts/python.exe tools/content/audio.py --models <model-directory> --voice us
.venv-content/Scripts/python.exe tools/content/verify_audio.py
.venv-content/Scripts/python.exe tools/content/build.py
node --test tests/content.test.js
```

Model directory cần `en_GB-vctk-medium.onnx[.json]` và `en_US-libritts_r-medium.onnx[.json]` từ kho `rhasspy/piper-voices`, với checksum trong `content/sources/voices.json`. Không thay model/config cùng version; đổi version ở `build.py` để tạo URL mới. Chạy từng voice một lần tại một thời điểm. Có thể chạy hai voice độc lập. Journal `.cache-content/audio-{voice}.jsonl` cho phép tiếp tục công việc bị gián đoạn; giữ cho đến khi lập manifest. Checkout đã có `content/audio-manifest.json` có thể tái sử dụng audio ngay cả khi không còn journal. Không ghi đè audio p1 cũ; thay nội dung sẽ tạo URL mới.

`build.py --draft` ghi bản nháp và lỗi vào `.cache-content/`. Chế độ xuất bản từ chối thiếu nghĩa, ví dụ, cloze, CEFR, audio, thông tin xác minh hoặc checksum không khớp. `verify_audio.py` giải mã mọi tệp MP3 được tham chiếu trước khi tạo manifest. Không dùng bản nháp trực tiếp trong ứng dụng.

Để chiếu lại nguồn Kaikki: `python tools/content/extract.py <vi-extract.jsonl.gz>`. Chỉ dùng dump 02-10-2026 có SHA-256 trong `docs/audits/source-extraction.json`. URL hiện hành của Kaikki có thể thay đổi nội dung; không ghi đè snapshot đã khóa bằng một dump mới dưới cùng tên phiên bản.

Compiler xác định nội dung và URL một cách ổn định. Mẫu TTS có nhiễu nên tái sinh cùng model có thể khác byte; bản audio đã xác minh và checksum trong manifest mới là artifact phát hành. Chạy lại với manifest/journal phải tái sử dụng file hiện có.

Khi cập nhật nội dung, tăng phiên bản service worker để cài đủ snapshot trước khi kích hoạt. Giữ audio phiên bản cũ trong đợt triển khai chuyển tiếp để các máy còn chạy ứng dụng cũ không mất âm thanh. Bản hiện tại chỉ loại file thử nghiệm mới không bao giờ được xuất bản.

Kiểm thử trình duyệt: `python tests/content_browser_test.py` (cần Playwright + Chromium); test tự mở HTTP server localhost và dùng hồ sơ trình duyệt tạm.
## Gợi ý từ mới và đối chiếu nguồn

`build.py` biên dịch `data/study-order.json` từ snapshot tần suất
`content/sources/learning-order-v2.json`. Nguồn v1 vẫn được giữ để đối chiếu;
compiler v2 chỉ dùng ID, dạng chữ, tần suất, bỏ qua trường CEFR của nguồn cũ.
Không chia bài hoặc đặt điều kiện hoàn thành cấp trước. Thiếu, trùng hoặc thêm
ID mà chưa cập nhật nguồn sẽ chặn build. Nguồn là wordfreq 3.1.1, có ghi công.

`audit_oxford.py` đối chiếu snapshot web, mục học và phép chiếu các headword
trong PDF người dùng cung cấp; không nhập định nghĩa của PDF. Bản phép chiếu
và SHA-256 của PDF được lưu để kiểm tra lại, không gộp hai phiên bản thành một.
Báo cáo giữ rõ cả những mục chưa khớp, thay vì làm tròn lên 5.000.

Kiểm tra: `python -m unittest discover -s tests -p study_order_test.py` và
`python -m unittest discover -s tests -p oxford_audit_test.py`.

Mục bổ sung từ PDF nằm ở nguồn riêng, được hợp nhất bằng `reference_rows()`.
Không ghi đè snapshot web hoặc chiếu lại nguồn Wiktionary cũ. Sau khi thêm từ,
chạy draft, pronunciations, tạo audio, verify_audio và build đầy đủ. Mọi thay
đổi checksum phát âm phải đối chiếu các ID cũ trước khi cập nhật manifest.
`overrides.json` có thể ghi phiên âm đã đối chiếu theo từng giọng; ví dụ sculpture
GB dùng /ˈskʌlptʃə/ để hiển thị và tham chiếu chấm nói cùng một nguyên âm.
