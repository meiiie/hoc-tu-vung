# Học Từ Vựng – Oxford 3000 (PWA)

Ứng dụng học từ vựng IELTS miễn phí, chạy offline: https://meiiie.github.io/hoc-tu-vung/

## Tính năng
- **Thẻ ghi nhớ:** lật 3D; vuốt phải là “đã biết”, vuốt trái là “đang học”; trộn thẻ, hoàn tác, tự phát âm. Chế độ luyện tập, không làm thay đổi lịch ôn.
- **Học:** chia thành từng vòng. Mỗi từ được hỏi trắc nghiệm trước, rồi mới phải gõ từ.
- **Ôn theo lịch (kiểu Anki):** thuật toán FSRS-6 (mặc định, mức nhớ mong muốn 85/90/95%) hoặc SM-2 như Anki. Thẻ Mới / Đang học / Ôn / Học lại, bước học 1p 10p, bước học lại 10p, 4 nút Lại/Khó/Được/Dễ kèm khoảng cách tiếp theo, bộ đếm xanh/đỏ/lục, thẻ hai chiều với chôn thẻ anh em trong ngày, cân bằng tải, phát hiện thẻ “hay quên” (8 lần quên → tạm ngưng), hoàn tác, khả năng nhớ của từng thẻ. Mặc định học hết toàn bộ thẻ mới mỗi ngày.
- **Ôn toàn bộ:** lướt cả bộ từ mà không làm lệch lịch ôn.
- **Phiên học được lưu:** tải lại trang (F5) vẫn tiếp tục đúng thẻ, đúng mặt thẻ.
- **Sao lưu:** xuất/nhập tiến độ ra tệp JSON trong Cài đặt; dữ liệu có phiên bản (schema) và được tự nâng cấp khi cập nhật.
- **Luyện nói:** chấm phát âm bằng Web Speech API. Trình duyệt không hỗ trợ thì chuyển sang ghi âm để tự so sánh.
- **Nghe – chép:** nghe từ rồi gõ lại; có nghe chậm và gợi ý.
- **Ghép thẻ** và **Kiểm tra.**
- **Phát âm:** giọng Anh (UK) và Mỹ (US), nghe chậm, nghe câu ví dụ.
- **Khác:** gắn sao từ khó, thống kê, giao diện sáng/tối, bắt đầu bằng các bước giới thiệu.
- Tiến độ lưu trong `localStorage`, nên mỗi máy (mỗi người dùng) có tiến độ riêng.

## Thêm trang Oxford 3000 mới
1. Tạo `data/pN.json` cùng cấu trúc với `data/p1.json` (`id: "pN-001", w, ipa, pos, lv, cefr[], vi, ex, exvi, col, tip, tags[]`).
2. Đặt âm thanh vào `audio/pN/{gb,us}/{w,ex}/001.mp3` (dùng `edge-tts`: en-GB-SoniaNeural, en-US-AvaNeural).
3. Thêm `{ "id": "pN", "title": "...", "short": "...", "file": "data/pN.json" }` vào `data/pages.json`.
4. Thêm file JSON mới vào `SHELL` trong `sw.js` và tăng `V`. Âm thanh không cần khai báo vì được lưu dần khi nghe, hoặc tải hết trong Cài đặt.

