# Học Từ Vựng – Oxford 3000 (PWA)

Ứng dụng học từ vựng IELTS miễn phí, chạy offline: https://meiiie.github.io/hoc-tu-vung/

## Tính năng
- **Thẻ ghi nhớ:** lật 3D; vuốt phải là “đã biết”, vuốt trái là “đang học”; trộn thẻ, hoàn tác, tự phát âm. Học hết toàn bộ, không giới hạn số từ.
- **Học:** chia thành từng vòng. Mỗi từ được hỏi trắc nghiệm trước, rồi mới phải gõ từ.
- **Ôn theo lịch:** lặp lại ngắt quãng theo thuật toán SM-2, số từ mới mỗi ngày theo mục tiêu bạn chọn.
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
- Thuật toán SM-2: P. A. Woźniak (SuperMemo, 1987), tự cài đặt lại.
- Cách bố trí chế độ học tham khảo trải nghiệm của Quizlet, Duolingo, Anki, ELSA Speak. Không dùng mã nguồn hay tài sản của các ứng dụng này.
- Linh vật “Cú Bông” là nhân vật gốc của dự án (`mascot.js`).
- Danh sách từ: Oxford 3000 (Oxford University Press). Nghĩa tiếng Việt theo tài liệu học.
