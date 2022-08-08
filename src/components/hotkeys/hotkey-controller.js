// @ts-check

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key#Values

// TODO(spdowling) make enumeration: HotKeySpecial.Enter
const HotKeySpecial = ['Enter', 'Escape', 'Backspace', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'];
// TODO(spdowling) make enumeration: HotKeyModifier.ALT
const HotKeyModifier = ['Meta', 'Control', 'Alt', 'Shift'];

// WeakMap(controller, shortcuts)?
// weakmap isn't much help, but a map might be helpful in checking for
// app wide configurations and unique checks
const registry = new WeakMap();

// TODO(spdowling) switch from #convention to #private declarations
export class HotKeyController {
    #host; #shortcuts; #listener; #signaller; #updating; #value;
    #defaults = { propagated: false, allowDefault: false, element: document };
    #reserved = [' ', 'Tab'];
    #filtered = ['input', 'select', 'textarea'];

    // TODO(spdowling) allow #defaults as an option?
    // TODO(spdowling) allow #filtered as an option?
    // TODO(spdowling) allow #reserved as an option?
    constructor(host, options = {}) {
        (this.#host = host).addController(this);

        // TODO(spdowling) need a better name than shortcuts and also
        // to confirm bindings is appropriate
        // maybe this should be #bindings and then shortcuts are the
        // combinations of mod + binding?
        // TODO(spdowling) globalise shortcuts by moving it out of the class
        // and having it shared by all instances, allowing for consistent
        // tracking regardless of which instance adds a bind. could be a WeakMap
        // of (controller, bind) entry, so that if the controller disappears,
        // so does the bind...
        this.#shortcuts = new Map();
        this.#listener = (e) => this.#process(e);
        this.#signaller = new AbortController();
        this.#updating = false;
        this.#value = null;
    }

    get value() {
        return this.#value;
    }

    hostDisconnected() {
        this.#shortcuts.clear();
        this.#signaller.abort();
    }

    hostUpdated() {
        if (this.#updating) {
            this.#value = null
            this.#updating = false;
        }
    }

    // TODO(spdowling) only allow one keybind at a time, so switch to single
    // array expectation for keybinds (rename keybind)
    // TODO(spdowling) throw if invalid, throw if !unique
    assign(keybinds, callback, options = {}) {
        if (!keybinds.length) return new TypeError('no keybinds given');
        if (!callback) callback = (binding) => binding;

        // TODO(spdowling) merge keybinds prep
        if (keybinds.every(e => typeof e === 'string')) {
            keybinds = [].concat(keybinds);
        }
        if (keybinds.some(e => !Array.isArray(e)) ||
            keybinds.some(kb => kb.some(e => typeof e !== 'string'))) {
            return new TypeError('invalid keybinds format, must be [[]] or []');
        }

        const { element } = { ...this.#defaults, ...options };
        if (!document.contains(element) || !window) {
            return new TypeError('unable to find binding target');
        }

        const shortcuts = this.#shortcuts.get(element) ?? new Map();
        for (const keybind of keybinds) {
            const { key, mod } = this.#split(keybind);
            if (!key || !mod) continue;
            const bindings = shortcuts.get(key) ?? [];
            // TODO(spdowling) index is unused, so redundant?
            const index = bindings
                .findIndex(b => mod.every(m => b.mod.includes(m)));
            if (!~index) {
                shortcuts.set(key, bindings.concat({ callback, mod }));
            }
        }

        if (shortcuts.size) {
            this.#shortcuts.set(element, shortcuts);
            element.addEventListener('keydown', this.#listener,
                { signal: this.#signaller.signal }
            );
        }
    }

    unassign(keybinds, element = document) {
        if (!keybinds.length) return new TypeError('no keybinds given');

        // TODO(spdowling) merge keybinds prep
        if (keybinds.every(e => typeof e === 'string')) {
            keybinds = [].concat(keybinds);
        }
        if (keybinds.some(e => !Array.isArray(e)) ||
            keybinds.some(kb => kb.some(e => typeof e !== 'string'))) return;

        if (!this.#shortcuts.has(element)) return;
        const shortcuts = this.#shortcuts.get(element);

        for (const keybind of keybinds) {
            const { key, mod } = this.#split(keybind);
            if (!key || !mod) continue;
            const bindings = (shortcuts.get(key) ?? []);
            const index = bindings
                .findIndex(b => b.mod.every(m => mod.contains(m)));
            if (~index) bindings.splice(index, 1);
            if (!bindings.length) shortcuts.delete(key);
        }

        if (!shortcuts.size) {
            this.#shortcuts.delete(element);
            // TODO(spdowling) do i have to pass original signal option to
            // ensure match?
            element.removeEventListener('keydown', this.#listener);
        }
    }

    // TODO(spdowling) rename? #extract(keybind), #separate(keybind)
    #split(keybind) {
        // TODO(spdowling) merge mod and key prep into a single
        // call that should also produce the object
        // so perhaps a map or reduce function is required. most probably
        // a reduce.
        const mod = keybind
            .filter(kb => HotKeyModifier.includes(kb));
        if (mod.length && mod.length > 2) return;

        const key = keybind
            .filter(kb => !mod.includes(kb) && !this.#reserved.includes(kb))
            .join();
        if (!HotKeySpecial.includes(key)) {
            if (!key.length || key.length > 1) return;
        }
        return { key: key.toUpperCase(), mod };
    }

    #process(e) {
        if (!this.#shortcuts.has(e.currentTarget) ||
            this.#filtered.includes(e.target.tagName) ||
            e.target.isContentEditable) return;

        const mods = HotKeyModifier.filter(m => e.getModifierState(m));
        const shortcuts = this.#shortcuts.get(e.currentTarget);
        // TODO(spdowling) change to forEach?
        const binding = (shortcuts.get(e.key.toUpperCase()) ?? [])
            .find(b => b.mod.length === mods.length &&
                b.mod.every(m => mods.includes(m))
            );
        // TODO(spdowling) binding only includes mod, not full shortcut info
        // need to have access to config such as propagated and prevented
        // console.log(shortcuts, binding);
        if (binding) {
            // if callback returns truthy, continue, otherwise return
            this.#value = binding.callback(binding, e);

            // if (!binding.propagated) e.stopPropagation();
            // if (!binding.allowDefault) e.preventDefault();
            this.#updating = true;
            this.#host.requestUpdate();
        }
    }
}
