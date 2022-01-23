import BullQueue, { QueueOptions } from "bull";
import { Subscriber } from "./subscriber";
import { TopicName } from "./topic-name";
import { Message } from "./message";
import { SubscriberName } from "./subscriber-name";

export class BullBus {
  private readonly queueOptions;
  private readonly redisUrl;
  private readonly topicNameToSubscriberNames;

  constructor(dependencies: {
    queueOptions?: QueueOptions;
    redisUrl?: string;
    topicNameToSubscriberNames: Record<
      TopicName,
      Array<SubscriberName> | undefined
    >;
  }) {
    this.queueOptions = dependencies.queueOptions;
    this.redisUrl = dependencies.redisUrl;
    this.topicNameToSubscriberNames = dependencies.topicNameToSubscriberNames;
  }

  async publish(topicName: TopicName, payload: Message): Promise<void> {
    const subscriberNames = this.topicNameToSubscriberNames[topicName] || [];

    const queues = subscriberNames.map((subscriberName) =>
      this.getQueue(topicName, subscriberName)
    );

    await Promise.all(
      queues.map(async (queue) => {
        await queue.add(payload);
      })
    );
  }

  addSubscribers(subscribers: Array<Subscriber>): void {
    for (const subscriber of subscribers) {
      this.addSubscriber(subscriber);
    }
  }

  private addSubscriber(subscriber: Subscriber) {
    const queue = this.getQueue(
      subscriber.topicName,
      subscriber.subscriberName
    );

    queue.process(async (job) => {
      await subscriber.handleMessage(job);
    });
  }

  private getQueue(topicName: TopicName, subscriberName: SubscriberName) {
    const queueName = `${subscriberName}-on-${topicName}`;

    return this.redisUrl
      ? new BullQueue(queueName, this.redisUrl)
      : new BullQueue(queueName, this.queueOptions);
  }
}
