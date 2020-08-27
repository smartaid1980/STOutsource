export default function () {
  GoGoAppFun({
    gogo: function (context) {
      if (context.preCon.processInfo) {
        _.each(context.preCon.processInfo, function (info) {
          context.processSelHtml +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            info.process_code +
            '">' +
            info.process_name +
            '</option>'
          context.processMap[info.process_code] = info.process_name
        })
      }

      servkit.crudtable({
        tableSelector: '#process_table',
        tableModel: 'com.servtech.servcloud.app.model.enhancement.ProcessNg',
        rightColumn: [3],
        order: [[0, 'asc']],
        create: {
          url: 'api/stdcrud',
          start: function (newTr, table) {
            $('[name="process_code"]')[0].innerHTML = context.processSelHtml
            $('[name="process_code"]').trigger('change')
            pageSetUp()
          },
        },
        read: {
          url: 'api/stdcrud',
          end: {
            1: function (data, rowData) {
              return context.processMap[data]
            },
          },
        },
        update: {
          url: 'api/stdcrud',
          start: {
            1: function (oldTd, newTd, oldTr, newTr, table) {
              var jEle = $(newTd).find('select[name="process_code"]').eq(0)
              jEle.html(context.processSelHtml)
              jEle.attr('disabled', true)
              _.each(jEle.find('option'), function (ele) {
                if (ele.value === $(oldTd).text()) {
                  $(ele).prop('selected', true)
                }
              })
            },
            2: function (oldTd, newTd, oldTr, newTr, table) {
              var jEle = $(newTd).find('input[name="ng_code"]').eq(0)
              jEle.val($(oldTd).text())
              jEle.attr('disabled', true)
            },
          },
        },
        delete: {
          url: 'api/stdcrud',
        },
      })
    },
    util: {
      processSelHtml: '',
      processMap: {},
    },
    preCondition: {
      processInfo: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_enhancement_process',
              columns: ['process_code', 'process_name'],
            }),
          },
          {
            success: function (data) {
              done(data)
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
