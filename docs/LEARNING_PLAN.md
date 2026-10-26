> **Lịch sử v20, phần chia bài đã bị thay thế trong v21.** Không còn 200 bài
> hoặc thứ tự bắt buộc A1→C1. Xem [quyết định hiện tại](OXFORD_AND_LEARNER_UX.md).
> Các quy tắc hạn mức, 04:00, hoàn tác và giữ tiến độ vẫn được dùng.

# Lộ trình và ngân sách học, 26-10-2026

## Công việc

- [x] Tái hiện trên Chromium với v8, goal=all, day01, hai chiều bật.
- [x] Truy vết dữ liệu → bộ lọc → bộ đếm → hàng đợi → FSRS → lưu tiến độ.
- [x] So sánh thiết kế, xác định ranh giới và các bất biến.
- [x] Triển khai, kiểm thử hành vi và kiểm tra giao diện thực tế.
- [x] Rà soát kết quả và giới hạn trước khi bàn giao.

## Bằng chứng và nguyên nhân

Kết quả trước sửa: 4.961 mục trong dữ liệu, bộ lọc day01 chỉ còn 25 mục,
10 nút ngày, bộ đếm báo 50 thẻ mới. Ảnh và JSON ở docs/audits/learning-plan-before.*.
Nhãn day01–day10 chỉ tồn tại trong 252 mục cũ. Trang đóng gói và ngày học
đã bị dùng làm chương trình học. Hai hướng thẻ bị đếm thành hai từ mới.
Hàng đợi ôn lấy deck() nên bộ lọc luyện tập còn che mất thẻ đã đến hạn.

## Thiết kế được chọn

Ứng dụng giữ FSRS/SM-2 trong srs.js để tính thời điểm ôn. learning-plan.js
sở hữu thứ tự giới thiệu từ, giới hạn mỗi ngày, hai chiều và chôn thẻ cùng từ.
app.js sở hữu giao diện, lưu trạng thái và thao tác trả lời/hoàn tác.

Hai phương án đã xét: (1) thêm day11…day199 vào từng từ, tiếp tục dùng deck()
cho mọi chế độ; (2) danh mục bài học độc lập với lịch thời gian, còn ôn đến hạn
được lấy toàn bộ thư viện. Chọn (2): thay mục tiêu không đổi thành viên bài,
không gán hạn chót giả và không bỏ quên từ ở bài khác. Không xây backend mới.

Hợp đồng đã triển khai:

```
LearningPlan.migrate(state, dayStart) -> state, giữ ID và lịch FSRS cũ
LearningPlan.started(introductions, wordId) -> boolean
LearningPlan.usage(state, dayStart) -> {words, directions}
LearningPlan.record(state, card, now, dayStart) -> cập nhật lần giới thiệu và hạn mức
LearningPlan.queue({cards, srs, introductions, usage, newIds, limit, buried,
                    now, dayEnd}) -> {fresh, directions, learning, review}
LearningPlan.next(queue, now, currentId, learnAhead) -> card | null
```

introduction là thời điểm đầu tiên một từ được trả lời trong lịch ôn, không phải
thời điểm trả lời gần nhất. Một từ tính đúng một lần dù có hai hướng.
Lịch cũ không đủ thông tin về lần đầu được đánh dấu thời gian 0, không bịa ngày.
Hoàn tác khôi phục cả introduction. Đặt lại một từ giữ lịch sử lần giới thiệu;
đó là học lại. Xóa toàn bộ tiến độ mới xóa toàn bộ lịch sử.
studyDay giữ danh sách từ và hướng vừa giới thiệu trong một ngày học. Tách
sổ hạn mức này khỏi dấu mốc lịch sử để thao tác học lại không làm mất ngày
giới thiệu ban đầu. Khi đổi ngày, thay sổ hiện tại, không tích lũy hạn mức.

Bài học có tối đa 25 từ, chia A1 → A2 → B1 → B2 → C1. Bài không phải ngày.
Trong cấp độ, dùng tần suất wordfreq 3.1.1 làm gợi ý thứ tự, không phải điểm
độ khó hay kiểm tra trình độ. Danh mục bài được đóng băng theo phiên bản;
đổi mục tiêu không chia lại bài. Mỗi ID xuất hiện đúng một bài.
Kết quả biên dịch: A1 900 mục/36 bài; A2 795/32; B1 691/28;
B2 1.298/52; C1 1.277/52. Tổng 4.961 mục và 200 bài.

Giữ quyết định v17 đã ghi trong LIFECYCLE.md: Thẻ ghi nhớ là luyện tự do,
Ôn theo lịch là nơi chấm FSRS. Cấu hình fcMode còn lại từ v16 không phải
bằng chứng rằng v17 bị lỗi; đã bỏ thay đổi thử nối lại hai chế độ sau khi
đọc được quyết định này. Sửa lời mô tả để không hứa rằng luyện tự do không
bao giờ ảnh hưởng ngày ôn: một lần quên có thể đưa thẻ lên ôn sớm theo chính
sách bằng chứng đã có, nhưng không sửa độ khó hoặc độ ổn định.

Mặc định 10 từ mới/ngày là lựa chọn sản phẩm có thể đổi, không phải con số
được chứng minh tối ưu. Có 0 để nghỉ giới thiệu từ mới. Mỗi ngày thêm tối đa
cùng số lượng hướng thẻ mới cho từ đã gặp; hiển thị riêng để không che tải ôn.
Hết hạn mức hoặc đổi bài không chặn thẻ đến hạn. Cùng từ chỉ xuất hiện một
hướng trong ngày học (bắt đầu 04:00 giờ thiết bị). Ngày nghỉ không cộng dồn hạn mức.
Lịch sử chuỗi ngày/câu trả lời cũ vẫn dùng ngày lịch để tránh viết lại quá khứ;
giao diện phải nói rõ ngày học 04:00 và ngày lịch của mục tiêu câu trả lời.

