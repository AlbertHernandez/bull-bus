<h1 align="center">🚀</h1>
<h3 align="center">Bull Bus</h3>

<p align="center">
    <a href="https://github.com/AlbertHernandez/bull-bus/actions/workflows/nodejs.yml?branch=main"><img src="https://github.com/AlbertHernandez/bull-bus/actions/workflows/nodejs.yml/badge.svg?branch=main" alt="nodejs"/></a>
    <a href="https://www.npmjs.com/package/bull-bus"><img src="https://img.shields.io/npm/v/bull-bus.svg" alt="bull-bus-npm"/></a>
</p>

<p align="center">
  Event Bus for Node.JS using Bull Queues
</p>

## Table of Contents

* [Installation](#installation)
* [How to Use It](#how-to-use-it)
* [Playground](#playground)
* [Preparing environment to contribute](#preparing-environment)
* [Building](#building)
* [Testing](#testing)
* [Linting](#linting)
* [Contributing](#contributing)

## Installation

```bash
npm install bull-bus
```

## How to Use It

Bull Bus library offers two main functionalities. The bull bus and the bull event bus. For one topic we can have N
handlers.

### Bull Bus

This class is a Bus Implementation using Bull, works with primitives data and does not know anything about the domain.
It may be useful in case we want to build our own domain event logic.

```ts
import { BullBus } from "bull-bus";

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
```

### Bull Event Bus

Bull Event Bus is very similar to the Bull Bus with the difference that gives us some default classes to create domain
events and subscriptions. Its useful when we are working with OOP.

```ts
import {
    DomainEvent,
    DomainEventSubscriber,
    BullEventBus,
} from "bull-bus";

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
    implements DomainEventSubscriber<EventA | EventB> {
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
```

## Playground

This library offers a playground where we can play with the functions that we are developing

```bash
docker-compose up -d redis
npm run playground
```

## Preparing environment to contribute

This library has been designed to work with node v16 and npm 8. In order to configure your local environment you can
run:

```bash
nvm install 16.0.0
nvm use
npm install npm@8.3.0 -g
npm install
```

## Building

```bash
npm run build
```

## Testing

### Jest with Testing Library

```bash
npm run test
```

## Linting

Run the linter

```bash
npm run lint
```

Fix lint issues automatically

```bash
npm run lint:fix
```

## Contributing

Contributions welcome! See
the [Contributing Guide](https://github.com/AlbertHernandez/bull-bus/blob/main/CONTRIBUTING.md).
