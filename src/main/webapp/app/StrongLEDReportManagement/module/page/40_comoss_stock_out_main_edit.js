export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.validateForm($('#queryID'), $('#submitBtn'))
      servkit.initDatePicker($('#startID'), $('#endID'), false, false)
      servkit.initSelectWithList(
        context.preCon.get_bill_no_list,
        $('#bill_select')
      )
      $('#bill_select').select2().select2('val', '')

      context.$reportID = $('#reportID')
      context.$reportIDdiv = $('#reportID-div')

      context.getCRUD(
        $('#startID').val() + ' 00:00:00',
        $('#endID').val() + ' 23:59:59'
      )

      $('#submitBtn').on('click', function (evt) {
        evt.preventDefault()
        context.getCRUD(
          $('#startID').val() + ' 00:00:00',
          $('#endID').val() + ' 23:59:59',
          $('#bill_select').val()
        )
      })
    },
    util: {
      getCRUD: function (startDate, endDate, billNo) {
        var context = this
        if (!context.crudTable) {
          var crudTable = context.$reportID[0].cloneNode(true)
          context.crudTable = crudTable
        } else {
          context.$reportIDdiv.html(context.crudTable.cloneNode(true))
        }

        var whereClause =
          '(bill_date between "' + startDate + '" AND "' + endDate + '")'
        if (billNo) {
          whereClause += 'AND bill_no  = "' + billNo + '"'
        }
        console.log(whereClause)
        servkit.crudtable({
          tableSelector: '#reportID',
          tableModel:
            'com.servtech.servcloud.app.model.storage.BillStockOutMain',
          order: [[0, 'asc']],
          create: {
            unavailable: true,
          },
          read: {
            url: 'api/stdcrud',
            type: 'GET',
            whereClause: whereClause,
            end: {
              2: function (data) {
                return data.toFormatedDate()
              },
            },
          },
          update: {
            url: 'api/stdcrud',
            type: 'PUT',
            send: function (tdEles) {
              return {
                modify_time: moment().format('YYYYMMDDHHmmss'),
              }
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {},
        })
      },
    },
    preCondition: {
      get_bill_no_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_bill_stock_out_main',
              columns: ['bill_no'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.bill_no] = elem.bill_no
              })
              done(dataMap)
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
