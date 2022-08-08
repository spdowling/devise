/** @type {import('snowpack').SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: '/' },
    src: { url: '/dist' },
  },
  packageOptions: {
    knownEntrypoints: [
      'lit-html',
      'lit-html/directives/cache.js',
      'lit-html/directives/choose.js',
      'lit-html/directives/map.js',
      'lit-html/directives/ref.js',
      'lit-html/directives/repeat.js',
      'lit-html/directives/unsafe-html.js',
      'lit-html/directives/when.js',
    ],
  },
  plugins: [
    ['./snowpack-plugin-lit-css', { style: 'compressed' }],
  ],
  devOptions: {
    open: 'none',
  },
  routes: [{ match: 'routes', src: '.*', dest: '/index.html' }],
};
