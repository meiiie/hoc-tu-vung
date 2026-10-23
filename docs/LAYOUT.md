# v14 wide-screen layout and review UX

## Breakpoints
- **Below 768 px:** the mobile layout is unchanged. The sidebar and the right panel are not rendered (`display:none`).
- **768–1023 px (tablet):** an icon sidebar (76 px). Each link keeps its text label for screen readers and shows it as a tooltip. The study column is up to 640 px, and home shows modes in 3 columns.
- **1024 px and up:** a sidebar with labels (224 px) on the left. In the middle, the study column: cards are 560 px; home, the word list and statistics are up to 980 px. On the right, a 300 px panel with today's progress (goal ring, streak, new/learning/review counts, next due time, an "Ôn ngay" button), a keyboard-shortcut list for the current mode, and Neko. At 1440 px and up the side columns are 248 and 340 px.
- The sidebar and the right panel are sticky and scroll independently. They are drawn for every screen in `chrome()`, called from `route()`. The right panel's numbers refresh after every save.

## Patterns studied (briefly)
- **Duolingo web:** a fixed left sidebar with the active item highlighted as a pill; the learning path in the centre; a right column with streak, daily quests and progress cards. Source: Screenrove capture "Duolingo / Learn path", 2026-09-24, https://screenrove.com/duolingo/product/duolingo-product-learn
- **Anki:** the answer buttons show the next interval; Good is the normal answer ("80–95% of the time"); shortcuts are 1–4 and Space/Enter = Good; Hard means "correct, but you had doubts or it took a long time", not a wrong answer. Sources: Anki Manual, Studying, https://docs.ankiweb.net/studying.html, and Deck Options (on FSRS: pressing Hard when you forgot makes intervals too long), https://docs.ankiweb.net/deck-options.html
- **Quizlet web:** cards centred in a narrow study column, with navigation by on-screen buttons and arrow keys (from general product knowledge; no capture cited).

## Review UX
- On home, the main button is **Ôn theo lịch**. It reads "Hôm nay cần ôn N thẻ", or, when nothing is due, gives the next due time (`nextDueAt`).
- In **Thẻ ghi nhớ**, a one-line note says it is extra practice that does not change the review schedule, with a link to Ôn theo lịch.
- In the rating row, **Được** is the largest button and is filled. Every button shows its interval. Keys 1–4 rate the card; Space reveals the answer, then rates it Được.
- A one-time tip explains the buttons: Lại = forgot, Khó = remembered but with great effort (not wrong), Được = normal, Dễ = instant. It is dismissed with "Đã hiểu" and saved as `set.gtip`.
