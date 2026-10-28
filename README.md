# Indeed Job Ad Copier

A tiny Chrome extension: on any Indeed job ad, one click copies the whole ad as clean, structured text — ready to paste into notes, a tracker, or an AI assistant to tailor your resume and cover letter.

## What gets copied

```
Job Title: Senior Software Engineer
Company: Example Pty Ltd
Details: Sydney NSW | 4.1 out of 5 stars
URL: https://au.indeed.com/viewjob?jk=…

Job Description:
About the role
We're looking for …

What you'll do
- Build and maintain …
- Work with …
```

Bullet lists in the description are kept as `- item` lines and paragraphs stay separated, so the text reads the same as the ad.

## Install

1. Clone or download this repo.
2. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select the folder.
3. Pin the extension from the puzzle-piece menu.

## Use

Open an Indeed job ad, then click the extension icon or press **Alt+Shift+I**. A green toast confirms the copy; a red one names anything it couldn't find (title, company or description).

No extension? Paste the contents of [`copy-job-ad.js`](copy-job-ad.js) into the DevTools console on the job page — it works the same way.

## How it finds things

Indeed's CSS class names are generated, so the script relies on Indeed's `data-testid` attributes (`desktop-job-header`, `vj-job-title`, `company-info-metadata`). The description container has no stable attribute, so it starts at the *Full job description* heading (`vj-job-description-heading`) and walks up the page until it reaches the element holding the description HTML.

## Privacy

Runs only on the tab you click it on (`activeTab`), only when you click. No network requests, no storage, no tracking.

## Disclaimer

Not affiliated with or endorsed by Indeed. For personal use on job ads you're viewing.

## License

[MIT](LICENSE)
