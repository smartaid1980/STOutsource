import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var table = servkit.crudtable({
        tableSelector: '#emp-table',
        tableModel: 'com.servtech.servcloud.app.model.storage.Employee',
        customBtns: [
          `<button class="btn bg-color-blueDark txt-color-white stk-qrcode-btn" title="${i18n(
            'Print_Checked_Qrcode'
          )}" style="margin-right:10px"><span class="fa fa-qrcode fa-lg"></span></button>`,
        ],
        create: {
          url: 'api/storage/employee',
          finalDo: function (newRow) {
            context.empMap[JSON.parse($(newRow).attr('stk-db-id'))] = $(newRow)
              .find('td:eq(2)')
              .text()
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            1: function (data, rowData) {
              context.empMap[rowData.emp_id] = rowData.emp_name
              return data
            },
          },
          finalDo: function () {
            servkit.downloadFile(
              '.stk-qrcode-btn',
              '/api/storage/employee/qrcode',
              function () {
                var empData = []
                _.each(table.getSelectedRow(), function (tr) {
                  empData.push($(tr).attr('stk-db-id').replace(/"/g, ''))
                })
                return {
                  'emp_id[]': empData,
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
              context.empMap[formData.emp_id] = formData.emp_name
              return formData.emp_org_id
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
          contentFunc: function (deleteIds) {
            var dataList = _.map(deleteIds, (val) => {
              return context.empMap[val]
            }).sort()
            return `${dataList.join(', ')}, ${i18n('Sure_Delete_Data')}`
          },
        },
      })
    },
    util: {
      empMap: {},
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
