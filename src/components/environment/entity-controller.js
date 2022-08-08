// @ts-check

import { openDB } from 'idb';
import { customAlphabet } from 'nanoid';
import { EnvDBPrefix } from './environment-controller';
export const nanoid = customAlphabet('6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz', 10);

const enumerate = ((...v) => Object.freeze(v
    .reduce((e, k, i) => {
        e[(e[k] = i + 1)] = k;
        return e;
    }, {}))
);

export const ItemType = enumerate(
    'SPECIFICATION', 'PROPERTY', 'RELATION', 'CANDIDATE'
);

// TODO(spdowling) how does sharing proxies across controller instances affect
// observer notifications?
const Proxied = new Map();

// considerations for proxy and weakmap storage:
// https://github.com/YousefED/SyncedStore/blob/main/packages/core/src/internal.ts
// https://github.com/YousefED/SyncedStore/blob/main/packages/core/src/object.ts

// TODO(spdowling) what about cases where we want to interact with, but not
// observe the data store? we need to separate out the observer logic somewhat
// so that we can correctly handle just triggering change items.
// when we consider the datasync implementation, we can probably do a better
// job of correctly separating these concerns.



// record controller wraps datasync to enforce record type, otherwise can be
// genericised in datasync

// insert - record type, { name, type, ...data }
// update - record type, { id, propertyKey }
// delete - record type, id

// type (entity, environment, etc.)
// row identifier (id)
// column (entity.propertyKey)
// value (new value of entity.propertyKey)
// timestamp
function update(table, params) {
    let fields = Object.keys(params).filter(k => k !== 'id');
    sync.sendMessages(
        fields.map(k => {
            return {
                dataset: table,
                row: params.id,
                column: k,
                value: params[k],
                // Note that every message we create/send gets its own, globally-
                // unique timestamp. In effect, there is a 1-1 relationship between
                // the timestamp and this specific message.
                timestamp: Timestamp.send(getClock()).toString()
            };
        })
    );
}





