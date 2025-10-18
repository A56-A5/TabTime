let activeTabId = null;
let activeDomain = null;
let startTime = Date.now();

async function updateTime() {
  if (!activeDomain) return;
  const now = Date.now();
  const todayStr = new Date().toISOString().slice(0, 10);
  const stored = await chrome.storage.local.get(["timeData", "timeDataByDate", "lastResetDate"]);
  let timeData = stored.timeData || {};
  let timeDataByDate = stored.timeDataByDate || {};
  const lastResetDate = stored.lastResetDate;

  if (lastResetDate !== todayStr) {
    if (lastResetDate && Object.keys(timeData).length) {
      timeDataByDate[lastResetDate] = {
        ...(timeDataByDate[lastResetDate] || {}),
        ...Object.fromEntries(
          Object.entries(timeData).map(([site, ms]) => [
            site,
            (timeDataByDate[lastResetDate]?.[site] || 0) + ms,
          ])
        ),
      };
    }
    timeData = {};
    await chrome.storage.local.set({
      timeData,
      timeDataByDate,
      lastResetDate: todayStr,
    });
    startTime = now;
    return;
  }

  const elapsed = now - startTime;
  timeData[activeDomain] = (timeData[activeDomain] || 0) + elapsed;
  if (!timeDataByDate[todayStr]) timeDataByDate[todayStr] = {};
  timeDataByDate[todayStr][activeDomain] =
    (timeDataByDate[todayStr][activeDomain] || 0) + elapsed;

  await chrome.storage.local.set({
    timeData,
    timeDataByDate,
    lastResetDate: todayStr,
  });

  const sortedDays = Object.keys(timeDataByDate).sort();
  if (sortedDays.length > 30) {
    for (let i = 0; i < sortedDays.length - 30; i++) {
      delete timeDataByDate[sortedDays[i]];
    }
    await chrome.storage.local.set({ timeDataByDate });
  }

  startTime = now;
}

async function setActiveTab(tabId) {
  if (tabId === activeTabId) return;
  await updateTime();
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) {
      activeDomain = null;
      activeTabId = null;
      return;
    }
    const url = new URL(tab.url);
    const hostname = url.hostname.replace(/^www\./, "");
    const ignoreList = [
      "chrome",
      "opera",
      "brave",
      "edge",
      "vivaldi",
      "about",
      "startpage",
      "settings",
      "extensions",
      "newtab",
    ];
    if (ignoreList.some((k) => hostname.toLowerCase().includes(k))) {
      activeDomain = null;
      activeTabId = tabId;
      return;
    }
    activeDomain = hostname;
    activeTabId = tabId;
    startTime = Date.now();
  } catch {
    activeTabId = null;
    activeDomain = null;
  }
}

chrome.tabs.onActivated.addListener((info) => setActiveTab(info.tabId));
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (tabId === activeTabId && changeInfo.url) {
    await updateTime();
    try {
      const hostname = new URL(changeInfo.url).hostname.replace(/^www\./, "");
      if (hostname !== activeDomain) {
        activeDomain = hostname;
        startTime = Date.now();
      }
    } catch {
      activeDomain = null;
    }
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await updateTime();
    activeTabId = null;
    activeDomain = null;
  } else {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab) await setActiveTab(tab.id);
  }
});

chrome.alarms.create("tick", { periodInMinutes: 1 / 12 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "tick") updateTime();
});

(async () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const stored = await chrome.storage.local.get([
    "timeData",
    "timeDataByDate",
    "lastResetDate",
  ]);
  if (!stored.timeData) stored.timeData = {};
  if (!stored.timeDataByDate) stored.timeDataByDate = {};
  if (!stored.lastResetDate) stored.lastResetDate = todayStr;
  await chrome.storage.local.set({
    timeData: stored.timeData,
    timeDataByDate: stored.timeDataByDate,
    lastResetDate: stored.lastResetDate,
  });
})();
