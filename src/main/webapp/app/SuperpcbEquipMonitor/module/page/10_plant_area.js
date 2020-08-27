export default function () {
  GoGoAppFun({
    gogo: function (context) {
      //to monitor page
      $('#plant-area-space').on('click', '.device', function () {
        window.location =
          '#app/SuperpcbEquipMonitor/function/' +
          servkit.getCookie('lang') +
          '/20_' +
          this.getAttribute('data-page-name') +
          '.html'
      })
      context.commons.superpcbPlantArea({
        source: undefined,
      })
    },
  })
}
