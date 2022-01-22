import { generateUuid } from "../../shared/generate-uuid";

export type DomainEventClass = {
  EVENT_NAME: string;
};

export type Attributes = {
  [key: string]: unknown;
};

export class DomainEvent {
  static EVENT_NAME: string;
  readonly eventId: string;
  readonly eventName: string;
  readonly occurredOn: Date;
  readonly meta: Record<string, unknown>;
  readonly attributes: Attributes;

  constructor(dependencies: {
    eventName: string;
    attributes: Attributes;
    eventId?: string;
    occurredOn?: Date;
    meta?: Record<string, unknown>;
  }) {
    this.eventId = dependencies.eventId || generateUuid();
    this.eventName = dependencies.eventName;
    this.occurredOn = dependencies.occurredOn || new Date();
    this.attributes = dependencies.attributes;
    this.meta = dependencies.meta || {};
  }
}
