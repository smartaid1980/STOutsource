export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      if (servtechConfig.ST_PLANT_AREA_AUTO_SHOW_OTHER_SIGNAL) {
        $('#space').addClass('auto-show-other-signal')
      }
      context.commons.plantArea({
        msg: {
          load: {
            incomplete: '該產區尚未設定完成!請先完成設定!',
          },
        },
      })
      $('#changeStyle').on('click', function () {
        var monitorHomePage = window.location.href
        if (monitorHomePage.search('index_dark') >= 0) {
          monitorHomePage = monitorHomePage.replace('index_dark', 'index')
        } else {
          monitorHomePage = monitorHomePage.replace('index', 'index_dark')
        }
        window.location.href = monitorHomePage
      })
      $('#leave-btn').on('click', function () {
        var lang = servkit.getCookie('lang')
        var page = '02_all_plant_area.html'
        if (servkit.getURLParameter('pageby')) {
          page = '02_all_plant_area_v1.html'
        }
        window.location.href = '#app/EquipMonitor/function/' + lang + '/' + page
      })
    },
    delayCondition: [
      'machineList',
      'machinePlantAreaList',
      'plantAreaList',
      'machineLightList',
    ],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        // "/js/plugin/d3/d3.v4.min.js",
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.valuelabels.js',
      ],
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
    ],
  })
}
