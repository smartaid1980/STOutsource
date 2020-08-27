export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.$rotateTable
        .find('tbody>tr:nth-child(2) th[data-original-title]')
        .append("<i class='fa fa-question-circle'></i>")
        .tooltip({
          container: '#rotate-table',
          html: 'true',
          placement: 'bottom',
        })

      ctx.commons.setMarqueeText('皇亮精密企業股份有限公司 - 機台狀態列表')

      ctx.$showRecordSpinner.spinner({
        min: 5,
        max: 20,
      })

      var machineModel = ctx.commons.getMachineModel()

      ctx.commons.setupFullscreen()
      ctx.commons.startListenDeviceStatus(machineModel, 'inner')
      ctx.commons.startRotate(machineModel)
      ctx.commons.startRefreshOeeAndPartcount(machineModel)

      if (ctx.isGraced && ctx.graceTag === 'iamouter') {
        ctx.$showRecordSpinner.spinner('value', ctx.graceParam.showRecord)
        ctx.$refreshFreqSpinner.spinner('value', ctx.graceParam.refreshFreq)
        ctx.$fullscreenBtn.trigger('click')
      }
    },

    util: {
      $fullscreenBtn: $('#fullscreen-btn'),
      $rotateTable: $('#rotate-table'),
      $showRecordSpinner: $('#show-record-spinner'),
      $refreshFreqSpinner: $('#refresh-freq-spinner'),
    },

    delayCondition: ['machineList'],
    preCondition: {
      boxIdList: function (done) {
        servkit.ajax(
          {
            url: 'api/box/read',
            type: 'GET',
          },
          {
            success: function (datas) {
              done(
                _.map(datas, function (box) {
                  return box.box_id
                })
              )
            },
          }
        )
      },
      workShift: function (done) {
        this.commons.ajaxWorkShift(done)
      },
      getProductList: function (done) {
        this.commons.getProductList(done)
      },
      getSampleList: function (done) {
        this.commons.getSampleList(done)
      },
      priority: function (done) {
        servkit.ajax(
          {
            url: 'api/huangliang/repair/priority',
            type: 'GET',
          },
          {
            success: function (datas) {
              done(
                _.reduce(
                  datas,
                  function (memo, data) {
                    memo[data.machine_id] = data.priority
                    return memo
                  },
                  {}
                )
              )
            },
          }
        )
      },
      alarmCode: function (done) {
        servkit.ajax(
          {
            url: 'api/alarm/read',
            type: 'GET',
          },
          {
            success: function (datas) {
              done(
                _.reduce(
                  datas,
                  function (memo, data) {
                    memo[data.alarm_id] = data.description
                    return memo
                  },
                  {}
                )
              )
            },
          }
        )
      },
    },
  })
}
