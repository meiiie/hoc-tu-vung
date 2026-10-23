# Layout (v15): the mobile UI, centred, at every width

v14 added a left sidebar and a right panel on wide screens. The user found it unfriendly, so v15 removes both at every width. Tablets and desktops now get the same single-column mobile UI, centred.

## What changes with width
- **Below 768 px:** exactly the mobile layout.
- **768 px and up:**
  - The content column is at most 600 px on study screens and 720 px on home, with the header aligned to the same column.
  - Home keeps the "Hôm nay" card (goal, streak), the main "Ôn theo lịch" button with the due count, and a 2-column grid of modes.
  - Type is slightly larger: body 16 px instead of 15, headings scaled to match.
  - The page background is a soft tint.
  - Settings and other sheets open as a centred dialog instead of a bottom sheet.
  - The word list stays the mobile list, with search and a sort menu.
- **Mouse and trackpad (hover-capable pointers):**
  - Hover states on mode cards, list rows and rating buttons.
  - A "?" button in the header (or the `?` key) opens a keyboard-shortcut sheet for the current screen.
  - Shortcuts work as before: Space, ← →, 1–4, Z.
- **Everywhere:** focus rings on interactive elements. Kept from v14: the Flashcards note, the dominant Được button, Space = Được, and the one-time rating tip.

## References (briefly)
- **Quizlet:** the 2021 study-modes redesign "removed the sidebar and improved global nav so students can more easily focus on the content front and center". It reports +9% one-day retention in Learn. Vickie Chiang, "Quizlet Study Modes Redesign", https://vickiechiang.medium.com/quizlet-study-modes-redesign-d80c6fd509c7
- **Duolingo:** lessons are "full-screen with no navigation". There is a top progress row and one primary action, and celebration screens are single centred cards. Only the browsing/home path uses a sidebar. Screenrove, "Duolingo design system", https://screenrove.com/duolingo/design
- **Material Design 3 / Android adaptive guidance:** under 600 dp, use a single pane with 16 dp margins. Window size classes are about available width, not device type. Use larger multi-pane layouts only when the content benefits (for example list–detail). A single-task study flow doesn't, so we keep one pane and limit its line length. Sources: https://m3.material.io/foundations/layout/breakpoints/compact and https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes
- **Focus apps such as Things and Linear:** a centred, readable content column with generous whitespace. This one comes from general product knowledge; I have no capture to cite.
- **Anki:** for the rating buttons, Good is the default and Space/Enter = Good. https://docs.ankiweb.net/studying.html

## Review UX (unchanged from v14)
See the README sections for v14 and v15.