Di trú v8 → v9 bỏ bộ lọc ngày/trang cũ (lưu bản sao trong migrationV9), giữ các
bộ lọc CEFR/sao; goal=all cũ chuyển 10 và thông báo rõ. Giữ mục tiêu số hợp lệ.
Không đổi lịch, độ khó, độ ổn định hay ID từ đã học. Phiên ôn cũ không tiếp tục
với hàng đợi lỗi. Đã giới thiệu không được gắn nhãn thành thạo.

## Cơ sở và giới hạn suy luận

- [Oxford](https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford3000-5000):
  danh sách dựa trên tần suất và tính phù hợp; CEFR hướng dẫn chọn từ theo trình độ.
  Mỗi từ đa nghĩa có nhiều điều cần học hơn nghĩa đầu. Lộ trình dùng CEFR thấp nhất
  của mục ghép, không khẳng định mọi nghĩa đều thuộc cấp đó.
- [Anki Manual](https://docs.ankiweb.net/deck-options.html): thêm từ làm tăng tải ôn;
  giảm từ mới khi tồn đọng; ngày bỏ lỡ không cộng dồn hạn mức. Đây là tài liệu vận hành,
  không phải thử nghiệm xác nhận 10 hay 25 từ/ngày cho người Việt.
- [Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x):
  kiểm tra truy hồi cải thiện lưu giữ ở bài kiểm tra trì hoãn trong thí nghiệm đọc đoạn văn.
  Chỉ đọc tóm tắt; không suy ra mức hiệu quả cụ thể cho ứng dụng hay tiếng Việt.
- [wordfreq](https://github.com/rspeer/wordfreq): dữ liệu tần suất tới khoảng 2021,
  không phải dữ liệu 2026. Tần suất là gợi ý thứ tự, không chứng minh chương trình
  học tối ưu. Cần giáo viên đánh giá bài và thử nghiệm với người học thực tế.

Pstack áp dụng: how, architect, model-the-domain, fix-root-causes,
prove-it-works. Tự thực hiện theo yêu cầu người dùng; không dùng hội đồng/subagent.
control-ui không có trong bản port, dùng Playwright trên ứng dụng thật.

## Kết quả kiểm chứng

- Trước sửa, Chromium: `total=4961, selected=25, dayChips=10, n=50`.
- Sau sửa, cùng trạng thái day01/goal=all: `total=4961, selected=4961,
  dayChips=0, lessons=200, goal=10, n=10`. Fixture có một từ học cũ nên thêm
  `b=1` chiều mới riêng, không trộn vào số từ mới.
- 18 kiểm thử chính sách hàng đợi, 3 kiểm thử lộ trình, 10 kiểm thử nội dung,
  3 kiểm thử audio/cloze, 23 kiểm thử SRS và 9 kiểm thử chấm phát âm đều qua.
- `tests/learning_plan_browser_test.py` qua trên Chromium: v8→v9 giữ ghi chú
  và SRS, chọn cấp/bài, đi tiếp bài, 10 từ duy nhất, hoàn tác, đổi bài/tải lại
  không lấy thêm hạn mức, ôn toàn thư viện khi bộ lọc rỗng, 0 từ mới, free
  practice tách khỏi FSRS, offline, xóa tiến độ đồng bộ. Hoàn tác còn khôi phục
  đúng lịch sử khi bộ đệm 20.000 lượt vừa loại phần tử cũ nhất.
- `tests/content_browser_test.py` qua: toàn bộ danh mục, C1, tìm kiếm/phân
  trang, audio UK/US, lưu/nhập tiến độ 8 MB, lỗi nhập giữ dữ liệu cũ, offline
  20 gói, audio Range 206 và không xóa cache ứng dụng khác. Không có pageerror.
- Build đầy đủ qua, 4.961 mục/23.646 nghĩa/4.961 ví dụ, missing=0. Không tạo
  lại audio hoặc thay đổi công thức/weights srs.js. `git diff --check` qua.
- Service worker v20 lưu cả lộ trình/module mới để offline. Đã mở bản cập
  nhật trong tab localhost của người dùng, giữ tên và mục tiêu 100 câu.

Ảnh, kết quả máy đọc được: `docs/audits/learning-plan-*` và
`docs/audits/content-browser-2026-10-26.json`. Kết quả hành trình học ở
`docs/audits/learning-plan-browser.json`; ảnh tab của người dùng ở
`docs/audits/learning-plan-user-tab.png`.

Không suy ra hiệu quả sư phạm từ việc kiểm thử phần mềm qua. Việc chọn 25 từ/bài,
10 từ mới/ngày và thứ tự theo tần suất là thiết kế có thể điều chỉnh, cần giáo viên
và dữ liệu sử dụng thực tế để đánh giá. Lịch sử cũ thiếu sự kiện giới thiệu đầu
tiên được đánh dấu không biết ngày; không bịa lại số từ mới đã học trong quá khứ.
Hệ thống hiện vẫn lưu tiến độ trên thiết bị, chưa giải quyết đồng bộ nhiều thiết bị
hoặc xung đột nhiều tab (giới hạn đã ghi trong báo cáo nội dung trước).
