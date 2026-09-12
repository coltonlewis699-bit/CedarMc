CEDARMC WEBSITE - UPDATED

Files to upload to the root of your GitHub Pages repository:
- index.html
- style.css
- script.js
- cedarmc-welcome.png
- ticket-support.png

IMPORTANT:
The HTML now expects these image files in the SAME root folder as index.html:
- cedarmc-welcome.png
- ticket-support.png

This fixes the old broken image path issue where the website looked inside an /assets/ folder that did not exist.

DISCORD LINK:
Open script.js and replace:
  discordUrl: '#',
with your real invite, for example:
  discordUrl: 'https://discord.gg/yourinvite',

LIVE STATUS:
The site is ready to use a status API later. Replace:
  statusApi: ''
with your API endpoint when one is available.

SERVER ADDRESS:
The Copy IP buttons use:
  CedarMc.org

GitHub Pages may take a minute or two to show a new commit after upload.
