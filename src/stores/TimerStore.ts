import * as v from "valibot";
import { nanoid } from "nanoid/non-secure";

import { TimerSchema, type TimerDefinition } from "../types";

const STORE_KEY = "@timers";

export class TimerStore extends EventTarget {
  timers: Array<TimerDefinition> = [];
  isPending = true;
  isMutating = false;

  constructor() {
    super();
    this.load();
  }

  async load() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const value = localStorage.getItem(STORE_KEY);
    if (value) {
      try {
        const timers = JSON.parse(value);
        if (areValidTimers(timers)) {
          this.timers = timers;
        }
      } catch {}
    }
    this.isPending = false;
    this.emit();
  }
  async save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.timers));
  }

  async add(value: Omit<TimerDefinition, "id">) {
    this.isMutating = true;
    this.timers.unshift({ ...value, id: nanoid(5) });
    await this.save();
    this.isMutating = false;
    this.emit();
  }

  async remove(value: TimerDefinition) {
    this.isMutating = true;
    this.timers = this.timers.filter((item) => item.id != value.id);
    await this.save();
    this.isMutating = false;
    this.emit();
  }

  async rename(value: TimerDefinition, name: string) {
    this.isMutating = true;
    const index = this.timers.findIndex((item) => item.id === value.id);
    if (index === -1) return;
    this.timers[index] = { ...value, name };
    await this.save();
    this.isMutating = false;
    this.emit();
  }

  private emit() {
    this.dispatchEvent(new Event("change"));
  }
}

// Singleton
export const timerStore = new TimerStore();

function areValidTimers(value: any): value is Array<TimerDefinition> {
  const validation = v.safeParse(v.array(TimerSchema), value);
  return validation.success;
}
