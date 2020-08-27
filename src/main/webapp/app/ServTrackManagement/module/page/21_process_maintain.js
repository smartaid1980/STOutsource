import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.initProcessTable()
      ctx.initNgTable()

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[ctx.appId][ctx.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          processCode: '',
          processName: '',
        }
      }
      ctx.$demoBtn.on('click', function (evt) {
        evt.preventDefault()
        ctx.$processCode.val(showdemoConfig.processCode)
        ctx.$processName.val(showdemoConfig.processName)
        ctx.$submitBtn.click()
      })

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
        ctx.processDetail(this)
        ctx.getNgData()
        $('#ngModal').modal()
      })
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $processCode: $('#process_code'),
      $processName: $('#process_name'),
      $demoBtn: $('#demo-btn'),
      $detailNote: $('#detail-note'),
      $processTable: $('#stk-process-table'),
      $ngTable: $('#stk-ng-table'),
      requestParam: '',
      processCode: '',
      processDetail: function (btn) {
        let html = `<div class="row">
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
        this.$detailNote.html(html)
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
        let that = this
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
      initProcessTable: function () {
        var loadingBtn = servkit.loadingButton(
          document.querySelector('#submit-btn')
        )
        loadingBtn.doing()
        let that = this
        var createAndUpdateEnd = {
          4: function (td) {
            let result = $(td).find('input').val()
            return parseFloat(result).toFixed(2)
          },
          6: function (td, formData) {
            return `<button class="btn btn-primary" name="ng-btn" data-process-code="${
              formData.process_code
            }" 
                  data-process-name="${formData.process_name}" data-remark="${
              formData.remark
            }">${i18n('ServTrackManagement_000034')}</button>`
          },
        }
        servkit.crudtable({
          tableSelector: '#stk-process-table',
          rightColumn: [4],
          create: {
            url: 'api/servtrack/process/create',
            end: createAndUpdateEnd,
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
              4: function (data) {
                return parseFloat(data).toFixed(2)
              },
              6: function (data, rowData) {
                return `<button class="btn btn-primary" name="ng-btn" data-process-code="${
                  rowData.process_code
                }" 
                  data-process-name="${rowData.process_name}" data-remark="${
                  rowData.remark
                }">${i18n('ServTrackManagement_000034')}</button>`
              },
            },
            finalDo: function () {
              loadingBtn.done()
            },
          },
          update: {
            url: 'api/servtrack/process/update',
            end: createAndUpdateEnd,
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
