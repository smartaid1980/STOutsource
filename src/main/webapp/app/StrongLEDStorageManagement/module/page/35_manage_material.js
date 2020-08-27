import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#material-table',
        tableModel: 'com.servtech.servcloud.app.model.storage.Material',
        create: {
          url: 'api/stdcrud',
          end: {
            // 4: function (td) {
            //   return context.preCon.getSupplierData[$(td).find('select').val()]
            // },
            5: function (td) {
              return context.preCon.getStoreTypeData[$(td).find('select').val()]
            },
          },
          finalDo: function (newRow) {
            context.materialMap[JSON.parse($(newRow).attr('stk-db-id'))] = $(
              newRow
            )
              .find('td:eq(2)')
              .text()
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            // 4: function (data) {
            //   return context.preCon.getSupplierData[String(data)]
            // },
            5: function (data, rowData) {
              context.materialMap[rowData.material_id] = rowData.material_name
              return context.preCon.getStoreTypeData[String(data)]
            },
          },
        },
        update: {
          url: 'api/stdcrud',
          end: {
            // 4: function (td) {
            //   return context.preCon.getSupplierData[$(td).find('select').val()]
            // },
            5: function (td, formData) {
              context.materialMap[formData.material_id] = formData.material_name
              return context.preCon.getStoreTypeData[$(td).find('select').val()]
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
          contentFunc: function (deleteIds) {
            var dataList = _.map(deleteIds, (val) => {
              return context.materialMap[val]
            }).sort()
            return `${dataList.join(', ')}, ${i18n('Sure_Delete_Data')}`
          },
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }

            if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId.toLowerCase() === input.value.toLowerCase()
                })
              ) {
                return `${i18n('Stk_Pk')}`
              }
            }
          },
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
      materialMap: {},
    },
    preCondition: {
      // getSupplierData: function (done) {
      //   servkit.ajax({
      //     url: 'api/getdata/db',
      //     type: 'POST',
      //     contentType: 'application/json',
      //     data: JSON.stringify({
      //       table: 'a_storage_supplier',
      //       columns: ['supplier_id', 'supplier_name']
      //     })
      //   }, {
      //     success: function (data) {
      //       var supplierData = {}
      //       _.each(data, function (elem) {
      //         supplierData[elem.supplier_id] = elem.supplier_name
      //       })
      //       done(supplierData)
      //     }
      //   })
      // },
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
