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
  "leetcode.com": "LeetCode",
  "hianime.to": "Anime",
  "in.pinterest.com": "Pinterest"
};

function formatTime(ms){
  const s = Math.floor(ms/1000);
  const h = Math.floor(s/3600);
  const m = Math.floor((s%3600)/60);
  const sec = s%60;
  return `${h}h ${m}m ${sec}s`;
}

function loadTimeData(){
  chrome.storage.local.get({timeData:{}}, (data)=>{
    const list = document.getElementById("time-list");
    list.innerHTML = "";
    const timeData = data.timeData || {};
    const entries = Object.entries(timeData);
    if(!entries.length){
      list.innerHTML="<p>No data yet</p>";
      return;
    }
    entries.sort((a,b)=>b[1]-a[1]);
    let total=0;
    for(const [site, ms] of entries){
      total+=ms;
      const friendlyName = SITE_NAME_MAP[site]||site;
      const div = document.createElement("div");
      div.className="site-item";
      div.textContent=`${friendlyName}: ${formatTime(ms)}`;
      list.appendChild(div);
    }
    const totalEl=document.getElementById("total-time");
    if(totalEl) totalEl.textContent=`Total: ${formatTime(total)}`;
  });
}

setInterval(loadTimeData,1000);

document.getElementById("reset-btn").addEventListener("click",()=>{
  chrome.storage.local.set({
    timeData:{},
    timeDataByDate:{},
    lastResetDate:new Date().toISOString().slice(0,10)
  }, loadTimeData);
});

document.querySelectorAll(".tab-btn").forEach((btn)=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById("list-tab").style.display = tab==="list"?"block":"none";
    document.getElementById("chart-tab").style.display = tab==="chart"?"block":"none";
    if(tab==="chart") loadWeeklyChart();
  });
});
async function loadWeeklyChart() {
  const { timeDataByDate } = await chrome.storage.local.get("timeDataByDate");
  const data = timeDataByDate || {};

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().slice(0, 10));
  }

  const dayLabels = days.map(d => {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  });

  const siteTotals = {};
  for (const d of days) {
    const dayData = data[d] || {};
    for (const [site, ms] of Object.entries(dayData)) {
      siteTotals[site] = (siteTotals[site] || 0) + ms;
    }
  }

  const topSites = Object.entries(siteTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([site]) => site);

  const datasets = topSites.map((site) => ({
    label: SITE_NAME_MAP[site] || site,
    data: days.map(d => (data[d]?.[site] || 0) / 1000 / 60),
    borderColor: "#" + Math.floor(Math.random() * 16777215).toString(16),
    fill: false
  }));

  const ctx = document.getElementById("weekly-chart").getContext("2d");
  if (window.weeklyChart) window.weeklyChart.destroy();

  window.weeklyChart = new Chart(ctx, {
    type: "line",
    data: { labels: dayLabels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      scales: {
        y: { title: { display: true } },
        x: { title: { display: true } },
      },
    },
  });
}

