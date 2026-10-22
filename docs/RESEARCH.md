# Research notes behind v7

This file records what v7 is based on and how carefully each source was read.
- **Read in full** means the page or paper itself was read.
- **Snippet only** means only search-result summaries were seen, so treat those claims as second-hand.

## Sources

| # | Source | How it was read | What we took from it |
|---|--------|-----------------|----------------------|
| 1 | P. Woźniak, *Effective learning: Twenty rules of formulating knowledge* (SuperMemo, supermemo.com) | Read in full | Minimum information principle; cloze deletion; mnemonic techniques; combat interference; redundancy is fine (two-way cards); "learn before you memorise". |
| 2 | B. Settles & B. Meeder, *A Trainable Spaced Repetition Model for Language Learning*, ACL 2016 (aclanthology.org/P16-1174) | Read in full | Half-life regression `p = 2^(-Δ/h)`. Duolingo grades typed answers and shows the learner a letter-level diff of their mistake. HLR improved daily active-user retention by about 12% in their experiment. |
| 3 | Quizlet Help Center, *Studying with Learn*, plus Quizlet blog posts on how Learn picks question formats | Snippet only | Learn moves each term from multiple choice to written recall once it is recognised. Written answers are lenient on capitalisation and punctuation. Hints fade as mastery grows. |
| 4 | Duolingo Help Center on streaks and Streak Freeze; Duolingo blog post on improving the streak | Snippet only | Separating "kept your streak" from "met your daily goal" raised 14-day retention by about 3.3% in their test. Streak freezes protect missed days. |
| 5 | Memrise blog on mems, and Memrise Help *Difficult words* | Snippet only | Learner-made mnemonics ("mems"). Difficult words are collected automatically from mistakes and practised in short sessions (about 20 words at most). |
| 6 | Clozemaster FAQ | Snippet only | Words are learned inside real sentences by blanking one word (cloze). There is also a cloze-listening mode. |
| 7 | Dunlosky et al. (2013), *Improving Students' Learning With Effective Learning Techniques*, Psychological Science in the Public Interest 14(1) | Snippet only (abstract and summaries) | Practice testing and distributed practice are rated *high utility*. The keyword mnemonic is rated *low utility*, which is why notes are optional and learner-written. |
| 8 | Roediger & Karpicke (2006), *Test-Enhanced Learning*, Psychological Science 17(3) | Snippet only | Testing effect: retrieval beats restudy for long-term retention. |
| 9 | E. L. Bjork & R. A. Bjork (2011), *Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning* | Snippet only | Spacing, interleaving, varied practice, testing and generation are all desirable difficulties. |
| 10 | FSRS / ts-fsrs and Anki (already used in v6; see README) | Read in v6 | The scheduler assumes reviews happen at scheduled times. |

Not read at all, so not relied on:
- Paivio's dual-coding papers. Audio and text pairing was already in the app.
- Memrise native-speaker video.
- Any primary source on notification ethics. Our "no guilt, no notifications" policy is a design choice, not a cited result.

## Decisions

1. **Learn mode climbs 4 steps per word: choice → typed recall → cloze in its own example sentence → dictation.**
   - Sources 3, 6, 8 and 9.
   - The order goes from recognition to production, and each step is a harder retrieval.
   - A miss drops the word one step. Wrong answers are corrected right away, with the example sentence shown.
   - If the word can't be found in its example, the cloze step is skipped. Simple inflections (-s, -ed, -ing; final e/y) are allowed.
2. **Typo tolerance with a visible diff.**
   - Sources 2 and 3.
   - Damerau–Levenshtein distance is used:
     - Answers of 4–7 letters may have one edit.
     - Answers of 8 or more letters may have two edits.
     - Words of 3 letters or fewer must be exact.
   - A near-miss counts as correct and is labelled *Gần đúng*. The expected word is shown with missing letters underlined and wrong ones struck through.
   - An "I was right" override covers answers the checker can't know about, such as valid synonyms.
3. **Streak separated from the daily goal, with earned freezes.**
   - Source 4.
   - Any answer in any mode keeps the streak.
   - The daily goal (10/20/50/100 answers) is shown separately.
   - You earn one freeze for every 7 days of streak, holding at most 2.
   - Freezes cover missed days automatically. Frozen days keep the streak alive but don't add to it.
   - There are no purchases, no push notifications and no guilt copy. The mascot never looks sad about a missed day.
4. **Difficult words (`#/hard`).**
   - Source 5.
   - A word lands here if you missed it in practice, it lapsed in review, it is a leech, or you starred it.
   - Sessions hold at most 12 words. Each question is typed recall, cloze or dictation (interleaved, source 9).
5. **Personal mnemonic note per word.**
   - Sources 1 and 5, tempered by source 7.
   - It is optional, written by the learner, and shown on the card back and in Learn feedback.
6. **The schedule is untouched by practice modes.**
   - Source 10.
   - FSRS stability updates assume each review happens at its scheduled time. Counting extra practice reviews would inflate stability, so Learn, Từ khó, Nghe – chép and Kiểm tra never change the scheduled review data.
   - Practice misses still feed *Từ khó*.

## Mascot

- Neko is the cat from the Wiii brand system (github.com/meiiie/wiii, `docs/assets/brand/neko-family-v1`).
- It is redrawn by hand from the Peek mark's paths. The colours come from the brand palette: Milk, Cocoa, Cocoa Lift, and Sky as an accent only.
- Per `BRAND_SYSTEM.md`, Neko expresses itself only through its eyes and pose:
  - no mouth, paws or accessories;
  - no sad face, so the "sad" state is a *concerned* pose and the message is carried by the text;
  - no endless bouncing.
- Under `prefers-reduced-motion`, all animation stops.
