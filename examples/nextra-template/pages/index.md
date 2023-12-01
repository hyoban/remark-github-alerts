# Getting Started

## Usage

Install the package:

```sh npm2yarn
npm install remark-github-alerts
```

Add the plugin to your `processor`:

```ts
import remarkGithubAlerts from "remark-github-alerts"

const processor = unified()
  .use(remarkParse)
  .use(remarkGithubAlerts)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })
```

If you are using Nextra, you can add the plugin to your `next.config.mjs`:

<br />

> [!IMPORTANT]
> Currently, you can only use github alerts in markdown files, `mdx` files are not supported.

```tsx
import nextra from "nextra"
import remarkGithubAlerts from "remark-github-alerts"

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  mdxOptions: {
    remarkPlugins: [remarkGithubAlerts],
  },
})

export default withNextra()
```

Import the styles:

```ts
import "remark-github-alerts/styles/github-colors-light.css"
import "remark-github-alerts/styles/github-colors-dark-class.css"
import "remark-github-alerts/styles/github-base.css"
```

## Example

<br />

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

```md
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
```
