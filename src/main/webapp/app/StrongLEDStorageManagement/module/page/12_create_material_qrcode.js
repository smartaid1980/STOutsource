import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.detailReportTable = createReportTable({
        $tableElement: $('#detail-table'),
        $tableWidget: $('#detail-table-widget'),
        centerColumn: [8],
        hideCols: [0, 9],
        order: [[1, 'asc']],
        customBtns: [
          // 暫時把同步按鈕隱藏
          `<button id="synchronize" class="btn btn-primary">${i18n(
            'Refresh_Purchase_Order'
          )}</button>`,
          `<code id="sync-alert" class="note-error hide">${i18n(
            'Sync_Alert'
          )}</code>`,
          '<br>',
          `<span id="sync-info">${i18n(
            'Last_Synchronization_Time'
          )}：<span></span></span>`,
        ],
        serverSide: true, // 加上serverSide才可以用ajax畫
        ajax: function (data, callback, setting) {
          // 等到使用者觸發才會去畫欄位，此方法已脫離reporttable的機制(reporttable的callback會沒作用)
          console.log(setting)
          var out = []
          var temp = context.detailData
          if (
            data &&
            data.order &&
            data.order[0] &&
            data.order[0].column &&
            data.order[0].dir
          ) {
            temp.sort(function (a, b) {
              return servkit.naturalCompareValue(
                {
                  name: String(a[data.order[0].column]),
                },
                {
                  name: String(b[data.order[0].column]),
                }
              )
            })
            if (data.order[0].dir === 'desc') temp.reverse()
          }

          $(
            '#detail-table .hasinput>input[type=text], #detail-table .hasinput>select'
          ).each(function (index) {
            var value = this.value
            if (value) {
              if (this.nodeName === 'SELECT') {
                var regExSearch =
                  value === ''
                    ? ''
                    : '^' +
                      value.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                      '$'
                if (regExSearch) {
                  temp = temp.filter(function (row) {
                    return new RegExp(regExSearch).test(row[index + 1]) // 有隱藏一行
                  })
                }
              } else {
                temp = temp.filter(function (row) {
                  return String(row[index + 1]).indexOf(value) >= 0
                })
              }
            }
          })
          for (
            var i = data.start, ien = data.start + data.length;
            i < ien;
            i++
          ) {
            if (temp[i]) {
              out.push(temp[i])
            }
          }
          callback({
            draw: data.draw,
            data: out,
            recordsTotal: temp.length,
            recordsFiltered: temp.length,
          })
        },
      })
      context.basicReportTable = createReportTable({
        $tableElement: $('#basic-table'),
        $tableWidget: $('#basic-table-widget'),
        hideCols: [0],
        onDraw: function () {
          if (!context.basicTableDefault)
            if ($('#basic-table-widget .dt-toolbar').length) {
              $('#basic-table-widget .dt-toolbar').addClass('hide')
              $('#basic-table thead>tr:first').addClass('hide')
              $('#basic-table-widget .dt-toolbar-footer').addClass('hide')
              context.basicTableDefault = true
            }
        },
      })

      context.createCodeReportTable = createReportTable({
        $tableElement: $('#create-code-table'),
        $tableWidget: $('#create-code-table-widget'),
        checkbox: true,
        showNoData: false,
        customBtns: [
          `<span id="min">${i18n('Packing_Amount')}：<span></span></span>`,
          '<input type="text" id="min-input" class="form-control hide">',
          `<button id="change-min" class="btn btn-primary">${i18n(
            'Change_Min_Packing_Amount'
          )}</button>`,
          `<button id="min-cancel" class="btn btn-primary hide">${i18n(
            'Cancel'
          )}</button>`,
          `<button id="min-confirm" class="btn btn-primary hide">${i18n(
            'Confirm'
          )}</button>`,
          '<code id="min-alert" class="note-error"></code>',
          '<br>',
          `<span>${i18n('Generate_Qrcode')}：</span>`,
          `<button id="by-min" class="btn btn-success">${i18n(
            'Generated_With_Min_Packing_Amount'
          )}</button>`,
          `<button id="by-all" class="btn btn-success">${i18n(
            'Generated_A_Whole_Batch'
          )}</button>`,
          '<br>',
          `<button id="create" class="btn btn-primary">${i18n('Add')}</button>`,
          `<button id="reset" class="btn btn-primary">${i18n(
            'Reset'
          )}</button>`,
          `<button id="delete" class="btn btn-primary">${i18n(
            'Delete'
          )}</button>`,
          '<button id="print" class="btn bg-color-blueDark txt-color-white hide"><span class="fa fa-qrcode fa-lg"></span></button>',
        ],
        onDraw: function () {
          if (!context.createCodeTableDefault)
            if ($('#create-code-table-widget #delete').length) {
              context.confirmMinLoadingBtn = servkit.loadingButton(
                document.querySelector('#min-confirm')
              )
              context.toolbarEvent()
              servkit.downloadFile(
                '#print',
                '/api/storage/material/qrcode',
                function () {
                  var thingData = []
                  if (context.autoPrint)
                    _.each(
                      context.createCodeReportTable.table.rows()[0],
                      (index) => {
                        console.log(
                          context.createCodeReportTable.table.row(index).data()
                        )
                        thingData.push(
                          context.createCodeReportTable.table
                            .row(index)
                            .data()[4]
                        )
                      }
                    )
                  else
                    _.each(
                      context.createCodeReportTable.getSelectedRow(),
                      (tr) => thingData.push(tr[4])
                    )
                  return {
                    'thing_id[]': thingData,
                  }
                },
                'GET'
              )
              context.createCodeTableDefault = true
            }
          context.disableTableInput(context.disable)
          if (!context.create) {
            $('#print').attr('disabled', false)
            $(
              '#create-code-table-widget input, #create-code-table-widget select'
            ).attr('disabled', false)
            $('#create-code-table-widget')
              .find('.dt-toolbar-footer > div:last-child')
              .css({
                visibility: 'visible',
              })
          }
        },
      })
      context.updateSyncTime()

      $('#detail-table-widget').on('click', '#synchronize', function () {
        // 同步一下
        if (!context.detailTableDefault)
          if (document.querySelector('#synchronize')) {
            context.syncLoadingBtn = servkit.loadingButton(
              document.querySelector('#synchronize')
            )
            context.detailTableDefault = true
          }
        context.updateSyncTime(function (last) {
          console.log(last)
          if (new Date().getTime() - last.getTime() < 30 * 60 * 1000) {
            $('#sync-alert').removeClass('hide')
          } else {
            context.syncLoadingBtn.doing()
            $('#sync-alert').addClass('hide')
            servkit.ajax(
              {
                url: 'api/storage/erpsyn',
                type: 'GET',
              },
              {
                success: function (data) {
                  context.updateSyncTime()
                  context.syncLoadingBtn.done()
                  console.log('sync finished')
                  $('#query-btn').trigger('click')
                },
              }
            )
          }
        })
      })

      servkit.validateForm($('#query-form'), $('#query-btn'))
      $('#query-btn')
        .on('click', function (evt) {
          // 查詢
          evt.preventDefault()
          context.loadingBtn.doing()
          var status = $('[name=status]:checked').val()
          if (status === '2') status = `bill_status='0' or bill_status='1'`
          else status = `bill_status='${status}'`

          var demoData = [
            {
              bill_detail: '1',
              bill_no: 'WRK190319038',
              bill_date: '20190319',
              material_id: 'YF01-F-HM1-499-2835C-24X-WF2-03',
              ware_id: 'QY10',
              quantity: 212,
              delivery_date: '20190319',
              status: 0,
            },
            {
              bill_detail: '1',
              bill_no: 'WRK190319038',
              bill_date: '20190319',
              material_id: 'YF01-F-HM1-499-2835C-24X-WF2-04',
              ware_id: 'QY10',
              quantity: 212,
              delivery_date: '20190319',
              status: 0,
            },
            {
              bill_detail: '1',
              bill_no: 'WRK190319038',
              bill_date: '20190319',
              material_id: 'YF01-F-HM1-499-2835C-24X-WF2-05',
              ware_id: 'QY10',
              quantity: 212,
              delivery_date: '20190319',
              status: 1,
            },
          ]
          // servkit.ajax({
          //   url: 'api/getdata/db',
          //   type: 'POST',
          //   contentType: 'application/json',
          //   data: JSON.stringify({
          //     table: 'a_strongled_view_bill_stock_in_material_thing',
          //     columns: ['bill_detail', 'bill_from', 'bill_date', 'material_id', 'remark', 'ware_id', 'quantity', 'delivery_date', 'bill_status'],
          //     whereClause: `(${status}) and in_stock=0 group by bill_from`
          //   })
          // }, {
          //   success: function (data) {
          //     context.detailRenderTable(data)
          //     context.loadingBtn.done()
          //   }
          // })

          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table:
                  'a_strongled_view_material_thing_left_join_bill_stock_in',
                columns: [
                  'bill_detail',
                  'bill_no',
                  'bill_from',
                  'bill_date',
                  'material_id',
                  'remark',
                  'material_sub',
                  'quantity',
                  'delivery_date',
                  'bill_status',
                ],
                whereClause: `(${status}) and (in_stock=0 or in_stock is null) group by bill_no, bill_detail, material_sub`,
              }),
            },
            {
              success: function (data) {
                context.detailRenderTable(data)
                context.loadingBtn.done()
              },
            }
          )
        })
        .trigger('click')

      $('#detail-table')
        .on('click', '.create-code', function () {
          // 叫出建立條碼modal
          context.create = true
          context.codeList = []
          context.disable = true
          context.createPrintloadingBtn.done()
          context.createloadingBtn.done()
          context.createModalData(this, true)
          $('#create-code-modal .modal-footer').removeClass('hide')
        })
        .on('click', '.reprint', function () {
          // 叫出列印條碼modal
          context.create = false
          $('#create-code-modal .modal-footer').addClass('hide')
          var dom = this
          var rowData = context.detailReportTable.table
            .row(dom.closest('tr'))
            .data()
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table:
                  'a_strongled_view_material_thing_left_join_bill_stock_in',
                columns: ['code_no', 'thing_id', 'thing_pcs', 'thing_unit'],
                whereClause: `material_id='${rowData[3]}' and bill_no='${rowData[1]}' and bill_detail='${rowData[0]}'`,
              }),
            },
            {
              success: function (data) {
                context.codeList = []
                context.disable = false
                _.each(data, (val) =>
                  context.codeList.push([
                    val.code_no,
                    val.thing_pcs,
                    val.thing_unit,
                    `<button class="btn btn-success edit">${i18n(
                      'Edit'
                    )}</button>`,
                    val.thing_id,
                  ])
                )
                context.createModalData(dom, false, function () {
                  $('#print').attr('disabled', false)
                  $(
                    '#create-code-table-widget input, #create-code-table-widget select'
                  ).attr('disabled', false)
                  $('#create-code-table-widget')
                    .find('.dt-toolbar-footer > div:last-child')
                    .css({
                      visibility: 'visible',
                    })
                  $('#create-code-modal').modal('show')
                })
              },
            }
          )
        })

      $('#create-code-table')
        .on('click', '.confirm', function () {
          var $row = $(this).closest('tr')
          var index = Number($row.find('td:eq(1)').text())
          var quantity = $row.find('td:eq(2) input').val()
          if (!quantity || isNaN(Number(quantity))) {
            if (!$row.find('td:eq(2) code').length)
              $row
                .find('td:eq(2)')
                .append(
                  `<code class="note-error">${i18n(
                    'Positive_Integer_Alert'
                  )}</code>`
                )
          } else {
            if ($row.find('td:eq(2) code').length)
              $row.find('td:eq(2) code').remove()
            context.codeList[index - 1] = [
              index,
              Number(quantity),
              $row.find('td:eq(3) input').val(),
              `<button class="btn btn-success edit">${i18n('Edit')}</button>`,
            ]
            context.createCodeRenderTable()
            context.disableTableInput(true)
            $('#create-and-print').attr('disabled', false)
            $('#create-without-print').attr('disabled', false)
          }
        })
        .on('click', '.edit', function () {
          var $row = $(this).closest('tr')
          var index = Number($row.find('td:eq(1)').text())
          var quantity = context.codeList[index - 1][1]
          var unit = context.codeList[index - 1][2]
          context.codeBuffer = context.codeList[index - 1]
          context.codeList[index - 1] = [
            index,
            '<input type="text" class="form-control quantity">',
            '<input type="text" class="form-control unit">',
            `<button class="btn btn-primary confirm">${i18n(
              'Confirm'
            )}</button>`,
          ]
          context.createCodeRenderTable()
          context.disableTableInput(false)
          var $newRow = $(`#create-code-table>tbody tr:eq(${index - 1})`)
          $newRow
            .find('td:eq(0)')
            .html(
              '<button class="btn btn-xs btn-danger cancel"><i class="fa fa-times"></i></button>'
            )
          $newRow.find('.quantity').val(quantity)
          $newRow.find('.unit').val(unit)
          $newRow.find('input, button').attr('disabled', false)
          $('#create-and-print').attr('disabled', true)
          $('#create-without-print').attr('disabled', true)
        })
        .on('click', '.cancel', function () {
          var $row = $(this).closest('tr')
          var index = Number($row.find('td:eq(1)').text())
          if (context.codeBuffer)
            context.codeList[index - 1] = context.codeBuffer
          else context.codeList.splice(index - 1, 1)
          context.disable = true
          context.createCodeRenderTable()
          $('#create-and-print').attr('disabled', false)
          $('#create-without-print').attr('disabled', false)
        })
        .on('keydown', '.quantity, .unit', function (e) {
          if (e.which === 13) {
            $(this).closest('tr').find('.confirm').trigger('click') // 觸發新增
            return false // 擋住預設行為
          }
        })

      $('#create-and-print').on('click', function () {
        context.checkQuantity('createPrintloadingBtn', function () {
          context.autoPrint = true
          $('#print').trigger('click')
          context.createPrintloadingBtn.done()
          $('#create-code-modal').modal('hide')
          $('#query-btn').trigger('click')
        })
      })
      $('#create-without-print').on('click', function () {
        context.checkQuantity('createloadingBtn', function () {
          context.createloadingBtn.done()
          $('#create-code-modal').modal('hide')
          $('#query-btn').trigger('click')
        })
      })
    },
    util: {
      quantity: 0,
      min: 100,
      unit: '',
      codeList: [],
      disable: true,
      create: true,
      detailData: [],
      detailTableDefault: false,
      basicTableDefault: false,
      createCodeTableDefault: false,
      codeBuffer: null,
      loadingBtn: servkit.loadingButton(document.querySelector('#query-btn')),
      syncLoadingBtn: null,
      confirmMinLoadingBtn: null,
      createPrintloadingBtn: servkit.loadingButton(
        document.querySelector('#create-and-print')
      ),
      createloadingBtn: servkit.loadingButton(
        document.querySelector('#create-without-print')
      ),
      autoPrint: false,
      detailReportTable: null,
      detailRenderTable: function (data) {
        var ctx = this
        ctx.detailData = _.map(data, (val) => {
          var status = '---'
          if (val.bill_status === 0)
            status = `<button class="btn btn-success create-code">${i18n(
              'Generate_Qrcode'
            )}</buttton>`
          else if (val.bill_status === 1)
            status = `<button class="btn btn-primary reprint">${i18n(
              'Reprint_Qrcode'
            )}</buttton>`
          return [
            val.bill_detail || '---',
            val.bill_no || '---',
            val.bill_date || '---',
            val.material_id || '---',
            val.remark || '---',
            !val.material_sub || val.material_sub === '0000'
              ? '---'
              : val.material_sub,
            val.quantity || '---',
            val.delivery_date || '---',
            status,
            val.material_sub,
          ]
        })
        if (ctx.detailReportTable) {
          ctx.detailReportTable.appendTable(ctx.detailData, [])
          ctx.detailReportTable.table.draw()
        }
      },
      basicReportTable: null,
      basicRenderTable: function (data) {
        this.basicReportTable.drawTable(data)
      },
      createCodeReportTable: null,
      createCodeRenderTable: function () {
        this.createCodeReportTable.drawTable(this.codeList)
      },
      createModalData: function (dom, disable, cb) {
        var ctx = this
        ctx.basicRenderTable([
          ctx.detailReportTable.table.row(dom.closest('tr')).data(),
        ]) // 進貨單基本資料

        ctx.quantity = Number(
          $(dom).closest('tr').find('td:nth-child(6)').text()
        )
        var prodId = $(dom).closest('tr').find('td:nth-child(3)').text()
        servkit.ajax(
          {
            url: `api/storage/material?whereclause=ProdID='${prodId}'`,
            type: 'GET',
          },
          {
            success: function (data) {
              if (data.length && data[0]) {
                if (data[0].base_inc) ctx.min = Number(data[0].base_inc)
                if (data[0].unit) ctx.unit = data[0].unit
              }
              $('#min>span').text(ctx.min)
              ctx.createCodeRenderTable()
              ctx.disableTableInput(ctx.disable)
              // ctx.createCodeReportTable.table.columns([3]).visible(disable)
              if (disable) $('#print').addClass('hide')
              else $('#print').removeClass('hide')
              if (cb) cb()
              else $('#create-code-modal').modal('show')
            },
          }
        )
      },
      changeMode: function (doms) {
        _.each(doms, (dom) => {
          var $dom = $(dom)
          if ($dom.hasClass('hide')) $dom.removeClass('hide')
          else $dom.addClass('hide')
        })
      },
      updateSyncTime: function (cb) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_synctime_stock_in',
              columns: ['sync_start'],
              whereClause: `sync_start IN (SELECT max(sync_start) FROM a_strongled_synctime_stock_in)`,
            }),
          },
          {
            success: function (data) {
              if (data && data[0]) {
                var last = new Date(data[0].sync_start)
                $('#sync-info>span').text(
                  moment(last).format('YYYY-MM-DD HH:mm:ss')
                )
                if (cb) cb(last)
              }
            },
          }
        )
      },
      disableTableInput: function (able) {
        $('#create-code-table-widget')
          .find('input, button, select')
          .attr('disabled', !able)
        if (!able)
          $('#create-code-table-widget')
            .find('.dt-toolbar-footer > div:last-child')
            .css({
              visibility: 'hidden',
            })
        else
          $('#create-code-table-widget')
            .find('.dt-toolbar-footer > div:last-child')
            .css({
              visibility: 'visible',
            })
      },
      toolbarEvent: function () {
        var ctx = this
        $('#change-min').on('click', function () {
          // 切換最小包裝數(顯示編輯模式)
          $('#min-input').val($('#min>span').text())
          ctx.changeMode([
            '#min>span',
            '#change-min',
            '#min-input',
            '#min-cancel',
            '#min-confirm',
          ])
        })
        $('#min-cancel').on('click', function () {
          // 取消修改最小包裝數
          $('#min-alert').text('')
          ctx.changeMode([
            '#min>span',
            '#change-min',
            '#min-input',
            '#min-cancel',
            '#min-confirm',
          ])
        })
        $('#min-confirm').on('click', function () {
          // 確認修改最小包裝數
          if (isNaN($('#min-input').val()))
            $('#min-alert').text(`${i18n('Positive_Integer_Alert')}`)
          else {
            ctx.confirmMinLoadingBtn.doing()
            ctx.min = Number($('#min-input').val())
            $('#min-alert').text('')
            $('#min>span').text(ctx.min)
            ctx.changeMode([
              '#min>span',
              '#change-min',
              '#min-input',
              '#min-cancel',
              '#min-confirm',
            ])
            ctx.confirmMinLoadingBtn.done()
          }
        })

        $('#by-min').on('click', function () {
          ctx.codeList = []
          var last = 0
          if (ctx.min) {
            for (var index = ctx.min; index < ctx.quantity; index += ctx.min) {
              last = index
              ctx.codeList.push([
                ctx.codeList.length + 1,
                ctx.min,
                ctx.unit || '',
                `<button class="btn btn-success edit">${i18n('Edit')}</button>`,
              ])
            }
            if (last < ctx.quantity)
              ctx.codeList.push([
                ctx.codeList.length + 1,
                ctx.quantity - last,
                ctx.unit || '',
                `<button class="btn btn-success edit">${i18n('Edit')}</button>`,
              ])
          }
          ctx.createCodeRenderTable()
          ctx.disableTableInput(true)
        })
        $('#by-all').on('click', function () {
          ctx.codeList = [
            [
              1,
              ctx.quantity,
              ctx.unit || '',
              `<button class="btn btn-success edit">${i18n('Edit')}</button>`,
            ],
          ]
          ctx.createCodeRenderTable()
          ctx.disableTableInput(true)
        })

        $('#create').on('click', function () {
          ctx.codeBuffer = null
          ctx.codeList.push([
            ctx.codeList.length + 1,
            '<input type="text" class="form-control quantity">',
            '<input type="text" class="form-control unit">',
            `<button class="btn btn-primary confirm">${i18n(
              'Confirm'
            )}</button>`,
          ])
          ctx.disable = false
          ctx.createCodeRenderTable()
          var index = ctx.codeList.length // 所有資料有幾筆
          var table = ctx.createCodeReportTable.table // 拿到這個table的datatables物件
          table
            .page(
              index % table.page.len() === 0
                ? Math.floor(index / table.page.len()) - 1
                : Math.floor(index / table.page.len())
            )
            .draw(false) // 換頁
          var $newRow = $(
            `#create-code-table>tbody tr:eq(${(index % table.page.len()) - 1})`
          )
          $('#create-code-modal').animate(
            {
              scrollTop: $newRow.find('td').offset().top,
            },
            1000
          )
          $newRow
            .find('td:eq(0)')
            .html(
              '<button class="btn btn-xs btn-danger cancel"><i class="fa fa-times"></i></button>'
            )
          $newRow.find('input, button').attr('disabled', false)
          $('#create-and-print').attr('disabled', true)
          $('#create-without-print').attr('disabled', true)
        })
        $('#reset').on('click', function () {
          ctx.codeList = []
          ctx.createCodeRenderTable()
          ctx.disableTableInput(true)
        })
        $('#delete').on('click', function () {
          _.each(ctx.createCodeReportTable.getSelectedRow(), (val) => {
            var index = _.findIndex(ctx.codeList, (codeValue) => {
              return codeValue[0] === val[0]
            })
            ctx.codeList.splice(index, 1)
          })
          _.each(ctx.codeList, (val, key) => (val[0] = key + 1))
          ctx.createCodeRenderTable()
          ctx.disableTableInput(true)
        })
      },
      checkQuantity: function (btuName, cb) {
        var ctx = this
        var total = 0
        _.each(ctx.codeList, (val) => (total += Number(val[1])))
        if (total !== ctx.quantity) {
          if (!$('#quantity-alert').length)
            $('#create-code-table-widget').append(
              `<code id="quantity-alert" class="note-error">${i18n(
                'Total_Not_Equal_quantity'
              )}</code>`
            )
        } else {
          if ($('#quantity-alert').length) $('#quantity-alert').remove()
          ctx[btuName].doing()
          var docData = ctx.basicReportTable.table.row(0).data()
          var sendData = {
            bill_no: String(docData[1]),
            bill_detail: String(docData[0]),
            material_id: String(docData[3]),
            material_sub: String(docData[9]),
            remark: String(docData[4]),
            delivery_date: String(docData[7]),
            groups: [],
          }
          _.each(ctx.codeList, (val) =>
            sendData.groups.push({
              code_no: String(val[0]),
              thing_pcs: String(val[1]),
              thing_unit: String(val[2]),
            })
          )
          servkit.ajax(
            {
              url: 'api/storage/material',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(sendData),
            },
            {
              success: function (data) {
                console.log(data)
                _.each(data, (val) => {
                  var index = _.findIndex(ctx.codeList, (codeData) => {
                    return (
                      String(codeData[0]) === val.code_no &&
                      String(codeData[1]) === val.thing_pcs &&
                      String(codeData[2]) === val.thing_unit
                    )
                  })
                  if (index >= 0) ctx.codeList[index].push(val.thing_id)
                })
                if (cb) cb()
                else $('#create-code-modal').modal('hide')
              },
            }
          )
        }
      },
    },
    preCondition: {
      getMaterial: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_material',
              columns: ['material_id', 'material_name'],
            }),
          },
          {
            success: function (data) {
              var materialData = {}
              _.each(
                data,
                (elem) => (materialData[elem.material_id] = elem.material_name)
              )
              done(materialData)
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
    ],
  })
}
