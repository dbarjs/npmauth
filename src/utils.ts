import process from 'node:process'
import { Buffer } from 'node:buffer'
import { read } from 'rc9'
import { execa } from 'execa'
import type { ConfigCommand } from './schemas'
import { ConfigMap } from './schemas'

export function encodeTokenToBase64(token: string) {
  return Buffer.from(token).toString('base64')
}

export function getConfig(): ConfigMap {
  const config = read<ConfigMap>('.npmauthrc')

  return ConfigMap.parse(config)
}

export function parseConfig(config: ConfigMap = getConfig()) {
  const commands: ConfigCommand[] = []

  Object.entries(config).forEach(([registryKey, registry]) => {
    if (!registry.enabled)
      return

    const { host, registry: registryUrl, field, location } = registry

    const getCommand = (key: string, value: string): ConfigCommand => ({
      registryKey,
      location,
      key,
      value,
    })

    Object.entries(field).forEach(([fieldKey, fieldValue]) => {
      const hostConfigKey = `${host}:${fieldKey}`
      const registryConfigKey = `${registryUrl}:${fieldKey}`

      if (typeof fieldValue === 'string') {
        commands.push(getCommand(hostConfigKey, fieldValue))
        commands.push(getCommand(registryConfigKey, fieldValue))
        return
      }

      if (fieldValue.type === 'env') {
        const token = process.env[fieldValue.key]
        if (!token) {
          console.error(`Token not found for ${fieldValue.key}`)
          return
        }

        const encodedToken = fieldValue.encode === 'base64' ? encodeTokenToBase64(token) : token

        commands.push(getCommand(hostConfigKey, encodedToken))
        commands.push(getCommand(registryConfigKey, encodedToken))
      }
    })
  })

  return commands
}

export async function writeConfigWithPnpm(commands: ConfigCommand[]) {
  const execute = commands.map(({ location, key, value }) => {
    return async () => {
      await execa('npm', ['config', `--location=${location}`, 'set', key, value])
    }
  })

  for await (const write of execute)
    await write()
}
