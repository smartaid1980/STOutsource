import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      if (servtechConfig.ST_CUSTOMER === 'YihCheng') {
        ctx.initProcessTable(true)
      } else {
        ctx.initProcessTable()
      }

      ctx.initNgTable()

      ctx.$submitBtn.on('click', function (evt) {
        var loadingBtn = servkit.loadingButton(
          document.querySelector('#submit-btn')
        )
        loadingBtn.doing()
        try {
          evt.preventDefault() // 防止氣泡事件
          ctx.read()
        } catch (e) {
          console.warn(e)
        } finally {
          loadingBtn.done()
        }
      })

      $('#stk-process-table-body').on('click', '[name=ng-btn]', function (evt) {
        evt.preventDefault()
        ctx.processCode = this.dataset.processCode
        ctx.processDetail($('#detail-note'), this)
        ctx.getNgData()
        $('#ngModal').modal()
      })

      $('#stk-process-table-body').on(
        'click',
        '[name=invalid-reason-btn]',
        function (evt) {
          evt.preventDefault()
          ctx.processCode = this.dataset.processCode
          ctx.processDetail($('#invalid-detail-note'), this)
          ctx.getInvalidReason(ctx.processCode)
          $('#invalidReason').modal()
        }
      )
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $processCode: $('#process_code'),
      $processName: $('#process_name'),
      $demoBtn: $('#demo-btn'),
      $detailNote: $('#detail-note'),
      $processTable: $('#stk-process-table'),
      $ngTable: $('#stk-ng-table'),
      $invalidReasonCrudTable: $('#invalid-reason-crud-table'),
      $invalidReasonCrudTableBody: $('#invalid-reason-crud-table-body'),
      requestParam: '',
      processCode: '',
      getInvalidReason: function (processCode) {
        var ctx = this
        if (!ctx.crudHolderTable) {
          var crudTable = ctx.$invalidReasonCrudTable[0].cloneNode(true)
          ctx.crudHolderTable = crudTable
        } else {
          ctx.$invalidReasonCrudTableBody.html(
            ctx.crudHolderTable.cloneNode(true)
          )
        }
        function createAndUpdateSend(tdEles) {
          return {
            invalid_type: (function () {
              var invalidType = $(tdEles[3]).find(':selected').val()
              var isChangeLine = $(tdEles[5]).find(':selected').val()
              if (invalidType == 1 && isChangeLine == 1) {
                return 2
              }
              if (invalidType == 1 && isChangeLine == 0) {
                return 1
              }
              if (invalidType == 0 && isChangeLine == 0) {
                return 0
              }
            })(),
          }
        }
        servkit.crudtable({
          tableSelector: '#invalid-reason-crud-table',
          tableModel:
            'com.servtech.servcloud.app.model.strongLED.InvalidReason',
          hideCols: [3, 5],
          order: [[0, 'asc']],
          create: {
            url: 'api/stdcrud',
            start: function (newTr, table) {
              $('[name=invalid_class]').val('1')
              $('[name=process_code]').val(processCode)

              $('[name=invalid_type]').on('change', function (evt) {
                if ($('[name=invalid_type]').val() == 0) {
                  $('[name=is_change_line]').val('0')
                  $('[name=is_change_line]').attr('disabled', true)
                } else {
                  $('[name=is_change_line]').attr('disabled', false)
                }
              })
            },
            send: createAndUpdateSend,
          },
          read: {
            url: 'api/stdcrud',
            whereClause: 'process_code = "' + processCode + '"',
            end: {
              4: function (data) {
                return data == 0 ? 'OFF' : 'ON'
              },
              6: function (data, rowData) {
                var invalidType = rowData['invalid_type']
                if (invalidType == 2) {
                  return 'ON'
                } else {
                  return 'OFF'
                }
              },
            },
          },
          update: {
            url: 'api/stdcrud',
            start: {
              4: function (oldTd, newTd, oldTr, newTr, table) {
                $(newTd)
                  .find('[name=invalid_type]')
                  .on('change', function (evt) {
                    if ($(newTd).find('[name=invalid_type]').val() == 0) {
                      $(newTr).find('[name=is_change_line]').val('0')
                      $(newTr)
                        .find('[name=is_change_line]')
                        .attr('disabled', true)
                    } else {
                      $(newTr)
                        .find('[name=is_change_line]')
                        .attr('disabled', false)
                    }
                  })
                var oldInvalidType = $(oldTd).eq(0).text() == 'ON' ? 1 : 0
                $(newTd)
                  .find('[name=invalid_type]')
                  .val(oldInvalidType)
                  .trigger('change')
              },
            },
            send: createAndUpdateSend,
          },
          delete: {
            unavailable: true,
          },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('input')
              if (!input.disabled) {
                var result = _.findWhere(ctx.preCon.invalidReasons, {
                  invalid_id: input.value,
                })
                if (result) {
                  return `${i18n('ServTrackManagement_000318')}`
                }
              }
            },
          },
        })
      },
      processDetail: function ($detailNote, btn) {
        const html = `<div class="row">
              <section class="col col-6">
                <label class="label">${i18n('ServTrackManagement_000112')} | ${
          btn.dataset.processCode
        }</label>
              </section>
              <section class="col col-6">
                <label class="label">${i18n('ServTrackManagement_000113')} | ${
          btn.dataset.processName
        }</label>
              </section>
            </div>
            <div class="row">
              <section class="col col-6">
              <label class="label">${i18n('ServTrackManagement_000095')} | ${
          btn.dataset.remark
        }</label>
            </section>`
        $detailNote.html(html)
      },
      getNgData: function () {
        var that = this
        that.$ngTable.data('crudTableConfig').create.url =
          'api/servtrack/processng/create?processcode=' +
          encodeURIComponent(that.processCode)
        that.$ngTable.data('crudTableConfig').read.url =
          'api/servtrack/processng/readcode?processcode=' +
          encodeURIComponent(that.commons.checkEscapeSymbol(that.processCode))
        that.$ngTable.data('crudTableConfig').update.url =
          'api/servtrack/processng/update?processcode=' +
          encodeURIComponent(that.processCode)
        that.$ngTable.parent().find('.stk-refresh-btn').click()
      },
      initNgTable: function () {
        const that = this
        servkit.crudtable({
          tableSelector: '#stk-ng-table',
          create: {
            url: 'api/servtrack/processng/create?processcode=""',
          },
          read: {
            url: 'api/servtrack/processng/readcode?processcode=""',
          },
          update: {
            url: 'api/servtrack/processng/update?processcode=""',
          },
          delete: {
            unavailable: true,
          },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `<br>${i18n('ServTrackManagement_000110')}`
              }
              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return `<br>${i18n('ServTrackManagement_000118')}`
                }
              }
              if (input.value.length > 50) {
                return `<br>${i18n('ServTrackManagement_000001')}`
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
            },
            2: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `<br>${i18n('ServTrackManagement_000109')}`
              }
              if (input.value.length > 50) {
                return `<br>${i18n('ServTrackManagement_000001')}`
              }
              var regHalfwidth = /[\uFE30-\uFFA0]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000023')}`
              }
              if (that.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            3: function (td) {
              var input = td.querySelector('input')
              if (input.value.length > 50) {
                return `<br>${i18n('ServTrackManagement_000001')}`
              }
            },
          },
        })
      },
      read: function () {
        var that = this
        that.$processTable.data('crudTableConfig').read.url =
          'api/servtrack/process/read?processcode=' +
          encodeURIComponent(
            that.commons.checkEscapeSymbol(that.$processCode.val())
          ) +
          '&processname=' +
          encodeURIComponent(
            that.commons.checkEscapeSymbol(that.$processName.val())
          )
        that.$processTable.parent().find('.stk-refresh-btn').click()
      },
      initProcessTable: function (YihCheng = false) {
        const that = this

        var createAndUpdateEnd = {
          4: function (td) {
            const result = $(td).find('input').val()
            return parseFloat(result).toFixed(2)
          },
          6: function (td, formData) {
            return `<button class="btn btn-primary" name="ng-btn" data-process-code="${
              formData.process_code
            }" 
                  data-process-name="${formData.process_name}" data-remark="${
              formData.remark ?? '暫無說明'
            }">${i18n('ServTrackManagement_000034')}</button>`
          },
          7: function (data, rowData) {
            return `<button class="btn btn-primary" name="invalid-reason-btn" data-process-code="${
              rowData.process_code
            }" 
                    data-process-name="${rowData.process_name}" data-remark="${
              rowData.remark ?? '暫無說明'
            }">${i18n('ServTrackManagement_000034')}</button>`
          },
        }
        servkit.crudtable({
          tableSelector: '#stk-process-table',
          rightColumn: [4],
          create: {
            url: 'api/servtrack/process/create',
            end: createAndUpdateEnd,
            unavailable: YihCheng,
          },
          read: {
            url:
              'api/servtrack/process/read?processcode=' +
              encodeURIComponent(
                that.commons.checkEscapeSymbol(that.$processCode.val())
              ) +
              '&processname=' +
              encodeURIComponent(
                that.commons.checkEscapeSymbol(that.$processName.val())
              ),
            end: {
              3: function (data, rowData) {
                return rowData.remark ?? '暫無說明'
              },
              4: function (data, rowData) {
                return rowData.division_id
              },
              5: function (data, rowData) {
                return rowData.process_quality
              },
              7: function (data, rowData) {
                return `<button class="btn btn-primary" name="ng-btn" data-process-code="${
                  rowData.process_code
                }" 
                  data-process-name="${
                    rowData.process_name
                  }" data-remark="${(rowData.remark =
                  rowData.remark ?? '暫無說明')}">${i18n(
                  'ServTrackManagement_000034'
                )}</button>`
              },
              8: function (data, rowData) {
                return `<button class="btn btn-primary" name="invalid-reason-btn" data-process-code="${
                  rowData.process_code
                }" 
                    data-process-name="${
                      rowData.process_name
                    }" data-remark="${(rowData.remark =
                  rowData.remark ?? '暫無說明')}">${i18n(
                  'ServTrackManagement_000034'
                )}</button>`
              },
            },
          },
          update: {
            url: 'api/servtrack/process/update',
            end: createAndUpdateEnd,
            unavailable: YihCheng,
          },
          delete: {
            unavailable: true,
          },
          validate: {
            1: function (td, table) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `<br>${i18n('ServTrackManagement_000108')}`
              }
              if (!input.disabled) {
                if (
                  _.find(table.columns(0).data().eq(0), function (existId) {
                    return existId.toLowerCase() === input.value.toLowerCase()
                  })
                ) {
                  return `<br>${i18n('ServTrackManagement_000111')}`
                }
              }
              if (input.value.length > 50) {
                return `<br>${i18n('ServTrackManagement_000001')}`
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
            },
            2: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `<br>${i18n('ServTrackManagement_000107')}`
              }
              if (input.value.length > 50) {
                return `<br>${i18n('ServTrackManagement_000001')}`
              }
              var regHalfwidth = /[\uFE30-\uFFA0]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000023')}`
              }
              if (that.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            3: function (td) {
              var input = td.querySelector('input')
              if (input.value.length > 50) {
                return `<br>${i18n('ServTrackManagement_000001')}`
              }
            },
            4: function (td) {
              var input = td.querySelector('input')
              if (input.value === '') {
                return `<br>${i18n('ServTrackManagement_000005')}`
              } else if (isNaN(input.value)) {
                return `<br>${i18n('ServTrackManagement_000006')}`
              } else if (input.value < 0 || input.value > 100) {
                return `${i18n('ServTrackManagement_000004')}`
              }
            },
            5: function (td) {
              var processCode = $(td).parent().attr('stk-db-id')
              if (processCode) {
                var isChecked = $(td).find('input').prop('checked')
                var removeDoubleQuotesProcessCode = processCode.replace(
                  /"/g,
                  ''
                )
                var convertBackslashDoubleToOne = removeDoubleQuotesProcessCode.replace(
                  /\\\\/g,
                  '\\'
                )
                var productId = that.preCon.productOps.getName(
                  convertBackslashDoubleToOne
                )
                if (!isChecked && productId) {
                  return `<br>${i18n('ServTrackManagement_000198')}`
                }
              }
            },
          },
        })
      },
    },
    preCondition: {
      productOps: function (done) {
        var that = this
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_product_op',
              columns: ['process_code', 'product_id'],
            }),
          },
          {
            success: function (data) {
              var func = that.commons.initializeDBData(data)
              func.init('process_code', 'product_id')
              done(func)
            },
            fail: function (data) {
              console.warn(data)
            },
          }
        )
      },
      invalidReasons: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_invalid_reason',
              columns: ['invalid_id'],
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
