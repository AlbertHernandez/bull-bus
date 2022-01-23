import { Job } from "bull";
import { Event } from "./event";

export type EventHandler<JobData = Event> = (
  job: Job<JobData>
) => Promise<void>;
