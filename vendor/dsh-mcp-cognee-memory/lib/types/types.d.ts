/** Client-safe Cognee connection state. */
export interface CogneeStatus {
    /** Stable readiness category. */
    readonly state: 'not-configured' | 'disabled' | 'authorization-required' | 'connection-failed' | 'incompatible-tools' | 'ready';
    /** Translation key owned by the settings consumer. */
    readonly messageKey: `cognee.status.${CogneeStatus['state']}`;
}
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        /** Managed project memory injected into model history and hidden in the human transcript. */
        'cognee-memory': {
            kind: 'cognee-memory';
        };
    }
}
//# sourceMappingURL=types.d.ts.map