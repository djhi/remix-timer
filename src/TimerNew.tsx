import type { Dispatched } from "@remix-run/interaction";
import type { Handle } from "@remix-run/component";
import * as v from "valibot";
import { timerStore } from "./stores/TimerStore";
import { BackspaceIcon } from "./icons";
import { RouterProvider, Link } from "./RouterProvider";

export function TimerNew(this: Handle) {
  const { router } = this.context.get(RouterProvider);
  let hoursInputRef: HTMLInputElement;
  let minutesInputRef: HTMLInputElement;
  let secondsInputRef: HTMLInputElement;
  let value = "";
  let hours = "00";
  let minutes = "00";
  let seconds = "00";

  const updateTime = () => {
    const fullValue = value.padStart(6, "0");
    hours = (fullValue.charAt(0) + fullValue.charAt(1)).padStart(2, "0");
    hoursInputRef.value = hours;
    minutes = (fullValue.charAt(2) + fullValue.charAt(3)).padStart(2, "0");
    minutesInputRef.value = minutes;
    seconds = (fullValue.charAt(4) + fullValue.charAt(5)).padStart(2, "0");
    secondsInputRef.value = seconds;
    this.update();
  };

  const onNumberButtonClick = (event: Dispatched<PointerEvent, HTMLButtonElement>) => {
    if (value.length === 6) return;
    const buttonValue = event.currentTarget.value;
    value += buttonValue;
    updateTime();
  };

  const onDeleteClick = () => {
    value = value.substring(0, value.length - 1);
    updateTime();
  };

  return () => (
    <form
      class="flex flex-col gap-2 p-2 grow"
      on={{
        submit: async (event) => {
          event.preventDefault();
          const data = Object.fromEntries(new FormData(event.currentTarget));
          const validation = v.safeParse(schema, data);
          if (validation.success) {
            await timerStore.add({
              name: validation.output.name,
              duration:
                validation.output.hours * 60 * 60 * 1000 +
                validation.output.minutes * 60 * 1000 +
                validation.output.seconds * 1000,
            });
            router.navigate("/");
          }
        },
      }}
    >
      <input
        type="text"
        name="name"
        placeholder="Name"
        class="input input-xl w-full"
        defaultValue="Timer"
      />
      <input
        type="hidden"
        name="hours"
        connect={(el) => {
          hoursInputRef = el;
        }}
      />
      <input
        type="hidden"
        name="minutes"
        connect={(el) => {
          minutesInputRef = el;
        }}
      />
      <input
        type="hidden"
        name="seconds"
        connect={(el) => {
          secondsInputRef = el;
        }}
      />
      <p class="text-4xl text-center">
        <span>{hours}</span>
        <span>h</span>&nbsp;<span>{minutes}</span>
        <span>min</span>&nbsp;<span>{seconds}</span>
        <span>s</span>
      </p>
      <div class="grid grid-cols-3 place-items-center grow">
        {Array.from(Array(9).keys()).map((value) => (
          <button
            key={value}
            class="btn btn-circle btn-xl btn-ghost"
            type="button"
            value={value + 1}
            on={{ click: onNumberButtonClick }}
          >
            {value + 1}
          </button>
        ))}
        <button
          key={value}
          class="btn btn-circle btn-xl btn-ghost"
          type="button"
          value="00"
          on={{ click: onNumberButtonClick }}
        >
          00
        </button>
        <button
          key={value}
          class="btn btn-circle btn-xl btn-ghost"
          type="button"
          value="0"
          on={{ click: onNumberButtonClick }}
        >
          0
        </button>
        <button
          key={value}
          class="btn btn-circle btn-xl btn-ghost"
          type="button"
          on={{ click: onDeleteClick }}
        >
          <span class="sr-only">Delete</span>
          <BackspaceIcon />
        </button>
      </div>
      <button type="submit" class="btn btn-primary btn-xl">
        Save
      </button>
      <Link to="/" class="btn btn-xl">
        Cancel
      </Link>
    </form>
  );
}

const schema = v.object({
  name: v.string(),
  hours: v.pipe(v.string(), v.toNumber()),
  minutes: v.pipe(v.string(), v.toNumber()),
  seconds: v.pipe(v.string(), v.toNumber()),
});
