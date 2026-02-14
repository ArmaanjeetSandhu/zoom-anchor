let isLocked = false;
let fadeTimeout;

const indicator = document.createElement("div");

indicator.style.cssText = `
    position: fixed !important;
    z-index: 2147483647 !important;
    
    padding: 25px 40px !important;
    border-radius: 16px !important;
    
    background: rgba(30, 30, 30, 0.2) !important;
    backdrop-filter: blur(15px) !important;
    -webkit-backdrop-filter: blur(45px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;

    color: white !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 22px !important;
    font-weight: 600 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    
    box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
    
    pointer-events: none !important;
    
    opacity: 0 !important;
    transition: opacity 0.3s ease-in-out !important;
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
  }
});

function showHud(locked) {
  mountIndicator();
  updatePosition();

  if (fadeTimeout) clearTimeout(fadeTimeout);

  if (locked)
    indicator.innerHTML = `
            <span style="font-size: 28px">🔒</span> 
            <span>LOCKED</span>
        `;
  else
    indicator.innerHTML = `
            <span style="font-size: 28px">🔓</span> 
            <span>UNLOCKED</span>
        `;

  setTimeout(() => {
    indicator.style.opacity = "1";
  }, 10);

  fadeTimeout = setTimeout(() => {
    indicator.style.opacity = "0";
  }, 1500);
}
