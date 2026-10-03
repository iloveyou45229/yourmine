I WANNA BE YOURS — FIVE-DAY LOVE WEBSITE
========================================

FILES
- index.html   Main website structure
- style.css    Responsive styling and animations
- app.js       Games, five-day schedule, streak, music, persistence, birthday reveal
- assets/      Put your photo here

ADD YOUR PHOTO
1. Open the assets folder.
2. Copy the picture you shared into it.
3. Rename the picture exactly: love-photo.jpg
   (If your image is PNG, either convert it to JPG or change PHOTO in app.js to assets/love-photo.png.)
The website crops the image into four equal quadrants in the reveal grid. Day 2 reveals I, Day 3 reveals LOVE, Day 4 reveals YOU, and the birthday heart game reveals the full photo.

START THE FIVE-DAY JOURNEY
- Open index.html in a modern browser on the device you intend her to use.
- Day 1 starts on the first opening, at the exact time opened, and ends at 3:59 AM the next day.
- Day 2 starts at 4:00 AM the next day; Day 2 and Day 3 end at 3:59 AM the following day.
- Day 4 starts at 4:00 AM and ends at midnight; Day 5 starts at midnight four calendar dates after the first-open date.
- Therefore, open the website for the first time on the calendar date four days before her birthday. Keep the same browser/device throughout.
- The clock uses the device's local time. Set its date/time correctly.

SAVING / LOVE ID
- A LOVE ID and game progress are saved in localStorage in that browser.
- Returning to the same browser/device keeps progress. Private/incognito mode, clearing browser data, or switching devices may lose progress.
- For cross-device progress, a hosted website would need a real backend/database and a sign-in system; this project is offline-friendly and has no server.
- The display marks a day complete after its scheduled day passes, even if the game was skipped. Winning a game awards the heart immediately; the 10-minute target is not a lock.

MUSIC
- A soft original synthesized melody plays when the browser allows sound. Browsers commonly block audible autoplay until the visitor interacts with the page. If silent, tap “Music on” once. The melody changes by day; it is not a recording of commercial songs.

BIRTHDAY VIDEO
- The “Don't click me” button opens the Google Drive preview for the supplied video link. If Drive permissions prevent playback, use “Open surprise in Google Drive”.

RUN LOCALLY
Double-click index.html, or serve this folder with a local static server. For example, from this folder run:
  python -m http.server 8000
Then open http://localhost:8000

IMPORTANT
This is a client-side website. It cannot enforce an unchangeable clock or preserve data after browser storage is deleted. Test the full schedule and photo on the intended device before sharing it.