export class EntityController {
    #host; #env; #callback;
    #config = {
        records: false,
        attributes: true,
        attributesFilter: [],
        relations: true,
    };
    #targets;
    // TODO(spdowling) linked to store record type mappings ?
    #reservedKeys = ['id', 'type'];
    #db; #unobserved; #value;

    // TODO(spdowling) consider whether we want to pre-define the callback
    // or go back to more of a on-demand callback method, or even both
    constructor(host, env, callback, options) {
        (this.#host = host).addController(this)
        this.#env = env;
        this.#callback = callback ?? (async () => true);
        this.#config = { ...this.#config, ...(options?.config ?? {}) };
        this.#targets = options?.targets ?? [];
        this.#reservedKeys = [
            ...this.#reservedKeys,
            ...(options?.reservedKeys ?? []),
        ];
        this.#db = null;
        this.#unobserved = false;
        this.#value = null;
    }

    get value() {
        return this.#value;
    }

    async hostUpdated() {
        if (this.#env && !this.#db) {
            const exists = (await indexedDB.databases())
                .some(d => d.name === EnvDBPrefix + this.#env);
            if (exists) {
                this.#db = await openDB(EnvDBPrefix + this.#env);
                this.#unobserved = true;
            }
        }
        if (this.#unobserved) {
            this.#value = await this.#callback();
            this.#unobserved = false;
            this.#host.requestUpdate();
        }
    }

    hostDisconnected() {
        if (this.#db) {
            this.#db.close();
            this.#db = null;
        }
    }

    // TODO(spdowling) observe should be replaced? or wrap datasync?
    // describes that I want to observe a particular entity, so perhaps this can be
    // generalised inside of datasync, as long as we are can be reliably consistent in
    // how we observe.
    observe(target) {
        if (target) {
            this.#targets = [...this.#targets, target];
            // this.#unobserved = true;
            // this.#host.requestUpdate();
        }
    }

    unobserve(target) {
        if (target) {
            this.#targets = this.#targets.filter(t => t !== target);
        }
    }

    // committer.insert(timestamp, store, id, key, val)
    async create({ name, type, ...data }) {
        if (!this.#db || !name || !ItemType[type]) return;
        const named = await this.#db
            .getKeyFromIndex('items', 'named', name);
        const id = named?.id ?? nanoid();
        if (!named) {
            const clean = Object.keys(data)
                .filter(k => !this.#reservedKeys.includes(k))
                .reduce((o, k) => ({ ...o, [k]: data[k] }), {});
            await this.#db.add('items', { id, name, type, ...clean });
            this.#notify('record', id, 'id', null);
        }
        return id;
    }

    // TODO(spdowling) can we somehow retrieve keys and rely on another method
    // to handle retrieval from cache or idb?
    async all(types = []) {
        if (!this.#db || !'items') return;
        if (types.some(t => !ItemType[t])) return;
        const records = types.length
            ? await this.#db.getAllFromIndex('items', 'typed')
                .filter(r => types.includes(r.type))
            : await this.#db.getAll('items');
        return records.map(record => this.#proxy(record));
    }

    async latest(id) {
        if (!this.#db || !id) return;
        // TODO(spdowling) if we are given an id, first check that
        // we have a valid record before validating against cache
        // TODO(spdowling) based on an id existing, is it worth checking
        // the cache before we get to this.#proxy?
        return this.#proxy(await this.#db.get('items', id));
    }

    // TODO(spdowling) trigger UPDATE with new relation entry?
    // relate(source, target, type) {
    //      this.create({
    //          name: 'RELATION_A.ID_B.ID', // generate name from IDs
    //          type: ItemType.RELATION,
    //          base: 'AGGREGATION', // is base better than relation?
    //          relation: 'AGGREGATION', // ?? need to validate against known types
    //      });
    // }

    // committer.delete(timestamp, store, id, key, val)
    async delete(id) {
        if (!this.#db || !'items' || !id) return;
        const record = await this.#db.getKey('items', id);
        if (record) {
            await this.#db.delete('items', record);
            this.#notify('record', null, 'id', record);
            // TODO(spdowling) calling revoke() and then deleting feels clunky
            Proxied.get(record).revoke();
            Proxied.delete(record);
            this.#targets = this.#targets.filter(t => t !== id);
        }
    }

    // how do we proxy an object with the use of datasync? is the implication that
    // locally we are still using idb? or should datasync give us the full api
    // surface area of data retrieval?

    // we are moving away from databases with the idea that the Trie is our state of truth
    // so given a constructed Trie, we should be able to retrieve data information
    // which would require a new API for data access. damn this was looking quite tidy before

    // TODO(spdowling) rename to #wrap() and allow an unwrap()?
    #proxy(target, context = { root: target.id, path: [] }) {
        if (!target) return;
        // TODO(spdowling) should the caller own the cache check?
        if (Proxied.has(target?.id)) return Proxied.get(target.id).proxy;
        const revocable = Proxy.revocable(target, {
            defineProperty: (target, p, attributes) => {
                if (this.#reservedKeys.includes(p.toString())) return false;
                const had = target.hasOwnProperty(p);
                const res = Reflect.defineProperty(target, p, attributes);
                if (!had && res) this.#update(context, target, p);
                return res;
            },
            deleteProperty: (target, p) => {
                const res = Reflect.deleteProperty(target, p);
                if (res) this.#update(context, target, p);
                return res;
            },
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
                // (this.#reservedKeys.includes(p.toString()) && res) ??
                if (this.#reservedKeys.includes(p.toString())) {
                    res.writable = false;
                    // TODO(spdowling) should all be false?
                    res.configurable = false;
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
        if (context.root === target.id) Proxied.set(target.id, revocable);
        // TODO(spdowling) do we return the proxy? or just cache it?
        // if we externalise Proxied.get, Proxied.set to caller, then return
        // if not, then shouldn't return?
        return revocable.proxy;
    }

    async #update({ root, path }, target, propertyKey) {
        if (!this.#db || !'items') return;
        const merge = (target, [k, ...p], value) => {
            const merged = Array.isArray(target) ? [...target] : { ...target };
            // @ts-ignore
            merged[k] = p.length ? merge(merged[k], p, value) : value[k];
            return merged;
        };
        const record = await this.#db.get('items', root);
        // @ts-ignore
        const merged = merge(record, [...path, propertyKey], target);
        await this.#db.put('items', merged);
        Proxied.get(record.id).revoke();
        this.#proxy(merged);
        const origin = path[0] ?? propertyKey;
        const change = !Array.isArray(record[origin])
            ? 'attribute'
            : 'relation';
        this.#notify(change, merged, origin, record[origin]);
    }

    async #notify(type, target, affected, oldValue) {
        if (type === 'record' && !this.#config.records) return;
        // only matters if we have targets, if we have no targets, dont bail
        // if (type !== 'record' && !this.#targets.includes(target.id)) return;
        if (type === 'attribute' && !this.#config.attributes) return;
        if (type === 'attribute' &&
            (this.#config.attributesFilter.length &&
                !this.#config.attributesFilter.includes(affected))) return;
        if (type === 'relation' && !this.#config.relations) return;
        const change = { type, target, affected, oldValue };
        this.#value = await this.#callback(change);
        this.#host.requestUpdate();
    }
}
