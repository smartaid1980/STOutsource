import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#charthead', '#bar-chart')
      pageSetUp()
      context.init(context)
      context.alarmCodeMap = context.preCon.alarmCodeMap

      var alarmCodeCountTable = createReportTable({
          $tableElement: $('#table'),
          rightColumn: [3],
          onDraw: function (tableData, pageData) {
            context.drawChart(pageData)
            $('.dataTables_length').addClass('hide')
          },
          excel: {
            fileName: 'Alarm_History_ByCode',
            format: ['text', 'text', 'text', '0'],
            customHeaderFunc: function (tableHeader) {
              return _.initial(tableHeader) // remove last
            },
            customDataFunc: function (tableData) {
              var cloneTableData = $.extend(true, {}, tableData)
              return _.map(cloneTableData, function (data) {
                var elem = _.map(data, function (str) {
                  if (typeof str === 'string') return str.replace(/<\/br>/g, '')
                  return str
                })
                return [elem[0], elem[1], elem[2], elem[3]]
              })
            },
          },
        }),
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          rightColumn: [1],
        })

      context.$submitBtn.on('click', function (e) {
        e.preventDefault()
        context.loadingBtn.doing()
        context.detailTableData = {}
        context.getAlarmCodeCount(
          context.$startDate.val(),
          context.$endDate.val(),
          alarmCodeCountTable
        )
      })

      context.$table.on('click', '.details', function (e) {
        e.preventDefault()
        context.$modal.modal('show')

        var data = alarmCodeCountTable.table.row($(this).parents('tr')).data()
        let key = $(this).attr('id')
        context.$modal
          .find('.modal-subtitle')
          .html(
            `${i18n('Machine_Type')}: ${data[0]} <br> ${i18n('Alarm_Name')}: ${
              data[2]
            }`
          )

        detailTable.drawTable(
          _.map(context.detailTableData[key], function (elem) {
            return [
              servkit.getMachineName(elem.machine_id),
              elem.count,
              moment(elem.date, 'YYYYMMDD').format('YYYY/MM/DD'),
            ]
          })
        )
      })

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2018/06/01',
          endDate: '2018/07/09',
        }
      }
      $('#showdemo').on('click', function (e) {
        e.preventDefault()

        context.$startDate.val(showdemoConfig.startDate)
        context.$endDate.val(showdemoConfig.endDate)
        context.$submitBtn.click()
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $submitBtn: $('#submit-btn'),
      $barChart: $('#bar-chart'),
      $table: $('#table'),
      $modal: $('#modal'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      alarmCodeMap: {},
      detailTableData: {},
      init: function (ctx) {
        servkit.initDatePicker(ctx.$startDate, ctx.$endDate, true)
        ctx.$barChart.on('plotclick', function (event, pos, item) {
          if (item) {
            ctx.$table
              .find('tbody tr')
              .eq(item.seriesIndex)
              .find('button')
              .click()
          }
        })
        ctx.machineMap = servkit.getMachineMap()

        //避免每次modal出現的時候會被捲到最下面的窘況 (似乎是 data-toggle="modal" data-target="#modal" 造成的 )
        ctx.$modal.modal({
          show: false,
        })
      },
      getAlarmName(alarmCodeMap, cncBrand, machineType, alarmCode) {
        return (
          alarmCodeMap[`${cncBrand}@@${machineType}@@${alarmCode}`] ||
          alarmCodeMap[`${cncBrand}@@OTHER@@${alarmCode}`] || //沒有機種特定的警報說明就用預設的
          `${i18n('Alarm_Code_Undefined')}`
        )
      },
      getAlarmCodeCount: function (startDate, endDate, table) {
        var context = this
        hippo
          .newSimpleExhaler()
          .space('alarm_code_count')
          .index(
            'machine_id',
            servkit.getFuncBindMachineList(context.appId, context.funId)
          )
          .indexRange('date', startDate, endDate)
          .columns('machine_id', 'alarm_code', 'count', 'date', 'cnc_id')
          .exhale(function (data) {
            //{"FANUC@@1006":[[deviceId, alarmCode, count, occurredDate], ...]}
            context.detailTableData = {}
            _.each(data.exhalable, (elem) => {
              _.each(elem.alarm_code.split(','), (code) => {
                let key = `${elem.cnc_id}@@${
                  context.machineMap[elem.machine_id].machine_type
                }@@${code}`
                if (!context.detailTableData[key]) {
                  context.detailTableData[key] = []
                }
                context.detailTableData[key].push(elem)
              })
            })

            //cnc_id, code alarm_status, count
            var tableData = []
            _.each(context.detailTableData, function (alarmInfo, key) {
              var cncBrand = key.split('@@')[0]
              var machineType = key.split('@@')[1]
              var alarmCode = key.split('@@')[2]

              //  if (!_.isNaN(parseInt(alarmCode)) && alarmCode != "-1") {
              if (alarmCode != '-1') {
                var alarmItems = alarmCode.split(',')
                var alarmCodes = {}
                for (var i = 0; i < alarmItems.length; ++i) {
                  // avoid dupl alarm code
                  if (
                    !Object.prototype.hasOwnProperty.call(
                      alarmCodes,
                      alarmItems[i]
                    )
                  ) {
                    alarmCodes[alarmItems[i]] = 'true'
                  }
                }

                var alamStatus = ''
                for (var acode in alarmCodes) {
                  if (acode !== '') {
                    var curalarmStatus =
                      acode +
                      ' : ' +
                      context.getAlarmName(
                        context.alarmCodeMap,
                        cncBrand,
                        machineType,
                        acode
                      )
                    alamStatus += curalarmStatus + '</br>'
                  }
                }
                if (alamStatus === '') {
                  alamStatus = 'N/A'
                  alarmCode = 'N/A'
                }

                tableData.push([
                  context.preCon.machineTypeMap[machineType] || machineType,
                  alarmCode,
                  alamStatus,
                  _.reduce(
                    alarmInfo,
                    function (memo, elem) {
                      return parseInt(memo) + parseInt(elem.count)
                    },
                    0
                  ),
                  `<button class="btn btn-primary details" id="${key}"> ${i18n(
                    'Alarm_Details'
                  )}</button>`,
                ])
              }
            })

            //machine_id, cnc_id, alarm_code, count, date
            table.drawTable(tableData)
            context.loadingBtn.done()
          })
      },
      drawChart: function (pageData) {
        var context = this
        var ticks = []
        //cnc_name, alarm_code, alarm_status, count
        var plotData = _.map(pageData, function (elem, index) {
          var alarmCode = elem[1]
          if (alarmCode.length > 10)
            alarmCode = '...' + alarmCode.substr(alarmCode.length - 7)
          ticks.push([index, elem[0] + '<br>' + alarmCode])
          return {
            data: [[index, elem[3]]],
            label: elem[2],
            color: servkit.colors.red,
          }
        })

        $.plot(context.$barChart, plotData, {
          series: {
            bars: {
              show: true,
              barWidth: 0.5,
              align: 'center',
            },
          },
          xaxis: {
            axisLabel: `${i18n('AlarmCode')}`,
            ticks: ticks,
            axisLabelUseHtml: true,
            axisLabelFontFamily: servkit.fonts,
            axisLabelPadding: 5,
            labelWidth: $('#bar-chart').width() / 15,
          },
          yaxis: {
            min: 0,
            axisLabel: `${i18n('AlarmNumber')}`,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: servkit.fonts,
            axisLabelUseHtml: true,
            axisLabelPadding: 5,
            tickDecimals: 0,
            minTickSize: 1,
          },
          legend: {
            show: false,
          },
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          tooltip: true,
          tooltipOpts: {
            content: '%s<span>%y</span>',
            defaultTheme: false,
          },
        })
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      alarmCodeMap: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_alarm',
              columns: [
                'alarm_id',
                'cnc_id',
                'machine_type_id',
                'alarm_status',
              ],
            }),
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  (memo, alarm) => {
                    memo[
                      `${alarm.cnc_id}@@${alarm.machine_type_id}@@${alarm.alarm_id}`
                    ] = alarm.alarm_status
                    return memo
                  },
                  {}
                )
              )
            },
          }
        )
      },
      machineTypeMap: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_machine_type',
              columns: ['machine_type_id', 'type_name'],
            }),
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  (memo, elem) => {
                    memo[elem.machine_type_id] = elem.type_name
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
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
