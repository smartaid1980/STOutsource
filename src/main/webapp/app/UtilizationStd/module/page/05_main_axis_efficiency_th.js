import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#axis-bar-chart-header', '#axis-bar-chart')
      servkit.addChartExport('#feed-bar-chart-header', '#feed-bar-chart')

      var reportTable = createReportTable({
        $tableWidget: $('#date-table-widget'),
        $tableElement: $('#table'),
        // rightColumn: [1, 2, 3, 4],
        onDraw: function (tableData, pageData) {
          if (tableData.length) {
            context.drawChart(context.dataArr)
          }
        },
        excel: {
          fileName: 'MainAxisEfficiency',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
          ],
        },
      })

      context.getDbData(
        'm_device_light',
        ['light_id', 'light_name', 'color'],
        context.machineLightCallback
      )
      servkit.initDatePicker(context.$queryDate)

      context.initMachineSelect()
      context.initMachinesStatus()

      context.$demoBtn.on('click', function (evt) {
        evt.preventDefault()
        context.$queryDate.val('2016/07/23')
        context.$machineSelect
        $("#machine option:contains('FANUC01')").prop('selected', true).change()
        context.drawTable(reportTable)
      })

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.drawTable(reportTable)
      })

      $('#test-btn').on('click', function (evt) {
        evt.preventDefault()
        servkit.ajax({
          url: 'api/productionefficiency/mainaxis/test',
          type: 'POST',
          contentType: 'application/json',
          // data: JSON.stringify(dbObj)
        }, {
          success: function (data) {
            console.log(data)
            console.log('true')
          },
          fail: function (data) {
            console.log('fail')
          },
        })
      })
    },
    util: {
      $queryDate: $('#query-date'),
      $machineSelect: $('#machine'),
      machineLightObj: {},
      $machineLigth: $('[name=machineLigth]'), // 燈號
      $demoBtn: $('#demo-btn'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      $deviceData: {},
      getDBObject: {},
      dataArr: [],

      //==================== Function ====================
      initMachineSelect: function () {
        var ctx = this
        servkit.initFuncBindMachineSelect(
          ctx.$machineSelect,
          ctx.appId,
          ctx.funId
        )
        pageSetUp()
      },
      initMachinesStatus: function () {
        var that = this
        servkit.ajax({
          url: servkit.rootPath + '/api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'm_device_light',
            columns: ['light_id', 'light_name'],
          }),
        }, {
          success: function (data) {
            var dataMap = {}
            _.map(data, function (obj) {
              if (obj.light_id == '11') {
                dataMap[obj.light_id] = `${i18n(
                    'UtilizationStd_Main_Axis_Rate_001'
                  )}`
              } else if (obj.light_id == '12') {
                dataMap[obj.light_id] = `${i18n(
                    'UtilizationStd_Main_Axis_Rate_002'
                  )}`
              } else if (obj.light_id == '13') {
                dataMap[obj.light_id] = `${i18n(
                    'UtilizationStd_Main_Axis_Rate_003'
                  )}`
              } else if (obj.light_id == '0') {
                dataMap[obj.light_id] = `${i18n(
                    'UtilizationStd_Main_Axis_Rate_010'
                  )}`
              }
            })
            that.getDBObject['getStatus'] = dataMap
          },
          fail: function (data) {
            console.log(data)
          },
        })
      },
      getDbData: function (tableName, columnArr, callback) {
        var that = this
        servkit.ajax({
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: tableName,
            columns: columnArr,
          }),
        }, {
          success: function (data) {
            callback.apply(that, [data])
          },
        })
      },
      machineLightCallback: function (data) {
        var that = this
        var machineLigthDec = `<span>${i18n(
          'UtilizationStd_Main_Axis_Rate_004'
        )}:</span>&nbsp;`
        _.each(data, function (value) {
          that.machineLightObj[value.light_id] = value
          if (value.light_id == 11) {
            machineLigthDec =
              machineLigthDec +
              '<span class="btn" style="background:' +
              value.color +
              ';"></span>&nbsp;<span>' +
              `${i18n('UtilizationStd_Main_Axis_Rate_006')}` +
              '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
          } else if (value.light_id == 12) {
            machineLigthDec =
              machineLigthDec +
              '<span class="btn" style="background:' +
              value.color +
              ';"></span>&nbsp;<span>' +
              `${i18n('UtilizationStd_Main_Axis_Rate_002')}` +
              '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
          } else if (value.light_id == 13) {
            machineLigthDec =
              machineLigthDec +
              '<span class="btn" style="background:#037ca9;"></span>&nbsp;<span>' +
              `${i18n('UtilizationStd_Main_Axis_Rate_005')}` +
              '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
          }
        })
        this.$machineLigth.html($(machineLigthDec))
      },
      drawTable: function (reportTable) {
        var that = this
        var date = $('#query-date').val()
        var machine = $('#machine').val()
        var loadingBtn = this.loadingBtn
        loadingBtn.doing()
        var resultData

        var axisSpeedMode = Math.floor(
          servkit.configModeOfAxisSpeedAndFeedRate() / 10
        )
        var feedRateMode = servkit.configModeOfAxisSpeedAndFeedRate() % 10

        hippo
          .newSimpleExhaler()
          .space('axis_speed_feed_rate_detail')
          .index('machine_id', [machine])
          .indexRange('date', date, date)
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'status',
            'start_timestamp',
            'end_timestamp',

            'override_axis_speed',
            'override_feed_rate',
            'override_axis_status',
            'override_feed_status',

            'cmd_axis_speed',
            'cmd_feed_rate',
            'cmd_axis_status',
            'cmd_feed_status',

            'axis_speed',
            'feed_rate',
            'axis_status',
            'feed_status'
          )
          .exhale(function (exhalable) {
            try {
              that.dataArr = []
              console.log(exhalable)
              var groupExhalable = that.groupExhalable(
                exhalable,
                axisSpeedMode,
                feedRateMode
              )
              var result = groupExhalable.map(function (data) {
                that.dataArr.push(data)

                var startTime = servkit.switchDataFormat({
                    type: 'time',
                  },
                  data.start_timestamp
                )
                var endTime = servkit.switchDataFormat({
                    type: 'time',
                  },
                  data.end_timestamp
                )
                var lastTime =
                  new Date(endTime).getTime() -
                  new Date(startTime).getTime() +
                  ''

                var axisSpeed = data.axis_speed
                var feedRate = data.feed_rate
                var axisStatus = that.statusParse(data.axis_status)[0]
                var feedStatus = that.statusParse(data.feed_status)[0]

                return [
                  servkit.getMachineName(data.machine_id),
                  data.work_shift,
                  that.getDBObject.getStatus[data.status],
                  axisSpeed,
                  axisStatus,
                  feedRate,
                  feedStatus,
                  startTime,
                  endTime,
                  servkit.switchDataFormat({
                      type: 'hourMin',
                    },
                    lastTime
                  ),
                ]
              })

              resultData = result

              servkit
                .politeCheck()
                .until(function () {
                  return resultData
                })
                .thenDo(function () {
                  reportTable.drawTable(resultData)
                  reportTable.showWidget()
                })
                .tryDuration(0)
                .start()
            } catch (e) {
              console.warn(e)
            } finally {
              loadingBtn.done()
            }
          })
      },
      groupExhalable: function (exhalable, axisSpeedMode, feedRateMode) {
        var group = []
        var preData
        _.each(exhalable, function (dataArr) {
          _.each(dataArr, function (exh) {
            // var exh = data[0];
            if (axisSpeedMode == 1) {
              exh.axis_speed = exh['override_axis_speed']
              exh.axis_status = exh['override_axis_status']
            } else if (axisSpeedMode == 3) {
              exh.axis_speed = exh['cmd_axis_speed']
              exh.axis_status = exh['cmd_axis_status']
            }

            if (feedRateMode == 1) {
              exh.feed_rate = exh['override_feed_rate']
              exh.feed_status = exh['override_feed_status']
            } else if (feedRateMode == 3) {
              exh.feed_rate = exh['cmd_feed_rate']
              exh.feed_status = exh['cmd_feed_status']
            }
            var currMixTag = '' + exh['work_shift'] + exh['axis_status'] + exh['feed_status']
            // console.log(currMixTag);
            exh.mixTag = currMixTag
            if (preData == undefined) {
              preData = exh
            } else {
              if (preData['mixTag'] == exh['mixTag']) {
                preData.end_timestamp = exh['end_timestamp']
              } else {
                group.push(preData)
                exh.start_timestamp = preData['end_timestamp']
                preData = exh
              }
            }
          })
        })
        if (preData != undefined) {
          //            logInfo(prev.toString());
          group.push(preData)
        }
        return group
      },
      drawChart: function (datas) {
        var that = this
        var axisSetList = [],
          feedSetList = [],
          axisSet = [],
          feedSet = []

        var lastDevice = datas[0].machine_id
        var dateTag =
          datas[0].start_timestamp.substring(0, 4) +
          '/' +
          datas[0].start_timestamp.substring(4, 6) +
          '/' +
          datas[0].start_timestamp.substring(6, 8)
        _.each(datas, function (elem) {
          var machindId = elem.machine_id
          if (machindId != lastDevice) {
            axisSetList.push(axisSet)
            feedSetList.push(feedSet)
            axisSet = []
            feedSet = []
          }
          var axisStatus = elem.axis_status
          var feedStatus = elem.feed_status
          var start = servkit.switchDataFormat({
              type: 'time',
            },
            elem.start_timestamp
          )
          var end = servkit.switchDataFormat({
              type: 'time',
            },
            elem.end_timestamp
          )
          var offset = new Date(end).getTime() - new Date(start).getTime(start)
          var offSetPeriod = servkit.switchDataFormat({
              type: 'hourMin',
            },
            offset
          )

          var axisObj = {
            label: '&nbsp' +
              that.statusParse(axisStatus)[0] +
              '<br>' +
              start +
              ' ~ ' +
              end +
              '<br>' +
              offSetPeriod,
            data: [
              [offset, new Date(dateTag).getTime()]
            ],
            color: that.statusParse(axisStatus)[1],
          }
          var feedObj = {
            label: '&nbsp' +
              that.statusParse(feedStatus)[0] +
              '<br>' +
              start +
              ' ~ ' +
              end +
              '<br>' +
              offSetPeriod,
            data: [
              [offset, new Date(dateTag).getTime()]
            ],
            color: that.statusParse(feedStatus)[1],
          }
          axisSet.push(axisObj)
          feedSet.push(feedObj)
        })
        axisSetList.push(axisSet)
        feedSetList.push(feedSet)

        _.each(axisSetList, function (elem) {
          var ele = $('#axis-bar-chart')
          that.growStackBar(
            elem,
            ele,
            `${i18n('UtilizationStd_Main_Axis_Rate_008')}`
          )
        })

        _.each(feedSetList, function (elem) {
          var ele = $('#feed-bar-chart')
          that.growStackBar(
            elem,
            ele,
            `${i18n('UtilizationStd_Main_Axis_Rate_009')}`
          )
        })

        setTimeout(function () {
          $('#axis-bar-chart .tickLabel:first').css({
            left: '-10px',
          })
          $('#feed-bar-chart .tickLabel:first').css({
            left: '-10px',
          })
        }, 100)
      },
      growStackBar: function (dataSet, $ele, tag) {
        console.log(tag)
        var xMin = new Date(
          dataSet[0].label.split('<br>')[1].split(' ~')[0]
        ).getTime() //第一筆開始時間的毫秒
        var option = {
          series: {
            stack: true,
            bars: {
              show: true,
              fill: 1,
              align: 'center',
              barWidth: 0.5,
            },
          },
          bars: {
            lineWidth: 1,
            barWidth: 0.5,
            horizontal: true,
          },
          xaxis: {
            mode: 'time',
            tickSize: [1, 'hour'], //沒有的話會變兩個小時一格
            tickFormatter: function (v, axis) {
              //沒有的話會從格林威治時間開始
              var tick = xMin + v
              var date = new Date(tick)
              var hours =
                date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
              var minutes =
                date.getMinutes() < 10 ?
                '0' + date.getMinutes() :
                date.getMinutes()

              return hours + ':' + minutes
            },
          },
          yaxis: {
            show: false,
            axisLabel: tag,
          },
          grid: {
            hoverable: true,
            clickable: true,
          },
          legend: {
            show: false,
          },
          tooltip: true,
          tooltipOpts: {
            content: '%s',
            defaultTheme: false,
          },
        }

        if (document.body.clientWidth < 800) option.xaxis.tickSize = [2, 'hour']

        $.plot($ele, dataSet, option)
      },
      statusParse: function (ele) {
        var that = this
        var status = []
        if (ele == 0) {
          status = [
            `${i18n('UtilizationStd_Main_Axis_Rate_006')}`,
            that.machineLightObj[11].color,
          ]
        } else if (ele == 1) {
          status = [`${i18n('UtilizationStd_Main_Axis_Rate_005')}`, '#037ca9']
        } else if (ele == 2) {
          status = [
            `${i18n('UtilizationStd_Main_Axis_Rate_002')}`,
            that.machineLightObj[12].color,
          ]
        } else {
          status = [`${i18n('UtilizationStd_Main_Axis_Rate_007')}`, '#d3d3d3']
        }
        return status
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
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
    preCondition: {
      machine: function (done) {
        var that = this
        servkit.ajax({
          url: servkit.rootPath + '/api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            table: 'm_device',
            columns: ['device_id', 'device_name'],
          }),
        }, {
          success: function (data) {
            var func = that.commons.initializeDBData(data)
            func.init('device_id', 'device_name')
            done(func)
          },
          fail: function (data) {
            console.log(data)
          },
        })
      },
    },
  })
}