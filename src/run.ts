import process from 'node:process'
import { detect } from 'package-manager-detector'
import { getConfig, parseConfig, writeConfigWithPnpm } from './utils'
import 'dotenv/config'

export async function runMain(): Promise<void> {
  const config = getConfig()
  const commands = parseConfig(config)
  const pm = await detect({
    cwd: process.cwd(),
    onUnknown: () => {
      return undefined
    },
  })

  if (!pm)
    console.warn('Could not detect package manager, using NPM as default.')

  writeConfigWithPnpm(commands, pm?.name)
}
