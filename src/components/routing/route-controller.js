// @ts-check

const origin = window.location.origin;
const controllers = [];

const compile = (route) => {
    const replaced = route.path
        .replace(/^\/+/, '')
        .replace(/(?::)(\w+)/g, (_, k) => `(?<${k}>[^/]+)`)
        .replace(/\*/g, '?(?<tail>.*)');
    return new RegExp(`(?:^\/|^)${replaced}$`);
};

export class RouteController {
    #host; #notFound; #routes; #waiting; #routing; #state;

    constructor(host, options = {}) {
        (this.#host = host).addController(this);
        // TODO(spdowling) fallback or default not found option?
        this.#notFound = options.notFound;
        this.#routes = [];
    }

    get #parent() {
        return controllers[controllers.indexOf(this) - 1];
    }

    get #nested() {
        return controllers[controllers.indexOf(this) + 1];
    }

    get state() {
        return this.#state;
    }

    hostConnected() {
        controllers.push(this);
        if (controllers.length === 1) {
            window.addEventListener('click', (e) => this.#click(e));
            window.addEventListener('popstate', () => this.#popstate());
            return this.#resolve(window.location.pathname);
        }
        this.#resolve(this.#parent?.state?.tail ?? window.location.pathname);
    }

    hostDisconnected() {
        controllers.splice(controllers.indexOf(this), 1);
    }

    register({ name, path, resolve, render }) {
        if (!name || !path) return;
        if (this.#routes.some(r => r.name === name)) return;
        this.#routes = [...this.#routes, { path, name, resolve, render }];
        return this;
    }

    unregister(name) {
        if (!name || !this.#routes.length) return;
        this.#routes = this.#routes.filter(r => r.name !== name);
        return this;
    }

    link(target, params) {
        if (target?.startsWith('/')) return target;
        const base = this.#parent?.link() ?? '';
        const path = this.#state?.path ?? '';
        if (!target) return base + path;
        if (!params) return base.replace(/\/+$/, '') + '/' + target;
        for (const route of this.#routes) {
            if (route.name !== target) continue;
            const path = route.path
                .replace(/:(\w+)/g, (_, s) => params[s] || '')
                .replace(/\*+$/, '');
            if (compile(route).test(path)) {
                return base.replace(/\/+$/, '') + path;
            }
        }
        return base + target;
    }

    async goto(path) {
        if (path !== this.#state?.path && !this.#waiting) {
            await (this.#routing = this.#resolve(path));
            if (this.#state?.path && !this.#state?.tail) {
                window.history.pushState({}, '', origin + this.link());
            }
        }
    }

    #click(e) {
        if (e.defaultPrevented || e.button !== 0 ||
            e.metaKey || e.ctrlKey || e.shiftKey) return;
        const anchor = e.composedPath().find(el => el.tagName === 'A');
        if (anchor === undefined ||
            anchor.hasAttribute('download') ||
            anchor.href.startsWith('mailto:') ||
            anchor.origin !== origin) return;
        e.preventDefault();
        if (anchor.href !== window.location.href) {
            this.goto(anchor.pathname);
        }
    }

    #popstate(e) {
        this.#resolve(window.location.pathname);
    }

    async #resolve(path) {
        this.#waiting = true;
        try { await this.#routing; } catch (e) { Promise.reject(e); }
        this.#waiting = false;
        if (!this.#routes.length) {
            this.#state = { path: '', tail: path };
        } else {
            const route = this.#routes.find(r => compile(r).test(path));
            if (!route) {
                this.#state = await this.#notFound?.(path);
            } else {
                const match = path.match(compile(route));
                const { tail, ...params } = match.groups ?? {};
                if (route.resolve && !await route.resolve(params)) return;
                if (tail) path = path.substring(0, path.length - tail.length);
                this.#state = { route, params, path, tail };
            }
        }
        if (this.#state?.tail !== undefined) {
            this.#nested?.goto?.(this.#state.tail);
        }
        this.#host.requestUpdate();
    }
}
