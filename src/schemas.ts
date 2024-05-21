/* eslint-disable ts/no-redeclare */
import { z } from 'zod'

export const RegistryConfig = z.object({
  enabled: z.boolean().default(true),
  host: z.string(),
  registry: z.string(),
  scope: z.string(),
  field: z.record(z.string(), z.union([z.string(), z.object({
    type: z.literal('env'),
    key: z.string(),
    encode: z.union([z.literal('base64'), z.literal('text')]).default('text'),
  })])),
})

export type RegistryConfig = z.infer<typeof RegistryConfig>

export const Config = z.record(z.string(), RegistryConfig)

export type Config = z.infer<typeof Config>
