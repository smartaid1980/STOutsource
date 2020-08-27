import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      var $machineLigth = $('#machineLigth')
      buildMachineLight()

      ctx.commons.monitor({
        currentAppId: ctx.appId,
        currentPage: ctx.funId,
        titles: {
          pieLeftName: `${i18n('Speed')}`,
          pieRightName: `${i18n('Feed')}`,
          txtFirstName: `${i18n('Program')}`,
          txtLastName: `${i18n('Quantity')}`,
        },
      })

      // todo 處理無圖片時的問題

      //初始化燈號
      function buildMachineLight() {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device_light',
              columns: ['light_id', 'light_name', 'color'],
            }),
          },
          {
            success: function (data) {
              var machineLigthDec = `<span>${i18n(
                'Light_Status'
              )}:</span>&nbsp;`
              _.each(data, function (value) {
                machineLigthDec =
                  machineLigthDec +
                  '<span class="btn" style="background:' +
                  value.color +
                  ';"></span>&nbsp;<span>' +
                  value.light_name +
                  '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
              })
              $machineLigth.html($(machineLigthDec))
            },
          }
        )
      }
    },
    delayCondition: ['machineList'],
  })
}
