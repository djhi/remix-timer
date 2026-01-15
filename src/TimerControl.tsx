import type { Handle } from "@remix-run/component";
import { Timer } from "./stores/TimerModel";
import type { TimerDefinition } from "./types";
import { PauseIcon, PlayIcon, ResetIcon } from "./icons";

const numberFormatter = new Intl.NumberFormat("en-US", { minimumIntegerDigits: 2 });

export function TimerControl(this: Handle, { timer: timerDefinition }: { timer: TimerDefinition }) {
  const timer = new Timer(timerDefinition.duration);
  this.on(timer, { change: () => this.update() });

  return () => (
    <div class="flex justify-between items-bottom">
      <div
        class="relative"
        style={{
          "--duration": timer.status === "running" ? "1100ms" : "100ms",
        }}
      >
        <div
          class={`radial-progress duration-(--duration) after:duration-(--duration) ${timer.status === "idle" ? "text-base-content" : timer.status === "finished" ? "text-accent" : "text-primary"}`}
          style={{
            "--value": timer.progress,
            "--size": "12rem",
            "--thickness": "4px",
          }}
          aria-valuenow={timer.progress}
          role="progressbar"
        >
          <div class="flex text-4xl text-base-content tabular-nums">
            {timer.timeTarget.hours > 0 ? (
              <>
                <span>{numberFormatter.format(timer.timeRemaining.hours)}</span>:
                <span>{numberFormatter.format(timer.timeRemaining.minutes)}</span>:
                <span>{numberFormatter.format(timer.timeRemaining.seconds)}</span>
              </>
            ) : timer.timeTarget.minutes > 0 ? (
              <>
                <span>{numberFormatter.format(timer.timeRemaining.minutes)}</span>:
                <span>{numberFormatter.format(timer.timeRemaining.seconds)}</span>
              </>
            ) : (
              <span>{numberFormatter.format(timer.timeRemaining.seconds)}</span>
            )}
          </div>
        </div>
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
}
