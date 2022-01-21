const core = require('@actions/core');
const got = require('got').default
const fs = require('fs')
const path = require('path')

async function run() {
  try {
    const imageUrl = core.getInput('url')
    core.debug(`图片地址 ${imageUrl}`)
    const opType = core.getInput('op_type')
    core.debug(`操作类型 ${opType}`)
    const appName = core.getInput('app_name')
    core.debug(`app name ${appName}`)
    const pagePath = core.getInput('page_path')
    const body = await got.get(imageUrl).buffer()
    fs.writeFileSync(path.resolve(`./src/static/tab/cts_tab_${appName}.png`), body)
    core.debug(`写入文件`)
    const tabFile = fs.readFileSync(path.resolve(`./src/config/${appName}/tab.json`))
    let tabs = JSON.parse(tabFile)
    const tabName = core.getInput('tab_name')
    const iconPath = path.relative(core.getInput('src'), `./src/static/tab/cts_tab_${appName}.png`)
    if (opType === 'WRITE') {
      const idx = tabs.findIndex(item => item.pagePath === pagePath)
      if (idx > 0) {
        // 修改已经存在的
        tabs[idx].text = tabName
        tabs[idx].text = tabName
        tabs[idx].iconPath = iconPath
        tabs[idx].selectedIconPath = iconPath
      } else {
        const len = tabs.length
        const insertIdx = Math.floor(len / 2)
        core.debug(`插入到第 ${insertIdx + 1} 个 tab`)
        tabs.splice(insertIdx, 0, {
          pagePath: pagePath,
          text: tabName,
          iconPath,
          selectedIconPath: iconPath
        })
      }
    } else {
      tabs = tabs.filter(item => item.pagePath !== pagePath)
      core.debug(`移除 tab 成功`)
    }

    fs.writeFileSync(path.resolve(`./src/config/${appName}/tab.json`), JSON.stringify(tabs, null, 2))
    core.debug(`更新 tab 成功`)

    const extPath = path.resolve('./config', appName, 'main.json')
    const messengerIndex = tabs.findIndex(item => item.pagePath === 'modules/tab-pages/messenger/index')
    const ret = require(extPath)
    ret.MESSENGER_TAB_INDEX = messengerIndex
    fs.writeFileSync(extPath, JSON.stringify(ret, undefined, 2))
    core.debug(`更新 ext 文件成功`)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
