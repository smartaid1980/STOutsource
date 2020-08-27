import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#charthead', '#bar-chart')

      pageSetUp()
      context.init()
      context.alarmCodeMap = context.preCon.alarmCodeMap

      var alarmCodeCountTable = createReportTable({
          $tableElement: $('#table'),
          rightColumn: [3],
          onDraw: function (tableData, pageData) {
            context.drawChart(pageData)
          },
        }),
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          rightColumn: [4],
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
        var cncBrand = data[0]
        var alarmCode = data[1]

        detailTable.drawTable(
          _.map(context.detailTableData[cncBrand + '__' + alarmCode], function (
            elem
          ) {
            return [
              servkit.getMachineName(elem.machine_id),
              elem.cnc_id,
              context.alarmCodeTrans(elem.alarm_code),
              elem.count,
              elem.date,
            ]
          })
        )
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/04/01')
        context.$endDate.val('2016/04/30')
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
            var btnId = '#' + dataIndex.replace('<br>', '__')
            $(btnId).click()
          }
        })

        //避免每次modal出現的時候會被捲到最下面的窘況 (似乎是 data-toggle="modal" data-target="#modal" 造成的 )
        this.$modal.modal({ show: false })
      },
      getAlarmCodeCount: function (startDate, endDate, table) {
        var context = this

        hippo
          .newSimpleExhaler()
          .space('alarm_code_count')
          .index('machine_id', servkit.getMachineList())
          .indexRange('date', startDate, endDate)
          .columns('machine_id', 'alarm_code', 'count', 'date', 'cnc_id')
          .exhale(function (data) {
            console.log(data)
            //{"FANUC__1006":[[deviceId, alarmCode, count, occurredDate], ...]}
            context.detailTableData = _.groupBy(data.exhalable, function (
              elem
            ) {
              return (
                elem.cnc_id + '__' + context.alarmCodeTrans(elem.alarm_code)
              )
            })
            //cnc_id, code alarm_status, count
            var tableData = []
            _.each(context.detailTableData, function (alarmInfo, brandCode) {
              var cncBrand = brandCode.split('__')[0]
              var alarmCode = context.alarmCodeTrans(brandCode.split('__')[1])

              //              if (!_.isNaN(parseInt(alarmCode)) && alarmCode != "-1") {
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
                  var curalarmStatus =
                    acode +
                    ' : ' +
                    (context.alarmCodeMap[cncBrand] &&
                    context.alarmCodeMap[cncBrand][acode]
                      ? context.alarmCodeMap[cncBrand][acode]
                      : `${i18n('Alarm_Code_Undefined')}`)
                  alamStatus += curalarmStatus + '</br>'
                }

                tableData.push([
                  cncBrand,
                  alarmCode,
                  alamStatus,
                  _.reduce(
                    alarmInfo,
                    function (memo, elem) {
                      return parseInt(memo) + parseInt(elem.count)
                    },
                    0
                  ),
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

        //cnc_id, alarm_code, alarm_status, count
        var alarmObj = _.map(pageData, function (elem, index) {
          return [index, elem[3]]
        })
        var ticks = _.map(pageData, function (elem, index) {
          return [index, elem[0] + '<br>' + elem[1]]
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
      alarmCodeTrans: function (alarmCode) {
        var resultString = ''
        var alarmItems = alarmCode.split(',')
        _.each(alarmItems, function (value) {
          if (value != '-1') {
            var codeNumber = Number(value)
            if (codeNumber < -1) {
              var hexString = (codeNumber >>> 0).toString(16)
              var convert10Value = parseInt(hexString, 16)
              var value10 = parseInt('81000000', 16)
              var codeValue = convert10Value - value10
              resultString += codeValue + ','
            } else {
              resultString += codeNumber + ','
            }
          } else {
            return (resultString += value + ',')
          }
        })
        return resultString.substring(0, resultString.length - 1)
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
