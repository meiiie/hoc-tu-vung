# Word lifecycle (current v22; history from v16/v17 retained)

Every mode reads from one lifecycle record per word: `S.srs[id]` for the English to Vietnamese card, plus `id~r` for the reverse card when two-way review is on. Only scheduled answers in Ôn theo lịch change FSRS memory state. Thẻ ghi nhớ remains free practice, as decided in v17. Other modes write *evidence* (`S.ev[id]`), and a failed recall can bring a card forward. New-word suggestions stay in the selected day/filter, prioritizing starred words and recent practice exposure within that scope, with no CEFR gate. It never changes stability, difficulty or interval.

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
| Ôn ổn định (internal key: mastered) | Review and stability ≥ 21 days (SM-2: interval ≥ 21) | Anki "mature" (≥ 21 d); Quizlet "Mastered" |

This is a scheduling milestone, not a claim of language mastery or a terminal state. The 21-day threshold is a UI heuristic, not a validated proficiency test. A lapse sends the word back to Relearning, as in Anki. This differs from Duolingo and Memrise, which let mastered items "decay" visually but don't track them.

## Flashcards vs. Ôn theo lịch (v17 decision)
v16 put two modes inside Thẻ ghi nhớ ("Theo lịch" / "Lướt tự do"). Testing on a real iPhone showed this was confusing: it was a hidden mode, the same screen behaved two ways, and the toggle was easy to miss. v17 separates them again (option A):
* **Ôn theo lịch** is the *only* place where the schedule changes. It has 4 buttons (Lại / Khó / Được / Dễ) with intervals, and labelled counters (Mới / Học / Ôn).
* **Thẻ ghi nhớ** is free browsing of the whole deck. It never changes stability or interval. "Đang học" counts as practice evidence, as in the table below.

This matches the market leaders. Anki has one scheduled path ("Study Now"), and Custom Study/preview don't affect scheduling by default. Quizlet keeps Flashcards (browse; "track progress" only sorts the current round) separate from Learn/spaced review. Duolingo has one primary "next lesson" path and practice outside it. One obvious place where the schedule changes means lower cognitive load and no hidden state. Merging (option B) would only help users who never open the review screen, and the home screen already makes Ôn theo lịch the primary button with its due count.

## Evidence from the other modes
| Mode | Success | Failure | Why |
|---|---|---|---|
| Thẻ ghi nhớ, Học, Nghe–chép, Kiểm tra | Logged. It can prioritize a word for a future scheduled introduction, but does not consume the scheduled new-word quota. | Logged, and `S.miss` is incremented (feeds Từ khó). If the word is in Review and due later than tomorrow, it is brought forward to tomorrow (at most once per day). Its stability and interval are kept. | Practice happens out of schedule. Counting a success would inflate intervals, because the item was shown recently or recognised from multiple choice. Anki's "custom study / preview" and Quizlet Learn don't feed the long-term schedule either. A failure is real evidence that memory is weaker than predicted, so the word is checked sooner. The FSRS rating itself is then made in a proper spaced retrieval, which keeps the model calibrated. |
| Ghép thẻ (Match) | Logged as exposure only | No effect | Match is a timed recognition game with elimination cues, so its errors are mostly mis-taps and say little about recall. |
| Luyện nói | Pronunciation history only (`S.pron`) | – | Pronunciation is a separate skill from recall of meaning. |

New-word introduction uses the selected day/filter with a distinct-word quota per day group (default 25; settings 0/5/10/25). Selecting another group permits more new words immediately, as requested by the user. All-days selection uses the aggregate quota. Due and learning cards remain global. A new direction of an already introduced word has a separate cap equal to that quota. See LEARNING_PLAN.md for schema 9 migration, 04:00 boundaries, global due reviews, sibling burying and undo.

## Word browser
Danh sách từ has filter chips with counts (Tất cả, Mới, Đang học, Đang ôn, Ôn ổn định, Hay quên, Tạm ngưng / ẩn). Tapping a word opens a sheet with its state, reviews, lapses, next due date, retrievability, stability, difficulty, and a merged history of FSRS reviews and practice evidence. The sheet also has these actions: Tạm ngưng / Mở lại, Ẩn đến mai / Bỏ tạm ẩn, and Học lại từ đầu (reset to New, which needs a second tap to confirm).

## Data safety
Schema 8 migration only adds `ev:{}` and `set.fcMode='sched'`. Existing `srs`, `revlog`, `log`, `learn` and `miss` are untouched (verified by the test: 40 seeded cards survive the 7→8 migration).

Schema 9 preserves SRS memory and notes, clears obsolete day/page filters with a migration record, seeds word introductions from available review history, and tracks daily introductions independently of calendar answer logs. Labels use Ôn ổn định, not Thành thạo.

Schema 10 removes legacy lesson selection and lesson filters, retaining notes,
SRS memory, introductions and the current daily quota. Old lesson links return
home. See OXFORD_AND_LEARNER_UX.md for the v21 design and source audit. CEFR
is reference metadata, never a prerequisite. LEARNING_PLAN.md records the
superseded v20 lesson design; its quota, undo and sibling rules remain valid.

Schema 11 restores numbered study-day groups capped at 25 members, independent
of CEFR. It retains the existing daily ID ledger and scopes usage by group
membership. Filtering within a group cannot reset the budget. See STUDY_DAYS.md
for the current design, including preserved legacy selection and pace migration.
