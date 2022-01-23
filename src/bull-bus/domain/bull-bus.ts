import BullQueue, { QueueOptions } from "bull";
import { Subscriber } from "./subscriber";
import { TopicName } from "./topic-name";
import { Event } from "./event";
import { SubscriberName } from "./subscriber-name";
import { EventOptions } from "./event-options";

export class BullBus {
  private readonly queueOptions;
  private readonly redisUrl;
  private readonly topicNameToSubscriberNames;
  private readonly eventOptions;

  constructor(dependencies: {
    queueOptions?: QueueOptions;
    redisUrl?: string;
    topicNameToSubscriberNames: Record<
      TopicName,
      Array<SubscriberName> | undefined
    >;
    eventOptions?: EventOptions;
  }) {
    this.queueOptions = dependencies.queueOptions;
    this.redisUrl = dependencies.redisUrl;
    this.topicNameToSubscriberNames = dependencies.topicNameToSubscriberNames;
    this.eventOptions = dependencies.eventOptions;
  }

  async publish(topicName: TopicName, payload: Event): Promise<void> {
    const subscriberNames = this.topicNameToSubscriberNames[topicName] || [];

    const queues = subscriberNames.map((subscriberName) =>
      this.getQueue(topicName, subscriberName)
    );

    await Promise.all(
      queues.map(async (queue) => {
        await queue.add(payload, this.eventOptions);
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
      await subscriber.handleEvent(job);
    });
  }

  private getQueue(topicName: TopicName, subscriberName: SubscriberName) {
    const queueName = `${subscriberName}-on-${topicName}`;

    return this.redisUrl
      ? new BullQueue(queueName, this.redisUrl)
      : new BullQueue(queueName, this.queueOptions);
  }
}
