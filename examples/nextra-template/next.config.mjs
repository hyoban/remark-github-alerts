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
