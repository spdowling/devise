// @ts-check

import { nanoid } from 'nanoid';

// considerations for proxy and weakmap storage:
// https://github.com/YousefED/SyncedStore/blob/main/packages/core/src/internal.ts
// https://github.com/YousefED/SyncedStore/blob/main/packages/core/src/object.ts

export class Clock {
    #wall; #tick; #node;

    // Timestamp.toString() fmt.Sprintf("%d.%09d,%d", t.WallTime/1e9, t.WallTime%1e9, t.Logical)
    static parse(timestamp) {
        // TODO(spdowling) requires RegExp validation of timestamp input
        // example regexp = `^(?P<sign>-)?(?P<secs>\d{1,19})(?:\.(?P<nanos>\d{1,20}))?(?:,(?P<logical>-?\d{1,10}))?(?P<synthetic>\?)?$`)
        // TODO(spdowling) !isNaN(wall), !isNaN(tick)
        // TODO(spdowling) convert to .split().map()?
        const [wall, tick, ...node] = timestamp.split(':');
        return new Clock({
            // secs, nanos, wall, tick, node
            wall: parseInt(wall),
            tick: parseInt(tick, 36),
            node: node.join(':')
        });
    }

    constructor(clock) {
        this.#wall = clock.wall ?? Date.now();
        this.#tick = clock.tick ?? 0;
        this.#node = clock.node ?? nanoid();
    }

    // TODO(spdowling) remove; compare/sort with valueOf()
    get wall() {
        return this.#wall;
    }

    // TODO(spdowling) remove; compare/sort with valueOf()
    get tick() {
        return this.#tick;
    }

    // TODO(spdowling) remove; compare/sort with valueOf()
    get node() {
        return this.#node;
    }

    now() {
        // if update has no return, trigger this.update and then return this
        return this.update(this);
    }

    update(clock) {
        // if (timestamp.node === this.#node) throw Error('duplicate node');
        const wall = Date.now();
        // do we really want to create a new clock instance just for now?
        // it'll be an invalid node value compared to what we want ...
        // if we are able to use valueof, then we dont need to retrieve the wall
        // value from each one right?
        const latest = [this.#wall, clock.wall, new Clock({ wall })]
            // if .valueOf() is comparable, just use: .sort().pop(); ?
            .sort((a, b) => a.wall - b.wall || a.tick - b.tick).pop();
        const offset = latest.wall - wall;
        if (offset > 60000) throw new Error('drift exceeded');
        if (30000 < -offset) throw new Error('jump exceeded');

        // should this be < instead of !== ?
        if (this.#wall !== latest.wall) {
            this.#wall = latest.wall;
            this.#tick = latest === clock.wall ? clock.tick + 1 : 0;
        } else {
            this.#tick = this.#wall === clock.wall
                ? Math.max(this.#tick, clock.tick) + 1
                : this.#tick + 1;
        }
        // TODO(spdowling) return object? or string? or nothing?
        return { wall: this.#wall, tick: this.#tick, node: this.#node };
    }

    valueOf() {
        return this.toString();
    }

    toString() {
        return [
            (this.#wall + '').padStart(15, '0'),
            (this.#tick).toString(36).padStart(5, '0'),
            (this.#node + '').padStart(16, '0'),
        ].join(':');
    }
}
