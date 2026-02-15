chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "updateIcon" && sender.tab) {
    const iconPath = request.locked ? "anchor-red.png" : "anchor.png";

    fetch(chrome.runtime.getURL(iconPath))
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then((imageBitmap) => {
        const canvas = new OffscreenCanvas(128, 128);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imageBitmap, 0, 0, 128, 128);
        return ctx.getImageData(0, 0, 128, 128);
      })
      .then((imageData) => {
        chrome.action.setIcon(
          {
            imageData: imageData,
            tabId: sender.tab.id,
          },
          () => {
            if (chrome.runtime.lastError)
              console.error(
                "Icon update failed:",
                chrome.runtime.lastError.message,
              );
            else console.log("Icon updated successfully to:", iconPath);
          },
        );
      })
      .catch((error) => {
        console.error("Failed to load icon:", error);
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
