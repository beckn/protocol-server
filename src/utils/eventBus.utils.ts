import EventEmitter from "events";

class EventBus extends EventEmitter { }

// Create a shared instance
const eventBus = new EventBus();

export default eventBus;
