import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var table = servkit.crudtable({
        tableSelector: '#doc-table',
        tableModel: 'com.servtech.servcloud.app.model.storage.Document',
        customBtns: [
          `<button class="btn bg-color-blueDark txt-color-white stk-qrcode-btn" title="${i18n(
            'Print_Checked_Qrcode'
          )}" style="margin-right:10px"><span class="fa fa-qrcode fa-lg"></span></button>`,
        ],
        create: {
          url: 'api/storage/document',
          finalDo: function (newRow) {
            context.docMap[JSON.parse($(newRow).attr('stk-db-id'))] = $(newRow)
              .find('td:eq(2)')
              .text()
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            1: function (data, rowData) {
              context.docMap[rowData.doc_id] = rowData.doc_name
              return data
            },
          },
          finalDo: function () {
            servkit.downloadFile(
              '.stk-qrcode-btn',
              '/api/storage/document/qrcode',
              function () {
                var docData = []
                _.each(table.getSelectedRow(), function (tr) {
                  docData.push($(tr).attr('stk-db-id').replace(/"/g, ''))
                })
                return {
                  'doc_id[]': docData,
                }
              },
              'GET'
            )
          },
        },
        update: {
          url: 'api/stdcrud',
          end: {
            1: function (td, formData) {
              context.docMap[formData.doc_id] = formData.doc_name
              return formData.doc_org_id
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
          contentFunc: function (deleteIds) {
            var dataList = _.map(deleteIds, (val) => {
              return context.docMap[val]
            }).sort()
            return `${dataList.join(', ')}, ${i18n('Sure_Delete_Data')}`
          },
        },
      })
    },
    util: {
      docMap: {},
    },
    preCondition: {},
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
