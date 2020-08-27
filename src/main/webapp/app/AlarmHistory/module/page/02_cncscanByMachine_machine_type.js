import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  renderPlantAndMachineSelect,
  getPlantMachineOptionMap,
} from '../../../../js/servtech/module/servkit/form.js'
export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap(false)
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#charthead', '#bar-chart')
      pageSetUp()
      context.init(context)
      context.alarmCodeMap = context.preCon.alarmCodeMap

      var alarmCodeDetailTable = createReportTable({
          $tableElement: $('#table'),
          rightColumn: [4],
          onDraw: function (tableData, pageData) {
            context.drawChart(pageData)
            $('.dataTables_length').addClass('hide')
          },
          excel: {
            fileName: 'Alarm_History_ByMachine',
            format: ['text', 'text', 'text', 'text', '0'],
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
                return [elem[0], elem[1], elem[2], elem[3], elem[4]]
              })
            },
          },
        }),
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          rightColumn: [1, 2, 3],
        })

      context.$submitBtn.on('click', function (e) {
        e.preventDefault()
        context.loadingBtn.doing()
        context.detailTableData = {}
        context.getAlarmCodeDetail(
          context.$startDate.val(),
          context.$endDate.val(),
          context.$machineSelect.val(),
          alarmCodeDetailTable
        )
      })

      context.$table.on('click', '.details', function (e) {
        e.preventDefault()
        context.$modal.modal('show')

        var data = alarmCodeDetailTable.table.row($(this).parents('tr')).data()
        const key = $(this).attr('id')
        context.$modal
          .find('.modal-subtitle')
          .html(
            `${i18n('Machine_Type')}: ${data[1]} <br> ${i18n('Alarm_Name')}: ${
              data[3]
            }`
          )

        detailTable.drawTable(
          _.map(context.detailTableData[key], function (elem) {
            var startTime = elem.start_time.dateTimeBitsToFormatted()
            var endTime = elem.end_time.dateTimeBitsToFormatted()
            return [
              servkit.getMachineName(elem.machine_id),
              startTime,
              endTime,
              (
                new Date(endTime).getTime() - new Date(startTime).getTime()
              ).millisecondToHHmmss(),
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
          machine: '_FOXCONNP01D01M005',
        }
      }
      $('#showdemo').on('click', function (e) {
        e.preventDefault()

        context.$startDate.val(showdemoConfig.startDate)
        context.$endDate.val(showdemoConfig.endDate)
        context.$machineSelect.val(showdemoConfig.machine)
        context.$submitBtn.click()
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $plant: $('#plant'),
      $submitBtn: $('#submit-btn'),
      $barChart: $('#bar-chart'),
      $table: $('#table'),
      $modal: $('#modal'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      alarmCodeMap: {},
      detailTableData: {},
      plantData: {},
      init: function (ctx) {
        servkit.initDatePicker(ctx.$startDate, ctx.$endDate, true)
        renderPlantAndMachineSelect(
          plantMachineOptionMap,
          ctx.$plant,
          ctx.$machineSelect,
          ctx.appId,
          ctx.funId
        )
        ctx.machineMap = servkit.getMachineMap()
        ctx.$barChart.on('plotclick', function (event, pos, item) {
          if (item) {
            ctx.$table
              .find('tbody tr')
              .eq(item.seriesIndex)
              .find('button')
              .click()
          }
        })

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
      getAlarmCodeDetail: function (startDate, endDate, machineId, table) {
        var context = this
        hippo
          .newSimpleExhaler()
          .space('alarm_code_detail')
          .index('machine_id', [machineId])
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'alarm_code',
            'start_time',
            'end_time',
            'duration',
            'cnc_id'
          )
          .exhale(function (data) {
            //{"FANUC__1006":[[machine_id, alarm_code, start_time, end_time, duration, cnc_id], ...]}
            context.detailTableData = {}
            _.each(_.sortBy(data.exhalable, 'start_time'), (elem) => {
              _.each(elem.alarm_code.split(','), (code) => {
                const key = `${elem.cnc_id}@@${
                  context.machineMap[elem.machine_id].machine_type
                }@@${code}`
                if (!context.detailTableData[key]) {
                  context.detailTableData[key] = []
                }
                context.detailTableData[key].push(elem)
              })
            })

            //machine_id, cnc_id, alarm_code, alarm_status, count
            var tableData = []
            _.each(context.detailTableData, function (alarmInfo, key) {
              var cncBrand = key.split('@@')[0]
              var machineType = key.split('@@')[1]
              var alarmCode = key.split('@@')[2]

              // if (!_.isNaN(parseInt(alarmCode)) && alarmCode != '-1') {
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
                  servkit.getMachineName(machineId),
                  context.preCon.machineTypeMap[machineType] || machineType,
                  alarmCode,
                  alamStatus,
                  alarmInfo.length,
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
        //machine_id, cnc_id, alarm_code, alarm_status, count
        var plotData = _.map(pageData, function (elem, index) {
          var alarmCode = elem[2]
          if (elem[2].length > 10)
            alarmCode = '...' + alarmCode.substr(alarmCode.length - 7)
          ticks.push([index, elem[1] + '<br>' + alarmCode])

          return {
            data: [[index, elem[4]]],
            label: elem[3],
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
            axisLabelFontFamily: servkit.fonts,
            axisLabelUseHtml: true,
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
