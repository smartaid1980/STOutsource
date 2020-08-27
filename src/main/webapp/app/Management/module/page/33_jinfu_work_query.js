export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.validateForm($('#queryID'), $('#submitBtn'))
      servkit.initDatePicker($('#startID'), $('#endID'), false, false)
      servkit.initSelectWithList(
        context.preCon.get_a_jinfu_work_list,
        $('#work_select')
      )
      $('#work_select').select2().select2('val', '')
      // servkit.initSelectWithList(context.preCon.get_m_device_list, $('#work_select'))
      context.tempalteEngine = createTempalteEngine()
      context.reportIDReportTable = createReportTable({
        $tableElement: $('#reportID'),
        $tableWidget: $('#reportID-widget'),
        order: [[0, 'asc']],
      })
      $('#submitBtn').on('click', function (evt) {
        evt.preventDefault()
        // try {
        var startDate = $('#startID').val()
        var endDate = $('#endID').val()
        var workId = $('#work_select').val()
        var whereClause =
          '(exp_edate >= "' +
          startDate +
          '" AND exp_mdate <= "' +
          endDate +
          '")'
        // var whereClause = '((exp_mdate BETWEEN "' + startDate + '" AND "' + endDate + '") OR (exp_edate BETWEEN "' + startDate + '" AND "' + endDate + '")) ';
        if (workId) {
          whereClause += 'AND work_id  = "' + workId + '"'
        }
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_jinfu_work',
              columns: [
                'work_id',
                'product_id',
                'product_name',
                'machine_id',
                'work_seq',
                'cun_name',
                'program_name',
                'exp_mdate',
                'exp_edate',
                'work_qty',
              ],
              whereClause: whereClause,
            }),
          },
          {
            success: function (data) {
              var tableData = _.map(data, function (elem) {
                return [
                  elem.product_id,
                  elem.product_name,
                  elem.work_id,
                  elem.machine_id,
                  elem.program_name,
                  moment(elem.exp_mdate).format('YYYY/MM/DD HH:mm:ss'),
                  moment(elem.exp_edate).format('YYYY/MM/DD HH:mm:ss'),
                  elem.work_qty,
                ]
              })

              context.reportIDReportTable.drawTable(tableData)
            },
          }
        )
      })
    },
    util: {},
    preCondition: {
      get_a_jinfu_work_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_jinfu_work',
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
