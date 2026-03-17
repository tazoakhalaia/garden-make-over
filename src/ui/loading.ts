export class LoadingScreen {
  private el!: HTMLDivElement;
  private bar!: HTMLDivElement;
  private label!: HTMLDivElement;
  private loadView!: HTMLDivElement;
  private musicView!: HTMLDivElement;
  private dots = "";
  private dotTimer?: ReturnType<typeof setInterval>;

  constructor() {
    this.build();
  }

  show(): void {
    document.body.appendChild(this.el);
    requestAnimationFrame(() => {
      this.el.style.opacity = "1";
    });
    this.startDots();
  }

  setProgress(p: number): void {
    const pct = Math.round(Math.min(1, Math.max(0, p)) * 100);
    this.bar.style.width = `${pct}%`;
    this.label.textContent = `Loading${this.dots} ${pct}%`;
  }

  showMusicPrompt(): Promise<boolean> {
    return new Promise((resolve) => {
      this.stopDots();
      this.loadView.style.opacity = "0";
      this.loadView.style.pointerEvents = "none";
      setTimeout(() => {
        this.loadView.style.display = "none";
        this.musicView.style.display = "flex";
        requestAnimationFrame(() => {
          this.musicView.style.opacity = "1";
        });
      }, 400);

      this.el
        .querySelector<HTMLButtonElement>("#btn-yes")!
        .addEventListener("click", () => resolve(true), { once: true });
      this.el
        .querySelector<HTMLButtonElement>("#btn-no")!
        .addEventListener("click", () => resolve(false), { once: true });
    });
  }

  hide(): void {
    this.el.style.opacity = "0";
    setTimeout(() => {
      this.el.remove();
    }, 600);
  }

  private build(): void {
    this.el = document.createElement("div");
    this.el.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: #0a1a0a;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.5s ease;
      font-family: 'Segoe UI', system-ui, sans-serif;
      overflow: hidden;
    `;

    const bg = document.createElement("div");
    bg.style.cssText = `
      position: absolute; inset: 0;
      background-image:
        radial-gradient(circle at 20% 30%, rgba(34,85,34,0.25) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(20,60,20,0.2) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(10,30,10,0.15) 0%, transparent 70%);
      pointer-events: none;
    `;
    this.el.appendChild(bg);

    const emojis = ["🌾", "🌱", "🐄", "🐔", "🥕", "🍅", "🌻", "🐑"];
    emojis.forEach((e, i) => {
      const span = document.createElement("span");
      const size = 18 + Math.random() * 22;
      const left = 5 + (i / emojis.length) * 90;
      const delay = Math.random() * 4;
      const dur = 6 + Math.random() * 6;
      span.textContent = e;
      span.style.cssText = `
        position: absolute;
        font-size: ${size}px;
        left: ${left}%;
        bottom: -60px;
        opacity: 0.18;
        animation: floatUp ${dur}s ${delay}s ease-in-out infinite;
        pointer-events: none;
        user-select: none;
      `;
      this.el.appendChild(span);
    });

    if (!document.getElementById("ls-keyframes")) {
      const style = document.createElement("style");
      style.id = "ls-keyframes";
      style.textContent = `
        @keyframes floatUp {
          0%   { transform: translateY(0)   rotate(0deg);   opacity: 0.18; }
          50%  { opacity: 0.28; }
          100% { transform: translateY(-110vh) rotate(20deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .ls-btn {
          border: none; cursor: pointer;
          border-radius: 14px; padding: 14px 32px;
          font-size: 15px; font-weight: 700;
          letter-spacing: 0.5px;
          transition: transform 0.15s, opacity 0.15s;
        }
        .ls-btn:hover  { transform: scale(1.05); }
        .ls-btn:active { transform: scale(0.97); opacity: 0.85; }
      `;
      document.head.appendChild(style);
    }

    const card = document.createElement("div");
    card.style.cssText = `
      position: relative; z-index: 1;
      width: min(88vw, 360px);
      background: rgba(15, 35, 15, 0.92);
      border: 1px solid rgba(74, 222, 128, 0.25);
      border-radius: 24px;
      padding: 36px 32px 32px;
      box-shadow: 0 0 60px rgba(34,197,94,0.08), 0 24px 48px rgba(0,0,0,0.5);
      backdrop-filter: blur(12px);
      text-align: center;
    `;
    this.el.appendChild(card);

    this.loadView = document.createElement("div");
    this.loadView.style.cssText = "transition: opacity 0.4s;";
    card.appendChild(this.loadView);

    const spinner = document.createElement("div");
    spinner.style.cssText = `
      width: 56px; height: 56px; margin: 0 auto 20px;
      border: 3px solid rgba(74,222,128,0.15);
      border-top-color: #4ade80;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    `;
    this.loadView.appendChild(spinner);

    const title = document.createElement("div");
    title.style.cssText = `
      font-size: clamp(22px, 5vw, 28px);
      font-weight: 800; letter-spacing: -0.5px;
      color: #dcfce7; margin-bottom: 6px;
      background: linear-gradient(90deg, #86efac, #4ade80, #86efac);
      background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      animation: shimmer 2.5s linear infinite;
    `;
    title.textContent = "🌾 Happy Farm";
    this.loadView.appendChild(title);

    const sub = document.createElement("div");
    sub.style.cssText = `
      font-size: 13px; color: rgba(134,239,172,0.6);
      margin-bottom: 28px; letter-spacing: 0.3px;
    `;
    sub.textContent = "Preparing your farm...";
    this.loadView.appendChild(sub);

    const track = document.createElement("div");
    track.style.cssText = `
      width: 100%; height: 6px;
      background: rgba(74,222,128,0.12);
      border-radius: 99px; overflow: hidden;
      margin-bottom: 12px;
    `;
    this.loadView.appendChild(track);

    this.bar = document.createElement("div");
    this.bar.style.cssText = `
      height: 100%; width: 0%; border-radius: 99px;
      background: linear-gradient(90deg, #16a34a, #4ade80);
      transition: width 0.3s ease;
      box-shadow: 0 0 8px rgba(74,222,128,0.5);
    `;
    track.appendChild(this.bar);

    this.label = document.createElement("div");
    this.label.style.cssText = `
      font-size: 12px; color: rgba(134,239,172,0.5);
      letter-spacing: 0.5px;
    `;
    this.label.textContent = "Loading... 0%";
    this.loadView.appendChild(this.label);

    this.musicView = document.createElement("div");
    this.musicView.style.cssText = `
      display: none; flex-direction: column;
      align-items: center; gap: 0;
      opacity: 0; transition: opacity 0.4s;
    `;
    card.appendChild(this.musicView);

    const note = document.createElement("div");
    note.style.cssText = `
      font-size: 48px; margin-bottom: 14px;
      animation: pulse 2s ease-in-out infinite;
    `;
    note.textContent = "🎵";
    this.musicView.appendChild(note);

    const mTitle = document.createElement("div");
    mTitle.style.cssText = `
      font-size: clamp(18px, 4vw, 22px);
      font-weight: 800; color: #dcfce7;
      margin-bottom: 8px; letter-spacing: -0.3px;
    `;
    mTitle.textContent = "Play background music?";
    this.musicView.appendChild(mTitle);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = `
      display: flex; gap: 12px; width: 100%;
    `;
    this.musicView.appendChild(btnRow);

    const btnYes = document.createElement("button");
    btnYes.id = "btn-yes";
    btnYes.className = "ls-btn";
    btnYes.style.cssText = `
      flex: 1; background: #16a34a; color: #fff;
      box-shadow: 0 4px 16px rgba(22,163,74,0.35);
    `;
    btnYes.textContent = "🎶 Yes please!";
    btnRow.appendChild(btnYes);

    const btnNo = document.createElement("button");
    btnNo.id = "btn-no";
    btnNo.className = "ls-btn";
    btnNo.style.cssText = `
      flex: 1;
      background: rgba(255,255,255,0.07);
      color: rgba(134,239,172,0.8);
      border: 1px solid rgba(74,222,128,0.2) !important;
    `;
    btnNo.textContent = "🔇 No thanks";
    btnRow.appendChild(btnNo);
  }

  private startDots(): void {
    this.dotTimer = setInterval(() => {
      this.dots = this.dots.length >= 3 ? "" : this.dots + ".";
      this.label.textContent = `Loading${this.dots} ${this.bar.style.width}`;
    }, 400);
  }

  private stopDots(): void {
    if (this.dotTimer) clearInterval(this.dotTimer);
  }
}
