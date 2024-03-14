/// <reference types="vite/client" />
import dedent from 'dedent'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'
import remarkMdc from 'remark-mdc'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'

import remarkGithubAlerts from '../src'

const testFiles = {
  'basic.html': dedent`
    > [!NOTE]
    > Highlights information that users should take into account, even when skimming.

    > [!TIP]
    > Optional information to help a user be more successful.

    > [!IMPORTANT]
    > Crucial information necessary for users to succeed.

    > [!WARNING]
    > Critical content demanding immediate user attention due to potential risks.

    > [!CAUTION]
    > Negative potential consequences of an action.

    > [!NOTE]
    > Nested **markdown**

    normal paragraph

    > normal blockquote
  `,
  'markers.html': dedent`
    # Custom

    > [!nOtE] My title
    > With \`markers: '*'\` case of chars is not required and titles are supported.
    > [!custom]
    > Also any other alert name is allowed.
  `,
}

describe('basic processor', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGithubAlerts)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeFormat)
    .use(rehypeStringify, { allowDangerousHtml: true })

  for (const [filename, content] of Object.entries(testFiles)) {
    it(filename, async () => {
      const result = await processor.process(content)
      void expect(String(result)).toMatchFileSnapshot(
        `./snapshots/basic/${filename}`,
      )
    })
  }
})

describe('processor with remark mdc', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdc)
    .use(remarkGithubAlerts, { ignoreSquareBracket: true })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeFormat)
    .use(rehypeStringify, { allowDangerousHtml: true })

  for (const [filename, content] of Object.entries(testFiles)) {
    it(filename, async () => {
      const result = await processor.process(content)

      void expect(String(result)).toMatchFileSnapshot(
        `./snapshots/remark-mdc/${filename}`,
      )
    })
  }
})

describe('processor with markers *', () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGithubAlerts, { markers: '*' })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeFormat)
    .use(rehypeStringify, { allowDangerousHtml: true })

  for (const [filename, content] of Object.entries(testFiles)) {
    it(filename, async () => {
      const result = await processor.process(content)

      void expect(String(result)).toMatchFileSnapshot(
        `./snapshots/custom-markers/${filename}`,
      )
    })
  }
})
