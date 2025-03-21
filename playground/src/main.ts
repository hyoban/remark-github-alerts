import 'remark-github-alerts/styles/github-colors-light.css'
import 'remark-github-alerts/styles/github-colors-dark-class.css'
import 'remark-github-alerts/styles/github-base.css'

import rehypeStringify from 'rehype-stringify'
import remarkGithubAlerts from 'remark-github-alerts'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const processor = unified()
  .use(remarkParse)
  .use(remarkGithubAlerts)
  .use(remarkRehype)
  .use(rehypeStringify)

processor
  .process(
    `
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
`,
  )
  .then((file) => {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = String(file)
  })
