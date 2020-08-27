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
      context.init()
      context.alarmCodeMap = context.preCon.alarmCodeMap

      var alarmCodeDetailTable = createReportTable({
          $tableElement: $('#table'),
          rightColumn: [4],
          onRow: function (row, data) {
            $(row).find('td').eq(0).html(servkit.getMachineName(data[0]))
          },
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
              return _.map(cloneTableData, function (elem) {
                elem = _.map(elem, function (str) {
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
          rightColumn: [3, 4, 5],
          onRow: function (row, data) {
            $(row).find('td').eq(0).html(servkit.getMachineName(data[0]))
          },
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
        var cncBrand = data[1]
        var alarmCode = data[2]

        detailTable.drawTable(
          _.map(context.detailTableData[cncBrand + '__' + alarmCode], function (
            elem
          ) {
            var startTime = elem.start_time.dateTimeBitsToFormatted()
            var endTime = elem.end_time.dateTimeBitsToFormatted()
            return [
              servkit.getMachineName(elem.machine_id),
              elem.cnc_id,
              elem.alarm_code,
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
      init: function () {
        var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        }
        this.$startDate
          .datepicker(datepickerConfig)
          .val(moment(new Date()).format('YYYY/MM/DD'))
        this.$endDate
          .datepicker(datepickerConfig)
          .val(moment(new Date()).format('YYYY/MM/DD'))
        renderPlantAndMachineSelect(
          plantMachineOptionMap,
          this.$plant,
          this.$machineSelect,
          this.appId,
          this.funId
        )

        this.$barChart.on('plotclick', function (event, pos, item) {
          if (item) {
            var dataIndex = item.series.xaxis.ticks[item.dataIndex].label
            var btnId = '#' + dataIndex.replace('<br>', '__')
            $(btnId).click()
          }
        })

        //避免每次modal出現的時候會被捲到最下面的窘況 (似乎是 data-toggle="modal" data-target="#modal" 造成的 )
        this.$modal.modal({
          show: false,
        })
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
            context.detailTableData = _.groupBy(
              _.sortBy(data.exhalable, 'start_time'),
              function (elem) {
                return elem.cnc_id + '__' + elem.alarm_code
              }
            )

            //machine_id, cnc_id, alarm_code, alarm_status, count
            var tableData = []
            _.each(context.detailTableData, function (alarmInfo, brandCode) {
              var cncBrand = brandCode.split('__')[0]
              var alarmCode = brandCode.split('__')[1]

              //              if (!_.isNaN(parseInt(alarmCode)) && alarmCode != '-1') {
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
                      (context.alarmCodeMap[cncBrand] &&
                      context.alarmCodeMap[cncBrand][acode]
                        ? context.alarmCodeMap[cncBrand][acode]
                        : `${i18n('Alarm_Code_Undefined')}`)
                    alamStatus += curalarmStatus + '</br>'
                  }
                }
                if (alamStatus === '') {
                  alamStatus = 'N/A'
                  alarmCode = 'N/A'
                }

                tableData.push([
                  machineId,
                  cncBrand,
                  alarmCode,
                  alamStatus,
                  alarmInfo.length,
                  '<button class="btn btn-primary details" id="' +
                    brandCode +
                    `"> ${i18n('Alarm_Details')}` +
                    '</button>',
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

        //machine_id, cnc_id, alarm_code, alarm_status, count
        var alarmObj = _.map(pageData, function (elem, index) {
          return [index, elem[4]]
        })
        var ticks = _.map(pageData, function (elem, index) {
          var content = elem[2]
          var cutString = function (head) {
            var temp = head.split('_')
            head = ''
            for (var i = 0; i < temp.length; i++) {
              console.log(i)
              if (i == temp.length - 1) head += temp[i]
              else if (temp[i] + temp[i + 1] > 9) {
                head += temp[i] + '-<br>'
              } else {
                head += temp[i] + '-' + temp[i + 1] + '<br>'
                i++
              }
            }
            return head
          }
          var head = cutString(elem[1])
          if (elem[2].length > 10)
            content = '...' + elem[2].substr(elem[2].length - 7)
          return [index, head + '<br>' + content]
        })

        $.plot(
          context.$barChart,
          [
            {
              data: alarmObj,
              color: servkit.colors.red,
            },
          ],
          {
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
              axisLabelUseCanvas: true,
              axisLabelPadding: 5,
            },
            yaxis: {
              min: 0,
              axisLabel: `${i18n('AlarmNumber')}`,
              axisLabelFontSizePixels: 12,
              axisLabelFontFamily: servkit.fonts,
              axisLabelUseCanvas: true,
              axisLabelPadding: 5,
              tickDecimals: 0,
              minTickSize: 1,
            },
            legend: true,
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
              content: "<b style='display:none;'>%x</b><span>%y</span>",
              defaultTheme: false,
            },
          }
        )
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
              columns: ['alarm_id', 'cnc_id', 'alarm_status'],
            }),
          },
          {
            success: function (data) {
              var cncList = _.pluck(data, 'cnc_id')
              var alarmCodeMap = {}
              _.each(cncList, function (cncId) {
                alarmCodeMap[cncId] = {}
                _.each(data, function (elem) {
                  alarmCodeMap[cncId][elem.alarm_id] = elem.alarm_status
                })
              })
              done(alarmCodeMap)
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
