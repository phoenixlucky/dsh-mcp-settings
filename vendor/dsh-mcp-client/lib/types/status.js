var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
/** Root catalog shared by every configured mcp-client instance. */
let McpClientStatusCatalog = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _list_decorators;
    return class McpClientStatusCatalog extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _list_decorators = [Remote];
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['typert'];
        rows = (__runInitializers(this, _instanceExtraInitializers), new Map());
        managedResources = new Map();
        revisions = new Map();
        nextId = 0;
        constructor(ctx) { super(ctx, 'mcpClientStatus', { namespace: 'mcpClientStatus' }); }
        /** Return live connection summaries with credentials and command arguments omitted.
         * @returns The current server status rows.
         */
        list() { return [...this.rows.values()].map(row => ({ ...row, tools: [...row.tools] })); }
        /**
         * Add one server row and return its update and teardown functions.
         * @param input - Credential-safe connection details for the server.
         * @returns Functions that update or remove the registered row.
         */
        register(input, managedServerId) {
            const id = `${input.serverName}:${++this.nextId}`;
            this.rows.set(id, { ...input, ...(managedServerId === undefined ? {} : { managedServerId }), connectionRevision: 0, tools: [...input.tools], id });
            this.revisions.set(id, 0);
            return {
                update: (patch) => {
                    const current = this.rows.get(id);
                    if (current !== undefined) {
                        const revision = (this.revisions.get(id) ?? 0) + (patch.state !== undefined && patch.state !== current.state ? 1 : 0);
                        this.revisions.set(id, revision);
                        this.rows.set(id, { ...current, ...patch, connectionRevision: revision, tools: patch.tools === undefined ? current.tools : [...patch.tools] });
                    }
                },
                setResourceProvider: (provider) => {
                    if (managedServerId === undefined)
                        return;
                    if (provider === undefined) {
                        if (this.managedResources.get(managedServerId)?.statusId === id)
                            this.managedResources.delete(managedServerId);
                    }
                    else {
                        this.managedResources.set(managedServerId, { statusId: id, provider });
                    }
                },
                dispose: () => {
                    this.rows.delete(id);
                    this.revisions.delete(id);
                    if (managedServerId !== undefined && this.managedResources.get(managedServerId)?.statusId === id)
                        this.managedResources.delete(managedServerId);
                },
            };
        }
        /** Resolve a live provider only while its exact managed connection is connected. */
        getManagedResourceHandle(managedServerId) {
            const entry = this.managedResources.get(managedServerId);
            const row = entry === undefined ? undefined : this.rows.get(entry.statusId);
            if (entry === undefined || row === undefined)
                return undefined;
            return { provider: entry.provider, revision: this.revisions.get(entry.statusId) ?? 0, state: row.state };
        }
    };
})();
export { McpClientStatusCatalog };
export default McpClientStatusCatalog;
//# sourceMappingURL=status.js.map
