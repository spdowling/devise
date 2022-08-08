// @ts-check

// TODO(spdowling) <dialog> doesn't have good browser support
// TODO(spdowling) <dialog> get Escape working
// TODO(spdowling) <dialog> get outside clicks working
// TODO(spdowling) https://github.com/picocss/pico/blob/master/docs/js/modal.js
// has some answers for us
// <!-- TODO(spdowling) resolve dialog concerns to replace autocomplete?
// <dialog ?open=${this._commanding} @close=${this._commanding = false}>
//     <article>
//         <header><p>commander search?</p></header>
//         <folio-autocomplete
//             .index=${[{ name: 'commands' }]}
//             @folio-autocomplete:select=${this._command}>
//         </folio-autocomplete>
//         <!-- could have results list here? -->
//         <footer>navigation guidance</footer>
//     </article>
// </dialog-->
// <folio-prompt ?open=${this._commanding}>
//     <folio-autocomplete slot="content"
//         .index=${[{ name: 'commands' }]}
//         @folio-autocomplete:select=${this._command}>
//     </folio-autocomplete>
// </folio-prompt>

// rename to Dialog

// support PromptDialog and ConfirmDialog as specialisations
// Prompt wants inputs, Confirm includes buttons to continue to exit?
// what about ChooseDialog? which offers a list of items using autocomplete
// to be chosen before closing/firing?

export { FolioPromptElement } from './prompt';
