// @ts-check

import { css, html, LitElement } from 'lit';
import { EntityController } from '../environment';

// @ts-expect-error
import { styles } from '../../index.scss';

export class FolioEntitiesElement extends LitElement {
    #entities;

    static styles = [
        styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    static properties = {
        env: { type: String, attribute: false },
        baseUrl: { type: String, attribute: false },
        visible: { state: true }
    };

    constructor() {
        super();
        this.env = '';
        this.baseUrl = '';
        this.visible = [];
    }

    update(changedProperties) {
        super.update(changedProperties);
        if (changedProperties.has('env') &&
            changedProperties.get('env') !== this.env) {
            this.#entities = new EntityController(
                this,
                this.env,
                async () => (await this.#entities.all()),
                { records: true }
            );
        }
    }

    render() {
        const nop = (e) => e.key === 'Enter' && e.preventDefault();
        const visible = this.visible.length
            ? this.visible
            : this.#entities?.value ?? [];
        // TODO(spdowling) do a better job of regex replacing slashes
        const baseUrl = this.baseUrl === '/' ? '' : this.baseUrl;
        return html`
            <input type="search" @keydown=${nop} @input=${this.#filter}>
            <ul>
            ${visible.map((e) => html`
                <li>
                    <a href="${baseUrl}/${e.id}">${e.name}</a>
                </li>`)}
            </ul>`;
    }

    #filter({ target: { value: query } }) {
        const clean = (query) => query
            .toString().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .normalize('NFC').toString();
        this.visible = this.#entities?.value?.slice(0)
            .filter(c => clean(c.name).indexOf(clean(query)) >= 0);
    }
}

customElements.define('folio-entities', FolioEntitiesElement);
