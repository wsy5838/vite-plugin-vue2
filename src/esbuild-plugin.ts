import fs from 'fs-extra'
import { isJsxCode } from './template/utils';
import { Plugin, Loader } from 'esbuild'

const NodeModuleKey = 'node_modules'


// https://github.com/vitejs/vite/blob/b80daa7c0970645dca569d572892648f66c6799c/packages/vite/src/node/optimizer/scan.ts#L366
const scriptRE =
  /(<script(?:\s+[a-z_:][-\w:]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^"'<>=\s]+))?)*\s*>)(.*?)<\/script>/gis
const langRE = /\blang\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/i

const esbuildPlugin: Plugin = {
  name: "custom-jsx-loader",
  setup(build) {
    // 解析js文件
    build.onLoad({ filter: /\.js$/ }, async (arg) => {
      const path = arg.path
      if (path.includes(NodeModuleKey)) return null
      const code = await fs.readFile(path, 'utf8')
      if (isJsxCode(code)) {
        return {
          contents: code,
          loader: 'jsx'
        }
      }

    })
    // 解析.vue文件
    build.onLoad({ filter: /\.vue$/ }, async (arg) => {
      const path = arg.path
      if (path.includes(NodeModuleKey)) return null

      const code = await fs.readFile(path, 'utf8')
      const matches = code.matchAll(scriptRE)
      let loader: Loader = 'js'
      let js = ''

      for (const match of matches) {

        const [, openTag, content] = match

        const langMatch = langRE.exec(openTag)
        const lang =
          langMatch && (langMatch[1] || langMatch[2] || langMatch[3])

        if (lang === 'ts' || lang === 'tsx' || lang === 'jsx') {
          loader = lang
        } else if (isJsxCode(content)) {
          loader = 'jsx'
        }

        js = content

      }
      return {
        contents: js,
        loader
      }

    })
  },
};


export { esbuildPlugin }