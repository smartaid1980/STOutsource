import { getRootPath } from './util.js'

// for pdf export
const colors = {
  red: '#D62728',
  purple: '#9467BD',
  blue: '#2361FF',
  green: '#2FA12F',
  orange: '#FF7F0E',
}

const statusColors = {
  online: '#2e8b57',
  idle: '#ffa500',
  alarm: '#a90329',
  offline: '#d3d3d3',
}

const fonts = '"Microsoft JhengHei", Helvetica, Arial, sans-serif'

const rootPath = getRootPath()

const langMap = {
  en: {
    class: 'us',
    text: 'English (US)',
  },
  zh_tw: {
    class: 'tw',
    text: '繁體中文',
  },
  zh: {
    class: 'cn',
    text: '简体中文',
  },
}

const themeIdClassNameMap = {
  style2: 'smart-style-2',
  style5: 'smart-style-5',
}

export { colors, statusColors, fonts, rootPath, langMap, themeIdClassNameMap }
