const SITE_NAME_MAP = {
  "youtube.com": "YouTube",
  "mail.google.com": "Gmail",
  "google.com": "Google",
  "chat.openai.com": "ChatGPT",
  "reddit.com": "Reddit",
  "instagram.com": "Instagram",
  "facebook.com": "Facebook",
  "x.com": "X (Twitter)",
  "twitter.com": "Twitter",
  "linkedin.com": "LinkedIn",
  "github.com": "GitHub",
  "stackoverflow.com": "Stack Overflow",
  "netflix.com": "Netflix",
  "open.spotify.com": "Spotify",
  "spotify.com": "Spotify",
  "medium.com": "Medium",
  "twitch.tv": "Twitch",
  "discord.com": "Discord",
  "docs.google.com": "Google Docs",
  "drive.google.com": "Google Drive",
  "classroom.google.com": "Google Classroom",
  "zoom.us": "Zoom",
  "meet.google.com": "Google Meet",
  "monkeytype.com": "Monkeytype",
  "github.com": "GitHub",
  "leetcode.com": "LeetCode",
  "instagram.com": "Instagram",
  "hianime.to": "Anime",
  "newtab": "AFK",
  "in.pinterest.com": "Pinterest",
};

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

function loadTimeData() {
  chrome.storage.local.get({ timeData: {} }, (data) => {
    const list = document.getElementById("time-list");
    list.innerHTML = "";
    const entries = Object.entries(data.timeData);

    if (!entries.length) {
      list.innerHTML = "<p>No data yet</p>";
      return;
    }

    entries.sort((a, b) => b[1] - a[1]);
    let total = 0;

    for (const [site, ms] of entries) {
      total += ms;
      const friendlyName = SITE_NAME_MAP[site] || site; 
      const div = document.createElement("div");
      div.textContent = `${friendlyName}: ${formatTime(ms)}`;
      list.appendChild(div);
    }

    const totalEl = document.getElementById("total-time");
    if (totalEl) totalEl.textContent = `Total: ${formatTime(total)}`;
  });
}

setInterval(loadTimeData, 1000);

document.getElementById("reset-btn").addEventListener("click", () => {
  chrome.storage.local.set({ timeData: {} }, loadTimeData);
});
