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

## Flashcards
* **Theo lịch (default):** uses the same queue and session as Ôn theo lịch, so the same card cannot be counted twice. The queue order is due learning cards, then reviews, then new cards (within the daily new limit), then learn-ahead up to 20 minutes. Swipe right or → means Được (Good); swipe left or ← means Lại (Again). Each button shows its next interval. "Thêm Khó / Dễ" exposes all four ratings, and keys 1 to 4 always work. A reviewed card's sibling is buried for the day (Anki sibling burying). Review cards graded today are not due again today because FSRS sets the due date at least 1 day ahead. The only same-day repeats are learning steps, which is Anki's rule.
* **Lướt tự do:** this is the old free-browse mode, like Quizlet Flashcards with "track progress" off. It never changes the schedule. "Đang học" counts as a failed self-check (see below).

## Evidence from the other modes
| Mode | Success | Failure | Why |
|---|---|---|---|
| Lướt tự do, Học, Nghe–chép, Kiểm tra | Logged. A new word met here is introduced first in the next scheduled session. | Logged, and `S.miss` is incremented (feeds Từ khó). If the word is in Review and due later than tomorrow, it is brought forward to tomorrow (at most once per day). Its stability and interval are kept. | Practice happens out of schedule. Counting a success would inflate intervals, because the item was shown recently or recognised from multiple choice. Anki's "custom study / preview" and Quizlet Learn don't feed the long-term schedule either. A failure is real evidence that memory is weaker than predicted, so the word is checked sooner. The FSRS rating itself is then made in a proper spaced retrieval, which keeps the model calibrated. |
| Ghép thẻ (Match) | Logged as exposure only | No effect | Match is a timed recognition game with elimination cues, so its errors are mostly mis-taps and say little about recall. |
| Luyện nói | Pronunciation history only (`S.pron`) | – | Pronunciation is a separate skill from recall of meaning. |

New-word introduction respects the daily new limit set in onboarding or Settings ("Tất cả" = no limit, which is the default for this user, or 10/25/50).

## Word browser
Danh sách từ has filter chips with counts (Tất cả, Mới, Đang học, Đang ôn, Thành thạo, Hay quên, Tạm ngưng / ẩn). Tapping a word opens a sheet with its state, reviews, lapses, next due date, retrievability, stability, difficulty, and a merged history of FSRS reviews and practice evidence. The sheet also has these actions: Tạm ngưng / Mở lại, Ẩn đến mai / Bỏ tạm ẩn, and Học lại từ đầu (reset to New, which needs a second tap to confirm).

## Data safety
Schema 8 migration only adds `ev:{}` and `set.fcMode='sched'`. Existing `srs`, `revlog`, `log`, `learn` and `miss` are untouched (verified by the test: 40 seeded cards survive the 7→8 migration).
