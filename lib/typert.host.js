import { TYPERT as mcpClientTypert } from '../vendor/dsh-mcp-client/lib/typert.host.js'

const packageName = '@tinyforge/dsh-mcp-settings'
/** Host services this bundle mounts and must therefore publish to Remote clients. */
const serviceKeys = ['mcpServerManager', 'mcpClientStatus']
/** Remote endpoints this bundle's Client companion mounts with `$mount`. */
const endpoints = [
  ['mcpServerManager', 'check'],
  ['mcpServerManager', 'listResources'],
  ['mcpServerManager', 'listResourceTemplates'],
  ['mcpServerManager', 'readResource'],
  ['mcpServerManager', 'listSkills'],
  ['mcpServerManager', 'restart'],
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

/**
 * Declare that an optional JSON parameter accepts absence.
 *
 * The Host gate (`assertExactArguments` in the gateway) rejects a call whose args omit a
 * descriptor field unless that parameter says `acceptsUndefined`, and it reads nothing else —
 * `optional: true` alone is not enough. The vendored metadata predates that field, so a first
 * page of resources or skills — always called with the server id and no cursor — was refused
 * with `gateway/arguments-invalid: args fields do not match the descriptor: missing "cursor"`
 * and surfaced in the panel as a plain failure. The upgrade belongs here rather than in the
 * vendored artifact so a re-vendor cannot silently bring the old shape back.
 * @param invocation - Published invocation descriptor.
 * @returns The same descriptor with every omitted-able parameter marked.
 */
function withAcceptableAbsence(invocation) {
  if (!Array.isArray(invocation.parameters)) return invocation
  const parameters = invocation.parameters.map((parameter) => (
    parameter.source === 'json' && parameter.optional === true && parameter.acceptsUndefined !== true
      ? { ...parameter, acceptsUndefined: true }
      : parameter
  ))
  const changed = parameters.some((parameter, index) => parameter !== invocation.parameters[index])
  return changed ? { ...invocation, parameters } : invocation
}

export const TYPERT = {
  ...mcpClientTypert,
  package: packageName,
  model: { ...mcpClientTypert.model, services },
  invocations: invocations.map((invocation, index) => withAcceptableAbsence({
    ...invocation,
    id: `${packageName}#${endpoints[index][0]}/${endpoints[index][1]}`,
  })),
}
