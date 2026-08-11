import { expect } from 'chai'
import { spawnSync } from 'node:child_process'

const PARSER_TIMEOUT_MS = 5000

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
      encoding: 'utf8',
      timeout: PARSER_TIMEOUT_MS,
    },
  )

  expect(result.error, `${exportName} parser timed out`).to.equal(undefined)
  expect(result.status, result.stderr).to.equal(0)
}

describe('Security regression: zero-size parser structures', () => {
  it('terminates on a zero-size JXL partial stream box', () => {
    assertParserTerminates(
      './lib/types/jxl',
      'JXL',
      [0x00, 0x00, 0x00, 0x00, 0x6a, 0x78, 0x6c, 0x70, 0x00, 0x00, 0x00, 0x00],
    )
  })

  it('terminates on a zero-size HEIF box path', () => {
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
