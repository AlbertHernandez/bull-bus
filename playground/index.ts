import {
  DomainEvent,
  DomainEventSubscriber,
  BullEventBus,
  BullBus,
} from "../src";

const runBullEventBus = async () => {
  class UserRegistered extends DomainEvent {
    static EVENT_NAME = "user-registered";

    constructor(userName: string) {
      super({
        eventName: UserRegistered.EVENT_NAME,
        attributes: {
          userName,
        },
      });
    }
  }

  class UserFormCompleted extends DomainEvent {
    static EVENT_NAME = "user-form-completed";

    constructor(value: string) {
      super({
        eventName: UserFormCompleted.EVENT_NAME,
        attributes: {
          value,
        },
      });
    }
  }

  class SendSlackOnUserOrFormCompleted
    implements DomainEventSubscriber<UserRegistered | UserFormCompleted>
  {
    subscribedTo() {
      return [UserRegistered, UserFormCompleted];
    }

    subscriberName(): string {
      return "send-slack";
    }

    async on(event: UserRegistered | UserFormCompleted) {
      switch (event.eventName) {
        case UserRegistered.EVENT_NAME:
          console.log("Simulating send slack...", event.attributes.userName);
          break;
        case UserFormCompleted.EVENT_NAME:
          console.log("Simulating send slack...", event.attributes.value);
          break;
      }
    }
  }

  class SendEmailOnUserRegistered
    implements DomainEventSubscriber<UserRegistered>
  {
    subscribedTo() {
      return [UserRegistered];
    }

    subscriberName(): string {
      return "send-email";
    }

    async on(event: UserRegistered) {
      console.log("Simulating send email...", event.attributes.userName);
    }
  }

  const eventBus = new BullEventBus({
    redisUrl: "redis://127.0.0.1:6379",
    topicNameToSubscriberNames: {
      [UserRegistered.EVENT_NAME]: ["send-slack", "send-email"],
      [UserFormCompleted.EVENT_NAME]: ["send-slack"],
    },
  });

  eventBus.addSubscribers([
    new SendSlackOnUserOrFormCompleted(),
    new SendEmailOnUserRegistered(),
  ]);

  await eventBus.publish([new UserRegistered("gabriel")]);
  await eventBus.publish([new UserFormCompleted("3208")]);
};

const runBullBus = async () => {
  // Topic Name creations
  const accountCreatedTopicName = "account-created";
  const userCreatedTopicName = "user-created";

  // Subscriber name creations
  const sendEmailSubscriberName = "send-email";
  const sendSlackSubscriberName = "send-slack";
  const sendPushNotificationSubscriberName = "send-push-notification";

  const bullBus = new BullBus({
    redisUrl: "redis://127.0.0.1:6379",
    topicNameToSubscriberNames: {
      [accountCreatedTopicName]: [
        sendEmailSubscriberName,
        sendSlackSubscriberName,
      ],
      [userCreatedTopicName]: [sendPushNotificationSubscriberName],
    },
  });

  bullBus.addSubscribers([
    {
      topicName: accountCreatedTopicName,
      handleEvent: async (payload: unknown) => {
        console.log("Handle event Topic A, Handler 1 ", payload);
      },
      subscriberName: sendEmailSubscriberName,
    },
    {
      topicName: accountCreatedTopicName,
      handleEvent: async (payload: unknown) => {
        console.log("Handle event Topic A, Handler 2 ", payload);
      },
      subscriberName: sendSlackSubscriberName,
    },
    {
      topicName: userCreatedTopicName,
      handleEvent: async (payload: unknown) => {
        console.log("payload handler B: ", payload);
      },
      subscriberName: sendPushNotificationSubscriberName,
    },
  ]);

  await bullBus.publish(accountCreatedTopicName, {
    accountId: "2",
  });

  await bullBus.publish(userCreatedTopicName, {
    userId: "1",
  });
};

runBullBus();
runBullEventBus();
