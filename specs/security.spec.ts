import * as assert from 'node:assert'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'

const PARSER_TIMEOUT_MS = 1000

function assertParserTerminates(
  modulePath: string,
  exportName: string,
  payload: number[],
) {
  const script = `
    const { ${exportName} } = require(${JSON.stringify(modulePath)})
    const payload = Uint8Array.from(${JSON.stringify(payload)})
    try {
      ${exportName}.calculate(payload)
    } catch {}
  `

  const result = spawnSync(
    process.execPath,
    ['--require', 'ts-node/register', '-e', script],
    {
      cwd: process.cwd(),
      env: { ...process.env, TS_NODE_PROJECT: 'tsconfig.test.json' },
      encoding: 'utf8',
      timeout: PARSER_TIMEOUT_MS,
    },
  )

  assert.equal(
    result.error,
    undefined,
    `${exportName} parser did not terminate within ${PARSER_TIMEOUT_MS}ms`,
  )
  assert.equal(
    result.status,
    0,
    `${exportName} parser subprocess failed: ${result.stderr}`,
  )
}

describe('Security regression: zero-size parser structures', () => {
  it('terminates on a zero-size JXL partial stream box', () => {
    assertParserTerminates(
      './lib/types/jxl',
      'JXL',
      [0x00, 0x00, 0x00, 0x00, 0x6a, 0x78, 0x6c, 0x70, 0x00, 0x00, 0x00, 0x00],
    )
  })

  it('terminates on a zero-size HEIF ispe box', () => {
    assertParserTerminates(
      './lib/types/heif',
      'HEIF',
      [
        0x00, 0x00, 0x00, 0x0c, 0x6d, 0x65, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x08, 0x69, 0x70, 0x72, 0x70, 0x00, 0x00, 0x00, 0x1c,
        0x69, 0x70, 0x63, 0x6f, 0x00, 0x00, 0x00, 0x00, 0x69, 0x73, 0x70, 0x65,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      ],
    )
  })

  it('terminates on a zero-length ICNS entry', () => {
    assertParserTerminates(
      './lib/types/icns',
      'ICNS',
      [
        0x69, 0x63, 0x6e, 0x73, 0x00, 0x00, 0x00, 0x10, 0x69, 0x73, 0x33, 0x32,
        0x00, 0x00, 0x00, 0x00,
      ],
    )
  })
})
