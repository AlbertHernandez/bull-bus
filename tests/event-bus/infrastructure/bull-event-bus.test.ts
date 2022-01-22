import { BullEventBus, DomainEvent, DomainEventSubscriber } from "../../../src";
import { generateUuid } from "../../../src/shared/generate-uuid";

class DummyEvent extends DomainEvent {
  static EVENT_NAME = "dummy:event";

  constructor(id: string) {
    super({
      eventName: DummyEvent.EVENT_NAME,
      attributes: {
        id,
      },
    });
  }
}

describe("BullEventBus", () => {
  it("the subscriber should be called when the event it is subscribed to is published", (done) => {
    class DomainEventSubscriberDummy
      implements DomainEventSubscriber<DummyEvent>
    {
      subscribedTo() {
        return [DummyEvent];
      }

      subscriptionName(): string {
        return "dummy-subscription";
      }

      async on(event: DummyEvent) {
        console.log(event);
        done();
      }
    }

    const eventBus = new BullEventBus();

    const event = new DummyEvent(generateUuid());

    const subscriber = new DomainEventSubscriberDummy();

    eventBus.addSubscribers([subscriber]);

    eventBus.publish([event]);
  });
});
