# Học Từ Vựng – Oxford 3000 (PWA)

Ứng dụng học từ vựng miễn phí, chạy offline: https://meiiie.github.io/hoc-tu-vung/

**Chế độ học:** Thẻ ghi nhớ (lật 3D, vuốt phải “đã biết”, vuốt trái “đang học”, trộn thẻ, tự phát âm, hoàn tác, học hết toàn bộ không giới hạn) · Học (vòng thích ứng: trắc nghiệm → gõ từ) · Ôn theo lịch (SM-2) · Ghép thẻ (bấm giờ, kỷ lục) · Kiểm tra (gõ từ / trắc nghiệm / đúng-sai) · Danh sách và gắn sao từ khó · Thống kê.
Tiến độ lưu trong `localStorage` của từng máy, nên mỗi người dùng có tiến độ riêng.

## Thêm trang Oxford 3000 mới
1. Tạo `data/pN.json` cùng cấu trúc với `data/p1.json` (`id, w, ipa, pos, lv, cefr[], vi, ex, exvi, col, tip, audio, tags[]`).
2. Đặt mp3 vào `audio/pN/`.
3. Thêm `{ "id": "pN", "title": "...", "short": "...", "file": "data/pN.json" }` vào `data/pages.json`.
4. Thêm các file mới vào `FILES` trong `sw.js` và tăng `V` (ví dụ `htv-v3`) để máy đã cài tự cập nhật.

## Ghi nhận
- Cách bố trí các chế độ học (Flashcards, Learn, Match, Test) tham khảo trải nghiệm của Quizlet. Không dùng mã nguồn hay tài sản của Quizlet.
- Thuật toán lặp lại ngắt quãng: SM-2 (P. A. Woźniak, SuperMemo, 1987), tự viết lại.
- Mã nguồn tự viết, không sao chép từ dự án mã nguồn mở nào. Linh vật "Cú Bông" là nhân vật gốc, vẽ bằng SVG trong `mascot.js`.
- Danh sách từ: Oxford 3000 (Oxford University Press), nghĩa tiếng Việt theo tài liệu học. Âm thanh tạo bằng gTTS (Google Text-to-Speech).
