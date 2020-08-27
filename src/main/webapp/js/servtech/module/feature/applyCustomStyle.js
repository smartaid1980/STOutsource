import { servtechConfig } from '../servtech.config.js'

if (servtechConfig.ST_UI_SHOW_SERVLOGO === false) {
  var style = document.createElement('style')
  style.innerHTML = '.serv-info{display:none;}'
  document.head.appendChild(style)
}

if (servtechConfig.ST_UI_SHOW_CONTRACT === false) {
  var contract = document.createElement('style')
  contract.innerHTML = '#license-date{display:none;}'
  document.head.appendChild(contract)
  var ribbon = document.createElement('style')
  ribbon.innerHTML = '#ribbon{display:none;}'
  document.head.appendChild(ribbon)
}
