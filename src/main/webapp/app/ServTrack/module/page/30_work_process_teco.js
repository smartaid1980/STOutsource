import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()
      ctx.initFuncs(ctx)
      ctx.initElements(ctx)
      var complexQuery = 1,
        workIdQuery = 2

      var dayTable = createReportTable({
        $tableElement: $('#date-table'),
        $tableWidget: $('#date-table-widget'),
        order: [[4, 'asc']],
        rightColumn: [2, 3],
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
            return _.filter(tableHeader, function (num, index) {
              var columnList = [0, 1, 2, 3, 4, 5, 6, 7, 8]
              var findIndex = _.find(columnList, (val) => {
                return index == val
              })
              return findIndex !== undefined
            })
          },
          customDataFunc: function (tableData) {
            var cloneTableData = $.extend(true, {}, tableData)
            return _.map(cloneTableData, function (elem) {
              return _.filter(elem, function (num, index) {
                var columnList = [0, 1, 2, 3, 4, 5, 6, 7, 8]
                var findIndex = _.find(columnList, (val) => {
                  return index == val
                })
                return findIndex !== undefined
              })
            })
          },
        },
      })
      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[ctx.appId][ctx.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2017/09/01',
          endDate: '2017/09/30',
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
      })

      ctx.$dateTable.on('click', '[name=process]', function (evt) {
        evt.preventDefault()
        var params = {
          workId: ctx.commons.checkEscapeSymbol($(this).attr('value')),
        }
        ctx.processDatas(params)
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
        ctx.$productId.html(ctx.productFunc.getSelect())
        ctx.$productId.prop('selectedIndex', -1)
        ctx.$workId.html(ctx.workFunc.getSelect())
        ctx.$workId.prop('selectedIndex', -1)
        servkit.validateForm($('#form1'), ctx.$submitBtn)
        servkit.validateForm($('#form2'), ctx.$submitBtn2)
      },
      processDatas: function (params) {
        var that = this
        var resultData
        var workId = params.workId
        var work_duration
        var work_go_quantity
        servkit.ajax(
          {
            url:
              servkit.rootPath + '/api/teco/servtrack/work-process/readprocess',
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
                var workItem = {
                  workId: data.work_id,
                  id: i,
                  name: 'work item ' + i,
                  lane: data.op + ',' + data.process_name,
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
            productId: that.commons.checkEscapeSymbol(that.$productId.val()),
            status: [],
          }
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
        productNameTitle =
          that.$productId.val() == null
            ? ''
            : that.preCon.products.getName(that.$productId.val())

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
            url:
              servkit.rootPath +
              '/api/teco/servtrack/work-process/readtracking',
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
                subArray.push(data.e_quantity)
                subArray.push(data.input)
                subArray.push(
                  moment(data.create_time).format('YYYY/MM/DD HH:mm:ss')
                )
                subArray.push(data.user_name)
                subArray.push(
                  data.first_move_in == null
                    ? `${i18n('ServTrack_000096')}`
                    : moment(data.first_move_in).format('YYYY/MM/DD HH:mm:ss')
                )
                subArray.push(
                  data.op == undefined
                    ? '--'
                    : data.op + ', ' + data.process_name
                )
                subArray.push(
                  data.status_id == 2
                    ? `${i18n('ServTrack_000099')}`
                    : `${i18n('ServTrack_000104')}`
                )
                subArray.push(
                  `<button class="btn btn-primary" name="process" title="${i18n(
                    'ServTrack_000045'
                  )}" value="` +
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
