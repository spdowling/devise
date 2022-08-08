// @ts-check

import { css, html, LitElement, nothing } from 'lit';
import { RouteController } from '../routing';
import { CommandController } from '../commander';
import { EntityController } from '.';

// NOTE(spdowling) element composition imports
import '../prompt';
import '../autocomplete';
import '../entity';

// @ts-expect-error
import { styles } from '../../index.scss';

export class FolioEnvironmentElement extends LitElement {
    #router; #commands; #entities;

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
        prompt: { state: true }
    };

    constructor() {
        super();
        this.env = '';
        this.prompt = null;
    }

    get #entity() {
        return this.#router.state?.params?.entity;
    }

    connectedCallback() {
        super.connectedCallback();
        this.#router = new RouteController(this);
        this.#router.register({ name: 'root', path: '/' });
        this.#router.register({ name: 'entity', path: '/:entity' });
        this.#commands = new CommandController(this);
        this.#commands.register(this.#open, 'Open Entity');
        this.#commands.register(this.#import, 'Import Entity');
        this.#commands.register(this.#export, 'Export Entity');
        this.#commands.register(this.#delete, 'Delete Entity');
    }

    update(changedProperties) {
        super.update(changedProperties);
        if (changedProperties.has('env') &&
            changedProperties.get('env') !== this.env) {
            // TODO(spdowling) remove dependency on an observing instance,
            // instead rely on a standard class to retrieve info and have
            // folio-entities handled observations

            // TODO(spdowling) error on attempting to get on a proxy that was
            // revoked if we edit the entity in folio-entity form fields. may
            // be resolved by switching to non-observational approach
            this.#entities = new EntityController(this, this.env,
                async () => (await this.#entities.all())
                    .map(i => ({ id: i.id, name: i.name, type: i.type })),
                { records: true }
            );
        }
    }

    render() {
        return html`
            <folio-prompt ?open=${!!this.prompt}>
                ${this.prompt ?? nothing}
            </folio-prompt>
            ${this.#entity
                ? html`
            <folio-entity
                .env=${this.env} .entity=${this.#entity}>
            </folio-entity>`
                : html`
            <section id="entities" class="container">
                <header>
                    <hgroup>
                        <h2>Entities</h2>
                        <h3>Composed data properties and behaviour</h3>
                    </hgroup>
                </header>
                <folio-entities
                    .env=${this.env} .baseUrl=${this.#router.link()}>
                </folio-entities>
            </section>`}`;
    }

    #open() {
        const select = async ({ detail }) => {
            const result = detail ?? {};
            if (detail?.query) {
                result.id = await this.#entities.create({
                    name: detail.query,
                    // TODO(spdowling) when we have no entities, we will have
                    // no current type. do we ask for one?
                    type: this.#entity?.type ?? 'SPECIFICATION'
                });
            }
            this.prompt = null;
            this.#router.goto(`/${result.id}`);
        }
        this.prompt = html`
            <folio-autocomplete
                .data=${this.#entities?.value}
                .placeholder=${'Entity to open...'}
                .resultsList=${true}
                .emptyResult=${'No entity found. Create?'}
                .selectEmpty=${true}
                @folio-autocomplete:select=${select}>
            </folio-autocomplete>`;
    }

    #import() {
        const trapKey = (e) => {
            if (e.key === 'Enter') return false;
            if (e.key === 'Escape') {
                e.target.blur();
                e.stopPropagation();
            }
        }
        const remote = async ({ target: { value } }) => {
            if (!value) return;
            // const url = new URL(e.target.value);
            // const data = await fetch(url.href);
            // const json = await data.json();
            this.prompt = null;
        }
        const local = async ({ target: { files } }) => {
            if (!files) return;
            // TODO(spdowling) validate and process files[0]
            this.prompt = null;
        }
        this.prompt = html`
            <form @keydown=${trapKey}>
                <label for="remote">Import from URL
                    <input id="remote" type="text" @change=${remote}>
                    <small>Full URL to JSON file</small>
                </label>
                <label for="local">Import from local machine
                    <input id="local" type="file" @change=${local}> 
                    <small>Select local JSON file</small>
                </label>
            </form>`;
    }

    #export() {
        const download = (entity) => {
            if (!entity) return;
            const link = document.createElement('a');
            link.download = `${entity.name}`;
            const blob = new Blob(
                [JSON.stringify(entity)], { type: 'application/json' }
            );
            link.href = URL.createObjectURL(blob);
            setTimeout(() => URL.revokeObjectURL(link.href), 10);
            link.click();
        }
        const select = async ({ detail: { item: { id } } }) => {
            if (!id) return;
            download(this.#entities?.value?.find(e => e.id === id));
            this.prompt = null;
        }
        if (this.#entity) {
            download(this.#entities?.value?.find(e => e.id === this.#entity))
        } else {
            this.prompt = html`
                <folio-autocomplete
                    .data=${this.#entities?.value}
                    .placeholder=${'Entity to export...'}
                    .resultsList=${true}
                    .emptyResult=${'No entity found'}
                    @folio-autocomplete:select=${select}>
                </folio-autocomplete>`;
        }
    }

    #delete() {
        const select = async ({ detail: { id } }) => {
            if (id === undefined) return;
            const ok = await this.#confirm(`Delete ${id}?`)
            if (ok) console.log('delete', id);
            this.prompt = null;
            // TODO(spdowling) what happens if they delete currently viewed?
        }
        this.prompt = html`
            <folio-autocomplete
                .data=${this.#entities?.value}
                .placeholder=${'Entity to delete...'}
                .resultsList=${true}
                .emptyResult=${'No entity found'}
                @folio-autocomplete:select=${select}>
            </folio-autocomplete>`;
    }

    #confirm(message) {
        return new Promise(res => {
            this.prompt = html`
                <p>${message}</p>
                <footer>
                    <button class="secondary"
                        @click=${() => res(false)}>Cancel</button>
                    <button
                        @click=${() => res(true)}>Confirm</button>
                </footer>`;
        });
    }
}

customElements.define('folio-environment', FolioEnvironmentElement);
