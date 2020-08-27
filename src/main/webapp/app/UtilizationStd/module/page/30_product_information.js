import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.deviceNameFunc = ctx.preCon.deviceName
      ctx.initElements(ctx)
      ctx.initEvents(ctx)

      ctx.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [6, 7],
        onRow: function (row, data) {
          $(row).find('td').eq(9).css('display', 'none')
        },
      })

      if (new Date() - new Date(sessionStorage.loginTime) < 5000) {
        ctx.$submitBtn.click()
      }
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      $tableElement: $('#table'),
      $modalProductDate: $('#modal-product-date'),
      $modalProductMachineId: $('#modal-product-machine-id'),
      $modalproductWorkShift: $('#modal-product-work-shift'),
      $modalProductStaffName: $('#modal-product-staff-name'),
      $modalProductOrderId: $('#modal-product-order-id'),
      $modalProductPartId: $('#modal-product-part-id'),
      $modalProductStandardHours: $('#modal-product-standard-hours'),
      $modalProductRejectedQty: $('#modal-product-rejected-qty'),
      $modalProductSubmit: $('#modal-submit-btn'),
      $crudTableModal: $('#crud-table-modal'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      getData: function () {
        var that = this
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          ctx = this,
          dataMap = {},
          params = {
            startDate: this.$startDate.val(),
            endDate: this.$endDate.val(),
            machineList: machineList,
          }
        servkit.ajax(
          {
            url: 'api/cosmos/product/read',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
          },
          {
            success: function (data) {
              _.map(data, function (elem) {
                var key = elem.date + elem.machine_id + elem.work_shift
                var subMap = {}
                subMap['staff_name'] = elem.staff_name
                subMap['order_id'] = elem.order_id
                subMap['part_id'] = elem.part_id
                subMap['std_hours'] = elem.std_hours
                subMap['ng_quantity'] = elem.ng_quantity
                dataMap[key] = subMap
              })
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )

        servkit
          .politeCheck()
          .until(function () {
            return dataMap
          })
          .thenDo(function () {
            hippo
              .newSimpleExhaler()
              .space('utilization_time_detail')
              .index('machine_id', machineList)
              .indexRange('date', ctx.$startDate.val(), ctx.$endDate.val())
              .columns('machine_id', 'date', 'work_shift')
              .exhale(function (exhalable) {
                var compareKey = {}
                var tableData = []
                _.map(exhalable.exhalable, function (elem) {
                  var key = elem.date + elem.machine_id + elem.work_shift
                  if (compareKey[key] == null) {
                    compareKey[key] = key
                    var subArray = [
                      //日期
                      elem.date,
                      //機台
                      servkit.getMachineName(elem.machine_id),
                      //班次
                      elem.work_shift,
                      //員工名稱
                      dataMap[key] == null ? '' : dataMap[key].staff_name,
                      //訂單編號
                      dataMap[key] == null ? '' : dataMap[key].order_id,
                      //零件編號
                      dataMap[key] == null ? '' : dataMap[key].part_id,
                      //標工
                      dataMap[key] == null ? '' : dataMap[key].std_hours,
                      //不良品數
                      dataMap[key] == null ? '' : dataMap[key].ng_quantity,
                      //編輯
                      ctx.buttons.editBtn,
                      //隱藏欄位判斷資料庫有無填寫資料
                      dataMap[key] == null ? true : false,
                    ]
                    tableData.push(subArray)
                  }
                })
                ctx.reportTable.drawTable(tableData)
                loadingBtn.done()
              })
          })
          .tryDuration(0)
          .start()
      },
      initElements: function (ctx) {
        servkit.initDatePicker(ctx.$startDate, ctx.$endDate)
        servkit.initMachineSelect(ctx.$machineSelect, true)
        servkit.validateForm($('#main-form'), ctx.$submitBtn)
        ctx['buttons'] = {}
        ctx.buttons.editBtn = `<button class="btn btn-primary stk-edit-btn" title="${i18n(
          'Edit'
        )}" style="margin-right:5px">${i18n('Edit')}</button>`
      },
      initEvents: function (ctx) {
        var that = this
        ctx.$submitBtn.on('click', function (evt) {
          evt.preventDefault()
          ctx.loadingBtn.doing()
          try {
            ctx.getData()
          } catch (e) {
            ctx.loadingBtn.done()
          }
        })

        ctx.$tableElement.on('click', '.stk-edit-btn', function (evt) {
          evt.preventDefault()
          ctx['updateTarget'] = this.parentNode.parentNode
          var date = $(this).parent().parent().find('td').eq(0).text()
          var machine_id = $(this).parent().parent().find('td').eq(1).text()
          var work_shift = $(this).parent().parent().find('td').eq(2).text()
          var staff_name = $(this).parent().parent().find('td').eq(3).text()
          var order_id = $(this).parent().parent().find('td').eq(4).text()
          var part_id = $(this).parent().parent().find('td').eq(5).text()
          var std_hours = $(this).parent().parent().find('td').eq(6).text()
          var ng_quantity = $(this).parent().parent().find('td').eq(7).text()
          ctx.$modalProductDate.val(date)
          ctx.$modalProductMachineId.val(machine_id)
          ctx.$modalproductWorkShift.val(work_shift)
          ctx.$modalProductStaffName.val(staff_name)
          ctx.$modalProductOrderId.val(order_id)
          ctx.$modalProductPartId.val(part_id)
          ctx.$modalProductStandardHours.val(std_hours)
          ctx.$modalProductRejectedQty.val(ng_quantity)

          ctx.$crudTableModal.modal('toggle')
          ctx.$modalProductDate.prop('disabled', true)
          ctx.$modalProductMachineId.prop('disabled', true)
          ctx.$modalproductWorkShift.prop('disabled', true)
          $('.note-error').remove()
        })

        ctx.$modalProductSubmit.on('click', function (evt) {
          evt.preventDefault()
          ctx.removeErrorCode(ctx.$modalProductStaffName, 'section')
          ctx.removeErrorCode(ctx.$modalProductOrderId, 'section')
          ctx.removeErrorCode(ctx.$modalProductPartId, 'section')
          ctx.removeErrorCode(ctx.$modalProductStandardHours, 'section')
          ctx.removeErrorCode(ctx.$modalProductRejectedQty, 'section')

          var date = ctx.$modalProductDate.val().toString()
          var machine_id = ctx.$modalProductMachineId.val().toString()
          var work_shift = ctx.$modalproductWorkShift.val().toString()
          var staff_name = ctx.$modalProductStaffName.val().toString()
          var order_id = ctx.$modalProductOrderId.val().toString()
          var part_id = ctx.$modalProductPartId.val().toString()
          var std_hours = ctx.$modalProductStandardHours.val()
          var ng_quantity = ctx.$modalProductRejectedQty.val()

          var errorCount = 0
          if (staff_name.length > 50) {
            ctx.appendErrorCode(
              ctx.$modalProductStaffName,
              'section',
              `${i18n('Max_Value_50')}`
            )
            errorCount++
          } else if (!staff_name) {
            ctx.appendErrorCode(
              ctx.$modalProductStaffName,
              'section',
              `${i18n('Required')}`
            )
            errorCount++
          } else {
            ctx.removeErrorCode(ctx.$modalProductStaffName, 'section')
          }

          if (order_id.length > 20) {
            ctx.appendErrorCode(
              ctx.$modalProductOrderId,
              'section',
              `${i18n('Max_Value_20')}`
            )
            errorCount++
          } else if (!order_id) {
            ctx.appendErrorCode(
              ctx.$modalProductOrderId,
              'section',
              `${i18n('Required')}`
            )
            errorCount++
          } else {
            ctx.removeErrorCode(ctx.$modalProductOrderId, 'section')
          }

          if (part_id.length > 20) {
            ctx.appendErrorCode(
              ctx.$modalProductPartId,
              'section',
              `${i18n('Max_Value_20')}`
            )
            errorCount++
          } else if (!part_id) {
            ctx.appendErrorCode(
              ctx.$modalProductPartId,
              'section',
              `${i18n('Required')}`
            )
            errorCount++
          } else {
            ctx.removeErrorCode(ctx.$modalProductPartId, 'section')
          }

          if (std_hours.length > 10) {
            ctx.appendErrorCode(
              ctx.$modalProductStandardHours,
              'section',
              `${i18n('Max_Value_10')}`
            )
            errorCount++
          } else if (!std_hours) {
            ctx.appendErrorCode(
              ctx.$modalProductStandardHours,
              'section',
              `${i18n('Required')}`
            )
            errorCount++
          } else if (isNaN(std_hours)) {
            ctx.appendErrorCode(
              ctx.$modalProductStandardHours,
              'section',
              `${i18n('Valid_Number')}`
            )
            errorCount++
          } else {
            ctx.removeErrorCode(ctx.$modalProductStandardHours, 'section')
          }
          if (ng_quantity.length > 10) {
            ctx.appendErrorCode(
              ctx.$modalProductRejectedQty,
              'section',
              `${i18n('Max_Value_10')}`
            )
            errorCount++
          } else if (!ng_quantity) {
            ctx.appendErrorCode(
              ctx.$modalProductRejectedQty,
              'section',
              `${i18n('Required')}`
            )
            errorCount++
          } else if (isNaN(ng_quantity)) {
            ctx.appendErrorCode(
              ctx.$modalProductRejectedQty,
              'section',
              `${i18n('Valid_Number')}`
            )
            errorCount++
          } else {
            ctx.removeErrorCode(ctx.$modalProductRejectedQty, 'section')
          }
          if (errorCount > 0) {
            return false
          }
          var params = {
            date: date,
            machine_id: that.deviceNameFunc.getName(machine_id),
            work_shift: work_shift,
            staff_name: staff_name,
            order_id: order_id,
            part_id: part_id,
            std_hours: std_hours,
            ng_quantity: ng_quantity,
          }

          var isInsert = $(ctx.updateTarget).find('td').eq(9).text()
          if (isInsert == 'true') {
            ctx.insertProduct(ctx.updateTarget, params)
          } else {
            ctx.updateProduct(ctx.updateTarget, params)
          }
        })
      },
      updateProduct: function (node, params) {
        var that = this

        var loadingBtn = servkit.loadingButton(
          document.querySelector('#modal-submit-btn')
        )
        loadingBtn.doing()
        try {
          servkit.ajax(
            {
              url: 'api/cosmos/product/update',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                var smallParams = {
                  color: 'green',
                  title: `${i18n('Update_Success')}`,
                  icon: 'fa fa-check',
                  timeout: 2000,
                }
                if (data.length) {
                  var node = that.updateTarget
                  $(node).find('td').eq(0).html(params.date)
                  $(node)
                    .find('td')
                    .eq(1)
                    .html(servkit.getMachineName(params.machine_id))
                  $(node).find('td').eq(2).html(params.work_shift)
                  $(node).find('td').eq(3).html(params.staff_name)
                  $(node).find('td').eq(4).html(params.order_id)
                  $(node).find('td').eq(5).html(params.part_id)
                  $(node).find('td').eq(6).html(params.std_hours)
                  $(node).find('td').eq(7).html(params.ng_quantity)
                  that.commons.bling(
                    4,
                    300,
                    $(node).find('td'),
                    'rgba(0, 255, 0, 0.2)'
                  )
                  delete that.updateTarget
                }
                that.commons.smallBox(smallParams)
                that.$crudTableModal.modal('toggle')
              },
              fail: function (data) {
                console.warn(data)
                var smallParams = {
                  color: 'yellow',
                  title: `${i18n('Update_Failed')}`,
                  content: data,
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                }
                that.commons.smallBox(smallParams)
              },
            }
          )
        } catch (e) {
          console.log(e)
        } finally {
          loadingBtn.done()
        }
      },
      insertProduct: function (node, params) {
        var that = this

        var loadingBtn = servkit.loadingButton(
          document.querySelector('#modal-submit-btn')
        )
        loadingBtn.doing()
        try {
          servkit.ajax(
            {
              url: 'api/cosmos/product/insert',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                var smallParams = {
                  color: 'green',
                  title: `${i18n('Insert_Success')}`,
                  icon: 'fa fa-check',
                  timeout: 2000,
                }
                if (data.length) {
                  var node = that.updateTarget
                  $(node).find('td').eq(0).html(params.date)
                  $(node)
                    .find('td')
                    .eq(1)
                    .html(servkit.getMachineName(params.machine_id))
                  $(node).find('td').eq(2).html(params.work_shift)
                  $(node).find('td').eq(3).html(params.staff_name)
                  $(node).find('td').eq(4).html(params.order_id)
                  $(node).find('td').eq(5).html(params.part_id)
                  $(node).find('td').eq(6).html(params.std_hours)
                  $(node).find('td').eq(7).html(params.ng_quantity)
                  $(node).find('td').eq(9).html('false')
                  that.commons.bling(
                    4,
                    300,
                    $(node).find('td'),
                    'rgba(0, 255, 0, 0.2)'
                  )
                  delete that.updateTarget
                }
                that.commons.smallBox(smallParams)
                that.$crudTableModal.modal('toggle')
              },
              fail: function (data) {
                console.warn(data)
                var smallParams = {
                  color: 'yellow',
                  title: `${i18n('Insert_Failed')}`,
                  content: data,
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                }
                that.commons.smallBox(smallParams)
              },
            }
          )
        } catch (e) {
          console.log(e)
        } finally {
          loadingBtn.done()
        }
      },
      appendErrorCode: function (ele, selector, content) {
        var that = this
        var code = $('<code class="note-error"></code>')
        var dom = ele.closest(selector)[0]
        code.html(content)
        if (!dom.querySelector('code')) {
          dom.insertAdjacentHTML('beforeend', code[0].outerHTML)
        }
      },
      removeErrorCode: function (ele, selector) {
        var that = this
        var dom = ele.closest(selector)[0]
        var node = dom.querySelector('code')
        if (node) {
          dom.removeChild(node)
        }
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      deviceName: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_name', 'device_id'],
            }),
          },
          {
            success: function (data) {
              console.log(data)
              var func = that.commons.initializeDBData(data)
              func.init('device_name', 'device_id')
              done(func)
            },
            fail: function (data) {
              console.log(data)
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
      ['/js/plugin/jquery-validate/jquery.validate.min.js'],
    ],
  })
}
