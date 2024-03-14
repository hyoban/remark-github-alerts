import nextra from 'nextra'
import rehypeRaw from 'rehype-raw'
import remarkGithubAlerts from 'remark-github-alerts'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  mdxOptions: {
    remarkPlugins: [remarkGithubAlerts],
    rehypePlugins: [
      [
        rehypeRaw,
        {
          passThrough: ['mdxjsEsm', 'mdxJsxFlowElement'],
        },
      ],
    ],
  },
})

export default withNextra()
