let iconCache = {};

async function loadIconData(path) {
  const response = await fetch(chrome.runtime.getURL(path));
  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(128, 128);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageBitmap, 0, 0, 128, 128);
  return ctx.getImageData(0, 0, 128, 128);
}

async function preloadIcons() {
  const [unlocked, locked] = await Promise.all([
    loadIconData("anchor.png"),
    loadIconData("anchor-red.png"),
  ]);
  iconCache = { unlocked, locked };
}

preloadIcons().catch((error) =>
  console.error("Failed to preload icons:", error),
);

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "updateIcon" && sender.tab) {
    const imageData = request.locked ? iconCache.locked : iconCache.unlocked;

    if (!imageData) {
      console.warn("Icon cache not ready, skipping update.");
      return;
    }

    chrome.action.setIcon({ imageData, tabId: sender.tab.id }, () => {
      if (chrome.runtime.lastError)
        console.error("Icon update failed:", chrome.runtime.lastError.message);
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) chrome.tabs.sendMessage(tab.id, { action: "toggleLock" });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-lock") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id)
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleLock" });
    });
  }
});
