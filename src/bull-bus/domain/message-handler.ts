import { Job } from "bull";
import { Message } from "./message";

export type MessageHandler<JobData = Message> = (
  job: Job<JobData>
) => Promise<void>;
