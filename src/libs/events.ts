const events: Record<string, Event> = {}; // Events registry

// TODO: make Event more intuitive
// rn new Event("asdf") will not return a "new Event" if it already exists
export class Event {
  listeners: Array<Function> = [];
  name: string = "";

  // create a new event
  constructor(name: string) {
    if (Object.prototype.hasOwnProperty.call(events, name)) return events[name];
    this.name = name;
    events[name] = this;
  }

  addListener(func: Function): Event {
    this.listeners.push(func);
    return this;
  }

  removeListener(func: Function): Event {
    const index = this.listeners.indexOf(func);
    if (index > -1) this.listeners.splice(index, 1);
    return this;
  }

  fire(...params: Array<unknown>): Event {
    this.listeners.forEach((i) => i(...params));
    return this;
  }
}
