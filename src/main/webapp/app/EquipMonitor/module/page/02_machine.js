export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.boxId = servkit.getURLParameter('boxId')
      context.machineId = servkit.getURLParameter('machineId')
      context.brandId = servkit.getURLParameter('cncBrand')

      $('#leave-btn').on('click', function (e) {
        //離開頁面要跳回哪一頁的判斷
        e.preventDefault()
        context.leavePage(
          servkit.getURLParameter('preAppId'),
          servkit.getURLParameter('prePage')
        )
      })

      //讀取參數檔
      context.commons.getParamFile(
        context.machineId,
        context.brandId,
        paramBuffer
      )

      function paramBuffer(config) {
        context.machineMonitor = context.commons.machineMonitorV2(
          config,
          context.machineId
        )
        if (servkit.configUseShiftdata()) {
          servkit
            .schedule('updateShiftData')
            .freqMillisecond(15 * 60 * 1000)
            .action(function () {
              servkit.ajax(
                {
                  url: 'api/workshift/nowLogicallyDate',
                  type: 'GET',
                  contentType: 'application/json',
                },
                {
                  success: function (date) {
                    context.machineMonitor.date = date
                    servkit.ajax(
                      {
                        url: 'api/workshift/now',
                        type: 'GET',
                        contentType: 'application/json',
                      },
                      {
                        success: function (data) {
                          if (data && data['name']) {
                            var initSwitch = false
                            if (!context.machineMonitor.workShiftName)
                              initSwitch = true
                            console.log(context.machineMonitor.workShiftName)
                            context.machineMonitor.workShiftName = data['name'] // 紀錄班次名稱
                            if (initSwitch) {
                              context.machineMonitor.setHippo(
                                null,
                                'shiftdata_for_monitor',
                                null,
                                [
                                  'machine_id',
                                  'date',
                                  'work_shift',
                                  'power_millisecond',
                                  'oper_millisecond',
                                  'cut_millisecond',
                                  'partcount',
                                ]
                              )
                              context.machineMonitor.setHippo(
                                null,
                                'shift_program_data_for_monitor',
                                null,
                                [
                                  'machine_id',
                                  'date',
                                  'work_shift',
                                  'program_name',
                                  'start_oper_millisecond',
                                  'end_oper_millisecond',
                                  'start_partcount',
                                  'end_partcount',
                                ]
                              )
                              context.machineMonitor.preCondition(init)
                            }
                          }
                        },
                      }
                    )
                  },
                }
              )
            })
            .start()
        } else context.machineMonitor.preCondition(init)
      }

      function init() {
        context.machineMonitor.initialization()
        console.log(context.machineMonitor)

        if (
          context.machineMonitor.deviceStatus &&
          Object.keys(context.machineMonitor.deviceStatus).length
        )
          context.setDeviceStatusSchedule() // 更新devicestatus

        if (!context.machineMonitor.date)
          context.machineMonitor.date = moment(new Date()).format('YYYYMMDD')
        if (
          context.machineMonitor.hippo &&
          Object.keys(context.machineMonitor.hippo).length
        )
          context.setHippoSchedule() // 更新hippo

        if (
          context.machineMonitor.api &&
          Object.keys(context.machineMonitor.api).length
        )
          context.setAPISchedule() // 更新api

        if (
          context.machineMonitor.random &&
          Object.keys(context.machineMonitor.random).length
        )
          context.setRandomSchedule() // 更新random值
      }
    },
    util: {
      machineId: null,
      brandId: null,
      boxId: null,
      machineMonitor: null,
      lang: servkit.getCookie('lang'),
      date: null,
      programName: null,
      workShiftName: null,
      getCustomerHippo: null,
      setRandomSchedule: function () {
        // 更新隨機數值
        var ctx = this
        servkit
          .schedule('random')
          .freqMillisecond(60 * 1000)
          .action(function () {
            ctx.machineMonitor.randomUpdate()
          })
          .start()
      },
      setHippoSchedule: function () {
        // 更新hippo
        var ctx = this
        ctx.getCustomerHippo = servkit
          .schedule('getCustomerHippo')
          .freqMillisecond(15 * 60 * 1000)
          .action(function () {
            ctx.machineMonitor.hippoUpdate()
          })
          .start()
      },
      setDeviceStatusSchedule: function () {
        // 更新devicestatus
        var ctx = this
        servkit.subscribe('DeviceStatus', {
          machines: [ctx.boxId],
          dataModeling: true,
          handler: function (data) {
            var refresh = false
            if (
              ctx.machineMonitor.date &&
              ctx.machineMonitor.programName &&
              ctx.machineMonitor.workShiftName
            ) {
              if (
                ctx.machineMonitor.date &&
                ctx.date !== ctx.machineMonitor.date
              ) {
                if (ctx.date) refresh = true
                ctx.date = ctx.machineMonitor.date
              }
              if (
                ctx.machineMonitor.programName &&
                ctx.programName !== ctx.machineMonitor.programName
              ) {
                if (ctx.programName) refresh = true
                ctx.programName = ctx.machineMonitor.programName
              }
              if (
                ctx.machineMonitor.workShiftName &&
                ctx.workShiftName !== ctx.machineMonitor.workShiftName
              ) {
                if (ctx.workShiftName) refresh = true
                ctx.workShiftName = ctx.machineMonitor.workShiftName
              }
            }
            if (
              refresh &&
              ctx.getCustomerHippo &&
              ctx.getCustomerHippo.stop &&
              ctx.getCustomerHippo.start
            ) {
              console.log(ctx.date, ctx.machineMonitor.date)
              console.log(ctx.programName, ctx.machineMonitor.programName)
              console.log(ctx.workShiftName, ctx.machineMonitor.workShiftName)
              ctx.getCustomerHippo.stop()
              ctx.getCustomerHippo.start()
            }
            ctx.machineMonitor.deviceStatusUpdate(data)
          },
          noDataHandler: function (data) {
            ctx.machineMonitor.deviceStatusUpdate(data)
          },
          allBrand: true,
        })
      },
      setAPISchedule: function () {
        // 更新api
        var ctx = this
        var timeoutMilliseconds = 1000
        if (servtechConfig.ST_DEVICESTATUS_FREQUNECY) {
          timeoutMilliseconds = servtechConfig.ST_DEVICESTATUS_FREQUNECY
        }
        servkit
          .schedule('getCustomerAPI')
          .freqMillisecond(timeoutMilliseconds)
          .action(function () {
            _.each(ctx.machineMonitor.api, (ele) => {
              var param = ctx.machineMonitor.components[ele[0]].param.source // 取第一個元件的設定就可以了
              if (!param.data)
                param.data = {
                  machine_id: ctx.machineId,
                }
              servkit.ajax(ctx.machineMonitor.getAjaxData(param), {
                success: function (data) {
                  ctx.machineMonitor.apiUpdate(data, ele)
                },
              })
            })
          })
          .start()
      },
      leavePage: function (preAppId, prePage) {
        //返回上一頁
        var lang = servkit.getCookie('lang')
        var monitorHomePage =
          '#app/EquipMonitor/function/' + lang + '/02_plant_area.html'
        if (preAppId != null && prePage != null) {
          if (preAppId != 'null' && prePage != 'null') {
            if (prePage.search('id') >= 0 || prePage.search('pageby') >= 0) {
              monitorHomePage =
                '#app/' +
                preAppId +
                '/function/' +
                lang +
                '/' +
                servkit
                  .getURLParameter('prePage')
                  .replace('?', '.html?')
                  .replace(/ /g, '+')
              if (servkit.getURLParameter('text')) {
                monitorHomePage += '&text=' + servkit.getURLParameter('text')
              }
              if (servkit.getURLParameter('pageby')) {
                monitorHomePage +=
                  '&pageby=' + servkit.getURLParameter('pageby')
              }
            } else {
              monitorHomePage =
                '#app/' +
                preAppId +
                '/function/' +
                lang +
                '/' +
                prePage.split('?')[0] +
                '.html'
            }
          }
        }
        window.location.href = monitorHomePage
      },
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
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
      ],
      ['/js/plugin/d3/d3.min.js'],
      ['/js/plugin/sparkline/jquery.sparkline.min.js'],
    ],
  })
}
