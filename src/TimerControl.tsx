import type { Handle } from "@remix-run/component";
import { Timer } from "./stores/TimerModel";
import type { TimerDefinition } from "./types";
import { PauseIcon, PlayIcon, ResetIcon } from "./icons";
import { TimeLeftDisplay } from "./TimeLeftDisplay";

export function TimerControl(this: Handle, { timer: timerDefinition }: { timer: TimerDefinition }) {
  const timer = new Timer(timerDefinition.duration);
  this.on(timer, { change: () => this.update() });

  return () => {
    return (
      <div class="flex justify-between items-bottom">
        <div
          class="relative"
          style={{
            "--duration": timer.status === "running" ? "1100ms" : "100ms",
          }}
        >
          <TimeLeftDisplay target={timer.duration} elapsed={timer.elapsed} status={timer.status} />
          {timer.status !== "idle" ? (
            <button
              class="btn btn-square btn-primary btn-ghost absolute bottom-8 left-1/2 -translate-x-1/2"
              on={{ click: () => timer.reset() }}
            >
              <span class="sr-only">Reset</span>
              <ResetIcon />
            </button>
          ) : null}
        </div>
        <div class="flex flex-col justify-end">
          {timer.status === "idle" || timer.status === "paused" ? (
            <button class="btn btn-xl btn-circle btn-primary" on={{ click: () => timer.start() }}>
              <span class="sr-only">Start</span>
              <PlayIcon />
            </button>
          ) : (
            <button class="btn btn-xl btn-circle btn-primary" on={{ click: () => timer.pause() }}>
              <span class="sr-only">Pause</span>
              <PauseIcon />
            </button>
          )}
        </div>
      </div>
    );
  };
}
