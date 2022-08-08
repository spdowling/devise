// @ts-check

import { nanoid } from 'nanoid';
import { Clock } from './clock';

// retire is just a date change, so do we need to track it here?
// resolve is meant to be where we resolved an inconsistency or conflict in sync
// tag is really more the epoch tag to re-baseline all previous ops
const CommitType = ['new', 'modify', 'retire', 'tag', 'tombstone', 'resolve'];

// Websocket.receive(commits) -> CommitController.recv(commit)???

// record[propertyKey] = value;
// changelog.insert({ timestamp, store, record, propertyKey, value })

// changelog.merkle / changelog.compare / changelog.diff / changelog.synced
// When did two changelogs last converge? (k: time(change), v: hash(change))
//      // A1 sends JSON merkle to A2
//      // A2 compares as diff to local to get T1 (last agreed)
//      // A2 sends messages where timestamp >= T1
//      // A1 recvs and applies messages from A2
//      // For all messages targeting same field, apply most recent

// local:
//  insert(); notify()
//  <notification> syncer.send()
//  checkpoint(); insert()

// remote:
//  <notification> syncer.recv()
//  insert(); notify()

// who owns this?
const send = () => {
    //this.#clock.now();
};

// how does this interact with any kind of websocket logic that receives
// the actual responses from remote server sync endpoint?
// who owns this?
// TODO(spdowling) for each received message, trigger update(?)
const recv = (msg) => {
    //const timestamp = this.#clock.update(Clock.parse(msg.timestamp));
    // compare and check for existing
    // if no existing, then just insert
    // if no existing, but local, then don't insert?
};

// CommitController is our background process managing inbound and outbound
// commit updates

// CommitController provides us with a way for elements to interact with an
// ongoing sync process
// It's responsible for inserting and managing commits
// So other controllers, like Entity or Environment rely on this Controller to
// manage and control its idb data
// Entity, for instance, asks CommitController to insert a change, which then
// gets converted into a commit and notiofy observers such as proxy managers
// or the online sync service that uses websockets to actually marshall messages
// over a websocket channel

// TODO(spdowling) require a diff, compare function, valueOf()?


// TODO(spdowling) notify across all record types
// TODO(spdowling) ensure record type wrappers can interact
// TODO(spdowling) insert, update and delete all in here
// TODO(spdowling) own proxying of data as materialised view over local Trie
export class CommitController {
    #clock; #db; #observers; #unobserved;

    constructor() {
        this.#clock = new Clock();
        this.#observers = new Map();
        this.#unobserved = false;
    }

    observe(callback, options) {
        if (!callback) return;
        this.#observers.set(callback, {
            ...{
                store: '',
                instances: true,
                attributes: false,
                attributesFilter: []
            },
            ...this.#observers.get(callback) ?? {},
            ...options
        });
    }

    // insert, update and delete are responsible for the generation of the
    // messages themselves, then this commit-controller is going to attempt to
    // store that locally

    // applyMessages(messages) // locally apply commit messages
    //      existingMessages = compareMessages(messages); // check for locally existing messages
    //      clock = getClock(); // current local logical clock
    //      messages.forEach(m => {
    //          const exists = existingMessages.get(m);
    //          if (!exists || exists.timestamp < m.timestamp) apply(m);
    //          if (!exists || exists.timestamp !== m.timestamp) {
    //              clock.merkle = merkle.insert(clock.merkle, Timestamp.parse(m.timestamp))
    //              _messages.push(m);
    //          }
    //      });


    // commit entry structure should follow notify layout from original?
    // const change = { type, target, affected, oldValue };
    // with addition of record typr at the front

    // CommitType, RecordType, Record, Target, Affected, OldValue


    // apply is equivalent to our idb ops:
    // check record type(??)
    // retrieve by id
    // add new by id OR update existing by id


    // delete uses tombstone as property key and sets to 1

    // 


    // traditional db insert replacement
    async insert(timestamp, store, id, key, val) {
        if (!this.#db) return;
        if (await this.#db.getKey('commits', timestamp)) return;
        await this.#db.add('commits', { timestamp, store, id, key, val });
        // TODO(spdowling) unobserve locally originating inserts
        if (!this.#unobserved) this.#notify({ timestamp, store, id, key, val });
    }

    // TODO(spdowling) qualify whether we have the checkpoint or epoch concepts
    // down right. refer to blog posts already discussing CRDT options
    // TODO(spdowling) checkpointing generates a starting state set, which means
    // that we can materialise an initial state separately as a baseline in the
    // environment, before tracking and applying commits...
    async epoch(timestamp) {
        const commits = await this.#db.getAll('commits')
            .filter(c => c.timestamp <= timestamp);
        const baseline = commits
            .reduce((e, m) => m.timestamp <= timestamp && { ...e, ...m }, {});
        this.insert(this.#clock.now(), 'commits', nanoid(), null, baseline);
        for (const { id } of commits) this.#db.delete('commits', id);
    }

    async #notify(commit) {
        // check store, instances, attributes, attributesFilter config
        // const change = { type, target, affected, oldValue };
        // this.#value = await this.#callback(change);
        // this.#host.requestUpdate();
    }
}
