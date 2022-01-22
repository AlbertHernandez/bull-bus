import { DomainEvent } from "./domain-event";
import { DomainEventSubscriber } from "./domain-event-subscriber";

export interface EventBus {
  publish(events: Array<DomainEvent>): Promise<void>;
  addSubscribers(subscribers: Array<DomainEventSubscriber<DomainEvent>>): void;
}
