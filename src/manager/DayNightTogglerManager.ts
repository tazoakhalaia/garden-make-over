import { Container, Graphics, Text } from "pixi.js";

type WeatherMode = "none" | "rain" | "leaves";

export class DayNightToggle {
  private container = new Container();
  private isDay = true;
  private weatherMode: WeatherMode = "none";

  create(
    stage: Container,
    onToggle: (isDay: boolean) => void,
    onWeather?: (mode: WeatherMode) => void,
  ) {
    const dayBg = new Graphics()
      .roundRect(0, 0, 80, 40, 20)
      .fill({ color: 0x4a90d9 });

    const dayLabel = new Text({ text: "☀️", style: { fontSize: 22 } });
    dayLabel.anchor.set(0.5);
    dayLabel.position.set(40, 20);

    const dayBtn = new Container();
    dayBtn.addChild(dayBg, dayLabel);
    dayBtn.eventMode = "dynamic";
    dayBtn.cursor = "pointer";
    dayBtn.position.set(0, 0);

    dayBtn.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      this.isDay = !this.isDay;
      (dayBg as Graphics)
        .clear()
        .roundRect(0, 0, 80, 40, 20)
        .fill({ color: this.isDay ? 0x4a90d9 : 0x1a1a3e });
      dayLabel.text = this.isDay ? "☀️" : "🌙";
      onToggle(this.isDay);
    });

    const WEATHER_STATES: {
      mode: WeatherMode;
      emoji: string;
      color: number;
    }[] = [
      { mode: "none", emoji: "🌤️", color: 0x7ab8e8 },
      { mode: "rain", emoji: "🌧️", color: 0x4a6fa5 },
      { mode: "leaves", emoji: "🍂", color: 0xc2703a },
    ];
    let weatherIndex = 0;

    const wxBg = new Graphics()
      .roundRect(0, 0, 80, 40, 20)
      .fill({ color: WEATHER_STATES[0].color });

    const wxLabel = new Text({
      text: WEATHER_STATES[0].emoji,
      style: { fontSize: 22 },
    });
    wxLabel.anchor.set(0.5);
    wxLabel.position.set(40, 20);

    const wxBtn = new Container();
    wxBtn.addChild(wxBg, wxLabel);
    wxBtn.eventMode = "dynamic";
    wxBtn.cursor = "pointer";
    wxBtn.position.set(0, 50);

    wxBtn.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      weatherIndex = (weatherIndex + 1) % WEATHER_STATES.length;
      const next = WEATHER_STATES[weatherIndex];
      (wxBg as Graphics)
        .clear()
        .roundRect(0, 0, 80, 40, 20)
        .fill({ color: next.color });
      wxLabel.text = next.emoji;
      this.weatherMode = next.mode;
      onWeather?.(next.mode);
    });

    this.container.addChild(dayBtn, wxBtn);
    this.container.position.set(20, 80);
    stage.addChild(this.container);
  }
}
