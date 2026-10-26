/** Session-backed Cognee recall and proposal lifecycle. */
import { join } from 'node:path';
import { SessionSeq } from '@deepseek-ai/dsh-session';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { cogneeProposalSummary } from "./client.js";
import { z } from 'zod';
const MIN_TASK_CHARS = 24;
const MIN_OUTCOME_CHARS = 80;
const memoryStateSchema = z.object({
    activeRecallSeq: z.number().int().nonnegative().nullable(),
    privateAttemptTurn: z.number().int().nonnegative().nullable(),
    globalAttemptTurn: z.number().int().nonnegative().nullable(),
    activeTurn: z.number().int().nonnegative().nullable(),
    taskText: z.string(),
    outcomeText: z.string(),
    interrupted: z.boolean(),
});
const EMPTY_MEMORY_STATE = {
    activeRecallSeq: null, privateAttemptTurn: null, globalAttemptTurn: null,
    activeTurn: null, taskText: '', outcomeText: '', interrupted: false,
};
/** Host projection that keeps only the latest recall and proposal attempt facts. */
export const cogneeMemoryProjection = {
    key: 'cogneeMemory',
    stateVersion: 1,
    stateSchema: memoryStateSchema,
    init: () => ({ ...EMPTY_MEMORY_STATE }),
    apply: (state, event) => {
        if (event.type === 'turn/start') {
            return { ...state, activeTurn: event.data.turn, taskText: '', outcomeText: '', interrupted: false };
        }
        if (event.type === 'user/message' && state.activeTurn !== null && event.data.source.kind === 'user') {
            return { ...state, taskText: appendBounded(state.taskText, textOf(event.data)) };
        }
        if (event.type === 'assistant/message' && event.data.turn === state.activeTurn) {
            return {
                ...state,
                outcomeText: appendBounded(state.outcomeText, textOf(event.data.message)),
                interrupted: event.data.interrupted === true,
            };
        }
        if (event.type === 'user/message' && event.data.source.kind === 'cognee-memory') {
            return { ...state, activeRecallSeq: event.seq };
        }
        if (event.type === 'user/message' && state.activeRecallSeq !== null
            && event.sourceEventSeqs?.includes(SessionSeq(state.activeRecallSeq)) === true) {
            return { ...state, activeRecallSeq: null };
        }
        if (event.type === 'cognee-memory/proposal-attempt') {
            return event.data.destination === 'private'
                ? { ...state, privateAttemptTurn: event.data.turn }
                : { ...state, globalAttemptTurn: event.data.turn };
        }
        return state;
    },
};
/** Register managed memory behavior against Agent boundaries without touching the model tool registry.
 * @param ctx - Host context with Agent and Session services.
 * @param memory - Managed Cognee status, recall, and proposal service.
 * @returns resolves after the projection is ready and lifecycle listeners are installed.
 */
export async function installCogneeMemoryLifecycle(ctx, memory) {
    const projection = await ctx.sessionProjections.register(cogneeMemoryProjection);
    const lifecycle = new AbortController();
    const operations = new Set();
    ctx.effect(() => async () => {
        lifecycle.abort(new Error('Cognee lifecycle unloaded'));
        await Promise.allSettled([...operations]);
        await projection.dispose();
    }, 'cognee-memory: task lifecycle');
    ctx.on('agent/pre-step', async ({ agent, messages, step, signal }, next) => {
        if (step === 1) {
            try {
                retireRecall(projection, agent.session);
            }
            catch {
                return next();
            }
        }
        const decision = await next();
        if (decision.kind === 'reject' || step !== 1 || signal.aborted)
            return decision;
        try {
            const query = messages
                .filter(message => message.source.kind === 'user')
                .map(textOf)
                .filter(Boolean)
                .join('\n')
                .trim();
            if (query.length < MIN_TASK_CHARS)
                return decision;
            const status = await memory.status(signal);
            if (status.state !== 'ready')
                return decision;
            const recalled = await memory.recall(query, signal);
            signal.throwIfAborted();
            if (!hasRecallEvidence(recalled))
                return decision;
            const context = createUserMessage({
                content: [{ type: 'text', text: recalled }],
                source: { kind: 'cognee-memory' },
            });
            return { ...decision, messages: [...decision.messages, context] };
        }
        catch {
            // Cognee is optional: a failed lookup never blocks ordinary task execution.
            return decision;
        }
    });
    ctx.on('session/event', (session, event) => {
        if (event.type !== 'turn/end' || event.data.reason.kind !== 'completed')
            return;
        const operation = proposeForCompletedTurn(ctx, projection, memory, session, sessionState(projection, session), event.data.turn, lifecycle.signal)
            .catch(() => { ctx.logger.warn('cognee-memory: completed-turn proposal was skipped'); })
            .finally(() => { operations.delete(operation); });
        operations.add(operation);
    });
}
function retireRecall(projection, session) {
    const state = sessionState(projection, session);
    const activeSeq = state.activeRecallSeq;
    if (activeSeq === null)
        return;
    const seq = SessionSeq(activeSeq);
    if (!session.surface.nodes.includes(seq))
        return;
    session.append('user/message', createUserMessage({
        content: [],
        source: { kind: 'cognee-memory' },
    }), {
        surfaceOp: { op: 'replace', startSeq: seq, endSeq: seq },
        sourceEventSeqs: [seq],
    });
}
async function proposeForCompletedTurn(ctx, projection, memory, session, turnState, turn, signal) {
    if (turnState.activeTurn !== turn || turnState.interrupted)
        return;
    const userText = turnState.taskText.trim();
    const outcome = turnState.outcomeText.trim();
    if (userText.length < MIN_TASK_CHARS || outcome.length < MIN_OUTCOME_CHARS)
        return;
    const summary = cogneeProposalSummary(`Task: ${userText}\nOutcome: ${outcome}`);
    if (summary.length < MIN_OUTCOME_CHARS || signal.aborted)
        return;
    const status = await memory.status(signal);
    if (status.state !== 'ready')
        return;
    const state = sessionState(projection, session);
    if (state.privateAttemptTurn !== turn) {
        session.append('cognee-memory/proposal-attempt', { turn, destination: 'private' });
        try {
            await memory.propose('private', summary, signal);
        }
        catch { /* The durable marker prevents an uncertain duplicate. */ }
    }
    if (state.globalAttemptTurn !== turn && await hasProjectEvidence(ctx, session, signal)) {
        session.append('cognee-memory/proposal-attempt', { turn, destination: 'global' });
        try {
            await memory.propose('global', summary, signal);
        }
        catch { /* The destinations remain independent. */ }
    }
}
async function hasProjectEvidence(ctx, session, signal) {
    const cwd = session.header.cwd;
    if (cwd === undefined || cwd === '')
        return false;
    try {
        const target = await ctx.fs.resolve(join(cwd, '.git'), { signal });
        return (await ctx.fs.stat(target, signal)) !== undefined;
    }
    catch {
        return false;
    }
}
function sessionState(projection, session) {
    return projection.stateOf(session);
}
function hasRecallEvidence(text) {
    const start = text.indexOf('\n');
    const end = text.lastIndexOf('\n## End prior project memory');
    return start >= 0 && end > start && text.slice(start, end).trim().length > 0;
}
function textOf(message) {
    return message.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('\n');
}
function appendBounded(current, next) {
    const combined = current === '' ? next : `${current}\n${next}`;
    return combined.slice(-20_000);
}
//# sourceMappingURL=lifecycle.js.map