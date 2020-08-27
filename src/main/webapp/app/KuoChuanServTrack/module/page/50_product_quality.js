export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()
      ctx.initFuncs(ctx)
      ctx.initElements(ctx)
      var complexQuery = 1,
        workIdQuery = 2

      servkit.initSelectWithList(ctx.preCon.products, ctx.$productId)
      ctx.$productId.select2()
      // ctx.$productId.find('option:contains("ALL")').remove();
      // ctx.$productId.prev('.select2-container').css('height','');
      servkit.initSelectWithList(ctx.preCon.works, ctx.$workId)
      ctx.$workId.prop('selectedIndex', -1)
      ctx.$workId.select2()

      let dayTable = createReportTable({
        $tableElement: $('#date-table'),
        $tableWidget: $('#date-table-widget'),
        order: [[0, 'asc']],
        rightColumn: [2, 3, 4, 5],
        onRow: function (row, data) {
          var total = Number($(row).find('td').eq(4).text())
          var target = Number($(row).find('td').eq(5).text())
          if (total < target) {
            $(row).find('td').eq(4).css('color', 'red')
          }
          //$(row).find('td').eq(5).css("display", "none");
        },
        onDraw: function (tableData, pageData) {
          var chartConfig = {
            dataList: pageData,
            barValueIndex: [4], //選擇要秀出圖的數值欄位
            xAxisLabelValueIndex: [0], //4:機台編號 2:工單 3:刀號
            productObj: ctx.preCon.k,
            workObj: ctx.preCon.workFunc,
          }
          // ctx.drawChart(ctx.$modalBarChart, chartConfig);
        },
        excel: {
          fileName: '50_product_quality',
          format: ['text', 'text', 'text', 'text', 'text', 'text', 'text'],
        },
      })
      dayTable.table.column(5).visible(false)

      let dayTable2 = createReportTable({
        $tableElement: $('#date-table2'),
        $tableWidget: $('#date-table-widget'),
        rightColumn: [6, 8, 9, 10, 11],
        onRow: function (row, data) {
          //    $(row).find('td').eq(2).css("display", "none");
          //    $(row).find('td').eq(5).css("display", "none");
          //   $(row).find('td').eq(7).css("display", "none");
          //    $(row).find('td').eq(12).css("display", "none");
          //    $(row).find('td').eq(13).css("display", "none");
          var check = $(row).find('td').eq(13).text()
          if (check == 'true') {
            $(row).find('td').eq(8).css('color', servkit.colors.red)
          }
        },
        excel: {
          fileName: '50_product_quality_detail',
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
            'text',
            'text',
          ],
        },
      })
      dayTable2.table.column(2).visible(false)
      dayTable2.table.column(5).visible(false)
      dayTable2.table.column(7).visible(false)
      dayTable2.table.column(12).visible(false)
      dayTable2.table.column(13).visible(false)
      servkit.validateForm($('#main-form'), ctx.$submitBtn)
      // servkit.validateForm($("#main-form2"), ctx.$submitBtn2);

      //submit click
      ctx.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        // var currentDate = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
        // var str = '查詢時間：' + currentDate;
        // document.getElementsByName("currentDate").item(0).innerHTML = str;
        // document.getElementsByName("currentDate").item(1).innerHTML = str;
        // ctx.queryStatus(false);
        $('#date-table-widget2').hide()
        $('#date-table-widget').show()
        ctx.drawQualityTable(dayTable, complexQuery, false)
        ctx.detailRecord(dayTable, complexQuery)
      })

      ctx.$submitBtn2.on('click', function (evt) {
        evt.preventDefault()

        // var currentDate = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
        // var str = '查詢時間：' + currentDate;
        // document.getElementsByName("currentDate").item(0).innerHTML = str;
        // document.getElementsByName("currentDate").item(1).innerHTML = str;
        // $("#date-table-widget2").hide();
        // $("#date-table-widget").show();
        ctx.drawQualityTable(dayTable, workIdQuery, true)
        // ctx.queryStatus(true);
        ctx.detailRecord(dayTable, workIdQuery)
      })

      //demo2 click
      ctx.$submitBtnWorkId.on('click', function (evt) {
        evt.preventDefault()
        // var currentDate = moment(new Date()).format('YYYY/MM/DD HH:mm:ss');
        // var str = '查詢時間：' + currentDate;
        // document.getElementsByName("currentDate").item(1).innerHTML = str;
        $('#date-table-widget').hide()
        $('#date-table-widget2').show()
        ctx.drawQualityTable(dayTable)
      })
    },
    util: {
      datepickerConfig: {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      },
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $workId: $('#work-id'),
      $productId: $('#product-id'),
      $submitBtn: $('#submit-btn'),
      $submitBtn2: $('#submit-btn2'),
      $workStatus: $('[name="work-status"'),
      $demoBtn: $('#demo-btn'),
      $demoBtn2: $('#demo-btn2'),
      $submitBtnWorkId: $('#submit-btn-work-id'),
      $modalBarChart: $('#bar-chart-h'),
      $barChartTitle: $('#bar-chart-title'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      queryStatus: function (isWork, tableProductName) {
        var that = this
        var status = [],
          productId =
            that.$productId.val() == null
              ? ''
              : that.$productId.find('option:selected').text(),
          workId = that.$workId.val() == null ? '' : that.$workId.val()
        if (!isWork) {
          workId = ''
        } else {
          productId = tableProductName
        }
        _.each(this.$workStatus, function (ele) {
          if ($(ele).prop('checked')) {
            if (ele.value === '999') {
              status.push('未結案')
            } else {
              status.push('結案')
            }
          }
        })

        var currentDate = moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
        var str =
          '班次日期：' +
          that.$startDate.val() +
          '~' +
          that.$endDate.val() +
          '<br>' +
          '品項：' +
          productId +
          '<br>' +
          '派工單號:' +
          workId +
          '<br>' +
          '派工單狀態:' +
          status.join() +
          '<br>' +
          '查詢時間:' +
          currentDate

        document.getElementsByName('complexQueryStatus').item(0).innerHTML = str
        document.getElementsByName('complexQueryStatus').item(1).innerHTML = str
      },
      initFuncs: function (ctx) {
        if (ctx.preCon.products) {
          ctx['productFunc'] = ctx.preCon.products
        }
        if (ctx.preCon.works) {
          ctx['workFunc'] = ctx.preCon.works
        }
      },
      initElements: function (ctx) {
        ctx.$startDate
          .datepicker(ctx.datepickerConfig)
          .val(moment().format('YYYY/MM/DD'))
        ctx.$endDate
          .datepicker(ctx.datepickerConfig)
          .val(moment().format('YYYY/MM/DD'))
      },
      drawQualityTable: function (dayTable, queryType, check) {
        var that = this
        var result = []
        var productId = that.$productId.val() || []
        var resultData
        var params
        var productName
        if (queryType == 1) {
          params = {
            startDate: that.$startDate.val(),
            endDate: that.$endDate.val(),
            productIds: that.$productId.val() || [],
            workId: that.$workId.val(),
            status: [],
          }
          _.each(this.$workStatus, function (ele) {
            if ($(ele).prop('checked')) {
              if (ele.value === '999') {
                params.status.push('0')
                params.status.push('1')
              } else {
                params.status.push(ele.value)
              }
            }
          })
        } else {
          params = {
            startDate: '',
            endDate: '',
            workId: that.$workId.val(),
          }
        }
        servkit.ajax(
          {
            url: 'api/kuochuan/servtrack/productquality/readwork',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (dbData) {
              _.map(dbData, function (data) {
                productName = data.product_name
                var subArray = []
                subArray.push(data.work_id)
                subArray.push(data.product_name)
                subArray.push(data.input)
                subArray.push(
                  data.go_quantity == null ? '未完工' : data.go_quantity
                )
                subArray.push(data.quality == null ? '--' : data.quality)
                subArray.push(data.product_quality_sp)
                subArray.push(data.duration == null ? '--' : data.duration)
                result.push(subArray)
              })
              resultData = result
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )

        servkit
          .politeCheck()
          .until(function () {
            return resultData
          })
          .thenDo(function () {
            console.log(resultData)
            dayTable.drawTable(resultData)
            that.queryStatus(check, productName)
            dayTable.showWidget()
          })
          .tryDuration(0)
          .start()
      },
      detailRecord: function (dayTable2, queryType) {
        var that = this
        var result = []
        var resultData
        var params
        if (queryType == 1) {
          params = {
            startDate: that.$startDate.val(),
            endDate: that.$endDate.val(),
            productIds: that.$productId.val() || [],
            workId: '',
            status: [],
          }
          _.each(this.$workStatus, function (ele) {
            if ($(ele).prop('checked')) {
              if (ele.value === '999') {
                params.status.push('0')
                params.status.push('1')
              } else {
                params.status.push(ele.value)
              }
            }
          })
        } else {
          params = {
            startDate: '',
            endDate: '',
            workId: that.$workId.val(),
          }
        }

        servkit.ajax(
          {
            url: 'api/kuochuan/servtrack/productquality/readtracking',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (dbData) {
              //先分組先 key 是 派工單號 + "|" + 產品
              var groupObj = _.groupBy(dbData, function (data) {
                return data.work_id + '|' + data.product_name
              })
              //依照工序排序 理論上應該是不會改變;
              var sortDataObj = _.map(groupObj, function (data, key) {
                return _.sortBy(data, function (obj) {
                  return obj.op
                })
              })
              //
              var correctionData = []
              _.each(sortDataObj, function (dataList) {
                _.each(dataList, function (data, index, list) {
                  if (index == 0) {
                    data.is_red = false
                  } else {
                    var prevOutput = list[index - 1].go_quantity
                    var currOutput = data.output
                    if (currOutput > prevOutput) {
                      data.is_red = true
                    } else {
                      data.is_red = false
                    }
                  }
                  correctionData.push(data)
                })
              })

              _.map(correctionData, function (data) {
                var subArray = []
                subArray.push(data.work_id)
                subArray.push(data.product_name)
                subArray.push(data.shift_day)
                subArray.push(data.op)
                subArray.push(data.process_name)
                subArray.push(data.line_name)
                // subArray.pus h(moment(data.move_in).format('YYYY/MM/DD HH:mm:ss'));
                subArray.push(parseFloat(data.op_duration / 60).toFixed(2))
                subArray.push(
                  moment(data.move_out).format('YYYY/MM/DD HH:mm:ss')
                )
                subArray.push(data.output)
                subArray.push(data.go_quantity)
                subArray.push(data.ng_quantity)
                var quality
                if (data.output == 0) {
                  quality = 0
                } else {
                  quality = parseFloat(
                    (data.go_quantity / data.output) * 100
                  ).toFixed(2)
                }
                subArray.push(quality)
                subArray.push(data.op_quality_sp)
                subArray.push(data.is_red)
                result.push(subArray)
              })
              resultData = result
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
        servkit
          .politeCheck()
          .until(function () {
            return resultData
          })
          .thenDo(function () {
            dayTable2.drawTable(resultData)
            dayTable2.showWidget()
          })
          .tryDuration(0)
          .start()
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.symbol.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.dashes.min.js',
        '/js/plugin/flot/jquery.flot.threshold.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
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
    preCondition: {
      products: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_product',
              columns: ['product_id', 'product_name', 'is_open'],
              whereClause: 'product_id <> ?',
              whereParams: ['invalid_work'],
            }),
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  function (memo, elem) {
                    memo[elem.product_id] = elem.product_name
                    return memo
                  },
                  {}
                )
              )
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
      works: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_work',
              columns: ['work_id'],
              whereClause: 'work_id <> ?',
              whereParams: ['INVALID_WORK'],
            }),
          },
          {
            success: function (data) {
              done(
                _.reduce(
                  data,
                  function (memo, elem) {
                    memo[elem.work_id] = elem.work_id
                    return memo
                  },
                  {}
                )
              )
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
    },
  })
}
