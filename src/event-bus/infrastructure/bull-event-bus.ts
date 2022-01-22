import { Job, QueueOptions } from "bull";
import { EventBus } from "../domain/event-bus";
import { BullBus } from "../../bull-bus";
import { DomainEventSubscriber } from "../domain/domain-event-subscriber";
import { DomainEvent } from "../domain/domain-event";

export class BullEventBus implements EventBus {
  private readonly bullBus;

  constructor(
    dependencies: {
      bullBus?: BullBus;
      queueOptions?: QueueOptions;
      redisUrl?: string;
    } = {}
  ) {
    this.bullBus =
      dependencies.bullBus ||
      new BullBus({
        queueOptions: dependencies.queueOptions,
        redisUrl: dependencies.redisUrl,
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
          handleMessage: async (job: Job) => {
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
