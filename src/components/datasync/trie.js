// @ts-check

// TODO(spdowling) consider https://github.com/pierrec/js-xxhash as alt
// NOTE(spdowling) https://en.wikipedia.org/wiki/MurmurHash
const murmur = (key, seed = 0) => {
    if (typeof key !== 'string' && typeof key !== 'number') return;

    const data = new TextEncoder().encode('' + key);
    const size = (data.byteLength / 4) | 0;
    const body = new Uint32Array(data.buffer, data.byteOffset, size)
        .reduce((p, c) => {
            c = ((c & 0xffff) * 0xcc9e2d51) +
                ((((c >>> 16) * 0xcc9e2d51) & 0xffff) << 16);
            c = (c << 15) | (c >>> 17);
            c = ((c & 0xffff) * 0x1b873593) +
                ((((c >>> 16) * 0x1b873593) & 0xffff) << 16);
            p = p ^ c;
            p = (p << 13) | (p >>> 19);
            // NOTE(spdowling) individually calculate and correct multiply (*5)
            // and add (+0xe6465b64) to account for JS bitwise op differences
            let b = ((p & 0xffff) * 5) + ((((p >>> 16) * 5) & 0xffff) << 16);
            p = ((b & 0xffff) + 0x6b64) +
                ((((b >>> 16) + 0xe654) & 0xffff) << 16);
            return p;
        }, seed);
    const tail = data.slice(size * 4)
        .reduceRight((p, c, i) => p ^ (c & 0xff) << (i * 8), 0);

    let k = tail;
    k = ((k & 0xffff) * 0xcc9e2d51) +
        ((((k >>> 16) * 0xcc9e2d51) & 0xffff) << 16);
    k = (k << 15) | (k >>> 17);
    k = ((k & 0xffff) * 0x1b873593) +
        ((((k >>> 16) * 0x1b873593) & 0xffff) << 16);

    let h = body ^ k ^ data.length;
    h = h ^ h >>> 16;
    h = ((h & 0xffff) * 0x85ebca6b) +
        ((((h >>> 16) * 0x85ebca6b) & 0xffff) << 16);
    h = h ^ h >>> 13;
    h = ((h & 0xffff) * 0xc2b2ae35) +
        ((((h >>> 16) * 0xc2b2ae35) & 0xffff) << 16);
    h = h ^ h >>> 16;

    return h >>> 0;
}

export class Trie {
    static parse(values) {
        return values
            .reduce((t, v) => ({ ...t, ...Trie.insert(t, v) }), {});
    }

    static insert(trie = {}, value) {
        if (!value) return;

        const hash = murmur(value);
        if (hash) {
            return Trie.#insertKey(
                { ...trie, hash: (trie.hash ^ hash) >>> 0 },
                value.toString(3), // Number((value.wall / 1000 / 60) | 0).toString(3)
                hash
            );
        }
    }

    static diff(target = {}, source = {}, keypath = '') {
        if (target.hash === source.hash) return;

        const keys = new Set([
            ...Object.keys(target).filter(k => k !== 'hash'),
            ...Object.keys(source).filter(k => k !== 'hash')
        ]);
        const diffkey = [...keys.values()]
            .find(k => target[k]?.hash !== source[k]?.hash);
        return diffkey
            ? Trie.diff(target[diffkey], source[diffkey], keypath + diffkey)
            // parseInt(path.padEnd(16, '0'), 3) * 1000 * 60;
            : parseInt(keypath, 3);
    }

    static #insertKey(trie, key, hash) {
        if (!key.length) return trie;

        const node = trie[key[0]] || {};
        return {
            ...trie,
            [key[0]]: {
                ...node,
                ...Trie.#insertKey(node, key.slice(1), hash),
                hash: (node.hash ^ hash) >>> 0
            }
        };
    }
}