## Ghi nhận và giấy phép
- Biểu tượng: [Lucide](https://lucide.dev), giấy phép ISC, nhúng dạng SVG sprite trong `index.html`.
- Giọng đọc: Microsoft Edge Neural TTS, tạo bằng [edge-tts](https://github.com/rany2/edge-tts) (GPL-3.0, chỉ dùng để tạo file, không đóng gói vào ứng dụng).
- Lịch ôn: [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) 5.4.2 (MIT) trong `vendor/`; SM-2 theo Anki (tự cài đặt lại từ tài liệu [Deck Options](https://docs.ankiweb.net/deck-options.html)); cân bằng tải và chuyển đổi SM-2 → FSRS chuyển thể từ [ankitects/anki](https://github.com/ankitects/anki) (`rslib/src/scheduler/states/load_balancer.rs`, AGPL-3.0 — chỉ tham khảo công thức) và [fsrs-rs](https://github.com/open-spaced-repetition/fsrs-rs) (`memory_state_from_sm2`).
- Kiểm thử: `tests/srs.test.js` so sánh với ts-fsrs gốc; `tests/*.py` là kiểm thử Playwright trên điện thoại giả lập.
- Cách bố trí chế độ học tham khảo trải nghiệm của Quizlet, Duolingo, Anki, ELSA Speak. Không dùng mã nguồn hay tài sản của các ứng dụng này.
- Chấm phát âm: mô hình [ZIPA-CR-Ns small](https://huggingface.co/anyspeech/zipa-small-crctc-ns-700k) (Zhu et al., ACL 2025; giấy phép CC BY-NC-SA 4.0, chỉ dùng phi thương mại), tải về máy người dùng từ Hugging Face khi bật. Chạy bằng [onnxruntime-web](https://github.com/microsoft/onnxruntime) 1.30.0 (MIT, `vendor/ort/LICENSE`). Phiên âm chuẩn từ [CMUdict](https://github.com/cmusphinx/cmudict) (BSD-2, giọng Mỹ) và [Britfone](https://github.com/JoseLlarena/Britfone) (MIT, giọng Anh). Chi tiết: `docs/PRONUNCIATION.md`.
- Linh vật “Neko” lấy từ hệ thương hiệu Wiii (github.com/meiiie/wiii, AGPL-3.0, cùng tác giả), vẽ lại bằng SVG trong `mascot.js`. Từ v9, chuyển động theo nguyên lý trong [grokbot-animation-anatomy](https://github.com/ArvinYin1/grokbot-animation-anatomy) (chỉ tham khảo nguyên lý, mã và dữ liệu tự viết; xem `docs/MASCOT.md`).
- Danh sách từ: Oxford 3000 (Oxford University Press). Nghĩa tiếng Việt theo tài liệu học.

## v7
- Học theo 4 bước cho mỗi từ: trắc nghiệm → tự gõ → điền vào câu ví dụ → nghe – chép.
- Chấm gõ chấp nhận lỗi chính tả nhỏ ("Gần đúng"), có so sánh từng chữ và nút "Tôi đã đúng".
- Chuỗi ngày học tách khỏi mục tiêu ngày (10/20/50/100 câu). Cứ 7 ngày liên tiếp được thêm 1 ngày nghỉ (tối đa 2), tự dùng khi lỡ một ngày.
- Chế độ "Từ khó": gom từ hay sai, hay quên hoặc đã gắn sao.
- Mẹo nhớ riêng cho từng từ.
- Linh vật Neko, bảng màu và biểu tượng ứng dụng mới.
- Cơ sở nghiên cứu: `docs/RESEARCH.md`.

## v8
- Luyện nói thành công cụ chấm phát âm: nhận dạng âm vị ngay trên máy (ZIPA, ~71 MB, tải một lần, dùng offline), chấm từng âm so với IPA chuẩn, tô màu âm và âm tiết, kiểm tra trọng âm (ước lượng).
- Nhận xét lỗi thường gặp của người Việt: phụ âm cuối, /θ ð/, /ʃ/, /æ/–/e/, đuôi -s/-ed, nguyên âm dài–ngắn. Chạm vào âm để xem cách đặt lưỡi (hình cắt miệng).
- Nghe lại giọng mình cạnh giọng mẫu UK/US, phát chậm, sóng âm và cao độ, lịch sử điểm từng từ.
- Không có mô hình thì dùng Web Speech của trình duyệt; sửa lỗi hiện cùng lúc "Có lỗi nhận dạng" và điểm 100.
- Sửa nút dưới cùng bị thanh công cụ Safari che (safe area).
- Neko vẽ lại có tai mèo, đủ biểu cảm (nghe, nói, đúng, sai…), chọn màu trong Cài đặt.

## v9
- Neko vẽ lại theo nguyên lý trong grokbot-animation-anatomy: mắt khoét (mask) đổi hình từng điểm qua 9 biểu cảm, hai tai cử động riêng, lò xo 120 Hz, chớp mắt theo clip, hào quang thở, trạng thái "đang chấm" biến thành ba chấm.
- Luyện nói: Neko nghe (tai phản ứng theo âm lượng micro) → đang chấm → đúng / gần đúng / sai.
- 6 màu Neko, có bản cho giao diện sáng và tối, đều đạt độ tương phản ≥ 3:1. Chạm vào Neko để chọc.

## v10
- Chấm giọng Anh (UK) theo phiên âm Anh (Britfone): ví dụ "bath" là /bɑːθ/; phiên âm Mỹ vẫn được chấp nhận.
- Đánh giá lại các mô hình chấm phát âm và giọng đọc mới (xem `docs/PRONUNCIATION.md`); giữ ZIPA và edge-tts vì không có lựa chọn nào tốt hơn mà vẫn chạy được trên điện thoại.

## v11
- iPhone mic fix: a new capture context and a new microphone stream for every attempt, a silent-stream watchdog, an adaptive noise threshold, and a `?debug=1` diagnostic overlay. See docs/PRONUNCIATION.md.
- Live waveform; states for opening the mic, listening, "Neko nghe thấy bạn", waiting for you to finish (countdown), and no sound from the mic.
- Each syllable is a pill. Stress is a dot above the stressed syllable plus an underline, with no stray ˈ characters.
- Animated mouth cross-sections (tongue, lips, jaw, voicing, airflow) for each sound.

## v12
- Desktop: chữ trên thẻ bôi đen và sao chép được. Kéo chuột không còn vuốt hay lật thẻ. Nhấp (không kéo) để lật; nhấp đúp để chọn một từ. Có nút sao chép cho từ và câu ví dụ.
- Điều hướng bằng nút hoặc phím (← → phím cách, Z để hoàn tác). Muốn kéo thẻ bằng chuột thì bật “Kéo thẻ bằng chuột” trong Cài đặt; khi đó chỉ kéo được từ vùng trống của thẻ.
- Điện thoại: vẫn vuốt như cũ. Nhấn giữ để chọn chữ sẽ huỷ thao tác vuốt và lật.
- Phiên âm IPA hiển thị theo giọng đang chọn (US/UK), khớp với các ô âm.

## v13
- Trên máy tính, chuột vừa vuốt được vừa bôi đen được chữ:
  - Kéo nhanh và gần như nằm ngang (khoảng 0,5 px/ms trở lên, vượt 8 px trong 150 ms đầu) thì chuyển thẻ.
  - Giữ chuột khoảng 220 ms, kéo chậm hoặc kéo theo chiều dọc thì bôi đen chữ.
  - Kéo từ vùng trống của thẻ thì luôn là vuốt.
  - Tính năng này bật sẵn và tắt được trong Cài đặt.
- Phiên âm gọn lại còn một dòng IPA, bấm vào từng âm để xem cách phát âm:
  - Các âm tiết cách nhau bằng dấu chấm giữa. Trọng âm chính in đậm có màu, trọng âm phụ đậm vừa.
  - Sau khi chấm điểm, mỗi âm có nền xanh, vàng hoặc đỏ. Âm gần đúng có thêm gạch chân chấm, âm sai có gạch chân lượn sóng.

## v14
- Trên máy tính bảng và máy tính có thanh điều hướng bên trái. Từ 1024 px có thêm cột phải với tiến độ hôm nay, phím tắt và Neko. Trang chủ thành dạng lưới; danh sách từ thành bảng có sắp xếp và tìm kiếm; thống kê chia hai cột. Giao diện điện thoại giữ nguyên. Xem docs/LAYOUT.md.
- Nút chính trên trang chủ là “Ôn theo lịch”, ghi số thẻ cần ôn hôm nay hoặc thời điểm ôn tiếp theo.
- Thẻ ghi nhớ có dòng ghi chú “Luyện thêm: không thay đổi lịch ôn”.
- Khi chấm điểm, nút “Được” nổi bật nhất. Phím cách chọn “Được”, phím 1–4 chọn từng mức. Lần đầu có mẹo giải thích Lại, Khó, Được, Dễ.

## v15
- Bỏ thanh điều hướng bên trái và cột bên phải. Máy tính và máy tính bảng dùng đúng giao diện điện thoại, đặt ở giữa màn hình (rộng tối đa 600 px, trang chủ 720 px). Chữ lớn hơn một chút, có trạng thái khi rê chuột, và nút “?” (hoặc phím ?) để xem phím tắt. Cài đặt mở ở giữa màn hình. Xem docs/LAYOUT.md.
