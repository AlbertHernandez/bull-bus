import { DomainEvent, DomainEventClass } from "./domain-event";

export interface DomainEventSubscriber<T extends DomainEvent> {
  subscribedTo(): Array<DomainEventClass>;
  subscriberName(): string;

  on(domainEvent: T): Promise<void>;
}
