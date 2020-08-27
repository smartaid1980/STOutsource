export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 初始元件
      servkit.initDatePicker($('#start-date'), $('#end-date'), true, false)
      servkit.initSelectWithList(context.preCon.getDepts, $('#unit'))
      servkit.initSelectWithList(context.preCon.macro_json, $('#item'))
      var shiftMap = {}
      _.each(context.preCon.getShifts, (val) => (shiftMap[val.name] = val.name))
      servkit.initSelectWithList(shiftMap, $('#shift'))
      context.statisticsReportTable = createReportTable({
        $tableElement: $('#statistics-table'),
        $tableWidget: $('#table-widget'),
        order: [[3, 'desc']],
        customBtns: [
          '<div class="query-info"><div>起訖時間：<span class="query-time"></span></div><div>單位：<span class="query-unit"></span></div><div>班別：<span class="query-shift"></span></div></div>',
        ],
        onDraw: function (tableData, pageData) {
          var time = 0,
            proportion = 0
          _.each(tableData, (val) => {
            time += Number(val[2])
            proportion += Number(val[3].replace('%', ''))
          })
          var html = []
          html.push(`<tr>`)
          html.push(
            `<td colspan="2" class="text-right" style="color: red;">總計</td>`
          )
          html.push(`<td style="color: green;">${time.toFixed(2)}</td>`)
          html.push(`<td style="color: green;">${proportion.toFixed(2)}%</td>`)
          html.push(`</tr>`)
          $('#statistics-table tbody').append(html.join(''))
        },
        excel: {
          fileName: 'IntelligentAnalysis',
          format: ['text', 'text', 'text', 'text'],
        },
      })
      context.detailReportTable = createReportTable({
        $tableElement: $('#detail-table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [7],
        customBtns: [
          '<div class="query-info"><div>起訖時間：<span class="query-time"></span></div><div>單位：<span class="query-unit"></span></div><div>班別：<span class="query-shift"></span></div></div>',
        ],
        onDraw: function () {
          $('#detail-table tr').each(function () {
            $(this).find('th:eq(9), td:eq(9)').addClass('hide')
          })
        },
        excel: {
          fileName: 'IntelligentAnalysisDetail',
          format: [
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

      // 初始編輯閒置代碼modal的元件
      var machineMap = {}
      _.each(
        servkit.getMachineMap(),
        (val, key) => (machineMap[key] = val.device_name || val.device_id)
      )
      servkit.initSelectWithList(machineMap, $('[name=machine_id]'))
      servkit.initSelectWithList(
        context.preCon.macro_json,
        $('[name=invalid_macro]')
      )

      // 查詢
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()
        const start = $('#start-date').val()
        const end = $('#end-date').val()
        const unit = $('#unit option:selected').text()
        var shift = []
        $('#shift option:selected').each(function () {
          if (this.textContent !== 'ALL') shift.push(this.textContent)
        })

        // 查詢資料填入資訊欄
        $('.query-time').text(start + '~' + end)
        $('.query-unit').text(unit)
        $('.query-shift').text(shift.join('、'))

        context.getHippoData(function (data) {
          context.hippoData = data
          context.getDBData()
        })
      })

      $('#widget-grid').resize(function () {
        if (context.$barplot) context.drawBarChartValueLabel(context.$barplot)
        if (context.$lineplot)
          context.drawLineChartValueLabel(context.$lineplot)
      })

      // 點擊「編輯」後跳出modal
      $('#detail-table').on('click', '.edit', function () {
        context.editLoadingBtn.done()
        const data = $(this).data()
        $('[name=start_time]').val(data.start_time)
        $('[name=end_time]').val(data.end_time)
        $('[name=machine_id]').val(data.machine_id)
        $('[name=invalid_macro]').val(data.invalid_macro)
        $('#edit-modal').modal('show')
      })

      $('#edit-btn').on('click', function () {
        context.editLoadingBtn.doing()
        const start_time = $('[name=start_time]').val()
        const end_time = $('[name=end_time]').val()
        const machine_id = $('[name=machine_id]').val()
        const invalid_macro = $('[name=invalid_macro]').val()
        let requestData = {
          url: 'api/stdcrud',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            tableModel:
              'com.servtech.servcloud.app.model.iiot.IiotAiIdleUpdateList',
            start_time: start_time,
            end_time: end_time,
            machine_id: machine_id,
            invalid_macro: invalid_macro,
          }),
        }

        const id = machine_id + '||' + start_time + '||' + end_time
        if (context.invalidMacroInDB[id]) {
          requestData.type = 'PUT'
        }

        servkit.ajax(requestData, {
          success: function () {
            context.getDBData(function () {
              context.editLoadingBtn.done()
              $('#edit-modal').modal('hide')
              context.detailReportTable.getBlingRow(9, id)
            })
          },
        })
      })
    },
    util: {
      $barplot: null,
      hippoData: null,
      invalidMacroInDB: {},
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      editLoadingBtn: servkit.loadingButton(
        document.querySelector('#edit-btn')
      ),
      statisticsReportTable: null,
      detailReportTable: null,
      statisticsRenderTable: function (data) {
        this.statisticsReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.macro || '',
              val.macro_name || '',
              (val.duration / (60 * 60 * 1000)).toFixed(2),
              val.proportion + '%',
            ]
          })
        )
      },
      detailRenderTable: function (data) {
        this.detailReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.shiftDate,
              val.shift,
              servkit.getMachineName(val.machine_id),
              val.macro || '',
              val.macro_name || '',
              val.start_time,
              val.end_time,
              (val.duration / (60 * 60 * 1000)).toFixed(2),
              `<button class="btn btn-primary edit" data-machine_id="${val.machine_id}" data-start_time="${val.start_time}" data-end_time="${val.end_time}" data-invalid_macro="${val.invalid_macro}">編輯</button>`,
              val.machine_id + '||' + val.start_time + '||' + val.end_time,
            ]
          })
        )
      },
      drawBarChart: function (data) {
        // 先將占比由高到低排序
        var dataSorted = data.sort((a, b) => b.proportion - a.proportion)
        let max = 0
        var dataList = _.map(dataSorted, (val, index) => {
          if (max < Number(val.proportion)) max = Number(val.proportion)
          return [index, val.proportion]
        })
        var ticksName = [] // 自製legend用
        var ticks = _.map(dataSorted, (val, index) => {
          ticksName.push(val.macro_name)
          return [index, val.macro_name]
        })
        var colors = [],
          dataShowType = []
        _.times(dataSorted.length, () => {
          colors.push(servkit.statusColors.online)
          dataShowType.push('bar')
        })
        var option = {
          bars: {
            align: 'center',
            barWidth: 0.25,
          },
          xaxis: {
            tickDecimals: 0,
            ticks: ticks,
          },
          yaxis: {
            min: 0,
            max: max + 10,
            tickDecimals: 0,
            tickFormatter: function (v) {
              return v.toFixed(2) + '%'
            },
          },
        }
        var dataset = [
          {
            data: dataList,
            color: servkit.statusColors.online,
            bars: {
              show: true,
            },
          },
        ]
        this.$barplot = $.plot($('#bar-chart'), dataset, option)

        this.drawBarChartValueLabel(this.$barplot)
        this.drawLegend(
          $('#bar-chart').closest('.chart-containar'),
          colors,
          dataShowType,
          ticksName
        )
      },
      drawBarChartValueLabel($plot) {
        var ctx = $plot.getCanvas().getContext('2d') // get the context
        var data = $plot.getData()[0].data // get your series data
        var xaxis = $plot.getXAxes()[0] // xAxis
        var yaxis = $plot.getYAxes()[0] // yAxis
        var offset = $plot.getPlotOffset() // plots offset
        ctx.font = "1.2rem 'Microsoft JhengHei'" // set a pretty label font
        for (var i = 0; i < data.length; i++) {
          var text = data[i][1] + '%'
          var metrics = ctx.measureText(text)
          var xPos = xaxis.p2c(data[i][0]) + offset.left - metrics.width / 2 // place it in the middle of the bar
          var yPos = yaxis.p2c(data[i][1]) + 5 // place at top of bar, slightly up
          ctx.fillText(text, xPos, yPos)
        }
      },
      drawLineChart: function (data) {
        var dataSorted = data.sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )
        // var colors = [servkit.colors.blue, servkit.statusColors.online, servkit.statusColors.idle]
        var colors = [
          '#e66113',
          '#f28a17',
          '#f4b600',
          '#fef701',
          '#add401',
          '#6cb831',
          '#01a437',
          '#019342',
          '#029390',
          '#0173bc',
          '#035c9e',
          '#5e498e',
        ]
        let max = 0

        // 建立日期(x軸)
        var ticks = []
        if (dataSorted.length) {
          var startDate = moment(new Date(dataSorted[0].date))
          var endDate = moment(new Date(dataSorted[dataSorted.length - 1].date))
          while (!startDate.isSame(endDate, 'day')) {
            ticks.push([ticks.length, startDate.format('MM/DD')])
            startDate.add(1, 'days')
          }
          ticks.push([ticks.length, endDate.format('MM/DD')])
        }

        var dataset = []
        var dataMap = {}
        _.each(dataSorted, (val) => {
          if (!dataMap[val.invalid_macro])
            dataMap[val.invalid_macro] = {
              data: {},
              label: val.macro_name,
            }
          var index = _.findIndex(
            ticks,
            (date) => date[1] === moment(new Date(val.date)).format('MM/DD')
          )
          if (!dataMap[val.invalid_macro].data[index])
            dataMap[val.invalid_macro].data[index] = 0
          dataMap[val.invalid_macro].data[index] += val.duration
        })

        _.each(dataMap, (d) => {
          dataset.push({
            data: _.map(d.data, (value, date) => {
              const valueData = (value / (60 * 60 * 1000)).toFixed(2)
              if (max < Number(valueData)) max = valueData
              return [date, valueData]
            }),
            color: colors[dataset.length],
            points: {
              fillColor: colors[dataset.length],
            },
            label: d.label,
          })
        })

        dataset = dataset.slice(0, 12) // 最多顯示12筆

        var dataShowType = []
        _.times(dataset.length, () => {
          dataShowType.push('point-line')
        })

        // 日期區間超過一個月時，部分不顯示
        var ticksAutoSize = []
        if (ticks.length > 31) {
          _.each(ticks, (val, index) => {
            if (index % ((ticks.length / 15) | 0) === 0)
              ticksAutoSize.push(ticks[index])
            else ticksAutoSize.push([ticks[index][0], ''])
          })
        }

        var option = {
          lines: {
            show: true,
            lineWidth: 3,
          },
          points: {
            show: true,
            lineWidth: 4,
            symbol: function (ctx, x, y, radius, shadow) {
              // 增加點的大小
              ctx.arc(
                x,
                y,
                radius * 1,
                0,
                shadow ? Math.PI : Math.PI * 2,
                false
              )
            },
          },
          xaxis: {
            tickDecimals: 0,
            ticks: ticksAutoSize.length ? ticksAutoSize : ticks,
          },
          yaxis: {
            min: 0,
            max: Number(max) + 10,
            tickDecimals: 0,
          },
          legend: {
            show: false,
          },
        }

        this.$lineplot = $.plot($('#line-chart'), dataset, option)

        this.drawLineChartValueLabel(this.$lineplot)
        this.drawLegend(
          $('#line-chart').closest('.chart-containar'),
          colors,
          dataShowType,
          _.map(dataset, (d) => d.label)
        )
      },
      drawLineChartValueLabel($plot) {
        var ctx = $plot.getCanvas().getContext('2d') // get the context
        var xaxis = $plot.getXAxes()[0] // xAxis
        var yaxis = $plot.getYAxes()[0] // yAxis
        var offset = $plot.getPlotOffset() // plots offset
        ctx.font = "1.2rem 'Microsoft JhengHei'" // set a pretty label font

        var max = 0
        var checkData = {}
        _.each($plot.getData(), (layer, key) => {
          var data = $plot.getData()[key].data // get your series data
          for (var i = 0; i < data.length; i++) {
            var text = data[i][1]
            var index = data[i][0]
            if (Number(text) > max) max = Number(text)
            if (!checkData[index]) checkData[index] = []
            checkData[index].push({
              layerKey: key,
              index: i,
              value: Number(text),
            })
          }
        })
        var spacing = max / 10
        _.each(checkData, (val) => {
          var list = val.sort((a, b) => b.value - a.value)
          _.each(list, (data, index) => {
            var draw = false
            if (list[index - 1]) {
              if (list[index - 1].value - data.value > spacing) draw = true
            } else draw = true
            if (draw) {
              var chartData = $plot.getData()[data.layerKey].data // get your series data
              var metrics = ctx.measureText(data.value)
              var xPos =
                xaxis.p2c(chartData[data.index][0]) +
                offset.left -
                metrics.width / 2 // place it in the middle of the bar
              var yPos = yaxis.p2c(chartData[data.index][1]) // place at top of bar, slightly up
              ctx.fillText(data.value, xPos, yPos)
            }
          })
        })
      },
      drawLegend($containar, colors, dataShowType, dataLabel) {
        $containar.find('.chart-legend').empty()
        var html = []
        _.each(dataLabel, (legend, key) => {
          if (legend) {
            html.push(`<div>`)
            html.push(`  <div class="chart-legend-color">`)
            switch (dataShowType[key]) {
              case 'point-line':
                html.push(
                  `<div class="data-hr"><div style="background-color: ${colors[key]};"></div><hr style="border-top-color: ${colors[key]};"></div>`
                )
                break
              case 'line':
                html.push(
                  `<div class="target-hr"><hr style="border-top-color: ${colors[key]};"></div>`
                )
                break
              case 'dashed':
                html.push(
                  `<div class="average-hr"><hr style="border-top-color: ${colors[key]};border-top-style: dashed;"></div>`
                )
                break
              case 'bar':
                html.push(
                  `<div class="bar-icon"><hr style="background: ${colors[key]};"></div>`
                )
                break
            }
            html.push(`  </div>`)
            html.push(`  <div class="chart-legend-label">${legend}</div>`)
            html.push(`</div>`)
          }
        })
        $containar.find('.chart-legend').append(html.join(''))
      },
      getHippoData: function (callback) {
        var ctx = this
        const shiftTime = $('#shift').val()
        hippo
          .newSimpleExhaler()
          .space('machine_status_history_marco')
          .index('machine_id', ctx.preCon.getDeptMachine[$('#unit').val()])
          .indexRange('date', $('#start-date').val(), $('#end-date').val())
          .columns(
            'machine_id',
            'status',
            'start_time',
            'end_time',
            'duration',
            'invalid_macro'
          )
          .exhale(function (exhalable) {
            var deviceHistory = []
            let changeLineCount = 0
            let checkChangeLineCount = 0
            if (exhalable && exhalable.exhalable) {
              // 過濾掉狀態非12(閒置)的資料
              const idleData = _.filter(
                exhalable.exhalable,
                (val) => val.status === '12'
              )

              // 將與前一筆結束時間相差時間小於4秒的資料做合併
              let groupLessThanTenSecData = []
              let lastMachine
              _.each(idleData, (val) => {
                let create = true
                if (groupLessThanTenSecData.length !== 0) {
                  let end = moment(
                    groupLessThanTenSecData[groupLessThanTenSecData.length - 1]
                      .end_time,
                    'YYYYMMDDHHmmss'
                  )
                  let start = moment(val.start_time, 'YYYYMMDDHHmmss')
                  if (moment(start).diff(end, 'seconds') < 4) create = false
                }
                if (val.machine_id !== lastMachine) {
                  create = true
                  lastMachine = val.machine_id
                }
                if (create) groupLessThanTenSecData.push(val)
                else {
                  groupLessThanTenSecData[
                    groupLessThanTenSecData.length - 1
                  ].end_time = val.end_time
                  let start = moment(
                    groupLessThanTenSecData[groupLessThanTenSecData.length - 1]
                      .start_time,
                    'YYYYMMDDHHmmss'
                  )
                  let end = moment(
                    groupLessThanTenSecData[groupLessThanTenSecData.length - 1]
                      .end_time,
                    'YYYYMMDDHHmmss'
                  )
                  groupLessThanTenSecData[
                    groupLessThanTenSecData.length - 1
                  ].duration = moment(end).diff(start, 'seconds') * 1000
                }
              })

              lastMachine = null
              _.each(groupLessThanTenSecData, (val, key) => {
                val.start_time = moment(
                  val.start_time,
                  'YYYYMMDDHHmmss'
                ).format('YYYY/MM/DD HH:mm:ss')
                val.end_time = moment(val.end_time, 'YYYYMMDDHHmmss').format(
                  'YYYY/MM/DD HH:mm:ss'
                )
                const duration =
                  new Date(val.end_time) - new Date(val.start_time)
                if (moment(val.end_time).diff(val.start_time, 'minutes') >= 5) {
                  // 只顯示持續時間大於5分鐘的紀錄
                  const times = val.start_time.split(' ')
                  const shiftData = ctx.getShiftTime(times[0], times[1])
                  val.shift = shiftData.shift
                  val.shiftDate = shiftData.shiftDate

                  // 如果DUR> 4hr  always C7
                  if (duration > 4 * 60 * 60 * 1000) {
                    val.invalid_macro = '17' // (C7)
                    val.date = moment(new Date(val.start_time)).format(
                      'YYYY/MM/DD'
                    )

                    if (shiftTime.find((shift) => shift === val.shift))
                      deviceHistory.push(val)
                  } else if (
                    val.invalid_macro === '12' ||
                    val.invalid_macro === '13' ||
                    val.invalid_macro === '3'
                  ) {
                    // 換線(C3)
                    let change
                    changeLineCount++
                    servkit.ajax(
                      {
                        url: 'api/iiot/idleAI/getPRGMIsChange',
                        type: 'GET',
                        data: {
                          machineId: val.machine_id,
                          startTime: moment(
                            val.start_time,
                            'YYYYMMDDHHmmss'
                          ).format('YYYYMMDDHHmmss'),
                          endTime: moment(
                            val.end_time,
                            'YYYYMMDDHHmmss'
                          ).format('YYYYMMDDHHmmss'),
                        },
                      },
                      {
                        success: function (data) {
                          change = data
                        },
                        always: function () {
                          if (change === undefined) change = false
                          if (change) {
                            val.invalid_macro = '13' // (C3)
                          } else if (duration > 1 * 60 * 60 * 1000) {
                            // 如果M3 >1hr => C7
                            val.invalid_macro = '17' // (C7)
                          } else {
                            val.invalid_macro = '3' // (M3)
                          }

                          val.date = moment(new Date(val.start_time)).format(
                            'YYYY/MM/DD'
                          )

                          if (shiftTime.find((shift) => shift === val.shift))
                            deviceHistory.push(val)
                          checkChangeLineCount++
                        },
                      }
                    )
                  } else {
                    if (val.invalid_macro === '17') {
                      // 計劃性停機(超過1小時)(C7) or 上下料(小於1小時)(M3)
                      if (
                        moment(val.end_time).diff(val.start_time, 'hours') < 1
                      )
                        val.invalid_macro = '3' // (M3)
                    } else {
                      // 如果原代碼非C7，只要持續時間超過1小時，皆改為C7
                      if (
                        moment(val.end_time).diff(val.start_time, 'hours') >= 1
                      )
                        val.invalid_macro = '17' // (C7)
                    }

                    if (val.invalid_macro === '16') {
                      // 加水清鐵削(C6)
                      // start < 08:00:00 || end > 09:00:00  => 3
                      if (
                        new Date(val.start_time).getTime() <
                          new Date(
                            val.start_time.split(' ')[0] + ' 08:00:00'
                          ).getTime() ||
                        new Date(val.end_time).getTime() >
                          new Date(
                            val.start_time.split(' ')[0] + ' 09:00:00'
                          ).getTime()
                      ) {
                        val.invalid_macro = '3'
                      }

                      // if ((new Date(val.start_time).getTime() < new Date(val.start_time.split(' ')[0] + ' 08:00:00').getTime() &&
                      //   new Date(val.end_time).getTime() < new Date(val.start_time.split(' ')[0] + ' 08:00:00').getTime()) ||
                      //   (new Date(val.start_time).getTime() > new Date(val.start_time.split(' ')[0] + ' 09:00:00').getTime() &&
                      //     new Date(val.end_time).getTime() > new Date(val.start_time.split(' ')[0] + ' 09:00:00').getTime())) {
                      //   let beforeDuration // 前一筆持續時間
                      //   let afterDuration // 後一筆持續時間
                      //   if (groupLessThanTenSecData[key - 1] && lastMachine === val.machine_id && groupLessThanTenSecData[key - 1].machine_id === val.machine_id)
                      //     beforeDuration = moment(val.start_time).diff(groupLessThanTenSecData[key - 1].end_time, 'seconds')
                      //   if (groupLessThanTenSecData[key + 1] && lastMachine === val.machine_id && groupLessThanTenSecData[key + 1].machine_id === val.machine_id) {
                      //     groupLessThanTenSecData[key + 1].start_time = groupLessThanTenSecData[key + 1].start_time = moment(groupLessThanTenSecData[key + 1].start_time, 'YYYYMMDDHHmmss').format('YYYY/MM/DD HH:mm:ss')
                      //     afterDuration = moment(groupLessThanTenSecData[key + 1].start_time).diff(val.end_time, 'seconds')
                      //   }

                      //   if (beforeDuration === undefined || afterDuration === undefined) {
                      //     if (beforeDuration === undefined && afterDuration === undefined) val.invalid_macro = '3' // (M3)
                      //     else if (beforeDuration === undefined && lastMachine === val.machine_id) val.invalid_macro = groupLessThanTenSecData[key + 1].invalid_macro
                      //     else if (afterDuration === undefined && lastMachine === val.machine_id) val.invalid_macro = groupLessThanTenSecData[key - 1].invalid_macro
                      //   } else {
                      //     if (beforeDuration <= afterDuration && lastMachine === val.machine_id) val.invalid_macro = groupLessThanTenSecData[key - 1].invalid_macro
                      //     if (afterDuration < beforeDuration && lastMachine === val.machine_id) val.invalid_macro = groupLessThanTenSecData[key + 1].invalid_macro
                      //   }
                      // }
                    }

                    val.date = moment(new Date(val.start_time)).format(
                      'YYYY/MM/DD'
                    )

                    if (shiftTime.find((shift) => shift === val.shift))
                      deviceHistory.push(val)
                  }
                  lastMachine = val.machine_id
                }
              })
            }
            servkit
              .politeCheck()
              .until(function () {
                return changeLineCount === checkChangeLineCount
              })
              .thenDo(function () {
                if (callback) callback(deviceHistory)
              })
              .tryDuration(0)
              .start()
          })
      },
      getDBData: function (callback) {
        const ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_ai_idle_update_list',
              columns: [
                'machine_id',
                'start_time',
                'end_time',
                'invalid_macro',
              ],
              whereClause: `start_time < '${$(
                '#end-date'
              ).val()} 23:59:59' AND end_time > '${$(
                '#start-date'
              ).val()} 00:00:00' `,
            }),
          },
          {
            success: function (dbData) {
              ctx.invalidMacroInDB = {}
              _.each(dbData, (val) => {
                const id =
                  val.machine_id + '||' + val.start_time + '||' + val.end_time
                ctx.invalidMacroInDB[id] = val
              })
              console.log(ctx.invalidMacroInDB)

              let data = []
              _.each(ctx.hippoData, (value) => {
                const val = JSON.parse(JSON.stringify(value))
                const id =
                  val.machine_id + '||' + val.start_time + '||' + val.end_time
                if (ctx.invalidMacroInDB[id])
                  val.invalid_macro = ctx.invalidMacroInDB[id].invalid_macro
                if (ctx.preCon.macro_json[val.invalid_macro]) {
                  val.macro = ctx.preCon.macro_json[val.invalid_macro].split(
                    ':'
                  )[0]
                  val.macro_name = ctx.preCon.macro_json[
                    val.invalid_macro
                  ].split(':')[1]
                }
                if (
                  $('#item')
                    .val()
                    .find((item) => item === val.invalid_macro) !== undefined
                )
                  data.push(val)
              })

              var allTimes = 0
              // 以警報代碼群組
              var dataList = _.chain(data)
                .groupBy((val) => val.invalid_macro)
                .map((alarmGroup) => {
                  var durations = 0
                  _.each(alarmGroup, (val) => (durations += val.duration))
                  allTimes += durations

                  return {
                    macro: alarmGroup[0].macro,
                    macro_name: alarmGroup[0].macro_name,
                    duration: durations,
                  }
                })
                .value()

              var stackDuration = 0
              _.each(dataList, (val, key) => {
                val.proportion = ((val.duration / allTimes) * 100).toFixed(2)
                // 最後一筆直接100減掉其他加總時間，才會剛好一百
                if (key === dataList.length - 1)
                  val.proportion = (100 - stackDuration).toFixed(2)
                else stackDuration += Number(val.proportion)
              })

              ctx.drawBarChart(dataList)
              ctx.drawLineChart(data)
              ctx.statisticsRenderTable(dataList)
              ctx.detailRenderTable(data)
              ctx.loadingBtn.done()

              if (callback) callback()
            },
          }
        )
      },
      getShiftTime: function (date, time) {
        let thisDate = date
        for (var i = 0; i < this.preCon.getShifts.length; i++) {
          const shift = this.preCon.getShifts[i]
          if (
            new Date(`${date} ${time}`).getTime() >=
              new Date(`${date} ${shift.start}`).getTime() &&
            new Date(`${date} ${time}`).getTime() <
              new Date(`${date} ${shift.end}`).getTime()
          ) {
            const lastShift = this.preCon.getShifts[i - 1]
            if (
              lastShift &&
              new Date(`${date} ${lastShift.start}`).getTime() >
                new Date(`${date} ${shift.start}`).getTime()
            )
              thisDate = moment(thisDate)
                .subtract(1, 'days')
                .format('YYYY/MM/DD')
            return {
              shiftDate: thisDate,
              shift: shift.name,
            }
          }
        }
      },
    },
    preCondition: {
      getDepts: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_dept',
              columns: ['dept_id', 'dept_name'],
              whereClause: `is_open='Y'`,
            }),
          },
          {
            success: function (data) {
              var deptMap = {}
              _.each(data, (val) => (deptMap[val.dept_id] = val.dept_name))
              done(deptMap)
            },
          }
        )
      },
      getDeptMachine: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_dept_machine',
              columns: ['dept_id', 'machine_id'],
              whereClause: `is_alarm_open='Y'`,
            }),
          },
          {
            success: function (data) {
              var deptMap = {}
              _.each(data, (val) => {
                if (!deptMap[val.dept_id]) deptMap[val.dept_id] = []
                deptMap[val.dept_id].push(val.machine_id)
              })
              done(deptMap)
            },
          }
        )
      },
      getShifts: function (done) {
        // 直接透過sql改成想要的格式
        const timeFormat = 'DATE_FORMAT(${name},"%H:%i:%s") AS ${name}'
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_work_shift_time',
              columns: [
                'id',
                'sequence',
                'name',
                timeFormat.replace(/\$\{name\}/g, 'start'),
                timeFormat.replace(/\$\{name\}/g, 'end'),
              ],
            }),
          },
          {
            success: function (data) {
              var shiftList = []
              _.each(data, (val) => shiftList.push(val))
              done(
                shiftList.sort(
                  (a, b) => Number(a.sequence) - Number(b.sequence)
                )
              )
            },
          }
        )
      },
      macro_json: function (done) {
        servkit.ajax(
          {
            //先讀使用者的
            url: 'api/v3/macro/config/read',
            type: 'GET',
          },
          {
            success: function (response) {
              const map = _.chain(response)
                .indexBy('macro_code')
                .mapObject((value) => value.macro_code_name)
                .value()
              done(map)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.dashes.min.js',
      ],
    ],
  })
}
