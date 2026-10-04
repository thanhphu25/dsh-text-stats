/** Registers the text_stats tool with DeepSeek Harness. */
import { defineTool } from '@deepseek-ai/dsh-tools'

/** Cordis plugin name. */
export const name = 'text-stats'

/** Services required before this plugin activates. */
export const inject = ['tools']

/**
 * Register a text statistics tool owned by this plugin's lifetime.
 * @param {import('@deepseek-ai/cordis').Context} ctx - Cordis context with the tools service.
 * @returns {void}
 */
export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: 'text_stats',
    description:
      'Count characters, words, and lines in provided text. Use this tool when exact text statistics are requested.',
    parameters: {
      text: {
        type: 'string',
        required: true,
        description: 'The text to analyze',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      const text = args.text
      const characters = Array.from(text).length
      const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length
      const lines = text.length === 0 ? 0 : text.split(/\r?\n/).length
      return `characters=${characters}, words=${words}, lines=${lines}`
    },
  }))
}
