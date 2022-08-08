// @ts-check

import { deleteDB, openDB } from 'idb';

import { customAlphabet } from 'nanoid';
export const nanoid = customAlphabet('6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz', 10);

// TODO(spdowling) should be shared, general `folio` idb instance
const DBName = 'folio-environments';
const DBVersion = 1;

// TODO(spdowling) use $ as separator, remove separator from entries
// TODO(spdowling) allow user defined prefix override
export const EnvDBPrefix = 'folio-env-';
export const EnvDBVersion = 1;

// TODO(spdowling) expand on this? have StoreController own it? make enumerable?
// add RecordType(s)?
export const EnvStoreType = {
    _META: '_meta',
    ITEMS: 'items',
};

// TODO(spdowling) at some point we probably want to extract this out into
// a more general data and sync process?
export class EnvironmentController {
    #host; #callback;
    #config = {
        instances: true,
        attributes: false,
        attributesFilter: []
    };
    // TODO(spdowling) make part of config?
    #targets;
    #reservedKeys = ['id', 'supports'];
    #db; #unobserved; #value; #opening;

    // should be able to add an observer constructed outside of this...?
    #observers;

    // TODO(spdowling) remove callback from constructor and instead rely on
    // observe to register a callback with targets
    constructor(host, callback, options) {
        (this.#host = host).addController(this)

        // callback should actually be part of the observe function parameters
        // or arguments
        this.#callback = callback ?? (async () => true);
        this.#config = { ...this.#config, ...(options?.config ?? {}) };
        this.#targets = options?.targets ?? [];
        this.#reservedKeys = [
            ...this.#reservedKeys,
            ...(options?.reservedKeys ?? []),
        ];
        this.#unobserved = false;
        this.#value = null;
    }

    get value() {
        return this.#value;
    }

    // how can we force a wait on the actual opening here?
    // otherwise we skip from connected directly to updated and miss out on
    // being able to have access to hostConnected as expected...
    async hostConnected() {
        console.log(this.#host.tagName, 'hostConnected');

        // should we instead create some kind of promose func here? or perhaps
        // a private member that handles opening? then we can have it resolve
        // and call requestUpdate once it's done?
        this.#db = await openDB(DBName, DBVersion, {
            upgrade: (db, oldVersion, newVersion, tx) => {
                if (oldVersion < 1) {
                    db.createObjectStore('envs', {
                        keyPath: 'id',
                    }).createIndex('named', 'name', { unique: true });
                }
            },
        });
        console.log(this.#host.tagName, this.#db);
        this.#unobserved = true;
    }

    // since we want to ensure that we are correctly using environment-controller
    // now, we can make the changes we need at this point
    // we know what we dont want to force people to observe if all they want
    // is a simplistic interface layer to the data itself

    // so in the case of things like just reading, we need to be able
    // to get that without having loads of host updates...

    async hostUpdated() {
        console.log(this.#host.tagName, 'hostUpdated');
        console.log(this.#host.tagName, this.#db);
        // NOTE(spdowling) opening is our block to make sure that we dont
        // try to open again due to async updated notice
        // consider using external function and gating similar to router promise
        // logic
        // if (!this.#db && !this.#opening) {
        //     this.#opening = true;
        //     // TODO(spdowling) can we move this out to a helper function?
        //     // perhaps convert #open to support this as well?
        //     this.#db = await openDB(DBName, DBVersion, {
        //         upgrade: (db, oldVersion, newVersion, tx) => {
        //             if (oldVersion < 1) {
        //                 db.createObjectStore('envs', {
        //                     keyPath: 'id',
        //                 }).createIndex('named', 'name', { unique: true });
        //             }
        //         },
        //     });
        //     this.#opening = false;
        //     this.#unobserved = true;
        // }
        // TODO(spdowling) check for unobserved? or just check for initial?
        if (this.#unobserved) {
            this.#value = await this.#callback();
            this.#host.requestUpdate();
        }
        this.#unobserved = false;
    }

    hostDisconnected() {
        if (this.#db) {
            this.#db.close();
            this.#db = null;
        }
    }

    // this.#enviroments.observe(() => void, {});
    observe(callback, options) {
        const config = {
            ...this.#config,
            ...this.#observers.get(callback) ?? {},
            ...options
        };
        // this.#observers.set(callback, config);

        // this.#unobserved = true;
        // this.#host.requestUpdate();

        // const shortcuts = this.#shortcuts.get(element) ?? new Map();
        // for (const keybind of keybinds) {
        //     const { key, mod } = this.#split(keybind);
        //     if (!key || !mod) continue;
        //     const bindings = shortcuts.get(key) ?? [];
        //     // TODO(spdowling) index is unused, so redundant?
        //     const index = bindings
        //         .findIndex(b => mod.every(m => b.mod.includes(m)));
        //     if (!~index) {
        //         shortcuts.set(key, bindings.concat({ callback, mod }));
        //     }
        // }

        // if (shortcuts.size) {
        //     this.#shortcuts.set(element, shortcuts);
        //     element.addEventListener('keydown', this.#listener,
        //         { signal: this.#signaller.signal }
        //     );
        // }
    }

    unobserve(target) {
        this.#targets = this.#targets.filter(t => t !== target);
    }

    // TODO(spdowling) rename to create?
    async open({ name, ...data }) {
        if (!this.#db || !name || this.#value?.name === name) return;
        const named = await this.#db
            .getKeyFromIndex('envs', 'named', name);
        const id = named?.id ?? nanoid();
        // TODO(spdowling) handle version conflicts
        // TODO(spdowling) provide callback hooks?
        const db = await openDB(EnvDBPrefix + id, EnvDBVersion, {
            upgrade: (db, oldVersion, newVersion, tx) => {
                if (oldVersion < 1) {
                    for (const type of Object.values(EnvStoreType)) {
                        db.createObjectStore(type, {
                            keyPath: 'id',
                        }).createIndex('named', 'name', {
                            unique: true
                        });
                    }
                }
            }
        });
        if (!named) {
            const clean = Object.keys(data)
                .filter(k => !this.#reservedKeys.includes(k))
                .reduce((o, k) => ({ ...o, [k]: data[k] }), {});
            const supports = db.version;
            await this.#db.add('envs', { id, supports, name, ...clean });
            this.#notify('instance', id, 'id', null);
        }
        this.#notify('instance', id, 'connected', null);
        return id;
    }

    async all() {
        if (!this.#db) return;
        return (await this.#db.getAll('envs'))
            .map(env => this.#proxy(env));
    }

    async latest(id) {
        if (!this.#db || !id) return;
        return this.#proxy(await this.#db.get('envs', id));
    }

    async destroy(id) {
        if (!this.#db || !id) return;
        const env = await this.#db.getKey('envs', id);
        if (env) {
            deleteDB(id, {
                blocked: () => console.log('destroy(): deleteDB() blocked'),
            });
            await this.#db.delete('envs', env);
            this.#notify('instance', null, 'id', env);
            this.#targets = this.#targets.filter(t => t !== id);
        }
    }

    // NOTE(spdowling) used to attempt local environment discovery of existing
    // instances not known by the app
    async discover() {
        const known = (await this.all())
            .reduce((envs, { id }) => envs.concat(id), []);
        const found = (await indexedDB.databases())
            .filter(d => d.name.startsWith(EnvDBPrefix))
            .filter(d => !known.includes(d.name.split('-').pop()));
        // TODO(spdowling) validate correctness of stores?
        // TODO(spdowling) force upgrade? allow manual upgrade?
        for (const { name, version } of found) {
            const id = name.split('-').pop()
            await this.#db.add('envs', { id, supports: version, name });
            this.#notify('instance', id, 'id', null);
        }
    }

    // NOTE(spdowling) allow for open and upgrade attempts separately from
    // creation
    async upgrade(id) {
        const db = await openDB(EnvDBPrefix + id, EnvDBVersion, {
            upgrade: (db, oldVersion, newVersion, tx) => {
                if (oldVersion < 1) {
                    for (const type of Object.values(EnvStoreType)) {
                        db.createObjectStore(type, {
                            keyPath: 'id',
                        }).createIndex('named', 'name', {
                            unique: true
                        });
                    }
                }
            }
        });
    }

    #proxy(target, context = { root: target.id, path: [] }) {
        if (!target) return;
        const revocable = Proxy.revocable(target, {
            defineProperty: (target, p, attributes) => {
                if (this.#reservedKeys.includes(p.toString())) return false;
                if (!target.hasOwnProperty(p)) return false;
                return Reflect.defineProperty(target, p, attributes);
            },
            deleteProperty: () => false,
            get: (target, p, receiver) => {
                const res = Reflect.get(target, p, receiver);
                return (typeof res !== 'object')
                    ? (typeof res !== 'function')
                        ? res
                        : res.bind(target)
                    : this.#proxy(res, {
                        root: context.root,
                        path: context.path.concat(p.toString())
                    });
            },
            getOwnPropertyDescriptor: (target, p) => {
                const res = Reflect.getOwnPropertyDescriptor(target, p);
                res.configurable = false;
                if (this.#reservedKeys.includes(p.toString())) {
                    res.writable = false;
                }
                return res;
            },
            set: (target, p, value, receiver) => {
                if (this.#reservedKeys.includes(p.toString())) return false;
                const res = Reflect.set(target, p, value, receiver);
                if (res) this.#update(context, target, p);
                return res;
            },
        });
        return revocable.proxy;
    }

    async #update({ root, path }, target, propertyKey) {
        if (!this.#db) return;
        const merge = (target, [k, ...p], value) => {
            const merged = Array.isArray(target) ? [...target] : { ...target };
            // @ts-ignore
            merged[k] = p.length ? merge(merged[k], p, value) : value[k];
            return merged;
        };
        const env = await this.#db.get('envs', root);
        // @ts-ignore
        const merged = merge(env, [...path, propertyKey], target);
        await this.#db.put('envs', merged);
        const origin = path[0] ?? propertyKey;
        this.#notify('attribute', merged, origin, env[origin]);
    }

    async #notify(type, target, affected, oldValue) {
        // TODO(spdowling) anything we can do to tidy this up?
        // lots of messy checks that can be simplified?
        if (this.#targets.length && !this.#targets.includes(target.id)) return;
        if (type === 'instance' && !this.#config.instances) return;
        if (type === 'attribute' && !this.#config.attributes) return;
        if (type === 'attribute' && this.#config.attributesFilter.length &&
            !this.#config.attributesFilter.includes(affected)) return;
        const change = { type, target, affected, oldValue };
        this.#value = await this.#callback(change);
        this.#host.requestUpdate();
    }
}
