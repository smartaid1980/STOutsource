export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      function createAndUpdateSend(tdEles) {
        return {
          dept_name: (function () {
            var deptId = $(tdEles[2]).find(':selected').val()
            var deptName = ctx.preCon.dept[deptId].dept_name
            return deptName
          })(),
        }
      }

      servkit.crudtable({
        tableSelector: '#watch-managment',
        tableModel: 'com.servtech.servcloud.app.model.iiot.IiotSmartWatch',
        hideCols: [5],
        order: [[0, 'asc']],
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/stdcrud',
        },
        update: {
          url: 'api/stdcrud',
          send: createAndUpdateSend,
        },
        delete: {
          unavailable: true,
        },
      })
    },
    util: {},
    preCondition: {
      dept: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_dept',
              columns: ['dept_id', 'dept_name'],
              whereClause: 'is_open = "Y"',
            }),
          },
          {
            success: function (data) {
              var deptMap = _.indexBy(data, 'dept_id')
              done(deptMap)
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
    ],
  })
}
