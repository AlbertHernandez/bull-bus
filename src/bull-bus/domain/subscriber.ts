import { Event } from "./event";
import { SubscriberName } from "./subscriber-name";
import { TopicName } from "./topic-name";
import { EventHandler } from "./event-handler";

export interface Subscriber<JobData = Event> {
  subscriberName: SubscriberName;
  topicName: TopicName;
  handleEvent: EventHandler<JobData>;
}
