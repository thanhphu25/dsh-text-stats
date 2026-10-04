import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { ToolArgsError } from '@deepseek-ai/dsh-tools'
import * as plugin from '../index.js'

async function setup(t) {
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  const fiber = await ctx.plugin(plugin)
  const tool = ctx.tools.get('text_stats')
  assert.ok(tool)
  return { ctx, fiber, tool }
}

const cases = [
  ['empty text', '', 'characters=0, words=0, lines=0'],
  ['English text', 'Hello world\nHi', 'characters=14, words=3, lines=2'],
  ['Vietnamese text', 'Xin chào bạn', 'characters=12, words=3, lines=1'],
  ['Unicode code points', 'A😀e\u0301', 'characters=4, words=1, lines=1'],
  ['whitespace only', ' \t\n', 'characters=3, words=0, lines=2'],
  ['CRLF and a trailing empty line', 'one\r\ntwo\r\n', 'characters=10, words=2, lines=3'],
  ['standalone CR', 'a\rb', 'characters=3, words=2, lines=1'],
]

for (const [label, text, expected] of cases) {
  test(`counts ${label}`, async (t) => {
    const { tool } = await setup(t)
    assert.equal(await tool.execute({ text }, {}), expected)
  })
}

test('rejects missing text and non-string text', async (t) => {
  const { tool } = await setup(t)
  for (const args of [{}, { text: 123 }, { text: null }]) {
    await assert.rejects(() => tool.execute(args, {}), ToolArgsError)
  }
})

test('exposes the tool to prompt assembly and renders its result as text', async (t) => {
  const { ctx, tool } = await setup(t)
  const assembly = await ctx.systemPrompt.assemble()
  const schema = assembly.tools.find((candidate) => candidate.name === 'text_stats')
  assert.ok(schema)
  assert.deepEqual(schema.parameters.required, ['text'])
  const args = { text: 'Hello world' }
  const value = await tool.execute(args, {})
  assert.deepEqual(tool.output.render(args, value), [
    { type: 'text', text: 'characters=11, words=2, lines=1' },
  ])
})

test('unregisters the tool when the plugin unloads', async (t) => {
  const { ctx, fiber } = await setup(t)
  await fiber.dispose()
  assert.equal(ctx.tools.get('text_stats'), undefined)
  const assembly = await ctx.systemPrompt.assemble()
  assert.equal(assembly.tools.some((tool) => tool.name === 'text_stats'), false)
})
