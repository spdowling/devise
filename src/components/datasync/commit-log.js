// @ts-check

import { css, html, LitElement } from 'lit';

// @ts-expect-error
import { styles } from '../../index.scss';

export class FolioCommitLogElement extends LitElement {
    #synclog;

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
            // TODO(spdowling) replace with SynclogController
            // this.#synclog = new EntityController(
            //     this,
            //     this.env,
            //     async () => (await this.#synclog.all()),
            //     { records: true }
            // );
        }
    }

    // TODO(spdowling) consider filtering on commit type, ordering by timestamp
    // multiple filtering with epoch and other properties etc.
    render() {
        const nop = (e) => e.key === 'Enter' && e.preventDefault();
        const visible = this.visible.length
            ? this.visible
            : this.#synclog?.value ?? [];
        // TODO(spdowling) do a better job of regex replacing slashes
        const baseUrl = this.baseUrl === '/' ? '' : this.baseUrl;
        // TODO(spdowling) allow link to entities if the changelog is related
        // to an entity or not...
        return html`
            <input type="search" @keydown=${nop} @input=${this.#filter}>
            <ul>
            ${visible.map((e) => html`
                <li>
                    <a href="${baseUrl}/${e.id}">${e.name}</a>
                </li>`)}
            </ul>`;
    }

    // TODO(spdowling) apply filtering to the impacted or affected record name
    #filter({ target: { value: query } }) {
        const clean = (query) => query
            .toString().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .normalize('NFC').toString();
        this.visible = this.#synclog?.value?.slice(0)
            .filter(c => clean(c.name).indexOf(clean(query)) >= 0);
    }
}

customElements.define('folio-commit-log', FolioCommitLogElement);
