const ONE_SECOND = 1000;

export class Timer extends EventTarget {
  duration = 0;
  durationElapsed = 0;
  intervalId: number | undefined;
  running = false;
  timeTarget: { hours: number; minutes: number; seconds: number };
  timeRemaining: { hours: number; minutes: number; seconds: number };

  constructor(duration: number) {
    super();
    this.duration = duration;
    this.timeTarget = this.getTimeRemaining(duration);
    this.timeRemaining = this.getTimeRemaining(duration);
  }

  start() {
    this.running = true;
    this.dispatchEvent(new Event("change"));
    this.intervalId = setInterval(() => {
      this.durationElapsed += ONE_SECOND;
      const remainingMs = this.duration - this.durationElapsed;
      this.timeRemaining = this.getTimeRemaining(remainingMs);
      if (this.durationElapsed === this.duration) {
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
    this.durationElapsed = 0;
    this.timeRemaining = this.getTimeRemaining(this.duration);
    this.dispatchEvent(new Event("change"));
  }

  get status() {
    if (this.running) return "running";
    if (this.durationElapsed > 0) return "paused";
    if (this.durationElapsed === this.duration) return "finished";
    return "idle";
  }

  get progress() {
    return Math.floor(((this.duration - this.durationElapsed) / this.duration) * 100);
  }

  private getTimeRemaining(remainingMs: number) {
    const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingMs / 1000) % 60);
    return { hours, minutes, seconds };
  }
}
