import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()
      ctx.initFuncs(ctx)
      ctx.initElements(ctx)

      var dayTable = createReportTable({
        $tableElement: $('#date-table'),
        $tableWidget: $('#date-table-widget'), //reporttable.js有說明
        rightColumn: [5, 9, 10, 11, 12],
        onRow: function (row) {
          var rows = $(row).find('td')
          var data11 = rows.eq(11).text()
          var data12 = rows.eq(12).text()
          if (data11 < 0) {
            rows.eq(11).html('<font style="color:red;">' + data11 + '</font>')
          }
          if (data12 < 0) {
            rows.eq(12).html('<font style="color:red;">' + data12 + '</font>')
          }
        },
        excel: {
          fileName: '60_operating_performance',
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
          ],
        },
      })
      ctx.commons.dynamicDemo(ctx)
      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[ctx.appId][ctx.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2017/09/01',
          endDate: '2017/09/30',
          product: '',
          line: '',
        }
      }
      ctx.$demoBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.$startDate.val(showdemoConfig.startDate)
        ctx.$endDate.val(showdemoConfig.endDate)
        ctx.$productId.val(showdemoConfig.product).trigger('change.select2') // only for select2 plugin
        if (showdemoConfig.product === '') {
          $('#s2id_productId .select2-chosen').text('')
        }
        ctx.$lineId.val(showdemoConfig.line).trigger('change.select2') // only for select2 plugin
        if (showdemoConfig.line === '') {
          $('#s2id_lineId .select2-chosen').text('')
        }
        ctx.$submitBtn.click()
      })

      //submit click
      ctx.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.loadingBtn.doing()
        var currentDate = moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
        var str = `${i18n('ServTrack_000019')} : ` + currentDate
        document.getElementsByName('currentDate').item(0).innerHTML = str
        var reportType = 'drawTable'
        ctx[reportType](dayTable)
      })
    },
    util: {
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $productId: $('#productId'),
      $lineId: $('#lineId'),
      $submitBtn: $('#submit-btn'),
      $demoBtn: $('#showdemo1'),
      $labelColor: $('[name=labelColor]'), // 燈號
      $toolLifeChar: $('#bar-chart-h'),
      $shiftRangeTitle: $('#shift-range-title'),
      $productNameTitle: $('#product-name-title'),
      $lineTitle: $('#line-title'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      initFuncs: function (ctx) {
        if (ctx.preCon.products) {
          ctx['productFunc'] = ctx.preCon.products
        }
        if (ctx.preCon.lines) {
          ctx['lineFunc'] = ctx.preCon.lines
        }
      },
      initElements: function (ctx) {
        servkit.initDatePicker(ctx.$startDate, ctx.$endDate, true)
        ctx.$productId.html(ctx.productFunc.getSelect())
        ctx.$productId.prop('selectedIndex', -1)
        ctx.$lineId.html(ctx.lineFunc.getSelect())
        ctx.$lineId.prop('selectedIndex', -1)
        servkit.validateForm($('#main-form'), ctx.$submitBtn)
      },
      drawTable: function (dayTable) {
        var that = this
        var trackingArray = []
        var trackingResultData
        var params = {
          startDate: that.$startDate.val(),
          endDate: that.$endDate.val(),
          productId: that.commons.checkEscapeSymbol(that.$productId.val()),
          lineId: that.commons.checkEscapeSymbol(that.$lineId.val()),
        }
        var lindId =
          that.$lineId.val() == null
            ? ''
            : that.lineFunc.getName(that.$lineId.val())
        var productName =
          that.$productId.val() == null
            ? ''
            : that.productFunc.getName(that.$productId.val())
        that.$shiftRangeTitle.html(
          that.$startDate.val() + ' ~ ' + that.$endDate.val()
        )
        that.$lineTitle.html(lindId)
        that.$productNameTitle.html(productName)

        servkit.ajax(
          {
            url:
              servkit.rootPath +
              '/api/servtrack/operatingperformance/readperformance',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (dbData) {
              _.map(dbData, function (data) {
                var subArray = []
                subArray.push(data.shift_day)
                subArray.push(data.product_name)
                subArray.push(data.work_id)
                subArray.push(data.op)
                subArray.push(data.process_name)
                subArray.push(parseFloat(data.std_hour).toFixed(4))
                subArray.push(data.line_name)
                subArray.push(
                  moment(data.move_in).format('YYYY-MM-DD HH:mm:ss')
                )
                subArray.push(
                  moment(data.move_out).format('YYYY-MM-DD HH:mm:ss')
                )
                subArray.push(data.output)
                subArray.push(data.ng_quantity)
                subArray.push(data.output_variance)
                subArray.push(parseFloat(data.duration_variance).toFixed(2))
                trackingArray.push(subArray)
              })
              trackingResultData = trackingArray
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
        servkit
          .politeCheck()
          .until(function () {
            return trackingResultData
          })
          .thenDo(function () {
            dayTable.drawTable(trackingResultData)
            dayTable.showWidget()
            that.loadingBtn.done()
          })
          .tryDuration(0)
          .start()
      },
    },
    preCondition: {
      lines: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_line',
              columns: ['line_id', 'line_name'],
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('line_id', 'line_name')
              done(func)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
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
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('product_id', 'product_name')
              done(func)
            },
            fail: function (data) {
              console.warn(data)
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
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
