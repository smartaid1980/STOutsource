import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var table = servkit.crudtable({
        tableSelector: '#thing-table',
        tableModel: 'com.servtech.servcloud.app.model.storage.Thing',
        customBtns: [
          `<button class="btn bg-color-blueDark txt-color-white stk-qrcode-btn" title="${i18n(
            'Print_Checked_Qrcode'
          )}" style="margin-right:10px"><span class="fa fa-qrcode fa-lg"></span></button>`,
        ],
        create: {
          url: 'api/storage/thing',
          end: {
            5: function (td) {
              return context.preCon.getStoreTypeData[$(td).find('select').val()]
            },
          },
          finalDo: function (newRow) {
            context.thingMap[JSON.parse($(newRow).attr('stk-db-id'))] = $(
              newRow
            )
              .find('td:eq(3)')
              .text()
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            5: function (data, rowData) {
              context.thingMap[rowData.thing_id] = rowData.thing_name
              return context.preCon.getStoreTypeData[String(data)]
            },
          },
          finalDo: function () {
            servkit.downloadFile(
              '.stk-qrcode-btn',
              '/api/storage/material/qrcode',
              function () {
                var thingData = []
                _.each(table.getSelectedRow(), function (tr) {
                  thingData.push($(tr).attr('stk-db-id').replace(/"/g, ''))
                })
                return {
                  'thing_id[]': thingData,
                }
              },
              'GET'
            )
          },
        },
        update: {
          url: 'api/stdcrud',
          end: {
            5: function (td, formData) {
              context.thingMap[formData.thing_id] = formData.thing_name
              return context.preCon.getStoreTypeData[$(td).find('select').val()]
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
          contentFunc: function (deleteIds) {
            var dataList = _.map(deleteIds, (val) => {
              return context.thingMap[val]
            }).sort()
            return `${dataList.join(', ')}, ${i18n('Sure_Delete_Data')}`
          },
        },
        validate: {
          6: function (td) {
            let input = td.querySelector('input')
            let regStr = /^[\d]+$/
            if (!regStr.test(input.value)) {
              return `${i18n('Valid_Number')}`
            }
          },
        },
      })
    },
    util: {
      thingMap: {},
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
