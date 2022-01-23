import { Job as BullJob } from "bull";
import { Event } from "./event";

export type Job<JobData = Event> = BullJob<JobData>;
