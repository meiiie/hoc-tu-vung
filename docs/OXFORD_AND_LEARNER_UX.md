> Cập nhật v23: đã bổ sung cả 10 dạng từ từng thiếu trong PDF; thư viện hiện có
> 4.971 mục. Các số liệu/chênh lệch cũ bên dưới là lịch sử trước đợt bổ sung.
> Xem [kết quả hiện tại](PDF_ADDITIONS.md).

> Phần UX/chọn từ dưới đây ghi nhận v21. Theo xác nhận tiếp theo của người dùng,
> v22 khôi phục các nhóm Ngày tối đa 25 từ, học nhóm khác được ngay trong cùng
> ngày thực tế. Xem [thiết kế hiện tại](STUDY_DAYS.md). Đối chiếu Oxford/PDF
> và các giới hạn nguồn ở tài liệu này vẫn giữ nguyên.

# Danh mục Oxford và cách học linh hoạt, 26-10-2026

Quyết định này thay phần chia 200 bài A1→C1 trong LEARNING_PLAN.md theo yêu cầu
trực tiếp của người dùng. Giữ các sửa lỗi về hạn mức, thẻ hai chiều, hoàn tác,
giữ tiến độ và ôn đến hạn toàn thư viện. Tự nghiên cứu và triển khai, không subagent.

## Quy tắc giao diện của dự án

Đã đọc docs/LAYOUT.md, docs/RESEARCH.md, docs/LIFECYCLE.md và docs/MASCOT.md.
v15 chủ ý một cột, nội dung học ở trung tâm, thẻ Hôm nay và một nút ôn chính,
các chế độ trong lưới hai cột. v17 tách Thẻ ghi nhớ tự do khỏi Ôn theo lịch.
Không dùng thông báo gây tội lỗi hay biến giải thích kỹ thuật thành nội dung chính.
Yêu cầu mới loại bỏ thẻ lộ trình, màn hình 200 bài và thứ tự cứng theo CEFR.

## Chọn từ thay cho lộ trình cứng

Hai phương án được xét: trộn ngẫu nhiên các cấp CEFR theo tỷ lệ định sẵn, hoặc
chọn từ từ toàn thư viện theo tính hữu ích và hành động của người học. Chọn
phương án sau. Chưa có bằng chứng cho một tỷ lệ A1/B1/C1 áp dụng chung; trộn
ngẫu nhiên từ rất khó cho người mới không tự trở thành cá nhân hóa.

- Không dùng CEFR trong comparator, điều kiện mở khóa, con trỏ tiến trình hoặc
  giới hạn chọn từ. CEFR là metadata tra cứu và bộ lọc tùy chọn.
- Thứ tự gợi ý mặc định dựa trên tần suất dạng chữ wordfreq đã đóng băng.
  Đây chỉ là heuristic, không đo năng lực. Nó không phân biệt hoàn hảo các nghĩa,
  từ viết hoa hay cụm từ; không coi là thứ tự giáo trình Oxford.
- Từ gắn sao và từ người học vừa luyện được ưu tiên trong số từ chưa đưa vào
  lịch. Người học có thể bắt đầu một từ ở bất cứ cấp nào, không cần hoàn thành
  hàng trăm từ của cấp trước. Không tự gắn nhãn trình độ cho người học.
- Ôn đến hạn và thẻ đang học vẫn theo lịch cá nhân FSRS/SM-2. Thứ tự từ mới
  không được trì hoãn thẻ đến hạn hay vượt hạn mức 04:00 đã có.
- Chế độ Học tiếp tục các từ đang luyện, rồi lấy từ mới theo cùng gợi ý,
  thay cho chọn ngẫu nhiên trong toàn bộ 4.961 mục. Các câu trong vòng vẫn trộn.
- Không tạo khóa học tình huống giả bằng gán nhãn tự động chưa thẩm định.
  Ứng dụng hiện hỗ trợ học từ; chưa thay một khóa học đủ đọc, nghe, nói, viết.

