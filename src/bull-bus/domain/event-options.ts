import { JobOptions } from "bull";

export type EventOptions = Pick<
  JobOptions,
  | "attempts"
  | "backoff"
  | "timeout"
  | "removeOnComplete"
  | "removeOnFail"
  | "stackTraceLimit"
>;
