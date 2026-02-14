let isLocked = false;
let fadeTimeout;

const indicator = document.createElement("div");

indicator.style.cssText = `
    position: fixed !important;
    z-index: 2147483647 !important;
    
    padding: 20px 36px !important;
    border-radius: 24px !important;
    
    background: rgba(10, 10, 10, 0.15) !important;
    backdrop-filter: blur(30px) saturate(110%) !important;
    -webkit-backdrop-filter: blur(30px) !important;
    
    border: 1px solid rgba(255, 255, 255, 0.08) !important;

    color: rgba(255, 255, 255, 0.95) !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 20px !important;
    font-weight: 500 !important;
    letter-spacing: 0.5px !important;
    
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    
    box-shadow: 
        0 15px 40px rgba(0,0,0,0.15),
        0 0 0 1px rgba(255,255,255,0.05) inset !important;
    
    pointer-events: none !important;
    
    opacity: 0 !important;
`;

const updatePosition = () => {
  if (window.visualViewport) {
    const viewport = window.visualViewport;
    const left = viewport.offsetLeft + viewport.width / 2;
    const top = viewport.offsetTop + viewport.height / 2;
    const scale = viewport.scale;

    indicator.style.left = `${left}px`;
    indicator.style.top = `${top}px`;
    indicator.style.transform = `translate(-50%, -50%) scale(${1 / scale})`;
  } else {
    indicator.style.left = "50%";
    indicator.style.top = "50%";
    indicator.style.transform = "translate(-50%, -50%)";
  }
};

const mountIndicator = () => {
  if (!document.documentElement.contains(indicator))
    document.documentElement.appendChild(indicator);
  updatePosition();
};

if (document.documentElement) mountIndicator();
else document.addEventListener("DOMContentLoaded", mountIndicator);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updatePosition);
  window.visualViewport.addEventListener("scroll", updatePosition);
}

window.addEventListener("resize", updatePosition);
window.addEventListener("scroll", updatePosition);

document.addEventListener(
  "wheel",
  (e) => {
    if (!isLocked) return;

    if (e.ctrlKey) {
      e.preventDefault();
      return;
    }

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      return;
    }
  },
  { passive: false },
);

document.addEventListener(
  "gesturestart",
  (e) => {
    if (isLocked) e.preventDefault();
  },
  { passive: false },
);

document.addEventListener(
  "gesturechange",
  (e) => {
    if (isLocked) e.preventDefault();
  },
  { passive: false },
);

document.addEventListener("keydown", (e) => {
  if (e.altKey && e.code === "KeyL") {
    isLocked = !isLocked;
    showHud(isLocked);

    chrome.runtime.sendMessage({
      action: "updateIcon",
      locked: isLocked,
    });
  }
});

function showHud(locked) {
  mountIndicator();
  updatePosition();

  if (fadeTimeout) clearTimeout(fadeTimeout);

  if (locked)
    indicator.innerHTML = `
            <span style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">🔒</span> 
            <span>Locked</span>
        `;
  else
    indicator.innerHTML = `
            <span style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">🔓</span> 
            <span>Unlocked</span>
        `;

  indicator.style.transition = "opacity 0.2s ease-out";

  requestAnimationFrame(() => {
    indicator.style.opacity = "1";
  });

  fadeTimeout = setTimeout(() => {
    indicator.style.transition = "opacity 0.4s ease-in-out";
    indicator.style.opacity = "0";
  }, 1500);
}
