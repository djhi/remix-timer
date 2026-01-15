import type { Handle } from "@remix-run/component";
import { timerStore } from "./stores/TimerStore";
import { PlusIcon } from "./icons";
import { TimerItem } from "./TimerItem";
import { Navigate, Link } from "./RouterProvider";

export function TimerList(this: Handle) {
  this.on(timerStore, { change: () => this.update() });
  return () => {
    if (timerStore.isPending) return null;

    if (timerStore.timers.length === 0) {
      return <Navigate to="/new" />;
    }

    return (
      <div class="flex flex-col gap-4 grow pb-16">
        <ul class="grow flex flex-col px-2 gap-4">
          {timerStore.timers.map((timer) => (
            <li key={timer.id}>
              <TimerItem timer={timer} />
            </li>
          ))}
        </ul>
        <div class="fab left-1/2 -translate-x-1/2 end-[unset]">
          <Link to="/new" class="btn btn-xl btn-primary btn-circle">
            <span class="sr-only">Add one</span>
            <PlusIcon />
          </Link>
        </div>
      </div>
    );
  };
}
