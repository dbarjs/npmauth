import 'dotenv/config'
import { getConfig, parseConfig, writeConfigWithPnpm } from './utils'

export function runMain() {
  const config = getConfig()
  const commands = parseConfig(config)

  writeConfigWithPnpm(commands)
}
