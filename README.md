# Folio

esbuild as a bundler and sass executor
so the how do we do that? and use heroku cli local to run it?

Test URLs:

- http://localhost:8080/#/
- http://localhost:8080/#/e/KWJPLmQWbD/i/mMFnfMKzqf

For server handling, sync and storage of events, we should be using SQLite as our
backend, it's plenty performant enough. If required later on, we can go ahead
and use litestream to replicate sqlite data using their WAL hooking logic

Means we don't need a fancy-ass managed DB still, since we'll be able to wrap
and ensure a facade over the backend server details

Styling & Theming:

- all components should declare consistent variables for use
- all components must provide encapsulated variable defaults
- theming/default.scss is equivalent to the combination of component defaults
- theming/ provides a component for theme control (theme-switching)
  - e.g. https://github.com/picocss/examples/blob/master/js/minimal-theme-switcher.js
  - e.g. https://diegosanchezp.github.io/theme-switcher-component/
- theming/ provides a controller that components can depend on for value changes

consider introducing characteristic value component which would help us to
simplify the form for chars on canvas in data-panel as well as potentially
render in a nicer manner elsewhere:

- add new value
- select existing
- select default(s)

we should try and focus on removing as many dependencies on lit packages as
possible, including directives from lit-html. replacing repeat, map, when etc.
with vanilla conditional logic and only considering further performance
enhancements once we have the need

if we wanted to replace lit-element, some helpful inspiration might live in:

- https://blog.axlight.com/posts/developing-a-memoization-library-with-proxies/
  - explanation of how to track affected attributes of an object
- https://github.com/dai-shi/proxy-compare
  - source code inspiration to implement affected tracking using proxies

something to help with dynamic or reactive styling control:
https://github.com/adam-cyclones/reactive-css-properties

webcomponents library for inspo:
https://github.com/andrico1234/oui-ui

- @folio/folio - the main app
  - @folio/ui
    - @folio/prompt
    - @folio/autocomplete
    - @folio/commander
    - @folio/environment
    - @folio/entity
    - @folio/property
    - @folio/notice? notifications, or toast popups
  - @folio/controllers
    - @folio/route
    - @folio/hotkeys
    - @folio/theme
    - @folio/sync? synchronisation service

interesting micro-fsm that could be a good start for any consideration of flows
as part of lifecycle management:

```javascript
function transitionMachine(machine, { value: currentState } = {}, event) {
  ({ type: event = event } = event);
  const A = (i) => (Array.isArray(i) ? i : [i]);
  let state = currentState ?? machine.initial;
  let transition = machine.states[state].on?.[event] ??
    machine.on?.[event] ?? { target: state };
  let value = transition?.target ?? transition;
  let changed = value !== currentState;
  let actions = [
    ...(changed ? A(machine.states[currentState]?.exit ?? []) : []),
    ...A(transition.actions ?? []),
    ...(changed ? A(machine.states[value]?.entry ?? []) : []),
  ];
  let states = value.split(":");
  let inState = states.reduce((a, i) => ({ ...a, [i]: true }), {});
  return { value, changed, actions, states, inState };
}
```

frontend performance considerations:
https://www.smashingmagazine.com/2021/01/front-end-performance-2021-free-pdf-checklist/

How to organise our default shortcuts to make sure we don't overlap too much:
https://stackoverflow.com/questions/2769317/which-key-to-bind-to-avoid-conflict-with-native-browser-shortcuts
https://support.google.com/mail/answer/6594?hl=en-GB&co=GENIE.Platform%3DDesktop#zippy=%2Ccompose-chat%2Cformatting-text%2Capplication

github is another good source of element, style and logic inspiration for components
they make heavy use of data-\* attributes and have reasonable approaches to
fallback, but also how to structure elements and components

consider if we can replace all of our properties that define attribute: false
with data-\* attribute naming schemes instead

helpful error capturing middleware code?

```js
/* middleware can take any number of arguments of any type */
const middleware = (...args) => {
  const [event, ...data] = args;

  if (event.error) {
    /* caught the Error instance object */
    return event.error;
  }

  /* caught a hard exception, pass on... */
  return data;
};
window.addEventListener("error", middleware);
window.onerror = middleware;
```

setup heroku for deployment of the app/demo soon?

https://github.com/consento-org/hlc
https://github.com/cockroachdb/cockroach/blob/663fcf17cb8789a2c46a719e0107a15400eee918/pkg/util/hlc/hlc.go
https://github.com/websockets/ws
https://github.com/jaredwray/keyv/blob/master/packages/sqlite/package.json
https://github.com/kujirahand/node-sqlite-kvs/blob/master/lib/sqlite-kvs.js
https://stackoverflow.com/questions/7233057/lightweight-javascript-db-for-use-in-node-js?answertab=active#tab-top
https://github.com/louischatriot/nedb/tree/master/lib
https://github.com/techfort/LokiJS
https://github.com/sergeyksv/tingodb
https://github.com/floydpink/lzwCompress.js/blob/main/lzwCompress.js
https://github.com/felixge/node-dirty/blob/master/lib/dirty/dirty.js
https://github.com/jonalvarezz/snowpack-template-tailwind
https://github.com/pawap90/phaser3-ts-snowpack-eslint
https://benkaiser.dev/snowpack-github-actions/amp/

https://github.com/andrico1234/web-components-resources

serviceworkers for githubpages:
https://gist.github.com/kosamari/7c5d1e8449b2fbc97d372675f16b566e

Swarm: CRDT-backed, reactive, real-time data. Repo is dead, but inspo:

- https://github.com/olebedev/swarm
- https://replicated.cc/swarm/

interesting mesh p2p considerations:

- https://github.com/weaveworks/mesh

