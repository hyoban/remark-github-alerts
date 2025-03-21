/// <reference types="vite/client" />
import dedent from 'dedent'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'

import remarkGithubAlerts from '../src'

describe('Should process basic blockquote', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGithubAlerts)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeFormat)
    .use(rehypeStringify, { allowDangerousHtml: true })

  it('process w/ code type children', async () => {
    const result = await processor.process(dedent`
      >     [component/folder touched]: Description intent of your changes
      >
      >     [List of changes]
      >
      >     Signed-off-by: Your Name your@email.com

      For example:

      >     swss-common: Stabilize the ConsumerTable
      >
      >     * Fixing autoreconf
      >     * Fixing unit-tests by adding checkers and initialize the DB before start
      >     * Adding the ability to select from multiple channels
      >     * Health-Monitor - The idea of the patch is that if something went wrong with the notification channel,
      >       we will have the option to know about it (Query the LLEN table length).
      >
      >       Signed-off-by: user@dev.null
    `)

    void expect(String(result)).toContain('blockquote')
  })
})
