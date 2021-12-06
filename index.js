const core = require('@actions/core');
const got = require('got').default
const fs = require('fs/promises')
const path = require('path')

async function run() {
  try {
    const imageUrl = core.getInput('url')
    core.debug(`当前目录 ${__dirname}`)
    core.debug(`图片地址 ${imageUrl}`)
    const opType = core.getInput('op_type')
    core.debug(`操作类型 ${opType}`)
    const body = await got.get(imageUrl).buffer()
    await fs.writeFile(path.resolve(`./src/static/tab/cts_tab.png`), body)
    core.debug(`写入文件`)
    const pagesFile = await fs.readFile(path.resolve('./src/pages.json'))
    const pages = JSON.parse(pagesFile)
    if (opType === 'WRITE') {
      const idx = pages.tabBar.list.findIndex(item => item.pagePath === 'pages/cts/index')
      if (idx > 0) {
        // 修改已经存在的
        pages.tabBar.list[idx].text = 'CTS'
        pages.tabBar.list[idx].iconPath = 'static/tab/cts_tab.png'
        pages.tabBar.list[idx].selectedIconPath = 'static/tab/cts_tab.png'
      } else {
        const len = pages.tabBar.list.length
        const insertIdx = Math.floor(len / 2)
        core.debug(`插入到第 ${insertIdx + 1} 个 tab`)
        pages.tabBar.list.splice(insertIdx, 0, {
          pagePath: 'pages/cts/index',
          text: 'CTS',
          iconPath: 'static/tab/cts_tab.png',
          selectedIconPath: 'static/tab/cts_tab.png'
        })
      }
    } else {
      pages.tabBar.list = pages.tabBar.list.filter(item => item.pagePath !== 'pages/cts/index')
      core.debug(`移除 tab 成功`)
    }

    fs.writeFile(path.resolve(`./src/pages.json`), JSON.stringify(pages, null, 2))
    core.debug(`更新 tab 成功`)
    core.setOutput()
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
