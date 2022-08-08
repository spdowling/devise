// @ts-check

import { css, html, LitElement } from 'lit';
import { RouteController } from '../routing';
import { CommandController } from '../commander';
import { EnvironmentController } from '../environment';

// NOTE(spdowling) element composition imports
import '../commander';
import '../prompt';
import '../autocomplete';
import '../environment';

// @ts-expect-error
import { styles } from '../../index.scss';

export class FolioAppElement extends LitElement {
    #router; #commands; #environments;

    static styles = [
        styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    static properties = {
        prompt: { state: true }
    };

    constructor() {
        super();
        this.prompt = null;
    }

    get #environment() {
        return this.#router.state?.params?.env;
    }

    connectedCallback() {
        super.connectedCallback();
        this.#router = new RouteController(this);
        this.#router.register({ name: 'root', path: '/' });
        this.#router.register({ name: 'environment', path: '/:env/*' });
        this.#commands = new CommandController(this);
        this.#commands.register(this.#switch, 'Switch Environment');
        this.#commands.register(this.#import, 'Import Environment');
        this.#commands.register(this.#export, 'Export Environment');
        this.#commands.register(this.#destroy, 'Destroy Environment');
        this.#commands.register(this.#recover, 'Recover Environment');
        this.#commands.register(this.#upgrade, 'Upgrade Environment');
        // TODO(spdowling) switch to non-observing instance
        this.#environments = new EnvironmentController(
            this,
            async () => (await this.#environments.all())
                .map(e => ({ id: e.id, name: e.name }), {})
        );
    }

    render() {
        return html`
            <folio-commander></folio-commander>
            <folio-prompt ?open=${!!this.prompt}>
                ${this.prompt ?? null}
            </folio-prompt>
            ${this.#environment
                ? html`
            <folio-environment
                .env=${this.#environment}>
            </folio-environment>`
                : html`
            <section id="environments" class="container">
                <header>
                    <hgroup>
                        <h2>Environments</h2>
                        <h3>Independently configured workspaces</h3>
                    </hgroup>
                </header>
                <folio-environments
                    .baseUrl=${this.#router.link()}>
                </folio-environments>
            </section>`}`;
    }

    async #switch() {
        const chosen = await this.#choose(
            this.#environments.value,
            'Switch to...',
            // TODO(spdowling) allow placeholder marker for query value 
            // such as %%query%% or similar?
            'Environment not found. Create instead?'
        ) ?? {};
        console.log('creating:', chosen.query);
        // if chosen.id is unset, it means we have returned the query value
        // because we didn't find an existing item according to what was
        // queried for. so we need to open (create) according to that
        // query value, assign as the new id and then route to it
        chosen.id ??= await this.#environments.open({ name: chosen.query });
        this.#router.goto(`/${chosen.id}`);
    }

    #import() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', () => {
            console.log('importing:', [...input.files][0]);
            // const reader = new FileReader();
            // reader.addEventListener('load', ({ target: { result } }) => {
            //      console.log(reader.result);
            // });
            // reader.readAsText([...input.files][0]), 'UTF-8');
        });
        input.click();
    }

    async #export() {
        if (!this.#environments.value.length) return;
        const chosen = await this.#choose(
            this.#environments.value,
            'Export...'
        );
        const env = this.#environments.value.find(e => e.id === chosen.id);
        const anchor = document.createElement('a');
        anchor.download = `${env.name}`;
        anchor.href = URL.createObjectURL(new Blob(
            [JSON.stringify(env, null, 4)],
            { type: 'application/json' }
        ));
        setTimeout(() => URL.revokeObjectURL(anchor.href), 10);
        anchor.click();
    }

    async #destroy() {
        if (!this.#environments.value.length) return;
        const chosen = await this.#choose(
            this.#environments.value,
            'Destroy...'
        );
        if (chosen?.id && await this.#confirm(`Destroy ${chosen.id}?`)) {
            console.log('destroying', chosen.id);
            // this.#environments.destroy(chosen.id);
        }
    }

    async #recover() {
        if (!this.#environments.value.length) return;
        const chosen = await this.#choose(
            this.#environments.value,
            'Recover...'
        );
        if (chosen?.id && await this.#confirm(`Recover ${chosen.id}?`)) {
            console.log('recovering', chosen.id);
            // this.#environments.recover(chosen.id);
        }
    }

    async #upgrade() {
        if (!this.#environments.value.length) return;
        const chosen = await this.#choose(
            this.#environments.value,
            'Upgrade...'
        );
        if (chosen?.id && await this.#confirm(`Upgrade ${chosen.id}?`)) {
            console.log('upgrading', chosen.id);
            // this.#environments.upgrade(chosen.id);
        }
    }

    #choose(data, placeholder, emptyResult) {
        const fn = (res, { detail }) => !(this.prompt = null) && !res(detail);
        return new Promise(res => {
            // TODO(spdowling) move to prompt() as some kind of resolving
            // public api member on a class?
            this.prompt = html`
                <folio-autocomplete
                    .data=${data}
                    .placeholder=${placeholder}
                    .resultsList=${true}
                    .emptyResult=${emptyResult}
                    .selectEmpty=${!!emptyResult}
                    @folio-autocomplete:select=${(e) => fn(res, e)}>
                </folio-autocomplete>`;
        });
    }

    #confirm(message) {
        const fn = (res, confirm) => !(this.prompt = null) && !res(confirm);
        return new Promise(res => {
            // TODO(spdowling) track dialog.returnValue for auto-close?
            // TODO(spdowling) method="dialog" error:
            // 'Form submission canceled because the form is not connected'
            this.prompt = html`
                <p>${message}</p>
                <footer>
                    <button class="secondary"
                        @click=${() => fn(res, false)}>Cancel</button>
                    <button
                        @click=${() => fn(res, true)}>Confirm</button>
                </footer>`;
        });
    }
}

customElements.define('folio-app', FolioAppElement);
