import type { Paragraph, Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

export type RemarkGitHubAlertsOptions = {
  /**
   * List of markers to match.
   * @default ['TIP', 'NOTE', 'IMPORTANT', 'WARNING', 'CAUTION']
   */
  markers?: string[] | '*'

  /**
   * If markers case sensitively on matching.
   * @default false
   */
  matchCaseSensitive?: boolean

  /**
   * Custom icons for each marker. The key is the marker name, and the value is the html script represent the icon.
   * The key is always lowercase.
   *
   * @default inline svg icons from GitHub
   */
  icons?: Record<string, string>

  /**
   * Custom titles for each marker. The key is the marker name, and the value is the title.
   * The key is always lowercase.
   *
   * When the title is not specified, the default title is the capitalized marker name.
   */
  titles?: Record<string, string>

  /**
   * Prefix for the class names.
   *
   * @default 'markdown-alert'
   */
  classPrefix?: string

  // ^ options from MarkdownItGitHubAlertsOptions

  /**
   * Whether to ignore the square brackets in the marker.
   *
   * @default false
   */
  ignoreSquareBracket?: boolean
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const DEFAULT_GITHUB_ICONS = {
  note: '<svg class="octicon octicon-info mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>',
  tip: '<svg class="octicon octicon-light-bulb mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>',
  important: '<svg class="octicon octicon-report mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>',
  warning: '<svg class="octicon octicon-alert mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>',
  caution: '<svg class="octicon octicon-stop mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>',
}

// https://bl.ocks.org/jennyknuth/222825e315d45a738ed9d6e04c7a88d0
function encodeSvg(svg: string) {
  return svg.replace('<svg', (~svg.indexOf('xmlns') ? '<svg' : '<svg xmlns="http://www.w3.org/2000/svg"'))
    .replaceAll('"', '\'')
    .replaceAll('%', '%25')
    .replaceAll('#', '%23')
    .replaceAll('{', '%7B')
    .replaceAll('}', '%7D')
    .replaceAll('<', '%3C')
    .replaceAll('>', '%3E')
}

const remarkGithubAlerts: Plugin<RemarkGitHubAlertsOptions[], Root> = (
  options = {},
) => {
  const {
    markers = ['TIP', 'NOTE', 'IMPORTANT', 'WARNING', 'CAUTION'],
    icons = DEFAULT_GITHUB_ICONS,
    matchCaseSensitive = false,
    titles = {},
    classPrefix = 'markdown-alert',
    ignoreSquareBracket = false,
  } = options

  const markerNameRE = markers === '*' ? '\\w+' : markers.join('|')
  const RE = new RegExp(
    ignoreSquareBracket
      ? `^!(${markerNameRE})([^\\n\\r]*)`
      : `^\\[\\!(${markerNameRE})\\]([^\\n\\r]*)`,
    matchCaseSensitive ? '' : 'i',
  )

  return (tree) => {
    visit(tree, 'blockquote', (node, index, parent) => {
      const children = node.children as Paragraph[]
      const firstParagraph = children[0]
      if (!firstParagraph)
        return
      let firstContent = firstParagraph.children?.[0]
      if (!firstContent)
        return
      if (
        !('value' in firstContent)
        && 'children' in firstContent
        && firstContent.children[0]
      ) {
        firstContent = firstContent.children[0]
      }

      if (firstContent.type !== 'text')
        return
      const match = firstContent.value.match(RE)
      if (!match)
        return

      const type = match[1]?.toLowerCase() as keyof typeof icons
      const title = match[2]?.trim() || (titles[type] ?? capitalize(type))
      const icon = icons[type]
      const iconDataUri = `data:image/svg+xml;utf8,${encodeSvg(icon)}`

      if (index === undefined || !parent)
        return

      firstContent.value = firstContent.value.slice(match[0].length).trimStart()

      node.data = {
        hName: 'div',
        hProperties: {
          class: `${classPrefix} ${classPrefix}-${type}`,
        },
      }
      node.children = [
        {
          type: 'paragraph',
          data: {
            hName: 'p',
            hProperties: {
              class: `${classPrefix}-title`,
            },
          },
          children: [
            {
              // @ts-expect-error can not use span
              type: 'span',
              data: {
                hName: 'span',
                hProperties: {
                  class: `octicon octicon-${type}`,
                  style: `--oct-icon: url("${iconDataUri}")`,
                },
              },
            },
            {
              type: 'text',
              value: title,
            },
          ],
        },
        ...node.children,
      ]
    })

    return tree
  }
}

export default remarkGithubAlerts
