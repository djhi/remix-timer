import type { TimerStatus } from "./types";

export function TimeLeftDisplay() {
  return ({ elapsed, target }: { elapsed: number; target: number; status: TimerStatus }) => {
    const progress = Math.floor(((target - elapsed) / target) * 100);
    return (
      <div
        class={`radial-progress duration-(--duration) after:duration-(--duration) ${status === "idle" ? "text-base-content" : status === "finished" ? "text-accent" : "text-primary"}`}
        style={{
          "--value": progress,
          "--size": "12rem",
          "--thickness": "4px",
        }}
        aria-valuenow={progress}
        role="progressbar"
      >
        <TimeLeftDisplayText target={target} elapsed={elapsed} />
      </div>
    );
  };
}

const numberFormatter = new Intl.NumberFormat("en-US", { minimumIntegerDigits: 2 });

export function TimeLeftDisplayText() {
  return ({ elapsed, target }: { elapsed: number; target: number }) => {
    const remaining = target - elapsed;
    const remainingTime = getTimeParts(remaining);
    const targetTime = getTimeParts(target);

    return (
      <div class="flex text-4xl text-base-content tabular-nums">
        {targetTime.hours > 0 ? (
          <>
            <span>{numberFormatter.format(remainingTime.hours)}</span>:
            <span>{numberFormatter.format(remainingTime.minutes)}</span>:
            <span>{numberFormatter.format(remainingTime.seconds)}</span>
          </>
        ) : targetTime.minutes > 0 ? (
          <>
            <span>{numberFormatter.format(remainingTime.minutes)}</span>:
            <span>{numberFormatter.format(remainingTime.seconds)}</span>
          </>
        ) : (
          <span>{numberFormatter.format(remainingTime.seconds)}</span>
        )}
      </div>
    );
  };
}

function getTimeParts(ms: number) {
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return { hours, minutes, seconds };
}
