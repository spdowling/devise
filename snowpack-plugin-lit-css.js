// @ts-check

// TODO(spdowling) move to __repo__/scripts/

const sass = require("@snowpack/plugin-sass");

const clean = (css) => {
    if (!css) return '``';
    // TODO(spdowling) confirm character replacement requirements:
    // $  should be \\$
    // `  should be \\`
    // \\ should be \\\\
    const illegal = { '$': '\\$', '`': '\\`', '\\': '\\\\' };
    // TODO(spdowling) are there better ways to perform the replace?
    // e.g.:
    // css.toString('utf-8', 0, css.length)
    //     .replace(/\\/g, '\\')
    //     .replace(/\$\{/g, '\\${')
    //     .replace(/([^\\])`/g, '$1\\`');
    let res = '';
    for (let i = 0; i < css.length; i++) {
        const c = css.charAt(i);
        res += illegal[c] ?? c;
    }
    return `\`${res}\``;
}

// TODO(spdowling) this only allows us to import one style file, since we
// are restricting the naming of the exported const, instead of trying
// to use a unique export name or rely on a default
// if we provide a default, then we don't need to name it and we have a change
// to name it as we see fit?
const transform = (css) =>
    `import { css } from 'lit'; export const styles = css${clean(css)};`;

module.exports = (config, options) => {
    const compiler = sass(config, options);
    return {
        name: 'snowpack-plugin-lit-css',
        // TODO(spdowling) look out for .css as well, don't compile
        // but transform
        resolve: { input: ['.scss'], output: ['.js', '.css'] },
        async load({ filePath, isDev }) {
            const css = await compiler.load({ filePath, isDev });
            // TODO(spdowling) support sourcemap results
            // { '.js': { code: transform(css), map: '' } }
            // { '.css': { code: css, map: '' } }
            if (css) return {
                ...{ '.js': transform(css) },
                ...{ '.css': css },
                // TODO(spdowling) make .css generation optional, based on
                // current hmr configuration from config
                // ...isHmrEnabled ? { '.css': css } : {},
            };
        },
        onChange({ filePath }) {
            compiler.onChange({ filePath });
        },
    }
};
