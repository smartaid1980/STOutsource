import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.init()
      //alarmCodeMapAnko = {2021 : {cncId: "Hitachi", cncName: "Hitachi", alarm10: "21", alarm16: "15", alarmStatus: "濕度異常"}, ...}
      context.alarmCodeMapAnko = context.preCon.alarmCodeMapAnko

      //machine_id, cnc_id, alarm_code, alarm_status, count
      var alarmCodeTable = createReportTable({
          $tableElement: $('#table'),
          rightColumn: [4],
          onRow: function (row, data) {
            $(row).find('td').eq(0).html(servkit.getMachineName(data[0]))
            $(row)
              .find('td')
              .eq(2)
              .html(context.alarmCodeMapAnko[data[2]].alarm10)
          },
          onDraw: function (tableData, pageData) {
            context.drawChart(tableData)
          },
        }),
        //start_time, end_time, duration
        detailMachineTable = createReportTable({
          $tableElement: $('#detail-machine-table'),
          rightColumn: [0, 1, 2],
        }),
        //inverter_seq, cnc_id, inverter_status, alarm_code10, alarm_code16, inverter_alarm_status, start_time, end_time, duration
        detailInverterTable = createReportTable({
          $tableElement: $('#detail-inverter-table'),
          rightColumn: [6, 7, 8],
        })

      context.$submitBtn.on('click', function (e) {
        e.preventDefault()
        context.loadingBtn.doing()
        context.detailTableData = {}
        context.getAlarmCodeDetail(
          context.$startDate.val(),
          context.$endDate.val(),
          context.$machineSelect.val(),
          alarmCodeTable
        )
      })

      context.$table.on('click', '.details', function (e) {
        e.preventDefault()

        var rowData = alarmCodeTable.table.row($(this).parents('tr')).data()
        context.$modal
          .find('.summary')
          .html(
            [
              `<span class="label label-info">${i18n('Machine')} : ` +
                servkit.getMachineName(rowData[0]) +
                '</span>',
              `<span class="label label-info">${i18n('Cnc_Brand')} : ` +
                rowData[1] +
                '</span>',
              `<span class="label label-info">${i18n('AlarmCode')} : ` +
                context.alarmCodeMapAnko[rowData[2]].alarm10 +
                '</span>',
            ].join(' ')
          )

        context.$modal.modal('show')
        var alarmCode = $(this).attr('id')
        var codeObj = context.alarmCodeMapAnko[alarmCode]

        if (context.isInverterAlarm(alarmCode)) {
          $('#detail-machine-table')
            .closest('.dataTables_wrapper')
            .addClass('hide')
          $('#detail-inverter-table')
            .closest('.dataTables_wrapper')
            .removeClass('hide')

          //inverter_seq, cnc_id, alarm_code10, alarm_code16, inverter_alarm_status, inverter_status, start_time, end_time, duration
          detailInverterTable.drawTable(
            _.map(context.detailTableData[alarmCode], function (elem) {
              var inverterAlarmCodeObj =
                context.alarmCodeMapAnko[elem.inverter_alarm_code]

              if (inverterAlarmCodeObj) {
                return [
                  elem.inverter_seq,
                  inverterAlarmCodeObj.cncName,
                  inverterAlarmCodeObj.alarm10,
                  inverterAlarmCodeObj.alarm16,
                  inverterAlarmCodeObj.alarmStatus,
                  inverterAlarmCodeObj.cncId == context.HITACHI_ID
                    ? elem.inverter_status
                    : '---',
                  elem.start_time,
                  elem.end_time,
                  elem.duration,
                ]
              } else {
                return [
                  elem.inverter_seq,
                  '---',
                  '---',
                  '---',
                  '---',
                  '---',
                  elem.start_time,
                  elem.end_time,
                  elem.duration,
                ]
              }
            })
          )
        } else {
          $('#detail-machine-table')
            .closest('.dataTables_wrapper')
            .removeClass('hide')
          $('#detail-inverter-table')
            .closest('.dataTables_wrapper')
            .addClass('hide')

          //start_time, end_time, duration
          detailMachineTable.drawTable(
            _.map(context.detailTableData[alarmCode], function (elem) {
              return [elem.start_time, elem.end_time, elem.duration]
            })
          )
        }
      })

      $('#showDemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/05/01')
        context.$endDate.val('2016/05/10')
        context.$machineSelect.val('Machine01')
        context.$submitBtn.click()
      })
    },
    util: {
      HITACHI_ID: 'Hitachi',
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      $barChart: $('#bar-chart'),
      $table: $('#table'),
      $modal: $('#modal'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      alarmCodeMapAnko: {},
      detailTableData: {},
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

        var machineSelectHtml = []
        servkit.eachMachine(function (id, name) {
          machineSelectHtml.push(
            '<option value="' + id + '">' + name + '</option>'
          )
        })
        this.$machineSelect.html(machineSelectHtml.join(''))

        this.$barChart.on('plotclick', function (event, pos, item) {
          if (item) {
            var dataIndex = item.series.xaxis.ticks[item.dataIndex].label
            var btnId = '#' + dataIndex.split('@')[1]
            $(btnId).click()
          }
        })

        //避免每次modal出現的時候會被捲到最下面的窘況 (似乎是 data-toggle="modal" data-target="#modal" 造成的 )
        this.$modal.modal({ show: false })
      },
      isInverterAlarm: function (alarm_code) {
        //警報代碼為 113~118 或 213~240 為馬達(變頻器)異常  安口說不會改喔~~啾咪 >.^
        return (
          (alarm_code >= 113 && alarm_code <= 118) ||
          (alarm_code >= 213 && alarm_code <= 240)
        )
      },
      getAlarmCodeDetail: function (startDate, endDate, machineId, table) {
        var context = this

        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: 'alarm_by_machine_anko',
              pathPattern: machineId + '/{YYYY}/{MM}/{YYYY}{MM}{DD}.csv',
              startDate: startDate,
              endDate: endDate,
            }),
          },
          {
            success: function (data) {
              var keys = [
                'machine_id',
                'alarm_code',
                'inverter_seq',
                'inverter_alarm_code',
                'inverter_status',
                'start_time',
                'end_time',
                'duration',
              ]

              context.detailTableData = _.chain(data)
                .map(function (elem) {
                  elem[5] = elem[5].dateTimeBitsToFormatted()
                  elem[6] = elem[6].dateTimeBitsToFormatted()
                  elem[7] = parseInt(elem[7]).millisecondToHHmmss()
                  return _.object(keys, elem)
                })
                .groupBy('alarm_code')
                .value()

              console.log(context.detailTableData)

              //machine_id, cnc_id, alarm_code, alarm_status, count
              var tableData = []
              _.each(context.detailTableData, function (alarmInfo, alarm_code) {
                var codeObj = context.alarmCodeMapAnko[alarm_code]
                if (codeObj) {
                  var alarmStatus = codeObj.alarmStatus
                    ? codeObj.alarmStatus
                    : `${i18n('Alarm_Code_Undefined')}`
                  tableData.push([
                    machineId,
                    codeObj.cncName,
                    alarm_code, //放原始的key 顯示的時候再轉換才有辦法在點擊的時候找回原本的key
                    alarmStatus,
                    alarmInfo.length,
                    '<button class="btn btn-primary details" id="' +
                      alarm_code +
                      `"> ${i18n('Alarm_Details')}` +
                      '</button>',
                  ])
                } else {
                  console.warn(alarm_code + ' not defined in DB.')
                }
              })

              //machine_id, cnc_id, alarm_code, count, date
              table.drawTable(tableData)
              context.loadingBtn.done()
            },
          }
        )
      },
      drawChart: function (tableData) {
        var context = this

        //device_id, cnc_id, alarm_code, alarm_code_status, count
        var alarmObj = _.map(tableData, function (elem, index) {
          return [index, elem[4]]
        })
        var ticks = _.map(tableData, function (elem, index) {
          return [
            index,
            elem[1] +
              '<br>' +
              context.alarmCodeMapAnko[elem[2]].alarm10 +
              "<div class='hide'>@" +
              elem[2] +
              '@</div>',
          ]
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
            },
            yaxis: {
              min: 0,
              axisLabel: `${i18n('AlarmNumber')}`,
              axisLabelFontSizePixels: 12,
              axisLabelFontFamily: servkit.fonts,
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
      alarmCodeMapAnko: function (done) {
        this.commons.alarmCodeMapAnko(done)
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
