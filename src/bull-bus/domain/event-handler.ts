import { Event } from "./event";
import { Job } from "./job";

export type EventHandler<JobData = Event> = (
  job: Job<JobData>
) => Promise<void>;
