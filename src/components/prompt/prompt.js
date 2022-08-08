// @ts-check

import { html, LitElement } from 'lit';

// @ts-expect-error
import { styles } from '../../index.scss';

// https://allyjs.io/tutorials/accessible-dialog.html
// https://github.com/andreasbm/web-dialog

// TODO(spdowling) disable scroll whilst prompt shown: .modal-is-open from pico
// document.documentElement.classList.add('modal-is-open');

// TODO(spdowling) check for other instances of prompt and replace? perhaps
// based on configuration? if prompt requires confirmation, then don't allow
// new one

// NOTE(spdowling)
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog:
// <form> elements can close a dialog if they have the attribute method="dialog".
// When such a form is submitted, the dialog closes with its returnValue
// property set to the value of the button that was used to submit the form.

export class FolioPromptElement extends LitElement {
    static shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true
    };

    static styles = [styles];

    static properties = {
        open: { type: Boolean }
    };

    constructor() {
        super();
        this.open = false;
        // this.setAttribute('tabindex', '-1');
        // TODO(spdowling) test whether this works just as well instead of
        // setAttribute... may need to do it inside of connected callback?
        // this.tabIndex = -1;
        this.addEventListener('click', (e) => {
            if (e.target === this && this.open) {
                console.log('closing');
                this._close();
            }
        });
        // replace with hotkeys?
        this.addEventListener('keydown', (e) => this._keydown(e));
    }

    // connectedCallback() { find existing and hide? }

    update(changedProperties) {
        super.update(changedProperties);
        if (this.open) this.focus();
    }

    render() {
        // TODO(spdowling) only render header or footer if slot provided
        return html`
            <dialog ?open=${this.open}>
                <article>
                    <slot></slot>
                </article>
            </dialog>`;
    }

    _keydown(e) {
        switch (e.key) {
            case 'Escape':
                // TODO(spdowling) we don't necessarily always want to allow
                // closing on Escape. e.g. maybe they are in a dialog for
                // something else and they hit escape from an autocomplete
                // and lose their progress?
                if (this.open) this._close();
                break;
            case 'Tab':
                // override tab behaviour to contain focus within the prompt
                // content

                // currentTarget must be an Element
                // if (!(event.currentTarget instanceof Element)) return;
                // currentTarget must contain details-dialog
                // const dialog = event.currentTarget.querySelector('details-dialog');
                // if (!dialog) return;
                // prevent default tab behaviour
                // event.preventDefault();
                // get me all focusable elements
                // const elements = Array.from(dialog.querySelectorAll('*')).filter(focusable);
                // if (elements.length === 0) return;
                // backwards or forwards? shift+tab or just tab?
                // const movement = event.shiftKey ? -1 : 1;
                // get root note of dialog
                // const root = dialog.getRootNode();
                // 
                // const currentFocus = dialog.contains(root.activeElement) ? root.activeElement : null;
                // let targetIndex = movement === -1 ? -1 : 0;
                // if (currentFocus instanceof HTMLElement) {
                //     const currentIndex = elements.indexOf(currentFocus);
                //     if (currentIndex !== -1) {
                //         targetIndex = currentIndex + movement;
                //     }
                // }
                // if (targetIndex < 0) {
                //     targetIndex = elements.length - 1;
                // } else {
                //     targetIndex = targetIndex % elements.length;
                // }
                // elements[targetIndex].focus();
                break;
        }
    }

    _close() {
        this.dispatchEvent(new CustomEvent('folio-prompt:close'));
    }
}

customElements.define('folio-prompt', FolioPromptElement);
