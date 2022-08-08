// @ts-check

import { HotKeyController } from "../hotkeys";

const registry = new Map();

export class CommandController {
    #host; #hotkeys;

    constructor(host) {
        (this.#host = host).addController(this);
    }

    get registry() {
        return [...registry.values()]
            .reduce((acc, c) => acc.concat(c), []);
    }

    get #commands() {
        return registry.get(this) ?? [];
    }

    hostConnected() {
        this.#hotkeys = new HotKeyController(this.#host);
    }

    hostUpdated() {
        const { handler, binding, event } = this.#hotkeys.value ?? {};
        if (handler) handler.call(this.#host, [binding, event]);
    }

    hostDisconnected() {
        registry.delete(this);
    }

    register(handler, name, shortcut) {
        if (!handler || !name) return;
        const command = { handler, host: this.#host, name };
        if (shortcut) {
            // TODO(spdowling) capture error, or have hotkeys throw?
            // TODO(spdowling) move prevent and propagate into options
            // default true
            this.#hotkeys.assign(shortcut, (binding, event) => {
                // TODO(spdowling) remove once hotkeys supports binding
                // configuration of event handling
                event.preventDefault();
                event.stopPropagation();
                return { handler, binding, event };
            });
            command.shortcut = shortcut
        }
        registry.set(this, this.#commands.concat(command));
        return this;
    }

    unregister(handler) {
        if (!handler || !this.#commands.length) return;
        registry.set(this, this.#commands.filter(c => c.handler !== handler));
        return this;
    }
}
