import { getPositionStructure } from '../../../StrongLEDStorageManagement/module/positionStructure.js'

export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.validateForm($('#queryID'), $('#submitBtn'))
      servkit.initDatePicker($('#startID'), $('#endID'), false, false)
      servkit.initSelectWithList(
        context.preCon.get_a_return_id_list,
        $('#return_select')
      )
      $('#return_select').select2().select2('val', '')

      context.initReportTable()

      $('#submitBtn').on('click', function (evt) {
        evt.preventDefault()
        context.getTempStockData(true)
      })
    },
    util: {
      loadingBtn: servkit.loadingButton(document.querySelector('#submitBtn')),
      reportTable: undefined,

      initReportTable() {
        const context = this
        const hideCols = []
        const columns = [
          {
            name: 'return_id',
            data: 'return_id',
          },
          {
            name: 'return_datetime',
            data: 'return_datetime',
            render(data, type, rowData) {
              return data.toFormatedDatetime()
            },
          },
          {
            name: 'return_bill_type',
            data: 'return_bill_type',
          },
          {
            name: 'stock_out_bill_no',
            data: 'stock_out_bill_no',
          },
          {
            name: 'stock_out_bill_type',
            data: 'stock_out_bill_type',
          },
          {
            name: 'production_line',
            data: 'production_line',
          },
          {
            name: 'return_thing',
            data: 'return_thing',
          },
          {
            name: 'return_material',
            data: 'return_material',
          },
          {
            name: 'return_pcs',
            data: 'return_pcs',
          },
          {
            name: 'position_name',
            data: 'position_name',
          },
          {
            name: 'position_full_name',
            data: 'position_full_name',
          },
          {
            name: 'stock_in_bill_no',
            data: 'stock_in_bill_no',
          },
        ]
        const excelColName = columns.slice(0, 12).map((col) => col.name)
        // if (!context.actionPermission) {
        //   hideCols.push(12, 13);
        // }
        context.reportTable = createReportTable({
          $tableElement: $('#reportID'),
          $tableWidget: $('#reportID-widget'),
          order: [[0, 'asc']],
          checkbox: true,
          // centerColumn: [11, 12, 13],
          showNoData: false,
          hideCols,
          columns,
          excel: {
            fileName: 'ReturnLog',
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ],
            customDataFunc(tableData) {
              // tableData為dataTable的物件，需轉為陣列
              return Array.from(context.reportTable.getSelectedRow(true)).map(
                (data) => {
                  return excelColName.map((key) => data[key])
                }
              )
            },
            customHeaderFunc(header) {
              return header.slice(0, 12)
            },
          },
        })
      },
      getTempStockData(isShowingNoDataDialog) {
        const context = this
        // try {
        var startDate = $('#startID').val() + ' 00:00:00'
        var endDate = $('#endID').val() + ' 23:59:59'
        var returnId = $('#return_select').val()
        var whereClause =
          '(return_datetime between "' + startDate + '" AND "' + endDate + '")'
        // var whereClause = '((exp_mdate BETWEEN "' + startDate + '" AND "' + endDate + '") OR (exp_edate BETWEEN "' + startDate + '" AND "' + endDate + '")) ';
        if (returnId) {
          whereClause += 'AND return_id  = "' + returnId + '"'
        }
        console.log(whereClause)
        context.loadingBtn.doing()
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_comoss_return_log',
              columns: [
                'return_id',
                'return_datetime',
                'stock_out_bill_type',
                'return_bill_type',
                'return_thing',
                'return_material',
                'return_pcs',
                'position_id',
                'stock_in_bill_no',
                'stock_out_bill_no',
                'production_line',
              ],
              whereClause: whereClause,
            }),
          },
          {
            success: function (data) {
              console.log(data)
              _.each(data, (val, key) => {
                if (val.return_datetime) {
                  data[key].return_datetime = moment(
                    new Date(val.return_datetime)
                  ).format('YYYY/MM/DD HH:mm:ss')
                }
                if (val.position_id) {
                  data[
                    key
                  ].position_name = context.preCon.positionStructure
                    .getPositionIdPath(val.position_id)
                    .toString()
                  data[
                    key
                  ].position_full_name = context.preCon.positionStructure
                    .getFullPathByPositionId(val.position_id)
                    .toString()
                }
              })
              context.reportTable.drawTable(data)

              // context.reportTable.drawTable(data.map(d => _.mapObject(d, () => {

              // })));
              context.loadingBtn.done()
              if (!data.length && isShowingNoDataDialog) {
                $('#dialog-no-data').dialog('open')
              }
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
    },
    preCondition: {
      get_a_return_id_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_comoss_return_log',
              columns: ['return_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.return_id] = elem.return_id
              })
              done(dataMap)
            },
          }
        )
      },
      positionStructure(done) {
        getPositionStructure().then((instance) => done(instance))
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
