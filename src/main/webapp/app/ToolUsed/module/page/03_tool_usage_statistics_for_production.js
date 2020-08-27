import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      //日曆選單
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        dayTable = createReportTable({
          $tableElement: $('#date-table'),
          $tableWidget: $('#date-table-widget'), //reporttable.js有說明
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [5, 7], //選擇要秀出圖的數值欄位
              xAxisLabelValueIndex: [4, 2, 3], //4:機台編號 2:工單 3:刀號
              yAxisLabel: `${i18n('Time')}`,
            }
            context.drawChart(context.$toolLifeChar, chartConfig)
          },
          excel: {
            fileName: 'toolLifeDay',
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
      context.labelColorDes()
      //click觸發事件
      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      context.initProductIdSelect()
      //demo click
      context.$demoBtn.on('click', function (evt) {
        evt.preventDefault() //防止氣泡事件
        context.$startDate.val('2017/03/07')
        context.$endDate.val('2017/03/08')
        var reportType = 'demo'
        context[reportType](dayTable) //context[reportType](dayTable) 是指util.day(dayTable)
      })
      //submit click
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var reportType = 'day'
        context[reportType](dayTable)
      })
    },
    util: {
      //將id位置指定變數
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $selectProductId: $('#productId'),
      $submitBtn: $('#submit-btn'),
      $demoBtn: $('#showdemo'),
      $labelColor: $('[name=labelColor]'), // 燈號
      $toolLifeChar: $('#bar-chart-h'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      //下拉式選擇產品
      initProductIdSelect: function () {
        var that = this
        var productIdStr = ['product_id']
        hippo
          .newSimpleExhaler()
          .space('tool_used_product_id')
          .index('product_id', productIdStr)
          .columns('product_id')
          .exhale(function (exhalable) {
            try {
              that.$selectProductId
                .append(
                  exhalable.map(function (data) {
                    return (
                      "<option style ='padding:3px 0 3px 3px;' value='" +
                      data.product_id +
                      "'>" +
                      data.product_id +
                      '</option>'
                    )
                  })
                )
                .select2()
            } catch (e) {
              console.warn(e)
            }
          })
      },
      //選擇日期從hippo抓出指定值
      day: function (dayTable) {
        var that = this
        var productIdList = that.$selectProductId.val() || [],
          startDate = that.$startDate.val(),
          endDate = that.$endDate.val(),
          resultData,
          loadingBtn = that.loadingBtn
        loadingBtn.doing()
        hippo
          .newSimpleExhaler()
          .space('tool_used')
          .index('product_id', [productIdList])
          .indexRange('date', startDate, endDate)
          .columns(
            'product_id',
            'date',
            'op',
            'tool',
            'machine_id',
            'tool_change_times',
            'accumulative_millisecond',
            'average_millisecond'
          )
          .exhale(function (exhalable) {
            try {
              var result = exhalable.map(function (data) {
                return [
                  data.product_id,
                  data.date,
                  data.op,
                  data.tool,
                  data.machine_id,
                  data.accumulative_millisecond.millisecondToHHmmss(),
                  data.tool_change_times,
                  data.accumulative_millisecond == 0 ||
                  data.tool_change_times == 0 ||
                  data.accumulative_millisecond / data.tool_change_times == 0
                    ? '00:00:00'
                    : (
                        data.accumulative_millisecond / data.tool_change_times
                      ).millisecondToHHmmss(),
                ]
              })
              resultData = result
              servkit
                .politeCheck()
                .until(function () {
                  return resultData
                })
                .thenDo(function () {
                  dayTable.drawTable(resultData)
                  dayTable.showWidget()
                })
                .tryDuration(0) //每毫秒檢查值來了沒
                .start()
            } catch (e) {
              console.warn(e)
            } finally {
              loadingBtn.done()
            }
          })
      },
      drawChart: function ($chartEle, config) {
        var dataList = config.dataList, //所有資料
          barValueIndex = config.barValueIndex,
          xAxisLabelValueIndex = config.xAxisLabelValueIndex,
          yAxisLabel = config.yAxisLabel,
          that = this
        if (!dataList || dataList.length === 0) {
          return
        }
        var chartDatas = _.map(barValueIndex, function (barIndex, barI) {
          //e.g.  (5,0) (6,1)
          return {
            data: _.map(dataList, function (row, i) {
              return [that.hhmmssToSecond(row[barIndex]), i]
            }),
            bars: {
              // 直線圖參數
              align: 'center',
              horizontal: true,
              show: true,
              barWidth: 0.2,
              order: barI + 1,
              // order : 2
            },
          }
        })
        $.plot($chartEle, chartDatas, {
          colors: [
            servkit.colors.green,
            servkit.colors.blue,
            servkit.colors.orange,
          ],
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          yaxis: {
            font: {
              size: 14,
              family: 'Courier New',
              color: '#000000',
            },
            ticks: function () {
              return _.map(dataList, function (ele, i) {
                var tick = _.map(xAxisLabelValueIndex, function (index) {
                  return that.yAxisLabelValue(index, ele[index])
                }).join(' | ')
                return [i, tick]
              })
            },
          },
          xaxis: {
            tickFormatter: function (countSecond, axis) {
              var countMillisecond = countSecond * 1000
              return [countMillisecond.millisecondToHHmmss()]
            },
            min: 0,
            axisLabel: yAxisLabel,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Open Sans',
          },
          legend: true,
          tooltip: true,
          tooltipOpts: {
            content: function (label, xval, yval, flotItem) {
              var countMillisecond = xval * 1000
              var xvalModify = countMillisecond.millisecondToHHmmss().toString()
              return (
                '<b>' + xvalModify + "</b><span style='display:none;'>%y</span>"
              )
            },
            defaultTheme: true,
          },
        })
      },
      hhmmssToSecond: function (val) {
        var dateArray = val.split(':')
        var hour = parseInt(dateArray[0])
        var minute = parseInt(dateArray[1])
        var second = parseInt(dateArray[2])
        var time = parseFloat((hour * 3600 + minute * 60 + second).toFixed(2)) //小數點第二位四捨五入
        if (time > 0) {
          return time
        } else {
          return 0
        }
      },
      demo: function (dayTable) {
        //陣列值型別為 不定義字串js 會報is not defined
        var resultData = [
          [
            'test01',
            '20170308',
            '987654321',
            '1',
            'Machine0AA',
            '02:05:12',
            '01:05:12',
          ],
          [
            'test01',
            '20170308',
            '987654321',
            '121',
            'Machine0AA',
            '04:05:12',
            '02:10:12',
          ],
          [
            'test01',
            '20170308',
            '987654321',
            '003',
            'Machine0AA',
            '06:05:12',
            '03:05:12',
          ],
          [
            'test01',
            '20170308',
            '987654321',
            '04',
            'Machine0AA',
            '08:05:12',
            '04:10:12',
          ],
          [
            'test02',
            '20170308',
            '1234567',
            '001',
            'aaaaaaTestA0',
            '07:05:12',
            '01:05:12',
          ],
          [
            'test02',
            '20170308',
            '1234567',
            '002',
            'aaaaaaTestA0',
            '08:05:12',
            '02:10:12',
          ],
          [
            'test02',
            '20170308',
            '1234567',
            '013',
            'aaaaaaTestA0',
            '09:05:12',
            '03:05:12',
          ],
          [
            'test02',
            '20170308',
            '1234567',
            '04',
            'aaaaaaTestA0',
            '10:05:12',
            '04:10:12',
          ],
          [
            'test02',
            '20170308',
            '123456',
            '04',
            'aaaaaaTestA0',
            '10:05:12',
            '04:10:12',
          ],
          [
            'test02',
            '20170308',
            '12345',
            '04',
            'aaaaaaTestA0',
            '10:05:12',
            '04:10:12',
          ],
          [
            'test02',
            '20170308',
            '1234',
            '04',
            'aaaaaaTestA0',
            '10:05:12',
            '04:10:12',
          ],
          [
            'test02',
            '20170308',
            '123',
            '04',
            'aaaaaaTestA0',
            '10:05:12',
            '04:10:12',
          ],
        ]
        dayTable.drawTable(resultData)
        dayTable.showWidget()
      },
      labelColorDes: function () {
        var that = this
        var labelColorDes1 =
          '<span class="btn" style="background:' +
          servkit.colors.green +
          ';"></span>&nbsp;<span>' +
          `${i18n('Accumulative_Millisecond')}` +
          '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
        var labelColorDes2 =
          '<span class="btn" style="background:' +
          servkit.colors.blue +
          ';"></span>&nbsp;<span>' +
          `${i18n('Average_Millisecond')}` +
          '</span>&nbsp;&nbsp;&nbsp;&nbsp;'
        var labelColorDesSum = labelColorDes1 + labelColorDes2

        this.$labelColor.html(labelColorDesSum)
      },
      yAxisLabelValue: function (index, str) {
        var that = this
        // 2:工單 3:刀號 4:機台編號
        // if (index == 2) return that.padCenter(str, 10);
        if (index == 2) return str
        else if (index == 3) return that.padLeftZero(str, 3)
        // else if (index == 4) return that.padLeft(str, 10);
        else if (index == 4) return str
      },
      padLeft: function (str, maxlength) {
        var that = this
        if (str.length >= maxlength) {
          return str.substr(0, maxlength)
        } else {
          return that.padLeft(' ' + str, maxlength)
        }
      },
      padCenter: function (str, maxlength) {
        var that = this
        if (str.length > 7) {
          return str.substr(0, 7) + '...'
        } else {
          var num = maxlength - str.length
          var appendTimes = Math.round(num / 2)
          for (var i = 1; i <= appendTimes; i++) {
            if (i % 2 == 0) {
              str = '　' + str
            } else {
              str = str + '　'
            }
          }
          return str.substr(0, maxlength)
        }
      },
      padLeftZero: function (str, maxlength) {
        var that = this
        if (str.length >= maxlength) {
          return str.substr(0, maxlength)
        } else {
          return that.padLeftZero('0' + str, maxlength)
        }
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        // "/js/plugin/flot/jquery.flot.tooltip.min.js",
        '/js/plugin/flot/jquery.flot.tooltip-0.9.0.min.js',
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