RON format in general. also seems dead but interesting concepts and intent

- https://replicated.cc
  RON paper in files was updated Dec `21, so some movement
- https://github.com/gritzko/replicated.cc

https://mythbusters.js.org/#/

if we ever wanted to get rid of lit, we could do worse than:

- https://github.com/cferdinandi/reef/tree/master/src
- and maybe pepper in some portions of lit-html if we wanted to...

Other error handling considerations:

- https://blog.logrocket.com/javascript-either-monad-error-handling/
- https://openupthecloud.com/error-handling-javascript/
- https://github.com/ipfs/interface-datastore/blob/master/src/errors.js
- https://github.com/IndigoUnited/js-err-code/blob/master/index.js

Naming / Organisation

- inspo: https://github.com/edmulraney/snowpack-monorepo
- inspo: https://github.com/tgreyuk/govuk-webcomponents

using ts-check to identify types for us without typescript compilation

- https://medium.com/@benhurott/type-check-in-vanillajs-with-ts-vscode-1ca8e8f66665

buidless:
https://itnext.io/going-buildless-cffeb67f6289

Using SCSS with lit:

- https://stackoverflow.com/questions/61221405/lit-unable-to-load-scss-into-lit
- https://www.reddit.com/r/PolymerJS/comments/emd4ur/directly_using_scss_in_litelement/
  - https://gist.github.com/p-ob/01c02d3b88c6ad1cf44e6618211f305a

Best Practice validation:

- https://developers.google.com/web/fundamentals/web-components/best-practices
- https://github.com/webcomponents/gold-standard/wiki
- https://w3ctag.github.io/webcomponents-design-guidelines/
- https://open-wc.org/guides/developing-components/publishing/
- https://github.com/open-wc/customs-manifest
- https://github.com/open-wc/open-wc-starter-app
- https://github.com/mateusortiz/webcomponents-the-right-way#who-to-follow
- https://open-wc.org/guides/knowledge/styling/style-host-via-property/
- https://github.com/edmulraney/snowpack-monorepo

Online / Offline

- ServiceWorker
- BackgroundSync API
- Conflict resolution
- https://github.com/yjs/yjs#Relative-Positions
- https://wicg.github.io/periodic-background-sync/
- https://www.excellarate.com/blogs/background-sync-pwas-backbone/
- PWA implementation
- Replace idb?
  - https://github.com/jakearchibald/idb/blob/main/src/database-extras.ts
  - would need to provide our own promise wrap
  - https://cdn.jsdelivr.net/npm/idb@7.0.0/build/index.js
  - https://cdn.jsdelivr.net/npm/idb@7.0.0/build/wrap-idb-value.js
  - https://github.com/buley/dash

interesting thoughts on indexeddb and SQLite - https://jlongster.com/future-sql-web

ServiceWorker BackgroundSync API and IndexedDB to allow for offline first mode while still implementing approaches to online synchronisation
Google workbox is nice, but would prefer vanillajs as much as possible
Even idb could be replaced by our own code

// https://blog.sessionstack.com/how-javascript-works-the-internals-of-shadow-dom-how-to-build-self-contained-components-244331c4de6e
// https://blog.sessionstack.com/how-javascript-works-service-workers-their-life-cycle-and-use-cases-52b19ad98b58
// https://blog.sessionstack.com/how-javascript-works-the-mechanics-of-web-push-notifications-290176c5c55d

- What is going on with the service worker thing from vanillajs slides/deck?

Validate ourselves against starter kit to see best practice ideas:
https://github.com/lit/lit-starter-js

// NOTE: Units libraries:
// https://github.com/gentooboontoo/js-quantities
// https://stackoverflow.com/questions/865590/unit-of-measure-conversion-library
// https://codepen.io/jacobbanner/pen/oxeoqp?js-preprocessor=babel
// https://github.com/Philzen/measurement.js/blob/master/measurement.js
// https://mathjs.org/docs/datatypes/units.html
// https://github.com/josdejong/mathjs/blob/develop/src/type/unit/Unit.js
// https://github.com/convert-units/convert-units/tree/main/src/definitions

// Prefixes to support:
// googol, kibi, mebi, gibi, tebi, pebi, exi, zebi, yebi, yotta,
// zetta, exa, peta, tera, giga, mega, kilo, hecto, deca, deci,
// centi, milli, micro, nano, pico, femto, atto, zepto, yocto

// Unit types:
// length, mass, area, time, frequency, information, information-rate,
// currency, resolution, percent

find memory leaks in web apps:
https://github.com/nolanlawson/fuite

interesting emoji picker component:
https://github.com/nolanlawson/emoji-picker-element

localisation helper:
https://github.com/Lit/Lit/tree/main/packages/localize

dealing with async interactions:
https://github.com/lit/lit/tree/main/packages/labs/task

e2e example to validate against:
https://github.com/fernandopasik/hello-web-components

actually really good looking opensource openapi viewer:
https://mrin9.github.io/RapiDoc/

OpenReplay is an open source session replay for developers:
https://github.com/openreplay/openreplay

VanillaJS can do a lot!
https://dev.to/pluralsight/vanilla-javascript-and-html-no-frameworks-no-libraries-no-problem-2n99

DOM helper code
https://gitlab.com/zeen3/z3util-dom
https://gitlab.com/zeen3/z3util-dom/-/blob/master/lib/index.js

web component best practices:
https://developers.google.com/web/fundamentals/web-components/best-practices

https://github.com/mateusortiz/webcomponents-the-right-way

even more lightweight component framework than lit?

- https://github.com/operatortc/tonic

https://joinmastodon.org/ is just an interesting social media network concept
that is far more open and decentralised instead of a single web entity platform
