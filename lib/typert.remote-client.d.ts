import type { TypertRemoteInfo } from '@deepseek-ai/dsh-typert-protocol'
import type { TYPERT_REMOTE as McpClientRemote } from '../vendor/dsh-mcp-client/lib/typert.remote-client.js'

type Methods = Pick<typeof McpClientRemote.methods, 'mcpServerManager/check'>

declare const TYPERT_REMOTE: TypertRemoteInfo<Methods>
export default TYPERT_REMOTE
