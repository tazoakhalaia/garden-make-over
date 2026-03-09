import { soundManager } from "../manager/SoundManager";

export function showSoundPrompt(): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(2, 11, 5, 0.88)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "10000",
      fontFamily: "Georgia, serif",
    });

    overlay.innerHTML = `
      <div style="
        background: linear-gradient(160deg, #0e2016, #09160d);
        border: 1.5px solid rgba(61,220,110,0.5);
        border-radius: 20px;
        padding: 40px 48px;
        text-align: center;
        box-shadow: 0 8px 40px rgba(0,0,0,0.7);
        max-width: 360px;
        width: 90%;
      ">
        <div style="font-size: 52px; margin-bottom: 16px;">🎵</div>
        <div style="font-size: 22px; font-weight: bold; color: #c8ffd9; letter-spacing: 3px; margin-bottom: 10px;">
          ENABLE SOUNDS?
        </div>
        <div style="font-size: 13px; color: #6fcf8a; margin-bottom: 32px; letter-spacing: 1px;">
          Background music &amp; game sound effects
        </div>
        <div style="display: flex; gap: 14px; justify-content: center;">
          <button id="sound-yes" style="
            flex: 1; padding: 14px 0; border-radius: 12px;
            border: 1.5px solid rgba(61,220,110,0.6);
            background: linear-gradient(160deg, #1b5230, #122e1d);
            color: #c8ffd9; font-size: 16px; font-family: Georgia, serif;
            font-weight: bold; letter-spacing: 2px; cursor: pointer;
          ">🔊 YES</button>
          <button id="sound-no" style="
            flex: 1; padding: 14px 0; border-radius: 12px;
            border: 1.5px solid rgba(255,107,107,0.4);
            background: linear-gradient(160deg, #3a1a1a, #200f0f);
            color: #ffaaaa; font-size: 16px; font-family: Georgia, serif;
            font-weight: bold; letter-spacing: 2px; cursor: pointer;
          ">🔇 NO</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("sound-yes")!.addEventListener("click", () => {
      soundManager.enable();
      soundManager.playTheme();
      overlay.remove();
      resolve();
    });

    document.getElementById("sound-no")!.addEventListener("click", () => {
      overlay.remove();
      resolve();
    });
  });
}