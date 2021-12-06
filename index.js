const core = require('@actions/core');
const got = require('got').default
const fs = require('fs/promises')
const path = require('path')

async function run() {
  try {
    const imageUrl = core.getInput('url')
    core.debug(`图片地址 ${imageUrl}`)
    const opType = core.getInput('op_type')
    core.debug(`操作类型 ${opType}`)
    const src = core.getInput('src')
    const dist = core.getInput('dist')
    const pagePath = core.getInput('page_path')
    const body = await got.get(imageUrl).buffer()
    await fs.writeFile(path.resolve(dist), body)
    core.debug(`写入文件`)
    const pagesFile = await fs.readFile(path.resolve(src, 'pages.json'))
    const pages = JSON.parse(pagesFile)
    const tabName = core.getInput('tab_name')
    const iconPath = path.relative(core.getInput('src'), dist)
    if (opType === 'WRITE') {
      const idx = pages.tabBar.list.findIndex(item => item.pagePath === pagePath)
      if (idx > 0) {
        // 修改已经存在的
        pages.tabBar.list[idx].text = tabName
        pages.tabBar.list[idx].text = tabName
        pages.tabBar.list[idx].iconPath = iconPath
        pages.tabBar.list[idx].selectedIconPath = iconPath
      } else {
        const len = pages.tabBar.list.length
        const insertIdx = Math.floor(len / 2)
        core.debug(`插入到第 ${insertIdx + 1} 个 tab`)
        pages.tabBar.list.splice(insertIdx, 0, {
          pagePath: pagePath,
          text: tabName,
          iconPath,
          selectedIconPath: iconPath
        })
      }
    } else {
      pages.tabBar.list = pages.tabBar.list.filter(item => item.pagePath !== pagePath)
      core.debug(`移除 tab 成功`)
    }

    fs.writeFile(path.resolve(src, 'pages.json'), JSON.stringify(pages, null, 2))
    core.debug(`更新 tab 成功`)
    core.setOutput()
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
