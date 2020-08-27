import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()
      ctx.initFuncs(ctx)
      ctx.initElements(ctx)

      var complexQuery = 1,
        workIdQuery = 2

      var modalProcessTable = createReportTable({
        $tableElement: $('#modal-process-table'),
        $tableWidget: $('#modal-process-table-widget'),
        showNoData: false,
        hideCols: [0],
        rightColumn: [2, 3, 4, 5, 6],
        onRow: function (row) {
          ctx.drawBackground($(row).find('td:eq(1)'))
        },
      })

      var dayTable = createReportTable({
        $tableElement: $('#date-table'),
        $tableWidget: $('#date-table-widget'),
        order: [[4, 'asc']],
        customBtns: [
          `<a class="excel-btn-detail btn btn-success pull-left"><span class="fa fa-file-excel-o fa-lg"></span> ${i18n(
            'ServTrack_000156'
          )}` + '</a>',
        ],
        rightColumn: [5, 6, 7],
        excel: {
          fileName: '30_dispatch_list_process',
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
          customHeaderFunc: function (tableHeader) {
            return tableHeader.slice(0, tableHeader.length - 1)
          },
          customDataFunc: function (tableData) {
            return _.map(tableData, function (d) {
              var data = d.slice(0, d.length - 1)
              return _.filter(data, function (num, key) {
                return dayTable.table.columns().visible()[key]
              })
            })
          },
        },
      })

      $('#date-table-widget').on('click', '.excel-btn-detail', function (evt) {
        $('.excel-btn-2').trigger('click')
      })

      var excelTable = createReportTable({
        $tableElement: $('#excel-table'),
        $tableWidget: $('#excel-table-widget'),
        order: [[4, 'asc']],
        excel: {
          fileName: '30_dispatch_list_process_detail',
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

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[ctx.appId][ctx.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2018/06/01',
          endDate: '2018/12/17',
          workStatus: [],
          product: 'Ckey_AD_01',
        }
      }
      //demo click
      ctx.$demoBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.$startDate.val(showdemoConfig.startDate)
        ctx.$endDate.val(showdemoConfig.endDate)
        ctx.$productId.val(showdemoConfig.product).trigger('change.select2') // only for select2 plugin
        if (showdemoConfig.product === '') {
          $('.select2-chosen').text('')
        }
        $('[name="work-status"]').each(function () {
          for (var i = 0; i < showdemoConfig.workStatus.length; i++) {
            if ($(this).val() === showdemoConfig.workStatus[i]) {
              $(this).attr('checked', true)
            }
          }
        })
        var currentDate = moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
        var str = `${i18n('ServTrack_000019')} : ` + currentDate
        document.getElementsByName('currentDate').item(0).innerHTML = str
        $('#date-table-widget2').hide()
        $('#date-table-widget').show()
        ctx.$submitBtn.click()
      })

      ctx.$submitBtn2.on('click', function (evt) {
        evt.preventDefault()
        ctx.loadingBtn2.doing()
        var currentDate = moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
        var str = `${i18n('ServTrack_000019')} : ` + currentDate
        document.getElementsByName('currentDate').item(0).innerHTML = str
        var reportType = 'drawTable'
        ctx[reportType](dayTable, workIdQuery, true)
        ctx['drawExcelTable'](excelTable, workIdQuery, true)
      })

      //submit click
      ctx.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.loadingBtn.doing()
        var currentDate = moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
        var str = `${i18n('ServTrack_000019')} : ` + currentDate
        document.getElementsByName('currentDate').item(0).innerHTML = str
        var reportType = 'drawTable'
        ctx[reportType](dayTable, complexQuery, false)

        ctx['drawExcelTable'](excelTable, complexQuery, false)
      })

      ctx.$dateTable.on('click', '[name=process]', function (evt) {
        evt.preventDefault()
        var productName = $(this).attr('data-product_name')
        var params = {
          workId: ctx.commons.checkEscapeSymbol($(this).attr('value')),
        }

        ctx.drawModalProcessTable(params, modalProcessTable, productName)
      })
    },
    util: {
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $workId: $('#work-id'),
      $productId: $('#product-id'),
      $submitBtn: $('#submit-btn'),
      $submitBtn2: $('#submit-btn2'),
      $demoBtn: $('#demo-btn'),
      $demoBtn2: $('#demo-btn2'),
      $dispatchListStatus: $('#dispatch-list-status'),
      $modalBarChart: $('#bar-chart-h'),
      $dateTable: $('#date-table'),
      $dateTable2: $('#date-table2'),
      $myModal: $('#myModal'),
      $swimlaneChart: $('#swimlaneChart'),
      $shiftRange: $('#shift-range-title'),
      $workIdTitle: $('#work-id-title'),
      $workStatus: $('[name=work-status]'),
      $workStatusTitle: $('#work-status-title'),
      $productNameTitle: $('#product-name-title'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      loadingBtn2: servkit.loadingButton(
        document.querySelector('#submit-btn2')
      ),
      drawBackground: function ($td) {
        if ($td.text() != '--') {
          $td.css('background-color', servkit.colors.green)
        }
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
        servkit.initDatePicker(ctx.$startDate, ctx.$endDate, true)
        servkit.initSelectWithList(ctx.preCon.getProductList, $('#product-id'))
        ctx.$workId.html(ctx.workFunc.getSelect())
        ctx.$workId.prop('selectedIndex', -1)
        servkit.validateForm($('#form1'), ctx.$submitBtn)
        servkit.validateForm($('#form2'), ctx.$submitBtn2)
      },
      processDatas: function (params, productName, op2Amount) {
        var that = this
        var resultData
        var workId = params.workId
        var work_duration
        var work_go_quantity
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/servtrack/workprocess/readprocess',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (dbData) {
              var array = []
              var i = 0
              _.map(dbData, function (data) {
                work_duration =
                  data.work_duration == null ? '--' : data.work_duration
                work_go_quantity =
                  data.work_go_quantity == null ? '--' : data.work_go_quantity
                var key = data.op + data.process_name
                var laneTitle = op2Amount[key]
                var workItem = {
                  workId: data.work_id,
                  id: i,
                  name: 'work item ' + i,
                  lane: laneTitle,
                  start: new Date(data.move_in),
                  end: new Date(data.move_out),
                }
                i++
                array.push(workItem)
              })
              resultData = array
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )

        servkit
          .politeCheck()
          .until(function () {
            return resultData
          })
          .thenDo(function () {
            that.$swimlaneChart.html('')
            that.$dispatchListStatus.html('')
            that.$dispatchListStatus.html(
              `<div class="alert alert-info";">${i18n(
                'ServTrack_000017'
              )} ： ` +
                workId +
                `，${i18n('ServTrack_000094')} ： ` +
                productName +
                `，${i18n('ServTrack_000061')} ： ` +
                work_go_quantity +
                `，${i18n('ServTrack_000091')} ： ` +
                work_duration
            )
            that.commons.drawLaneChart(resultData)
            that.$myModal.modal()
          })
          .tryDuration(0)
          .start()
      },
      drawTable: function (dayTable, queryType, isWork) {
        var that = this
        var result = []
        var resultData
        var params
        var workIdTitle,
          productNameTitle,
          statusTitle = [],
          workProductName
        if (queryType == 1) {
          params = {
            startDate: that.$startDate.val(),
            endDate: that.$endDate.val(),
            productIds: that.$productId.val(),
            status: [],
          }
          var productIdArr =
            that.$productId.val() == null ? [] : that.$productId.val()
          var allStrIndex = productIdArr.indexOf('ALL')
          delete productIdArr[allStrIndex]
          productNameTitle =
            that.$productId.val() == null ? '' : productIdArr.join(',')
        } else {
          params = {
            startDate: '',
            endDate: '',
            workId: that.commons.checkEscapeSymbol(that.$workId.val()),
          }
        }
        that.$shiftRange.html(
          that.$startDate.val() + ' ~ ' + that.$endDate.val()
        )
        workIdTitle = that.$workId.val() == null ? '' : that.$workId.val()

        _.each(that.$workStatus, function (ele) {
          if ($(ele).prop('checked')) {
            if (ele.value === '999') {
              statusTitle.push(`${i18n('ServTrack_000097')}`)
              if (!isWork) {
                params.status.push('0')
                params.status.push('1')
              }
            } else {
              statusTitle.push(`${i18n('ServTrack_000093')}`)
              if (!isWork) {
                params.status.push(ele.value)
              }
            }
          }
        })
        that.$workStatusTitle.html(statusTitle.join())

        servkit.ajax(
          {
            url: servkit.rootPath + '/api/jumpway/work-process/readtracking',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (dbData) {
              _.map(dbData, function (data) {
                workProductName = data.product_name
                var subArray = []
                subArray.push(data.work_id)
                subArray.push(data.product_name)
                subArray.push(
                  moment(data.create_time).format('YYYY/MM/DD HH:mm:ss')
                )
                subArray.push(data.user_name)
                subArray.push(
                  data.first_move_in == null
                    ? `${i18n('ServTrack_000096')}`
                    : moment(data.first_move_in).format('YYYY/MM/DD HH:mm:ss')
                )
                subArray.push(data.e_quantity)
                subArray.push(data.last_go_quntity)
                subArray.push(
                  parseFloat(
                    (data.last_go_quntity / data.e_quantity) * 100
                  ).toFixed(2)
                )
                subArray.push(
                  data.status_id == 2
                    ? `${i18n('ServTrack_000099')}`
                    : `${i18n('ServTrack_000104')}`
                )
                subArray.push(
                  `<button class="btn btn-primary" name="process" title="${i18n(
                    'ServTrack_000045'
                  )}" data-product_name="` +
                    data.product_name +
                    '" value="' +
                    data.work_id +
                    `" style="margin-right:5px">${i18n(
                      'ServTrack_000045'
                    )}</button>`
                )
                result.push(subArray)
              })
              resultData = result
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
        servkit
          .politeCheck()
          .until(function () {
            return resultData
          })
          .thenDo(function () {
            dayTable.drawTable(resultData)
            if (isWork) {
              that.$workStatusTitle.html('')
              that.$workIdTitle.html(workIdTitle)
              if (workIdTitle != '') {
                that.$productNameTitle.html(workProductName)
              } else {
                that.$productNameTitle.html(productNameTitle)
              }
            } else {
              that.$workIdTitle.html('')
              that.$productNameTitle.html(productNameTitle)
            }
            dayTable.showWidget()
            that.loadingBtn.done()
            that.loadingBtn2.done()
          })
          .tryDuration(0)
          .start()
      },
      drawExcelTable: function (excelTable, queryType, isWork) {
        var that = this
        var result = []
        var resultData
        var params
        var workIdTitle,
          productNameTitle,
          statusTitle = [],
          workProductName
        if (queryType == 1) {
          params = {
            startDate: that.$startDate.val(),
            endDate: that.$endDate.val(),
            productIds: that.$productId.val(),
            status: [],
          }
        } else {
          params = {
            startDate: '',
            endDate: '',
            workId: that.commons.checkEscapeSymbol(that.$workId.val()),
          }
        }

        _.each(that.$workStatus, function (ele) {
          if ($(ele).prop('checked')) {
            if (ele.value === '999') {
              statusTitle.push(`${i18n('ServTrack_000097')}`)
              if (!isWork) {
                params.status.push('0')
                params.status.push('1')
              }
            } else {
              statusTitle.push(`${i18n('ServTrack_000093')}`)
              if (!isWork) {
                params.status.push(ele.value)
              }
            }
          }
        })

        servkit.ajax(
          {
            url: servkit.rootPath + '/api/jumpway/work-process/getWorkDetail',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (dbData) {
              _.map(dbData, function (data) {
                var subArray = []
                subArray.push(data.work_id)
                subArray.push(data.product_name)
                subArray.push(
                  moment(data.create_time).format('YYYY/MM/DD HH:mm:ss')
                )
                subArray.push(
                  data.first_move_in == null
                    ? `${i18n('ServTrack_000096')}`
                    : moment(data.first_move_in).format('YYYY/MM/DD HH:mm:ss')
                )
                subArray.push(data.e_quantity)
                subArray.push(data.last_go_quntity)
                subArray.push(
                  parseFloat(
                    (data.last_go_quntity / data.e_quantity) * 100
                  ).toFixed(2)
                )
                subArray.push(
                  data.status_id == 2
                    ? `${i18n('ServTrack_000099')}`
                    : `${i18n('ServTrack_000104')}`
                )
                subArray.push(data.op)
                subArray.push(data.go_quantity)
                subArray.push(data.responsibility_quantity)
                subArray.push(data.responsibility_quantity - data.go_quantity)
                subArray.push(
                  data.e_quantity - data.go_quantity < 0
                    ? '0'
                    : data.e_quantity - data.go_quantity
                )
                result.push(subArray)
              })
              resultData = result
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
        servkit
          .politeCheck()
          .until(function () {
            return resultData
          })
          .thenDo(function () {
            excelTable.drawTable(resultData)
            excelTable.hideWidget()
          })
          .tryDuration(0)
          .start()
      },
      drawModalProcessTable: function (params, modalProcessTable, productName) {
        //SRS:若該工序責任未完成量<0，已完成量以紅字顯示。
        function checkHightLightGoQty(respQty, goQty) {
          var diffValue = respQty - goQty
          if (diffValue < 0) {
            return '@@@(' + goQty
          } else {
            return '(' + goQty
          }
        }

        function getCurrentBalance(respQty, goQty) {
          var diffValue = respQty - goQty
          if (diffValue < 0) {
            return (
              '<font style="color:' +
              servkit.colors.red +
              ';">' +
              diffValue +
              '</font>'
            )
          } else {
            return diffValue
          }
        }
        var ctx = this
        var result = []
        var op2Amount = {}
        servkit.ajax(
          {
            url:
              servkit.rootPath +
              '/api/jumpway/work-process/getWorkProcessDetail',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (dbData) {
              _.map(dbData, function (data) {
                var subArray = []
                subArray.push(data.work_id)
                subArray.push(data.op + ',' + data.process_name)
                subArray.push(
                  data.current_line == null ? '--' : data.current_line
                )
                subArray.push(data.e_quantity)
                subArray.push(data.go_quantity)
                subArray.push(data.responsibility_quantity)
                subArray.push(
                  getCurrentBalance(
                    data.responsibility_quantity,
                    data.go_quantity
                  )
                )

                subArray.push(
                  data.e_quantity - data.go_quantity < 0
                    ? '0'
                    : data.e_quantity - data.go_quantity
                )
                var key = data.op + data.process_name
                op2Amount[key] =
                  data.op +
                  ',' +
                  data.process_name +
                  checkHightLightGoQty(
                    data.responsibility_quantity,
                    data.go_quantity
                  ) +
                  '/' +
                  data.e_quantity +
                  ')'
                result.push(subArray)
              })
              // resultData = result;
              modalProcessTable.drawTable(result)
              modalProcessTable.showWidget()

              ctx.processDatas(params, productName, op2Amount)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
        // servkit.politeCheck()
        //   .until(function () {
        //     return resultData;
        //   }).thenDo(function () {

        //   }).tryDuration(0)
        //   .start();
      },
    },
    preCondition: {
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
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('work_id', 'work_id')
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
      getProductList: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_product',
              columns: ['product_name', 'product_id'],
              whereClause: "is_open = 'Y'",
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.product_id] = elem.product_name
              })
              done(dataMap)
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
        '/js/plugin/flot/jquery.flot.symbol.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.dashes.min.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js', '/js/plugin/d3/d3.min.js'],
    ],
  })
}
