export function showLoadingScreen(): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.id = "asset-loading-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "#0a0f0a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999",
    fontFamily: "sans-serif",
    color: "#a8f5b8",
  });
  overlay.innerHTML = `
    <div style="font-size:48px;margin-bottom:24px;">🌱</div>
    <div style="font-size:20px;font-weight:bold;letter-spacing:3px;margin-bottom:20px;">LOADING FARM...</div>
    <div style="width:260px;height:12px;background:#1a3d22;border-radius:6px;overflow:hidden;border:1px solid #2d6a3f;">
      <div id="asset-loading-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#4ade80,#22c55e);border-radius:6px;transition:width 0.15s ease;"></div>
    </div>
    <div id="asset-loading-pct" style="margin-top:10px;font-size:13px;opacity:0.7;">0%</div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

export function updateLoadingBar(progress: number) {
  const bar = document.getElementById("asset-loading-bar");
  const pct = document.getElementById("asset-loading-pct");
  if (bar) bar.style.width = `${progress}%`;
  if (pct) pct.textContent = `${progress}%`;
}

export function hideLoadingScreen() {
  const overlay = document.getElementById("asset-loading-overlay");
  if (!overlay) return;
  overlay.style.transition = "opacity 0.4s ease";
  overlay.style.opacity = "0";
  setTimeout(() => overlay.remove(), 420);
}
