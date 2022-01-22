import BullQueue, { Queue, QueueOptions } from "bull";
import { generateUuid } from "../../shared/generate-uuid";
import { Subscriber } from "./subscriber";
import { TopicName } from "./topic-name";
import { Message } from "./message";

export class BullBus {
  private readonly queueOptions;
  private readonly redisUrl;
  private topicNameToSubscribersQueueConfig: Record<
    TopicName,
    | Array<{
        subscriber: Subscriber;
        queue: Queue;
      }>
    | undefined
  >;

  constructor(
    dependencies: { queueOptions?: QueueOptions; redisUrl?: string } = {}
  ) {
    this.queueOptions = dependencies.queueOptions;
    this.redisUrl = dependencies.redisUrl;
    this.topicNameToSubscribersQueueConfig = {};
  }

  async publish(topicName: TopicName, payload: Message): Promise<void> {
    const subscribersQueueConfig =
      this.topicNameToSubscribersQueueConfig[topicName] || [];

    await Promise.all(
      subscribersQueueConfig.map(async (subscriberQueueConfig) => {
        await subscriberQueueConfig.queue.add(payload);
      })
    );
  }

  addSubscribers(subscribers: Array<Subscriber>): void {
    for (const subscriber of subscribers) {
      this.addSubscriber({
        ...subscriber,
        subscriberName: subscriber.subscriberName || generateUuid(),
      });
    }
  }

  private addSubscriber(subscriber: Subscriber) {
    if (this.isAlreadyAddedSubscriber(subscriber)) {
      return;
    }

    const { topicName } = subscriber;

    if (!this.topicNameToSubscribersQueueConfig[topicName]) {
      this.topicNameToSubscribersQueueConfig[topicName] = [];
    }

    const queue = this.redisUrl
      ? new BullQueue(subscriber.topicName, this.redisUrl)
      : new BullQueue(subscriber.topicName, this.queueOptions);

    this.topicNameToSubscribersQueueConfig[topicName]?.push({
      subscriber,
      queue,
    });

    queue.process(async (job) => {
      await subscriber.handleMessage(job);
    });
  }

  private isAlreadyAddedSubscriber(subscriber: Subscriber) {
    const subscriberQueueConfig =
      this.topicNameToSubscribersQueueConfig[subscriber.topicName] || [];

    return subscriberQueueConfig.some((subscriberQueueConfig) =>
      this.areEqualsSubscribers(subscriber, subscriberQueueConfig.subscriber)
    );
  }

  private areEqualsSubscribers(
    subscriberA: Subscriber,
    subscriberB: Subscriber
  ) {
    return (
      subscriberA.topicName === subscriberB.topicName &&
      subscriberA.subscriberName === subscriberB.subscriberName
    );
  }
}
