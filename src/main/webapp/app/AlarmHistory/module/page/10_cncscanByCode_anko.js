import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.init()
      //alarmCodeMapAnko = {2021 : {cncId: "Hitachi",cncName: "Hitachi", alarm10: "21", alarm16: "15", alarmStatus: "濕度異常"}, ...}
      context.alarmCodeMapAnko = context.preCon.alarmCodeMapAnko
      //motorStatusMap = {0: "復位中", ...}
      context.motorStatusMap = context.preCon.motorStatusMap

      //cnc_id, alarm_code_10, alarm_code, alarm_status, count
      var alarmCodeCountTable = createReportTable({
          $tableElement: $('#table'),
          rightColumn: [4],
          onRow: function (row, data) {
            $(row)
              .find('td')
              .eq(2)
              .html(context.alarmCodeMapAnko[data[2]].alarm16)
          },
          onDraw: function (tableData, pageData) {
            context.drawChart(tableData)
          },
        }),
        //machine_id, alarm_code, alarm_status, start_time, end_time, duration
        detailMachineTable = createReportTable({
          $tableElement: $('#detail-machine-table'),
          rightColumn: [3, 4, 5],
        }),
        //cnc_id, inverter_alarm_code10, inverter_alarm_code16, inverter_alarm_status, inverter_status, start_time, end_time, duration
        detailInverterTable = createReportTable({
          $tableElement: $('#detail-inverter-table'),
          rightColumn: [5, 6, 7],
        })

      context.$submitBtn.on('click', function (e) {
        e.preventDefault()
        context.loadingBtn.doing()
        context.machineDetailTableData = {}
        context.inverterDetailTableData = {}
        context.getAlarmCodeCount(
          context.$startDate.val(),
          context.$endDate.val(),
          alarmCodeCountTable
        )
      })

      context.$table.on('click', '.details', function (e) {
        e.preventDefault()
        context.$modal.modal('show')
        var alarmCode = $(this).attr('id')
        var alarmObj = context.alarmCodeMapAnko[alarmCode]

        if (context.machineDetailTableData[alarmCode]) {
          $('#detail-machine-table')
            .closest('.dataTables_wrapper')
            .removeClass('hide')
          $('#detail-inverter-table')
            .closest('.dataTables_wrapper')
            .addClass('hide')
          detailMachineTable.drawTable(
            _.map(context.machineDetailTableData[alarmCode], function (elem) {
              return [
                servkit.getMachineName(elem.machine_id),
                alarmObj.alarm10,
                alarmObj.alarmStatus,
                elem.start_time,
                elem.end_time,
                elem.duration,
              ]
            })
          )
        } else if (context.inverterDetailTableData[alarmCode]) {
          $('#detail-machine-table')
            .closest('.dataTables_wrapper')
            .addClass('hide')
          $('#detail-inverter-table')
            .closest('.dataTables_wrapper')
            .removeClass('hide')
          detailInverterTable.drawTable(
            _.map(context.inverterDetailTableData[alarmCode], function (elem) {
              return [
                alarmObj.cncName,
                alarmObj.alarm10,
                alarmObj.alarm16,
                alarmObj.alarmStatus,
                alarmObj.cncId == context.HITACHI_ID
                  ? elem.inverter_status
                  : '---',
                elem.start_time,
                elem.end_time,
                elem.duration,
              ]
            })
          )
        }
      })

      $('#showDemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/05/01')
        context.$endDate.val('2016/05/10')
        context.$submitBtn.click()
      })
    },
    util: {
      HITACHI_ID: 'Hitachi',
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $submitBtn: $('#submit-btn'),
      $barChart: $('#bar-chart'),
      $table: $('#table'),
      $modal: $('#modal'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      alarmCodeMap: {},
      machineDetailTableData: {},
      inverterDetailTableData: {},
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
      getAlarmCodeCount: function (startDate, endDate, table) {
        var context = this
        // 機台廠牌  變頻器廠牌  警報代碼(十進位) 警報代碼(十六進位) 警報說明 次數 詳細資料

        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: 'alarm_by_code_anko',
              pathPattern: '{machine}/{YYYY}/{MM}/{YYYY}{MM}{DD}.csv',
              pathParam: {
                machine: servkit.getMachineList(),
              },
              startDate: startDate,
              endDate: endDate,
            }),
          },
          {
            success: function (data) {
              //keys = ["machine_id", "alarm_code", "start_time", "end_time", "inverter_alarm_code", "inverter_status", "duration"];
              //machineAlarmDetail : {machine_id, alarm_code, start_time, end_time, duration}
              //inverterAlamrDetail : {inverter_alarm_code, inverter_alarm_status, inverter_status, start_time, end_time, duration}
              context.machineDetailTableData = _.chain(data)
                .map(function (elem) {
                  return {
                    machine_id: elem[0],
                    alarm_code: elem[1],
                    start_time: elem[2].dateTimeBitsToFormatted(),
                    end_time: elem[3].dateTimeBitsToFormatted(),
                    duration: parseInt(elem[6]).millisecondToHHmmss(),
                  }
                })
                .groupBy('alarm_code')
                .value()

              context.inverterDetailTableData = {}
              _.each(data, function (elem) {
                var inverter_alarm_codes = _.without(
                  elem[4].split('#'),
                  '65535'
                ) //"65535" 是沒裝的意思
                var inverter_status = _.without(elem[5].split('#'), '65535')
                _.each(inverter_alarm_codes, function (
                  inverterAlarmCode,
                  index
                ) {
                  if (!context.inverterDetailTableData[inverterAlarmCode]) {
                    context.inverterDetailTableData[inverterAlarmCode] = []
                  }
                  try {
                    context.inverterDetailTableData[inverterAlarmCode].push({
                      inverter_alarm_code: inverterAlarmCode,
                      inverter_alarm_status:
                        context.alarmCodeMapAnko[inverterAlarmCode].alarmStatus,
                      inverter_status:
                        context.motorStatusMap[inverter_status[index]],
                      start_time: elem[2].dateTimeBitsToFormatted(),
                      end_time: elem[3].dateTimeBitsToFormatted(),
                      duration: parseInt(elem[6]).millisecondToHHmmss(),
                    })
                  } catch (e) {
                    console.warn(e)
                  }
                })
              })

              console.log(
                _.intersection(
                  _.keys(context.machineDetailTableData),
                  _.keys(context.inverterDetailTableData)
                )
              )
              console.log(context.machineDetailTableData)
              console.log(context.inverterDetailTableData)

              //cnc_id, alarm_code_10, alarm_code, alarm_status, count
              var tableData = []
              _.each(
                _.extend(
                  {},
                  context.machineDetailTableData,
                  context.inverterDetailTableData
                ),
                function (alarmInfo, alarm_code) {
                  var codeObj = context.alarmCodeMapAnko[alarm_code]
                  if (codeObj) {
                    var alarmStatus = codeObj.alarmStatus
                      ? codeObj.alarmStatus
                      : `${i18n('Alarm_Code_Undefined')}`
                    tableData.push([
                      codeObj.cncName,
                      codeObj.alarm10,
                      alarm_code, //TODO: 放原始的key 顯示的時候再轉換才有辦法在點擊的時候找回原本的key
                      alarmStatus,
                      alarmInfo.length,
                      '<button class="btn btn-primary details" id="' +
                        alarm_code +
                        `"> ${i18n('Alarm_Details')}` +
                        '</button>',
                    ])
                  }
                }
              )

              //machine_id, cnc_id, alarm_code, count, date
              table.drawTable(tableData)
              context.loadingBtn.done()
            },
          }
        )
      },
      drawChart: function (tableData) {
        var context = this

        //cnc_id, alarm_code_10, alarm_code, alarm_status, count
        var alarmObj = _.map(tableData, function (elem, index) {
          return [index, elem[4]]
        })
        var ticks = _.map(tableData, function (elem, index) {
          return [
            index,
            elem[0] +
              '<br>' +
              elem[1] +
              ' (' +
              context.alarmCodeMapAnko[elem[2]].alarm16 +
              ")<div class='hide'>@" +
              elem[2] +
              '@</div>',
          ]
        })
        console.log(alarmObj)
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
            tooltip: true,
            grid: {
              show: true,
              hoverable: true,
              clickable: true,
              tickColor: '#EFEFEF',
              borderWidth: 0,
              borderColor: '#EFEFEF',
            },
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
      motorStatusMap: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_motor_status',
              columns: ['motor_status_id', 'name'],
            }),
          },
          {
            success: function (data) {
              var motorStatusMap = {}
              _.each(data, function (elem) {
                motorStatusMap[elem.motor_status_id] = elem.name
              })
              done(motorStatusMap)
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