Màn hình chính chỉ giữ số liệu và thao tác. Giải thích nguồn, đơn vị đếm và
chính sách nằm ở trang Nguồn/Cài đặt; không thêm thẻ diễn giải trên trang chủ.
Di trú schema 9→10 bỏ lesson/filter.lesson, giữ SRS, introductions, studyDay,
ghi chú, mục tiêu và lịch sử. Liên kết #/path cũ trở về trang chủ.

## Tài liệu đã đọc và giới hạn suy luận

1. PDF người dùng cung cấp: E:/Downloads/The_Oxford_3000.pdf, 11 trang,
   metadata tạo 06-07-2020. Đã trích xuất toàn bộ và xem trang đầu để kiểm tra
   cách trình bày cột, mạo từ, từ loại và các mục đồng hình.
2. [Oxford 3000/5000: giới thiệu chính thức](https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford3000-5000).
   Đã đọc. Oxford 5000 là bộ mở rộng gồm danh mục cốt lõi và phần bổ sung.
   Nhãn từ loại/nghĩa và đơn vị thẻ của sản phẩm không đồng nhất.
3. [Oxford Word Skills, hướng dẫn từ OUP](https://www.oup.es/oxford-word-skills-2nd-edition/).
   Đã đọc trang nhà xuất bản, không tuyên bố đã đọc toàn bộ sách. Bài xoay quanh
   ngữ cảnh/chức năng giao tiếp, có mục tiêu cụ thể; phần lớn bài dùng linh hoạt
   về thứ tự. Điều này không chứng minh nên trộn mọi cấp độ ngẫu nhiên.
4. [Julie Moore, OUP, 2019](https://teachingenglishwithoxford.oup.com/2019/02/13/core-vocabulary/).
   Đã đọc bài. Tần suất cần đi cùng tính phù hợp và nhu cầu riêng. Danh mục là
   nền tảng, không đủ thay thế mọi từ mà người học cần cho mục đích của mình.
5. [Paul Nation, The Four Strands](https://doi.org/10.26686/wgtn.12552167),
   Victoria University of Wellington, bài gốc 2007, kho lưu trữ ghi 2020.
   Đã đọc tóm tắt và các đoạn về input, output, học chủ đích và điều kiện học.
   Flashcard là một phần của học ngôn ngữ, không thay toàn bộ chương trình.
6. [Bjork Learning and Forgetting Lab, UCLA](https://bjorklab.psych.ucla.edu/research/).
   Đã đọc các mục liên quan tới spacing/retrieval/interleaving. Không đánh đồng
   kết quả phân loại hình ảnh/toán với lợi ích của trộn nhãn CEFR.
7. [Healy, Schneider & Kole, 2025](https://www.mdpi.com/2076-328X/15/5/692),
   University of Colorado Boulder và University of Northern Colorado.
   Đã đọc abstract và introduction; ngày xuất bản trên bài là 17-05-2025,
   khác ngày nhận bài 27-02-2025. Sáu thí nghiệm với từ Pháp–Anh cho thấy tăng
   khó lúc đầu không luôn cải thiện lưu giữ. Không dùng để đặt tỷ lệ trộn cấp.
8. [Nakata & Suzuki, 2018](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/effects-of-massing-and-spacing-on-the-learning-of-semantically-related-and-unrelated-words/F58BA8D70385603B9C42E408BFCB8A10).
   Chỉ đọc abstract: 133 sinh viên Nhật, 48 cặp từ. Điểm sau học không khác
   đáng kể giữa nhóm nghĩa liên quan/không liên quan, nhưng lỗi nhiễu nhiều hơn
   với từ liên quan. Không tuyên bố nhóm từ theo chủ đề luôn tốt hoặc luôn xấu.

Position paper Oxford tìm được trên trang yêu cầu điền thông tin để tải. Không
gửi dữ liệu người dùng, không tuyên bố đã đọc toàn văn tài liệu này.

## Đơn vị đếm

Không thêm thẻ trùng hoặc thẻ đảo chiều để làm tròn 5.000. Kiểm kê lấy nguồn
đang đóng băng trong repo, tách số bản ghi tham chiếu, dạng từ và mục học.
Báo cáo đối chiếu PDF nói rõ phạm vi theo dạng chữ, không chứng nhận mọi nghĩa.
PDF 2020 và snapshot web 2026 có khác biệt thực tế; chưa tìm được changelog
chính thức giải thích từng thay đổi, nên không tự gán lý do Oxford thay từ.

## Đối chiếu và kiểm chứng đã thực hiện

`python tools/content/audit_oxford.py` tạo
[audit từng mục](audits/oxford-counts-2026-10-26.json). Snapshot web có 5.975
bản ghi tham chiếu và 4.960 dạng từ chuẩn hóa, đều ánh xạ được vào thư viện.
4.960 − 1 mục do gộp a/an + 2 mục do giữ riêng bank/bear = 4.961 mục học.
Công thức giải thích số mục của ứng dụng, không giải thích mọi thay đổi của
Oxford qua các phiên bản hoặc biến 5.000 thành một kiểm kê đã được chứng minh.

PDF có 3.000 dòng mục từ, 2.980 dạng từ chuẩn hóa và 21 nhóm mục đồng hình.
2.990 dòng ánh xạ được theo dạng chữ. Mười dạng từ chưa có: blank, CD,
chairman, disc, DVD, gentleman, policeman, sculpture, stiff, tape. Đây là
khác biệt nguồn chưa được nhập bổ sung trong lần sửa UX/chọn từ này.
Không lấy ánh xạ dạng chữ làm bằng chứng mọi nghĩa và mọi cách phát âm đã đủ.

Build đầy đủ đã đạt: 4.961 mục, 23.646 mục nghĩa, 4.961 ví dụ/cụm từ song ngữ,
không lỗi cấu trúc; đã đối chiếu checksum nguồn và các audio đang phát hành.
Không thay dữ liệu từ, ID hoặc tạo lại audio trong lần sửa này. Không tuyên bố
đã có chuyên gia duyệt toàn bộ nội dung ngôn ngữ.

73 kiểm thử đã đạt: 20 chính sách hàng đợi/di trú, 3 client nội dung, 4 thứ tự
gợi ý, 4 đối chiếu Oxford/PDF, 10 compiler nội dung, 23 SRS, 9 phát âm.
Hai bộ hành trình Chromium cũng đạt, không lỗi JavaScript:
[luồng người học](audits/learning-plan-browser.json) và
[nội dung, lưu trữ, audio, offline](audits/content-browser-2026-10-26.json).
Các ca gồm chọn từ C1 khi chưa học A1, giữ hạn mức khi đổi bộ lọc, hoàn tác,
ôn toàn thư viện, tạm dừng từ mới, giữ trạng thái schema 9, khôi phục sao lưu
8 MB, offline và tách luyện tự do khỏi việc chấm FSRS.

Đã cập nhật tab thật qua nút Tải lại của service worker v21. Trang chủ bỏ
lộ trình và giữ 6/100 câu, chuỗi 1 ngày, hạn mức 10 từ mới như trước cập nhật.
Không trả lời thẻ hoặc xóa tiến độ trên hồ sơ thật. Xem
[ảnh trang chủ](audits/learner-home-v21.png).

## Áp dụng pstack trong phạm vi này

Dùng bản skill cục bộ poteto-mode. Tự thực hiện nghiên cứu, thiết kế đối chiếu
và review theo yêu cầu không dùng subagent của người dùng.

- **Model the Domain**: tách dòng tham chiếu, dạng từ, mục học, chiều thẻ và
  lịch ôn. Không dùng một biến “số từ” cho cả năm khái niệm.
- **Fix Root Causes**: bỏ phụ thuộc của hàng đợi vào bài CEFR, không chỉ
  đổi nhãn hoặc ẩn khối lộ trình.
- **Explain the Number**: giữ phép ánh xạ từng dòng PDF, checksum nguồn và
  danh sách thiếu; tổng khớp không được thay cho kiểm tra bằng tập hợp.
- **Prove It Works**: kiểm thử hành vi và cập nhật tab thật trước khi báo xong.

Rà comment và tài liệu trực tiếp: không còn mô tả curriculum trong mã chạy;
thiết kế v20 được đánh dấu đã thay thế. Không giao review cho agent khác.
