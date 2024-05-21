import process from 'node:process'
import { Buffer } from 'node:buffer'
import { read } from 'rc9'
import { execa } from 'execa'
import { Config } from './schemas'

export function encodeTokenToBase64(token: string) {
  return Buffer.from(token).toString('base64')
}

function getConfig(): Config {
  const config = read<Config>('npmrc.conf')

  return Config.parse(config)
}

export function parseConfig(config: Config = getConfig()) {
  const parsedConfig: Record<string, string> = {}

  Object.entries(config).forEach(([_registryKey, registry]) => {
    if (!registry.enabled)
      return

    const { host, registry: registryUrl, field } = registry

    Object.entries(field).forEach(([fieldKey, field]) => {
      const hostConfigKey = `${host}:${fieldKey}`
      const registryConfigKey = `${registryUrl}:${fieldKey}`

      if (typeof field === 'string') {
        parsedConfig[hostConfigKey] = field
        parsedConfig[registryConfigKey] = field
        return
      }

      if (field.type === 'env') {
        const token = process.env[field.key]
        if (!token) {
          console.error(`Token not found for ${field.key}`)
          return
        }

        const encodedToken = field.encode === 'base64' ? encodeTokenToBase64(token) : token

        parsedConfig[hostConfigKey] = encodedToken
        parsedConfig[registryConfigKey] = encodedToken
      }
    })
  })

  return parsedConfig
}

export async function writeConfigWithPnpm(parsedConfig: Record<string, string>) {
  const execute = Object.entries(parsedConfig).map(([key, value]) => {
    return async () => {
      await execa('pnpm', ['config', '--global', 'set', key, value])
    }
  })

  for await (const write of execute)
    await write()
}
