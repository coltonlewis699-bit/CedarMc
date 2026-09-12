CEDARMC TICKET DASHBOARD v1
===========================

WHAT THIS VERSION DOES
- Gives bot.cedarmc.org a /dashboard/ Tickets editor.
- Live Discord-style preview.
- Edit ticket panel title, description, footer, color and the 4 button labels/colors.
- Load Discord text channels from the CedarMC server.
- Save the ticket panel settings on the bot host.
- Send a new ticket panel to a selected Discord channel.
- Keeps the existing ticket button custom IDs, so your current ticket system still handles the buttons.

IMPORTANT SECURITY
- Your Discord bot token NEVER goes into the GitHub website.
- CEDARMC_DASHBOARD_KEY is stored only on the bot host.
- The dashboard asks you to type the key when connecting.
- Do not upload your .env file or dashboard key to GitHub.

FILES
website/dashboard/
  index.html
  dashboard.css
  dashboard.js

bot/
  dashboard-api.js
  ticket-dashboard.js
  ticket-dashboard-config.json

BOT SETUP (DO NOT DO THIS UNTIL WE SET UP THE API ADDRESS)
1. Put the 3 bot files beside index.js / ticket.js.
2. Add to your bot environment:
   CEDARMC_DASHBOARD_KEY=<a long random private key>
   CEDARMC_DASHBOARD_PORT=8787
   CEDARMC_DASHBOARD_ORIGIN=https://bot.cedarmc.org
3. In index.js add:
   const { startDashboardApi } = require("./dashboard-api");
   Then inside ClientReady, after the bot is ready:
   startDashboardApi(client);

WEBSITE SETUP
Copy the website/dashboard folder into the GitHub Pages repository.
It will be available at:
https://bot.cedarmc.org/dashboard/

NEXT STEP
We still need to give the bot API a PUBLIC HTTPS address before the live GitHub Pages dashboard can connect to it.
Do not expose the Discord bot token or put the dashboard key into dashboard.js.
