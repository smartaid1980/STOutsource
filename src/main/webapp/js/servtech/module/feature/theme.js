import { themeIdClassNameMap } from '../servkit/var.js'

// 初始化版面主題選擇
function changeThemeHandler() {
  const id = this.id
  const className = themeIdClassNameMap[id]
  document.body.classList.remove(...Object.values(themeIdClassNameMap))
  document.body.classList.add(className)
  localStorage.setItem('theme_style', className)
}
function initPlatformTheme() {
  const cachedTheme = localStorage.getItem('theme_style')
  if (cachedTheme) {
    document.body.classList.remove(...Object.values(themeIdClassNameMap))
    document.body.classList.add(cachedTheme)
  }
  i18n.async(() => {
    $('#theme').find('span').text(i18n('Theme'))
    $('#style2').append(i18n('Style2')).on('click', changeThemeHandler)
    $('#style5').append(i18n('Style5')).on('click', changeThemeHandler)
  })
}

export { initPlatformTheme }
