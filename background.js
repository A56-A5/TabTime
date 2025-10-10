let activeTabId = null;
let activeDomain = null;
let startTime = Date.now();

async function updateTime() {
  if (!activeDomain) return;

  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  const stored = await chrome.storage.local.get(["timeData", "lastReset"]);
  const lastReset = stored.lastReset || 0;

  if (today > lastReset) {
    await chrome.storage.local.set({ timeData: {}, lastReset: today });
    startTime = now;
    return;
  }

  const elapsed = now - startTime;
  const timeData = stored.timeData || {};
  timeData[activeDomain] = (timeData[activeDomain] || 0) + elapsed;
  await chrome.storage.local.set({ timeData });

  startTime = now;
}

async function setActiveTab(tabId) {
  if (tabId === activeTabId) return;
  await updateTime();

  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url) {
      const url = new URL(tab.url);
      const hostname = url.hostname.replace(/^www\./, ""); 
      activeDomain = hostname;
      activeTabId = tabId;
      startTime = Date.now();
    }
  } catch {
    activeTabId = null;
    activeDomain = null;
  }
}

chrome.tabs.onActivated.addListener((info) => setActiveTab(info.tabId));

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    setActiveTab(tabId);
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
  const today = new Date().setHours(0, 0, 0, 0);
  const data = await chrome.storage.local.get("lastReset");
  if ((data.lastReset || 0) < today) await chrome.storage.local.set({ timeData: {}, lastReset: today });
})();
