import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.sumTable = createReportTable({
        $tableElement: $('#date-table'),
        rightColumn: [1, 2, 3],
        order: [[0, 'asc']],
        onRow: function (row, data) {
          //  若總體稼動率低於目標值(LINE.oee_sp)，則以紅字標示
          if (Number(data[3]) < Number(data[2])) {
            $(row)
              .find('td')
              .eq(3)
              .html(
                '<font style="color:' +
                  servkit.colors.red +
                  ';">' +
                  data[3] +
                  '</font>'
              )
          }
        },
        onDraw: function (tableData, pageData) {
          var tempMemo = 0
          var oeeSum = _.reduce(
            tableData,
            function (memo, elem) {
              tempMemo += parseFloat(elem[3])
              return tempMemo
            },
            0
          )
          var oeeAvg = tableData.length == 0 ? 0 : oeeSum / tableData.length
          $('#date-table')
            .find('tbody')
            .append(
              '<tr style="font-weight:bolder;color:green;">' +
                `<td colspan="3">${i18n('ServTrack_000073')}</td>` +
                '<td class="text-right">' +
                oeeAvg.toFixed(2) +
                '</td></tr>'
            )

          context.drawChart(pageData, oeeAvg)
        },
        excel: {
          fileName: '40_line_oee_sum',
          format: ['text', 'text', 'text', 'text'],
        },
        showNoData: false,
      })
      context.detailTable = createReportTable({
        $tableElement: $('#date-table2'),
        rightColumn: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        order: [[0, 'asc']],
        onRow: function (row, data) {
          if (data[3] === '--') {
            $(row)
              .find('td')
              .eq(3)
              .attr('style', 'color:' + servkit.colors.red)
          }
          // 良率(WORK_TRACKING.quality)<線別良率目標值(LINE.line_quality_sp)以紅字顯示
          if (Number(data[7]) < Number(data[6])) {
            $(row)
              .find('td')
              .eq(7)
              .html(
                '<font style="color:' +
                  servkit.colors.red +
                  ';">' +
                  data[7] +
                  '</font>'
              )
          }
          if (Number(data[10]) < Number(data[9])) {
            $(row)
              .find('td')
              .eq(10)
              .html(
                '<font style="color:' +
                  servkit.colors.red +
                  ';">' +
                  data[10] +
                  '</font>'
              )
          }
        },
        excel: {
          fileName: '40_line_oee_detail',
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
            'text',
            'text',
          ],
        },
        showNoData: false,
      })

      // init
      servkit.initDatePicker(context.$startDate, context.$endDate, true)
      servkit.initSelectWithList(
        context.preCon.processMap,
        context.$selectProcess
      )
      servkit.initSelectWithList(context.preCon.lineMap, context.$selectLine)
      context.$selectLine.select2()
      context.$type.eq(0).click()
      servkit.validateForm($('#main-form'), context.$submitBtn)

      context.$demoBtn.on('click', function (evt) {
        evt.preventDefault()

        context.$startDate.val('2017/06/01')
        context.$endDate.val('2017/06/01')
        context.$type.eq(0).click()
        context.$selectProcess.val('PP').trigger('change.select2')

        context.$submitBtn.click()
      })

      //submit click
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()
        var startDate = context.$startDate.val(),
          endDate = context.$endDate.val(),
          type = $('input[name="type"]:checked').val()
        context.$queryInfo.html(
          context.queryInfoTemplate({
            startDate: startDate,
            endDate: endDate,
            type:
              type == 'line'
                ? `${i18n('ServTrack_000010')}`
                : `${i18n('ServTrack_000003')}`,
            typeName:
              type == 'line'
                ? context.$selectLine.find('option:selected').text()
                : context.$selectProcess.find('option:selected').text(),
          })
        )
        context.labelColorDes()
        context.readoee({
          startDate: startDate,
          endDate: endDate,
          lineId:
            type == 'line'
              ? context.commons.checkEscapeSymbol(context.$selectLine.val())
              : '',
          processCode:
            type == 'process'
              ? context.commons.checkEscapeSymbol(context.$selectProcess.val())
              : '',
        })
      })

      context.commons.dynamicDemo(context)
      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2017/09/01',
          endDate: '2017/09/30',
          line: 'd_all',
        }
      }
      $('#demo-btn').on('click', function (evt) {
        evt.preventDefault()
        context.$startDate.val(showdemoConfig.startDate)
        context.$endDate.val(showdemoConfig.endDate)
        context.$selectProcess
          .val(showdemoConfig.line)
          .trigger('change.select2') // only for select2 plugin
        context.$submitBtn.click()
      })
    },
    util: {
      //將id位置指定變數
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $type: $('input[name="type"]'),
      $selectProcess: $('#process'),
      $selectLine: $('#line'),
      $submitBtn: $('#submit-btn'),
      $demoBtn: $('#demo-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      $resultTip: $('.resultTip'),
      $queryInfo: $('.queryInfo'),
      $barChart: $('#bar-chart'),
      $labelColor: $('[name=labelColor]'), // 燈號
      queryInfoTemplate: _.template(
        '<span>' +
          ` ${i18n('ServTrack_000015')}:<%= startDate %>~<%= endDate %><br>` +
          ' <%= type %>:<%= typeName %><br>' +
          ` ${i18n(
            'ServTrack_000019'
          )}:<%- moment().format("YYYY/MM/DD HH:mm:ss") %><br>` +
          '</span>'
      ),
      readoee: function (param) {
        var context = this
        servkit.ajax(
          {
            url: 'api/servtrack/lineoee/readoee',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(param),
          },
          {
            success: function (data) {
              context.sumTable.clearTable()
              context.detailTable.clearTable()
              context.drawSumTable(data)
              context.drawDetailTable(data)
              context.loadingBtn.done()
            },
          }
        )
      },
      drawSumTable: function (data) {
        if (data.length > 0) {
          // 無各線每日應生產工時或是設定為0，有進出站記錄(例外處理)不顯示資料
          if (!(data[0].op_duration > 0 && data[0].aval == 0)) {
            var sumData = _.chain(data)
              .groupBy('line_id')
              .map(function (elems, lineId) {
                var sum = _.reduce(
                  elems,
                  function (memo, elem) {
                    var op_duration =
                      elem.op_duration == null
                        ? parseFloat('0')
                        : elem.op_duration
                    memo.line_id = lineId
                    memo.line_name = elem.line_name
                    memo.oee_sp = elem.oee_sp
                    memo.op_duration_sum += op_duration
                    memo.oee_sum +=
                      elem.oee == null ? parseFloat('0') : elem.oee
                    return memo
                  },
                  {
                    op_duration_sum: 0,
                    oee_sum: 0,
                  }
                )
                sum.oee_avg = (sum.oee_sum / elems.length).toFixed(2)
                return sum
              })
              .value()
          }
          this.sumTable.drawTable(
            _.map(sumData, function (elem) {
              return [
                /*線別*/
                elem.line_name,
                /*總生產時間(時)*/
                (elem.op_duration_sum / 60).toFixed(2),
                /*目標值*/
                parseFloat(elem.oee_sp).toFixed(2),
                /*總體稼動率(%)*/
                elem.oee_avg == null ? '' : parseFloat(elem.oee_avg).toFixed(2),
              ]
            })
          )
        }
      },
      drawDetailTable: function (data) {
        var that = this
        var result = []
        var dashMessage = '--'
        _.each(data, function (elem) {
          var op_duration =
            elem.op_duration == null
              ? parseFloat('0').toFixed(2)
              : (elem.op_duration / 60).toFixed(2)
          var aval =
            elem.aval == null
              ? parseFloat('0').toFixed(2)
              : parseFloat(elem.aval).toFixed(2)
          if (!(op_duration > 0 && aval == 0)) {
            var array = [
              /*線別*/
              elem.line_name,
              /*班次日期*/
              elem.shift_day.replace(/-/g, '/'),
              /*總生產時間(時)*/
              op_duration,
              /*應有產量*/
              elem.output_sp == null ? dashMessage : elem.output_sp,
              /*實際產量*/
              elem.output == null ? parseFloat('0').toFixed(2) : elem.output,
              /*良品數*/
              elem.go_quantity == null ? 0 : elem.go_quantity,
              /*線別良率目標值*/
              parseFloat(elem.line_quality_sp).toFixed(2),
              /*良率*/
              elem.quality == null
                ? parseFloat('0').toFixed(2)
                : parseFloat(elem.quality).toFixed(2),
              /*利用率(%)*/
              aval,
              /*總體稼動率目標值*/
              elem.oee_sp,
              /*總體稼動率(%): 利用率*良率*產能效率*/
              elem.oee == null
                ? parseFloat('0').toFixed(2)
                : parseFloat(elem.oee).toFixed(2),
            ]
            result.push(array)
          }
        })
        var message = `${i18n('ServTrack_000077')}<br>`
        if (result.length == 0) {
          message += `${i18n('ServTrack_000071')}`
        }
        that.$resultTip.html(message)
        this.detailTable.drawTable(result)
      },
      drawChart: function (pageData, oeeAvg) {
        var chartData = [],
          colors = [],
          ticks = []

        _.each(pageData, function (elem, index) {
          var isAchieved = Number(elem[3]) >= Number(elem[2])
          var color = isAchieved ? servkit.colors.green : servkit.colors.red

          //bar
          chartData.push({
            label: index,
            bars: {
              fillColor: color,
            },
            valueLabels: {
              show: true,
              labelFormatter: function (v) {
                return parseFloat(v).toFixed(2) + '%'
              },
              font: '12pt ' + servkit.fonts,
              valign: 'middle', // above, below, middle, bottom
            },
            data: [[index, parseFloat(elem[3])]],
          })
          colors.push(color)
          ticks.push([index, elem[0]])

          //stack
          if (!isAchieved) {
            //bar
            chartData.push({
              label: index,
              bars: {
                fill: false,
              },
              data: [[index, parseFloat(elem[2] - elem[3])]],
            })
            colors.push(color)
          }
        })

        //line
        chartData.push({
          label: `${i18n('ServTrack_000072')}`,
          lines: {
            show: true,
          },
          bars: {
            show: false,
          },
          stack: {
            show: false,
          },
          color: servkit.colors.blue,
          points: {
            symbol: 'triangle',
            fillColor: servkit.colors.blue,
            show: true,
          },
          data: _.map(pageData, function (elem, index) {
            return [index, oeeAvg]
          }),
        })

        var options = {
          colors: colors,
          series: {
            stack: true,
            bars: {
              show: true,
              align: 'center',
              barWidth: 0.2,
            },
          },
          tooltip: true,
          tooltipOpts: {
            content: "<div class='hide'>%x</div><span>%y.2(%)</span>", // 爛 plugin, 竟然一定要有%x
            defaultTheme: false,
          },
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          xaxis: {
            ticks: ticks,
          },
          yaxis: {
            min: 0,
            max: 100,
            tickFormatter: function (v) {
              return v + '.00%'
            },
          },
        }

        $.plot(this.$barChart, chartData, options)
      },
      labelColorDes: function () {
        this.$labelColor.html(
          '<span class="btn" style="background:' +
            servkit.colors.green +
            ';"></span>&nbsp;' +
            `<span>${i18n('ServTrack_000034')}</span>&nbsp;&nbsp;&nbsp;&nbsp;` +
            '<span class="btn" style="display: inline-block;width: 26px;border-bottom: solid 3px ' +
            servkit.colors.blue +
            ';"></span>&nbsp;' +
            `<span>${i18n('ServTrack_000072')}</span>&nbsp;&nbsp;&nbsp;&nbsp;` +
            '<span class="btn" style="background:white;border: 2px solid ' +
            servkit.colors.red +
            ';"></span>&nbsp;' +
            `<span>${i18n('ServTrack_000144')}</span>`
        )
      },
    },
    preCondition: {
      processMap: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name'],
              whereClause: "is_open = 'Y' AND process_code <> 'common_process'",
            }),
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  function (memo, elem) {
                    memo[elem.process_code] = elem.process_name
                    return memo
                  },
                  {}
                )
              )
            },
          }
        )
      },
      lineMap: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_line',
              columns: ['line_id', 'line_name'],
            }),
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  function (memo, elem) {
                    memo[elem.line_id] = elem.line_name
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
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.symbol.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/servtech/cosmos/jquery.flot.valuelabels-2.2.0.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
