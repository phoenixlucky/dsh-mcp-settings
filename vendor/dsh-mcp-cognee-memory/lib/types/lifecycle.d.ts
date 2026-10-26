/** Session-backed Cognee recall and proposal lifecycle. */
import { Context } from '@deepseek-ai/cordis';
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
import type { CogneeMemoryRuntime } from './index.ts';
interface CogneeMemoryState {
    readonly activeRecallSeq: number | null;
    readonly privateAttemptTurn: number | null;
    readonly globalAttemptTurn: number | null;
    readonly activeTurn: number | null;
    readonly taskText: string;
    readonly outcomeText: string;
    readonly interrupted: boolean;
}
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionStateMap {
        /** Active recall source and separate proposal attempt markers. */
        cogneeMemory: CogneeMemoryState;
    }
}
declare module '@deepseek-ai/dsh-session/types' {
    interface SessionEventMap {
        /** Durable marker that one destination's proposal call may have reached Cognee. */
        'cognee-memory/proposal-attempt': {
            turn: number;
            destination: 'private' | 'global';
        };
    }
}
/** Host projection that keeps only the latest recall and proposal attempt facts. */
export declare const cogneeMemoryProjection: ProjectionDefinition<'cogneeMemory', CogneeMemoryState>;
/** Register managed memory behavior against Agent boundaries without touching the model tool registry.
 * @param ctx - Host context with Agent and Session services.
 * @param memory - Managed Cognee status, recall, and proposal service.
 * @returns resolves after the projection is ready and lifecycle listeners are installed.
 */
export declare function installCogneeMemoryLifecycle(ctx: Context, memory: CogneeMemoryRuntime): Promise<void>;
export {};
//# sourceMappingURL=lifecycle.d.ts.map