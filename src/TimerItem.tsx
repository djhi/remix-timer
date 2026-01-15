import type { Handle } from "@remix-run/component";
import * as v from "valibot";
import { timerStore } from "./stores/TimerStore";
import type { TimerDefinition } from "./types";
import { TrashIcon } from "./icons";
import { TimerControl } from "./TimerControl";

export function TimerItem(this: Handle) {
  this.on(timerStore, { change: () => this.update() });

  return ({ timer }: { timer: TimerDefinition }) => (
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body p-4">
        <div class="flex justify-between">
          <h2 class="card-title">
            <TimerName timer={timer} />
          </h2>
          <button
            class="btn btn-sm btn-square btn-ghost"
            on={{
              click: () => {
                timerStore.remove(timer);
              },
            }}
          >
            <span class="sr-only">Delete</span>
            <TrashIcon />
          </button>
        </div>
        <TimerControl timer={timer} />
      </div>
    </div>
  );
}

function TimerName() {
  let dialogRef: HTMLDialogElement;

  return ({ timer }: { timer: TimerDefinition }) => (
    <>
      <button
        class="btn btn-xl btn-ghost -m-6"
        command="show-modal"
        commandFor={`timer-modal-${timer.id}`}
      >
        {timer.name}
      </button>
      <dialog
        id={`timer-modal-${timer.id}`}
        class="modal"
        connect={(el) => {
          dialogRef = el;
        }}
      >
        <form
          class="modal-box"
          on={{
            submit: (event) => {
              event.preventDefault();
              const data = Object.fromEntries(new FormData(event.currentTarget));
              const validation = v.safeParse(schema, data);
              if (validation.success) {
                timerStore.rename(timer, validation.output.name);
              }
              dialogRef.close();
            },
          }}
        >
          <h3 class="text-lg font-bold">Enter a new name</h3>
          <input
            type="text"
            name="name"
            class="input"
            defaultValue={timer.name}
            connect={(el) => {
              el.select();
            }}
          />
          <div class="modal-action">
            <button
              type="button"
              command="request-close"
              commandFor={`timer-modal-${timer.id}`}
              class="btn"
            >
              Close
            </button>
            <button type="submit" class="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
});
