import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      servkit.initDatePicker($('#startDate'), $('#endDate'), true, false)
      $('#lineId').select2()
      servkit.initSelectWithList(
        ctx.preCon.get_a_servtrack_line_list,
        $('#lineId')
      )
      ctx.$lineId.prop('selectedIndex', -1)

      $('#workId').select2()
      servkit.initSelectWithList(
        ctx.preCon.get_a_servtrack_work_list,
        $('#workId')
      )
      ctx.$workId.prop('selectedIndex', -1)

      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        ctx.drawTrackingTable(
          ctx.$startDate.val(),
          ctx.$endDate.val(),
          ctx.$lineId.val(),
          ctx.$workId.val()
        )
      })
    },
    util: {
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $lineId: $('#lineId'),
      $workId: $('#workId'),
      $crudTable: $('#crudTable'),
      $crudTableBody: $('#crudTableBody'),
      drawTrackingTable: function (startDate, endDate, lineId, workId) {
        var ctx = this
        var loadingBtn = servkit.loadingButton(
          document.querySelector('#submit-btn')
        )
        loadingBtn.doing()
        try {
          if (!ctx.crudTrackingNgTable) {
            var crudTable = ctx.$crudTable[0].cloneNode(true)
            ctx.crudTrackingNgTable = crudTable
          } else {
            ctx.$crudTableBody.html(ctx.crudTrackingNgTable.cloneNode(true))
          }
          var whereClauseSql =
            "(shift_day BETWEEN '" +
            startDate +
            " 00:00:00' AND '" +
            endDate +
            " 23:59:59' )" +
            ' AND line_id ' +
            (lineId == null ? 'IS NOT NULL' : "= '" + lineId + "'") +
            ' AND work_id ' +
            (workId == null ? 'IS NOT NULL' : "= '" + workId + "'")
          servkit.crudtable({
            tableSelector: '#crudTable',
            tableModel:
              'com.servtech.servcloud.app.model.servtrack.WorkTracking',
            order: [[0, 'asc']],
            create: {
              unavailable: true,
            },
            read: {
              url: 'api/stdcrud',
              whereClause: whereClauseSql,
              end: {
                1: function (data) {
                  return moment(data, 'MMMM Do, YYYY').format('YYYY-MM-DD')
                },
                5: function (data) {
                  return moment(new Date(data)).format('YYYY-MM-DD HH:mm:ss')
                },
                6: function (data) {
                  return moment(new Date(data)).format('YYYY-MM-DD HH:mm:ss')
                },
              },
            },
            update: {
              url: 'api/strongled/track-management/output-qty',
              send(tdArray) {
                const tr = tdArray[0].parentElement
                const rowData = $(tr).data('rowData')
                return {
                  shift_time: rowData.shift_time
                    ? rowData.shift_time.toFormatedDatetime()
                    : null,
                }
              },
            },
            delete: {
              unavailable: true,
            },
            validate: {
              7(td, table) {
                const $td = $(td)
                const $tr = $td.closest('tr')
                // const $tr = $td.parent();
                const $custField3 = $tr.find('[name=cust_field_3]')
                const $custField4 = $tr.find('[name=cust_field_4]')
                const value2 = Number($custField3.val())
                const value3 = Number($custField4.val())
                const input = td.querySelector('input')
                const value = Number(input.value)
                const isError = value < value2 + value3
                if (isError) {
                  return `${i18n(
                    'Production_Can_Not_Be_Less_Than_The_Sum_Of_The_Number_Of_Defective_Products'
                  )}`
                }
              },
            },
          })
        } catch (e) {
          console.warn(e)
        } finally {
          loadingBtn.done()
        }
      },
    },
    preCondition: {
      get_a_servtrack_line_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_line',
              columns: ['line_name', 'line_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.line_id] = elem.line_name
              })
              done(dataMap)
            },
          }
        )
      },
      get_a_servtrack_work_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_work',
              columns: ['work_id', 'work_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.work_id] = elem.work_id
              })
              done(dataMap)
            },
          }
        )
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
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
