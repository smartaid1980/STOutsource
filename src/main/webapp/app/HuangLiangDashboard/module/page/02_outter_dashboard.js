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

      $('#marquee-text').val(ctx.preCon.marqueeText)
      ctx.commons.setMarqueeText(ctx.preCon.marqueeText)

      var loginInfo = JSON.parse(sessionStorage.getItem('loginInfo'))
      if (loginInfo.user_group.indexOf('management_assistant') === -1) {
        $('#marquee-text').parent().parent().hide()
      } else {
        $('#save-marquee-text-btn').on('click', function (evt) {
          ctx.saveMarqueeText($('#marquee-text').val())
        })
      }

      ctx.$showRecordSpinner.spinner({
        min: 5,
        max: 20,
      })

      var machineModel = ctx.commons.getMachineModel()

      ctx.commons.setupFullscreen()
      ctx.commons.startListenDeviceStatus(machineModel)
      ctx.commons.startRotate(machineModel)
      ctx.commons.startRefreshOeeAndPartcount(machineModel)

      ctx.startCheckMorningAndFullscreen()
    },

    util: {
      $fullscreenBtn: $('#fullscreen-btn'),
      $rotateTable: $('#rotate-table'),
      $showRecordSpinner: $('#show-record-spinner'),
      $refreshFreqSpinner: $('#refresh-freq-spinner'),

      startCheckMorningAndFullscreen: function () {
        var ctx = this,
          intervalId = setInterval(function () {
            var workShift = ctx.commons.getPrevAndCurrWorkShift().curr
            if (workShift.sequence !== 1 && ctx.commons.isFullscreen()) {
              ctx.gogoAnother({
                appId: 'HuangLiangDashboard',
                funId: '01_inner_dashboard',
                currentTab: true,
                graceTag: 'iamouter',
                graceParam: {
                  showRecord: ctx.$showRecordSpinner.spinner('value'),
                  refreshFreq: ctx.$refreshFreqSpinner.spinner('value'),
                },
              })
            }
          }, 2 * 60 * 1000)

        $(window).on('hashchange', function hashChange(evt) {
          clearInterval(intervalId)
          $(window).off('hashchange', hashChange)
        })
      },

      saveMarqueeText: function (marqueeText) {
        var ctx = this

        servkit.ajax(
          {
            url: 'api/savedata/hul_outer_dashboard_marquee',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              data: marqueeText,
            }),
          },
          {
            success: function () {
              ctx.commons.setMarqueeText(marqueeText)
              alert('儲存成功')
            },
            fail: function () {
              alert('儲存失敗')
            },
          }
        )
      },
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
      marqueeText: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: 'hul_outer_dashboard_marquee',
              pathPattern: 'data',
            }),
          },
          {
            success: function (data) {
              if (data[0]) {
                if (data[0][0]) {
                  done(data[0][0])
                } else {
                  done('皇亮精密企業股份有限公司 - 機台狀態列表')
                }
              } else {
                done('皇亮精密企業股份有限公司 - 機台狀態列表')
              }
            },
            fail: function (data) {
              done('皇亮精密企業股份有限公司 - 機台狀態列表')
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
