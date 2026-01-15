import * as v from "valibot";

export const TimerSchema = v.object({
  id: v.string(),
  name: v.string(),
  duration: v.number(),
});

export type TimerDefinition = v.InferOutput<typeof TimerSchema>;

export type TimerStatus = "idle" | "running" | "paused" | "finished";
