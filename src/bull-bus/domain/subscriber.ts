import { Message } from "./message";
import { SubscriberName } from "./subscriber-name";
import { TopicName } from "./topic-name";
import { MessageHandler } from "./message-handler";

export interface Subscriber<JobData = Message> {
  subscriberName: SubscriberName;
  topicName: TopicName;
  handleMessage: MessageHandler<JobData>;
}
