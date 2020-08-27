import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 建立儲位按鈕
      var createBtn = document.createElement('BUTTON')
      createBtn.id = 'auto-create-position'
      createBtn.classList.value = 'btn btn-success'
      createBtn.innerText = `${i18n('Auto_Create_Position')}`
      context.createPositionBtn = servkit.loadingButton(createBtn)

      var table = servkit.crudtable({
        tableSelector: '#store-table',
        customBtns: [
          `<button class="btn bg-color-blueDark txt-color-white stk-qrcode-btn" title="${i18n(
            'Print_Checked_Qrcode'
          )}"><span class="fa fa-qrcode fa-lg"></span></button>`,
          createBtn,
        ],
        create: {
          url: 'api/storage/store',
          send: function () {
            return {
              store_rule: (function () {
                return '{}'
              })(),
              tableModel: 'com.servtech.servcloud.app.model.storage.Store',
            }
          },
          end: {
            3: function (td, formData) {
              return context.preCon.getStoreTypeData[$(td).find('select').val()]
            },
          },
          finalDo: function (newRow) {
            context.storeMap[JSON.parse($(newRow).attr('stk-db-id'))] = $(
              newRow
            )
              .find('td:eq(1)')
              .text()
          },
        },
        read: {
          url:
            'api/stdcrud?tableModel=com.servtech.servcloud.app.model.storage.Store',
          end: {
            3: function (data, rowData) {
              context.storeMap[rowData.store_id] = rowData.store_name
              return context.preCon.getStoreTypeData[String(data)]
            },
          },
          finalDo: function () {
            servkit.downloadFile(
              '.stk-qrcode-btn',
              '/api/storage/store/qrcode',
              function () {
                var storeData = []
                _.each(table.getSelectedRow(), function (tr) {
                  storeData.push($(tr).attr('stk-db-id').replace(/"/g, ''))
                })
                return {
                  'store_id[]': storeData,
                }
              },
              'GET'
            )
          },
        },
        update: {
          url: 'api/stdcrud',
          start: {
            3: function (oldTd, newTd, oldTr) {
              var oldValue = $(oldTr).data('rowData').store_type_id
              $(newTd).val(
                $(newTd)
                  .find('option[value=' + oldValue + ']')
                  .val()
              )
              $(newTd)
                .find('option[value=' + oldValue + ']')
                .attr('selected', true)
            },
          },
          send: function () {
            return {
              store_rule: (function () {
                return '{}'
              })(),
              tableModel: 'com.servtech.servcloud.app.model.storage.Store',
            }
          },
          end: {
            3: function (td, formData) {
              context.storeMap[formData.store_id] = formData.store_name
              return context.preCon.getStoreTypeData[$(td).find('select').val()]
            },
          },
        },
        delete: {
          url:
            'api/stdcrud?tableModel=com.servtech.servcloud.app.model.storage.Store&key=store_id',
          contentFunc: function (deleteIds) {
            var dataList = _.map(deleteIds, (val) => {
              return context.storeMap[val]
            }).sort()
            return `${dataList.join(', ')}, ${i18n('Sure_Delete_Data')}`
          },
        },
        validate: {
          1: function (td) {
            let input = td.querySelector('input')
            if (input.value.length > 255) {
              return `${i18n('Out_Of_Len')}`.replace('{size}', 255)
            }
          },
          2: function (td) {
            let textarea = td.querySelector('textarea')
            if (textarea.value.length > 1024) {
              return `${i18n('Out_Of_Len')}`.replace('{size}', 1024)
            }
          },
          4: function (td) {
            let input = td.querySelector('input')
            let regStr = /^[\d]+$/
            if (!regStr.test(input.value)) {
              return `${i18n('Valid_Number')}`
            }
          },
        },
      })
      $(createBtn).on('click', function () {
        context.createPositionBtn.doing()
        var storeData = []
        _.each(table.getSelectedRow(), function (tr) {
          storeData.push($(tr).attr('stk-db-id').replace(/"/g, ''))
        })
        servkit.ajax(
          {
            url: 'api/storage/storeposition/autoinsert',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              store_id: storeData,
            }),
          },
          {
            success: function () {
              context.createPositionBtn.done()
              alert(`${i18n('Auto_Create_Position_Succeeded')}`)
              $('#store-table th input[type=checkbox]').prop('checked', false)
              $('#store-table td input[type=checkbox]').prop('checked', false)
            },
            fail: function () {
              alert(`${i18n('Auto_Create_Position_Failed')}`)
            },
          }
        )
      })
    },
    util: {
      storeMap: {},
      createPositionBtn: null,
    },
    preCondition: {
      getStoreTypeData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store_type',
              columns: ['store_type_id', 'store_type_name'],
            }),
          },
          {
            success: function (data) {
              var storeTypeData = {}
              _.each(data, function (elem) {
                storeTypeData[elem.store_type_id] = elem.store_type_name
              })
              done(storeTypeData)
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
