# Word lifecycle (v16)

Every mode reads from one lifecycle record per word: `S.srs[id]` for the English to Vietnamese card, plus `id~r` for the reverse card when two-way review is on. Only FSRS answers (Ôn theo lịch, or Thẻ ghi nhớ in "Theo lịch" mode) change memory state. Other modes write *evidence* (`S.ev[id]`), and that evidence can change ordering or bring a card forward. It never changes stability, difficulty or interval.

## States (priority order: the first match is shown)
| State | Rule | Source |
|---|---|---|
| Tạm ngưng (Suspended) | `susp` on either card | Anki suspend |
| Hay quên (Leech) | 8 lapses, then again every 4 (auto-suspends and stars the word) | Anki leech threshold 8 |
| Tạm ẩn hôm nay (Buried) | buried until the 4 am day boundary | Anki bury |
| Mới (New) | no card, or state `new` | Anki/FSRS |
| Đang học (Learning) | learning steps 1m, 10m | Anki defaults |
| Học lại (Relearning) | after Again on a Review card, step 10m | Anki defaults |
| Đang ôn (Review) | graduated, FSRS stability under 21 days | FSRS |
| Thành thạo (Mastered) | Review and stability ≥ 21 days (SM-2: interval ≥ 21) | Anki "mature" (≥ 21 d); Quizlet "Mastered" |

Mastered is a milestone, not a terminal state. A lapse sends the word back to Relearning, as in Anki. This differs from Duolingo and Memrise, which let mastered items "decay" visually but don't track them.

## Flashcards vs. Ôn theo lịch (v17 decision)
v16 put two modes inside Thẻ ghi nhớ ("Theo lịch" / "Lướt tự do"). Testing on a real iPhone showed this was confusing: it was a hidden mode, the same screen behaved two ways, and the toggle was easy to miss. v17 separates them again (option A):
* **Ôn theo lịch** is the *only* place where the schedule changes. It has 4 buttons (Lại / Khó / Được / Dễ) with intervals, and labelled counters (Mới / Học / Ôn).
* **Thẻ ghi nhớ** is free browsing of the whole deck. It never changes stability or interval. "Đang học" counts as practice evidence, as in the table below.

This matches the market leaders. Anki has one scheduled path ("Study Now"), and Custom Study/preview don't affect scheduling by default. Quizlet keeps Flashcards (browse; "track progress" only sorts the current round) separate from Learn/spaced review. Duolingo has one primary "next lesson" path and practice outside it. One obvious place where the schedule changes means lower cognitive load and no hidden state. Merging (option B) would only help users who never open the review screen, and the home screen already makes Ôn theo lịch the primary button with its due count.

## Evidence from the other modes
| Mode | Success | Failure | Why |
|---|---|---|---|
| Thẻ ghi nhớ, Học, Nghe–chép, Kiểm tra | Logged. A new word met here is introduced first in the next scheduled session. | Logged, and `S.miss` is incremented (feeds Từ khó). If the word is in Review and due later than tomorrow, it is brought forward to tomorrow (at most once per day). Its stability and interval are kept. | Practice happens out of schedule. Counting a success would inflate intervals, because the item was shown recently or recognised from multiple choice. Anki's "custom study / preview" and Quizlet Learn don't feed the long-term schedule either. A failure is real evidence that memory is weaker than predicted, so the word is checked sooner. The FSRS rating itself is then made in a proper spaced retrieval, which keeps the model calibrated. |
| Ghép thẻ (Match) | Logged as exposure only | No effect | Match is a timed recognition game with elimination cues, so its errors are mostly mis-taps and say little about recall. |
| Luyện nói | Pronunciation history only (`S.pron`) | – | Pronunciation is a separate skill from recall of meaning. |

New-word introduction respects the daily new limit set in onboarding or Settings ("Tất cả" = no limit, which is the default for this user, or 10/25/50).

## Word browser
Danh sách từ has filter chips with counts (Tất cả, Mới, Đang học, Đang ôn, Thành thạo, Hay quên, Tạm ngưng / ẩn). Tapping a word opens a sheet with its state, reviews, lapses, next due date, retrievability, stability, difficulty, and a merged history of FSRS reviews and practice evidence. The sheet also has these actions: Tạm ngưng / Mở lại, Ẩn đến mai / Bỏ tạm ẩn, and Học lại từ đầu (reset to New, which needs a second tap to confirm).

## Data safety
Schema 8 migration only adds `ev:{}` and `set.fcMode='sched'`. Existing `srs`, `revlog`, `log`, `learn` and `miss` are untouched (verified by the test: 40 seeded cards survive the 7→8 migration).
