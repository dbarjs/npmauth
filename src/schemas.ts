/* eslint-disable ts/no-redeclare */
import { z } from 'zod/v4'

export const ConfigLocationEnum = z.enum(['project', 'global', 'user'])

export type ConfigLocationEnum = z.infer<typeof ConfigLocationEnum>

export const FieldEncodeEnum = z.union([z.literal('base64'), z.literal('text')]).optional().catch('text')

export type FieldEncodeEnum = z.infer<typeof FieldEncodeEnum>

export const RegistryConfig = z.object({
  enabled: z.boolean().default(true),
  host: z.string(),
  registry: z.string(),
  scope: z.string(),
  field: z.record(z.string(), z.union([z.string(), z.object({
    type: z.literal('env'),
    key: z.string(),
    encode: FieldEncodeEnum,
  })])),
  location: ConfigLocationEnum.default('user'),
})

export type RegistryConfig = z.infer<typeof RegistryConfig>

export const ConfigMap = z.record(z.string(), RegistryConfig)

export type ConfigMap = z.infer<typeof ConfigMap>

export const ConfigCommand = z.object({
  registryKey: z.string(),
  location: ConfigLocationEnum.default('user'),
  key: z.string(),
  value: z.string(),
})

export type ConfigCommand = z.infer<typeof ConfigCommand>
