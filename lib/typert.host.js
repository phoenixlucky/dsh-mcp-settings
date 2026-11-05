import { TYPERT as mcpClientTypert } from '../vendor/dsh-mcp-client/lib/typert.host.js'

const packageName = '@tinyforge/dsh-mcp-settings'
/** Host services this bundle mounts and must therefore publish to Remote clients. */
const serviceKeys = ['mcpServerManager', 'mcpClientStatus']
/** Remote endpoints this bundle's Client companion mounts with `$mount`. */
const endpoints = [
  ['mcpServerManager', 'check'],
  ['mcpClientStatus', 'list'],
]

const services = serviceKeys.map((key) => mcpClientTypert.model.services.find(service => service.key === key))
const invocations = endpoints.map(([namespace, method]) => mcpClientTypert.invocations.find(item => item.namespace === namespace && item.method === method))

if (services.some(service => service === undefined)) {
  throw new Error(`MCP settings Typert metadata is missing one of: ${serviceKeys.join(', ')}`)
}
if (invocations.some(invocation => invocation === undefined)) {
  throw new Error(`MCP settings Typert metadata is missing one of: ${endpoints.map(([namespace, method]) => `${namespace}/${method}`).join(', ')}`)
}

export const TYPERT = {
  ...mcpClientTypert,
  package: packageName,
  model: { ...mcpClientTypert.model, services },
  invocations: invocations.map((invocation, index) => ({
    ...invocation,
    id: `${packageName}#${endpoints[index][0]}/${endpoints[index][1]}`,
  })),
}
