import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      pageSetUp()
      if (servtechConfig.ST_CUSTOMER === 'YihCheng') {
        ctx.YihChengSetting = true
      }
      ctx.initCrudTable()

      ctx.$submitBtn.on('click', function (evt) {
        evt.preventDefault() //防止氣泡事件
        const productId = ctx.$productId.val().trim()
        const productName = ctx.$productName.val().trim()
        if (
          (productId && productId.length >= 3) ||
          (productName && productName.length >= 3)
        ) {
          ctx.refreshTable(productId, productName)
        } else {
          $.smallBox({
            title: '查詢條件有誤',
            content: '請至少填寫一個查詢條件，且字元長度大於 3',
            color: servkit.colors.red,
            timeout: 4000,
          })
        }
      })

      $('#stk-product-table-body').on('click', '[name=ng-btn]', function (evt) {
        evt.preventDefault()
        var productId = $(this).parent().parent().find('td').eq(1).text()
        ctx.productDetail(this)
        ctx.getOpData(productId)
        var processDatas = ctx.preCon.processDatas
        ctx.getProcessDataObject(processDatas)
        $('#opModal').modal()
      })
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $productId: $('#product_id'),
      $productName: $('#product_name'),
      $demoBtn: $('#demo-btn'),
      $detailNote: $('#detail-note'),
      $productTable: '',
      $opTable: '',
      chackable: false,
      chackable2: false,
      YihChengSetting: false,
      crudtable: '',
      loadingBtn: '',
      requestParam: '',
      processIsOpenDataObject: {},
      processDataObject: {},
      drawTableObj: [],
      getProcessDataObject: function (data) {
        var that = this
        _.each(data, function (data) {
          var processDataMap = {}
          processDataMap['process_name'] = data.process_name
          processDataMap['process_quality'] = data.process_quality
          processDataMap['remark'] = data.remark
          that.processDataObject[data.process_code] = processDataMap
        })
      },
      productDetail: function (ele) {
        var that = this
        var productId = $(ele).parent().parent().find('td').eq(1).text()
        var productName = $(ele).parent().parent().find('td').eq(2).text()
        var remark = $(ele).parent().parent().find('td').eq(3).text()
        var html =
          '<div class="row">' +
          '<section class="col col-6">' +
          `<label class="label">${i18n('ServTrackManagement_000100')} |` +
          productId +
          '</label>' +
          '</section>' +
          '<section class="col col-6">' +
          `<label class="label">${i18n('ServTrackManagement_000043')} |` +
          productName +
          '</label>' +
          '</section>' +
          '</div>' +
          '<div class="row">' +
          '<section class="col col-6">' +
          `<label class="label">${i18n('ServTrackManagement_000095')} |` +
          remark +
          '</label>' +
          '</section>'
        that.$detailNote.html(html)
      },
      getOpData: function (productId) {
        var that = this
        if (that.chackable) {
          $('#stk-op-table-body').get(0).innerHTML = ''
          $('#stk-op-table-body').append(that.$opTable)
          that.$opTable = $('#stk-op-table').get(0).cloneNode(true)
        } else {
          that.$opTable = $('#stk-op-table').get(0).cloneNode(true)
          that.chackable = true
        }

        function createAndUpdateSend(tdEles) {
          return {
            is_open: (function () {
              if ($(tdEles[6]).find('input:checked').length) {
                return 'Y'
              } else {
                return 'N'
              }
            })(),

            op: (function () {
              var op = $(tdEles[1])
                .find('input')
                .val()
                .replace(/\b(0+)/gi, '')
              return op
            })(),

            process_code: (function () {
              var process_code = $(tdEles[2]).find(':selected').val()
              return process_code
            })(),
          }
        }

        var createAndUpdateEnd = {
          3: function (td) {
            return $(td).find(':selected').text()
          },
          4: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(4) + '<p>'
          },
          5: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
          },
          7: function (td) {
            if ($(td).find('input:checked').length) {
              return '<span class="label label-success" style="cursor:pointer">ON</span>'
            } else {
              return '<span class="label label-default" style="cursor:pointer">OFF</span>'
            }
          },
        }
        that.opTable = servkit.crudtable({
          tableSelector: '#stk-op-table',
          hideCols: [1],
          create: {
            url:
              'api/servtrack/productop/create?productid=' +
              encodeURIComponent(productId),
            start: function (tdEles) {
              $(tdEles).find('[name=process_code]').select2({
                minimumInputLength: 0,
              })
              servkit.initSelectWithList(
                that.preCon.getProcessList,
                $(tdEles).find('[name=process_code]')
              )
              $('[name=process_code]').prop('selectedIndex', -1)
              $(tdEles).eq(2).find('div').eq(0).remove()
              $(tdEles)
                .find('[name="process_code"]')
                .on('change', function () {
                  var process_code = $(this).val()
                  $(tdEles)
                    .find('[name=remark]')
                    .val(that.processDataObject[process_code].remark)
                  $(tdEles)
                    .find('[name=op_quality_sp]')
                    .val(that.processDataObject[process_code].process_quality)
                })
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            // for digiTrack
            finalDo: function () {
              that.opTable.refreshTable()
            },
          },
          read: {
            url:
              'api/servtrack/productop/readid?productid=' +
              encodeURIComponent(that.commons.checkEscapeSymbol(productId)),
            end: {
              3: function (data) {
                return that.processDataObject[data].process_name
              },
              4: function (data) {
                return '<p align="right">' + parseFloat(data).toFixed(4) + '<p>'
              },
              5: function (data) {
                return '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
              },
              7: function (data) {
                if (data === 'Y') {
                  return '<span class="label label-success" style="cursor:pointer">ON</span>'
                } else {
                  return '<span class="label label-default" style="cursor:pointer">OFF</span>'
                }
              },
            },
            finalDo: function () {
              _.each(
                document.querySelectorAll('.stk-delete-all-checkbox'),
                function (ele) {
                  ele.style.display = 'none'
                }
              )
            },
          },
          update: {
            url:
              'api/servtrack/productop/update?productid=' +
              encodeURIComponent(productId),
            start: {
              3: function (oldTd, newTd, oldTr, newTr) {
                var oldProcesssName = $(oldTd).eq(0).text()
                $(newTd).find('[name=process_code]').select2({
                  minimumInputLength: 0,
                })
                servkit.initSelectWithList(
                  that.preCon.getProcessList,
                  $(newTd).find('[name=process_code]')
                )
                $(newTd)
                  .find('[name=process_code]')
                  .val(that.preCon.processName2Code[oldProcesssName])
                  .trigger('change')
                $(newTd).find('div').eq(0).remove()

                $(newTd)
                  .find('[name="process_code"]')
                  .on('change', function () {
                    var process_code = $(this).val()
                    $(newTr)
                      .find('[name=remark]')
                      .val(that.processDataObject[process_code].remark)
                    $(newTr)
                      .find('[name=op_quality_sp]')
                      .val(that.processDataObject[process_code].process_quality)
                  })
              },
              7: function (oldTd, newTd) {
                if (oldTd.textContent.indexOf('ON') != 0) {
                  newTd.querySelector('input').checked = false
                } else {
                  newTd.querySelector('input').checked = true
                }
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            // for digiTrack
            finalDo: function () {
              that.opTable.refreshTable()
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            2: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000094')}`
              }
              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return `${i18n('ServTrackManagement_000102')}`
                }
              }
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
              var regChinese = /^[\u4E00-\u9FA5]+$/
              if (regChinese.test(input.value)) {
                return `<br>${i18n('ServTrackManagement_000022')}`
              }
              var regHalfwidth = /[^\x20-\xff]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000024')}`
              }
              if (that.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
              // for digiTrack
              if (servkit.configUseRegForDigiTrackWorkOp()) {
                var regNumber = /^\d{1,3}$/
                if (Number(input.value) === 0) {
                  return `${i18n('ServTrackManagement_000082')}`
                } else if (!regNumber.test(input.value)) {
                  return `${i18n('ServTrackManagement_000329')}`
                }
              }
            },
            3: function (td) {
              if (td.querySelector('select').value === '') {
                return `${i18n('ServTrackManagement_000029')}`
              }
            },
            4: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000033')}`
              } else if (Number(input.value) === 0) {
                return `${i18n('ServTrackManagement_000082')}`
              }
              if (isNaN(input.value)) {
                return `${i18n('ServTrackManagement_000006')}`
              } else if (0 > input.value || input.value > 999999.9999) {
                return `${i18n('ServTrackManagement_000032')}`
              }
            },
            5: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000103')}`
              } else if (isNaN(input.value)) {
                return `${i18n('ServTrackManagement_000006')}`
              } else if (0 > input.value || input.value > 100) {
                return `${i18n('ServTrackManagement_000004')}`
              }
            },
            6: function (td) {
              var input = td.querySelector('input')
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
            },
          },
        })
      },
      initCrudTable: function () {
        const ctx = this

        // if (that.chackable2) {
        //   $('#stk-product-table-body').get(0).innerHTML = ''
        //   $('#stk-product-table-body').append(that.$productTable)
        //   that.$productTable = $('#stk-product-table').get(0).cloneNode(true)
        // } else {
        //   that.$productTable = $('#stk-product-table').get(0).cloneNode(true)
        //   that.chackable2 = true
        // }

        function createAndUpdateSend(tdEles) {
          return {
            is_open: (function () {
              if ($(tdEles[4]).find('input:checked').length) {
                return 'Y'
              } else {
                return 'N'
              }
            })(),
          }
        }
        var createAndUpdateEnd = {
          4: function (td) {
            var result = $(td).find('input').val()
            return '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
          },
          5: function (td) {
            if ($(td).find('input:checked').length) {
              return '<span class="label label-success" style="cursor:pointer">ON</span>'
            } else {
              return '<span class="label label-default" style="cursor:pointer">OFF</span>'
            }
          },
          6: function () {
            var buttonHtml = `<button class="btn btn-primary" name="ng-btn">${i18n(
              'ServTrackManagement_000034'
            )}</button>`
            return buttonHtml
          },
        }

        ctx.crudtable = servkit.crudtable({
          tableSelector: '#stk-product-table',
          create: {
            url: 'api/servtrack/product/create',
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            unavailable: ctx.YihChengSetting,
          },
          read: {
            type: 'POST',
            preventReadAtFirst: true,
            requestParam: {
              table: 'a_servtrack_product',
            },
            end: {
              4: function (data, rowData) {
                return rowData.product_set
              },
              5: function (data, rowData) {
                return rowData.product_handle
              },
              6: function (data, rowData) {
                return rowData.product_material
              },
              7: function (data, rowData) {
                // return '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
                return rowData.product_quality_sp
              },
              8: function (data) {
                // if (data === 'Y') {
                //   return '<span class="label label-success" style="cursor:pointer">ON</span>'
                // } else {
                //   return '<span class="label label-default" style="cursor:pointer">OFF</span>'
                // }
                return data === 'Y'
                  ? '<span class="label label-success" style="cursor:pointer">ON</span>'
                  : '<span class="label label-default" style="cursor:pointer">OFF</span>'
              },
              9: function () {
                return `<button class="btn btn-primary" name="ng-btn">${i18n(
                  'ServTrackManagement_000034'
                )}</button>`
              },
            },
            finalDo: function () {
              _.each(
                document.querySelectorAll('.stk-delete-all-checkbox'),
                function (ele) {
                  ele.style.display = 'none'
                }
              )
              // loadingBtn.done()
            },
          },
          update: {
            url: 'api/servtrack/product/update',
            start: {
              5: function (oldTd, newTd) {
                if (oldTd.textContent.indexOf('ON') != 0) {
                  newTd.querySelector('input').checked = false
                } else {
                  newTd.querySelector('input').checked = true
                }
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            unavailable: ctx.YihChengSetting,
          },
          delete: {
            unavailable: true,
          },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000092')}`
              }
              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return `${i18n('ServTrackManagement_000099')}`
                }
              }
              if (ctx.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
              var regChinese = /^[\u4E00-\u9FA5]+$/
              if (regChinese.test(input.value)) {
                return `<br>${i18n('ServTrackManagement_000022')}`
              }
              var regHalfwidth = /[^\x20-\xff]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000024')}`
              }
            },
            2: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000093')}`
              }
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
              var regHalfwidth = /[\uFE30-\uFFA0]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000023')}`
              }
              if (ctx.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            3: function (td) {
              var input = td.querySelector('input')
              if (input.value.length > 50) {
                return `${i18n('ServTrackManagement_000001')}`
              }
            },
            4: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `${i18n('ServTrackManagement_000005')}`
              } else if (isNaN(input.value)) {
                return `${i18n('ServTrackManagement_000006')}`
              } else if (0 > input.value || input.value > 100) {
                return `${i18n('ServTrackManagement_000004')}`
              }
            },
          },
        })
      },
      refreshTable: function (product_id = false, product_name = false) {
        const ctx = this
        product_id = product_id ? `AND product_id LIKE '%${product_id}%'` : ''
        product_name = product_name
          ? `AND product_name LIKE '%${product_name}%'`
          : ''
        const whereClause = `1 ${product_id} ${product_name}`
        const url = { url: 'api/getdata/db', whereClause: whereClause }

        ctx.crudtable.changeReadUrl(url)
        ctx.crudtable.refreshTable()
      },
    },
    preCondition: {
      processDatas: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_process',
              columns: [
                'process_code',
                'process_name',
                'process_quality',
                'remark',
              ],
              whereClause: "is_open = 'Y' AND process_code <> 'common_process'",
            }),
          },
          {
            success: function (data) {
              done(data)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      getProcessList: function (done) {
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
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.process_code] = elem.process_name
              })
              done(dataMap)
            },
          }
        )
      },
      processName2Code: function (done) {
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
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.process_name] = elem.process_code
              })
              done(dataMap)
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
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
