const ONE_SECOND = 1000;

export class Timer extends EventTarget {
  duration = 0;
  elapsed = 0;
  private intervalId: number | undefined;
  private running = false;

  constructor(duration: number) {
    super();
    this.duration = duration;
  }

  start() {
    this.running = true;
    this.dispatchEvent(new Event("change"));
    this.intervalId = setInterval(() => {
      this.elapsed += ONE_SECOND;
      if (this.elapsed === this.duration) {
        this.running = false;
        clearInterval(this.intervalId);
      }
      this.dispatchEvent(new Event("change"));
    }, ONE_SECOND);
  }

  pause() {
    this.running = false;
    clearInterval(this.intervalId);
    this.dispatchEvent(new Event("change"));
  }

  async reset() {
    this.elapsed = 0;
    this.dispatchEvent(new Event("change"));
  }

  get status() {
    if (this.running) return "running";
    if (this.elapsed > 0) return "paused";
    if (this.elapsed === this.duration) return "finished";
    return "idle";
  }
}
