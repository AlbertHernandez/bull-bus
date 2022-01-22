import {
  DomainEvent,
  DomainEventSubscriber,
  BullEventBus,
  BullBus,
} from "../src";

const runBullEventBus = async () => {
  class EventA extends DomainEvent {
    static EVENT_NAME = "event-A";

    constructor(name: string) {
      super({
        eventName: EventA.EVENT_NAME,
        attributes: {
          name,
        },
      });
    }
  }

  class EventB extends DomainEvent {
    static EVENT_NAME = "event-B";

    constructor(color: string) {
      super({
        eventName: EventB.EVENT_NAME,
        attributes: {
          color,
        },
      });
    }
  }

  class DomainEventSubscriberX
    implements DomainEventSubscriber<EventA | EventB>
  {
    subscribedTo() {
      return [EventA, EventB];
    }

    async on(event: EventA | EventB) {
      console.log("event", event);
    }
  }

  class DomainEventSubscriberY implements DomainEventSubscriber<EventA> {
    subscribedTo() {
      return [EventA];
    }

    async on(event: EventA) {
      console.log("event", event);
    }
  }

  const eventBus = new BullEventBus({
    redisUrl: "redis://127.0.0.1:6379",
  });

  eventBus.addSubscribers([
    new DomainEventSubscriberX(),
    new DomainEventSubscriberY(),
  ]);

  await eventBus.publish([new EventA("my-name")]);
  await eventBus.publish([new EventB("blue")]);
};

const runBullBus = async () => {
  const bullBus = new BullBus({
    redisUrl: "redis://127.0.0.1:6379",
  });

  const topicNameA = "topic-A";
  const topicNameB = "topic-B";

  bullBus.addSubscribers([
    {
      topicName: topicNameA,
      handleMessage: async (payload: unknown) => {
        console.log("Handle Message Topic A, Handler 1 ", payload);
      },
    },
    {
      topicName: topicNameA,
      handleMessage: async (payload: unknown) => {
        console.log("Handle Message Topic A, Handler 2 ", payload);
      },
    },
    {
      topicName: topicNameB,
      handleMessage: async (payload: unknown) => {
        console.log("payload handler B: ", payload);
      },
    },
  ]);

  await bullBus.publish(topicNameA, {
    name: "my-name",
  });

  await bullBus.publish(topicNameB, {
    color: "blue",
  });
};

runBullBus();
runBullEventBus();
