export default function () {
  var theHref = location.href
  var boxId = getURLParameter('boxId', theHref)
  var machineId = getURLParameter('machineId', theHref)
  var preAppId = getURLParameter('preAppId', theHref)
  var prePage = getURLParameter('prePage', theHref)

  $('#boxId').text(boxId)
  $('#machineIdHead').text(machineId)
  $('#machineId').text(machineId)

  console.log('boxId:' + boxId + ', machineId:' + machineId)

  var lang = getCookie('lang')
  var monitorHomePage =
    '#app/EquipMonitor/function/' + lang + '/02_plant_area_monitor.html'
  console.log(preAppId)
  console.log(prePage)
  if (preAppId != 'null' && prePage != 'null') {
    monitorHomePage =
      '#app/' + preAppId + '/function/' + lang + '/' + prePage + '.html'
  }

  console.log('monitorHomePage: ' + monitorHomePage)
  window.location.href = monitorHomePage

  function getURLParameter(name, url) {
    //location.href
    return (
      decodeURIComponent(
        (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [
          null,
          '',
        ])[1].replace(/\+/g, '%20')
      ) || null
    )
  }

  function getCookie(key) {
    var cookieMap = _.reduce(
      window.document.cookie.split(';'),
      function (cookieMap, cookie) {
        var cookieSplitted = cookie.trim().split('=')
        cookieMap[cookieSplitted[0]] = cookieSplitted[1]
        return cookieMap
      },
      {}
    )
    return cookieMap[key]
  }
}
