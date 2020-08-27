// 將側邊欄的模式（縮小、展開、隱藏）存在瀏覽器 localStorage 當中

/**
 * 將nav的狀態存至localStorage
 * @memberof module:feature
 * @param {any} event
 */
function changeNavStatus(event) {
  const { data } = event
  const { class: className, tag } = data
  if (document.body.classList.contains(className)) {
    window.localStorage.setItem('navStatus', 'normal')
  } else {
    window.localStorage.setItem('navStatus', tag)
  }
}

function initNavStatus() {
  if (!window.localStorage) {
    return
  }
  const navStatus = window.localStorage.getItem('navStatus')
  switch (navStatus) {
    case 'minify':
      document.body.classList.add('minified')
      break
    case 'hidden':
      document.body.classList.add('hidden-menu')
      break
    case null:
    case 'normal':
    default:
      break
  }
  $('.minifyme').on(
    'click',
    null,
    {
      class: 'minified',
      tag: 'minify',
    },
    changeNavStatus
  )
  $('#hide-menu a').on(
    'click',
    null,
    {
      class: 'hidden-menu',
      tag: 'hidden',
    },
    changeNavStatus
  )
}

export { initNavStatus }
