import 'dotenv/config'
import process from 'node:process'
import { detect } from 'package-manager-detector'
import { getConfig, parseConfig, writeConfigWithPnpm } from './utils'

export async function runMain() {
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
