import 'dotenv/config'
import { parseConfig, writeConfigWithPnpm } from './utils'

export function runMain() {
  const parsedConfig = parseConfig()

  writeConfigWithPnpm(parsedConfig)
}
