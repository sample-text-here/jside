import { ipcMain, ipcRenderer, BrowserWindow } from "electron";
const events: Record<string, Event> = {};
export enum EventScope {
  process,
  global,
}

export class Event {
  readonly name: string = "";
  listeners: Array<Function> = [];
  scope: EventScope = EventScope.global;

  constructor(name: string) {
    this.name = name;
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
    if (this.scope === EventScope.global) {
      params.unshift(this.name);
      if (process.type === "renderer") {
        ipcRenderer.send("event", ...params);
      } else {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("event", ...params);
        });
      }
    }
    return this;
  }
}

export default function eventsInterface(name: string) {
  if (Object.prototype.hasOwnProperty.call(events, name)) return events[name];
  const event = new Event(name);
  events[name] = event;
  return event;
}

function handleInterProcess(e, ...message: Array<unknown>) {
  if (typeof message[0] !== "string") return;
  const event = eventsInterface(message[0]);
  if (event.scope !== EventScope.global) return;
  event.listeners.forEach((i) => i(...message.slice(1)));
}

if (process.type === "renderer") {
  ipcRenderer.on("event", handleInterProcess);
} else {
  ipcMain.on("event", handleInterProcess);
}
