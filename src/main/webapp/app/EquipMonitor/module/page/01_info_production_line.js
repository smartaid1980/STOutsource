export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var line = context.commons.productionLine({
        msg: {
          load: {
            incomplete: '該產線尚未設定完成!請先完成設定!',
          },
        },
      })

      $('#repair-result-content')
        .find('table')
        .on('click', '.stk-load-file', function (e) {
          $('#instructions').removeClass('hide') // 顯示說明文字
          if (context.drawer) {
            // 移除舊有 drawer
            context.drawer.removeDrawer()
          }

          var lineId = $(this).attr('data-id') // 放上新的 drawer
          if (context.preCon.ipCamMap && context.preCon.ipCamMap[lineId]) {
            context.drawer = servkit
              .ipCamDrawer()
              .attach(context.preCon.ipCamMap[lineId])
          }
        })

      context.getStatusPng()
    },
    util: {
      drawer: undefined,
      getStatusPng: function () {
        // change background
        var getStatusPng = servkit
          .schedule('getStatusPng')
          .freqMillisecond(5000)
          .action(function () {
            $('.bg').attr(
              'src',
              'api/equipline/getstatuspng?tsp=' + new Date().getTime()
            )
          })
          .start()
      },
    },
    preCondition: {
      ipCamMap: function (done) {
        servkit.ajax(
          {
            url: 'api/ipCam/read',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var ipCamMap = {}
              _.each(data, function (elem) {
                if (elem.line_id != '') {
                  ipCamMap[elem.line_id] = elem
                }
              })
              done(ipCamMap)
            },
          }
        )
      },
    },
    delayCondition: ['machineList'],
    dependencies: [['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js']],
  })
}
