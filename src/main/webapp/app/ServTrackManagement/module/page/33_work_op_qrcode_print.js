import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import { fetchDbData } from '../../../../js/servtech/module/servkit/ajax.js'
import { initSelect2WithData } from '../../../../js/servtech/module/servkit/form.js'

export default async function () {
  const productMap = await fetchDbData('a_servtrack_product', {
    columns: ['product_id', 'product_name'],
  }).then((data) =>
    Object.fromEntries(
      data.map(({ product_id, product_name }) => [product_id, product_name])
    )
  )
  const workIdList = await fetchDbData('a_servtrack_work', {
    columns: ['work_id'],
  }).then((data) => _.pluck(data, 'work_id'))
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()
      ctx.initFuncs(ctx)
      ctx.initElements(ctx)
      ctx.reportTable = createReportTable({
        $tableWidget: ctx.$workTableWidget,
        $tableElement: ctx.$workTable,
        rightColumn: [5, 6, 7],
        order: [[1, 'asc']],
        showNoData: false,
        checkbox: true,
        customBtns: [
          "<button class='btn bg-color-blueDark txt-color-white stk-qrcode-btn' title='print QRCode'><span class='fa fa-qrcode fa-lg'></span></button>",
        ],
      })
      ctx.reportTable.table.column(1).visible(false)

      ctx.$submit
        .on('click', function (evt) {
          evt.preventDefault()
          ctx.drawTable()
        })
        .trigger('click')
      $('.stk-check-all').on('click', function (evt) {
        evt.stopPropagation()
        if ($(this).prop('checked')) {
          _.each(ctx.$workTable.find('tbody > tr'), function (trEle) {
            $(trEle).find('td:first-child input').prop('checked', true)
          })
        } else {
          _.each(ctx.$workTable.find('tbody > tr'), function (trEle) {
            $(trEle).find('td:first-child input').prop('checked', false)
          })
        }
      })

      ctx.$workBody.on('click', '.stk-qrcode-btn', function (evt) {
        evt.preventDefault()
        var trEleArr = []
        var data = ctx.reportTable.getSelectedRow()
        for (let row = 0; row < data.length; row++) {
          trEleArr.push({
            work_id: data[row][0],
            op: data[row][3],
          })
        }
        if (data.length !== 0) {
          ctx.getQRCodedocx(
            ctx.formatParam(
              _.groupBy(trEleArr, function (obj) {
                return obj.work_id
              })
            )
          )
        }
      })
    },
    util: {
      reportTable: null,
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $workId: $('#work-id'),
      $productId: $('#product-id'),
      $submit: $('#submit-btn'),
      $workTableWidget: $('#work-table-widget'),
      $workTable: $('#work-table'),
      $workBody: $('#work-table-body'),
      $Forms: $('#stk-file'),
      formatParam: function (paramObj) {
        var works = {}
        _.each(_.keys(paramObj), function (key) {
          works[key] = []
          _.each(paramObj[key], function (obj) {
            works[key].push(obj.op)
          })
        })
        return works
      },
      drawTable: function () {
        var that = this
        var loadingBtn = servkit.loadingButton(
          document.querySelector('#submit-btn')
        )
        loadingBtn.doing()
        var startDate = this.$startDate.val()
        var endDate = this.$endDate.val()
        var workId = that.commons.checkEscapeSymbol(this.$workId.val())
        var productId = that.commons.checkEscapeSymbol(this.$productId.val())
        var table = that.reportTable
        that.tableData = table.table
        try {
          servkit.ajax(
            {
              url: 'api/servtrack/workop/getworks',
              type: 'GET',
              data: {
                startDate: startDate,
                endDate: endDate,
                workId: workId,
                productId: productId,
              },
            },
            {
              success: function (data) {
                var result = _.map(data, function (obj) {
                  return [
                    obj.work_id,
                    obj.product_id,
                    obj.product_name,
                    obj.op,
                    obj.process_name,
                    parseFloat(obj.std_hour).toFixed(4),
                    obj.e_quantity,
                    obj.input,
                    obj.create_time,
                    obj.user_name,
                    obj.remark || '',
                  ]
                })
                table.drawTable(result)
                if (result.length === 0) {
                  table.clearTable()
                }
                _.each(that.$workTable.prev().find('.hidden-xs'), function (
                  ele
                ) {
                  $(ele).css('display', 'none')
                })
                table.showWidget()
              },
            }
          )
        } catch (e) {
          console.warn(e)
        } finally {
          loadingBtn.done()
        }
      },
      getQRCodedocx: function (works) {
        var that = this
        var uuid = that.commons.uuidGenerator(32)
        if (!works) {
          $.smallBox({
            title: `${i18n('ServTrackManagement_000003')}`,
            content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
            color: '#C79121',
            iconSmall: 'fa fa-warning shake animated',
            timeout: 2000,
          })
        } else {
          $.smallBox({
            title: 'Please Wait...',
            content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
            color: '#739E73',
            iconSmall: 'fa fa-warning shake animated',
            timeout: 2000,
          })

          var $submitForm = $('<form name="' + uuid + '""></form>')
          var iframeHtml =
            '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;""></iframe>'
          $submitForm.append(
            $('<input>').attr('name', 'works').val(JSON.stringify(works))
          )
          $submitForm.append($('<input>').attr('name', 'uuid').val(uuid))
          $submitForm.attr({
            action: 'api/servtrack/workop/printQRCode',
            method: 'post',
            target: 'download_target',
          })

          that.$Forms.append($submitForm.hide())
          $submitForm.append(iframeHtml)

          document.querySelector('[name="' + uuid + '"]').submit()
        }
      },
      initFuncs: function (ctx) {
        if (ctx.preCon.products) {
          ctx['productFunc'] = ctx.preCon.products
        }
        if (ctx.preCon.works) {
          ctx['workFunc'] = ctx.preCon.works
        }

        if (ctx.preCon.process) {
          ctx['processFunc'] = ctx.preCon.process
        }
      },
      initElements: function (ctx) {
        servkit.initDatePicker(ctx.$startDate, ctx.$endDate, true)
        // ctx.$productId.html(ctx.productFunc.getSelect())
        // ctx.$productId.prop('selectedIndex', -1)
        initSelect2WithData(ctx.$productId, productMap, true, {
          minimumInputLength: 0,
          placeholder: '產品名稱',
          allowClear: true,
        })
        // ctx.$workId.html(ctx.workFunc.getSelect())
        // ctx.$workId.prop('selectedIndex', -1)
        initSelect2WithData(ctx.$workId, workIdList, true, {
          minimumInputLength: 0,
          placeholder: '派工單號',
          allowClear: true,
        })
        servkit.validateForm($('#main-form'), ctx.$submit)
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
    preCondition: {
      // products: function (done) {
      //   var that = this
      //   servkit.ajax(
      //     {
      //       url: servkit.rootPath + '/api/getdata/db',
      //       type: 'POST',
      //       contentType: 'application/json',
      //       data: JSON.stringify({
      //         table: 'a_servtrack_product',
      //         columns: ['product_id', 'product_name', 'is_open'],
      //       }),
      //     },
      //     {
      //       success: function (data) {
      //         var func = that.commons.initializeDBData(data)
      //         func.init('product_id', 'product_name')
      //         done(func)
      //       },
      //       fail: function (data) {
      //         console.warn(data)
      //       },
      //     }
      //   )
      // },
      // works: function (done) {
      //   var that = this
      //   servkit.ajax(
      //     {
      //       url: servkit.rootPath + '/api/getdata/db',
      //       type: 'POST',
      //       contentType: 'application/json',
      //       data: JSON.stringify({
      //         table: 'a_servtrack_work',
      //         columns: ['work_id'],
      //       }),
      //     },
      //     {
      //       success: function (data) {
      //         var func = that.commons.initializeDBData(data)
      //         func.init('work_id', 'work_id')
      //         done(func)
      //       },
      //       fail: function (data) {
      //         console.warn(data)
      //       },
      //     }
      //   )
      // },
      process: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: ['process_code', 'process_name', 'is_open'],
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('process_code', 'process_name')
              done(func)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
    },
  })
}
