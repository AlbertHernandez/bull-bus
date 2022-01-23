import { Job, QueueOptions } from "bull";
import { EventBus } from "../domain/event-bus";
import { BullBus } from "../../bull-bus";
import { DomainEventSubscriber } from "../domain/domain-event-subscriber";
import { DomainEvent } from "../domain/domain-event";
import { TopicName } from "../../bull-bus/domain/topic-name";
import { SubscriberName } from "../../bull-bus/domain/subscriber-name";

export class BullEventBus implements EventBus {
  private readonly bullBus;

  constructor(dependencies: {
    queueOptions?: QueueOptions;
    redisUrl?: string;
    topicNameToSubscriberNames: Record<
      TopicName,
      Array<SubscriberName> | undefined
    >;
  }) {
    this.bullBus = new BullBus({
      queueOptions: dependencies.queueOptions,
      redisUrl: dependencies.redisUrl,
      topicNameToSubscriberNames: dependencies.topicNameToSubscriberNames,
    });
  }

  addSubscribers(subscribers: Array<DomainEventSubscriber<DomainEvent>>): void {
    subscribers.forEach((subscriber) => this.addSubscriber(subscriber));
  }

  async publish(events: Array<DomainEvent>): Promise<void> {
    await Promise.all(
      events.map(async (event) => {
        await this.bullBus.publish(event.eventName, event);
      })
    );
  }

  private addSubscriber(subscriber: DomainEventSubscriber<DomainEvent>) {
    const bullBusSubscribers = subscriber
      .subscribedTo()
      .map((domainEventClass) => {
        return {
          topicName: domainEventClass.EVENT_NAME,
          subscriberName: subscriber.subscriberName(),
          handleEvent: async (job: Job) => {
            const { data } = job;
            await subscriber.on(
              new DomainEvent({
                ...data,
                occurredOn: new Date(data.occurredOn),
              })
            );
          },
        };
      });

    this.bullBus.addSubscribers(bullBusSubscribers);
  }
}
