export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.validateForm($('#form'), $('#query_btn'))
      $('#query_btn').on('click', function (evt) {
        evt.preventDefault()
        var shiftDate = $('#query_date').val()
        var machineId = $('#machine_id').val()
        var criterai =
          'api/enhancement/workTracking?machine_id=' +
          machineId +
          '&shift_date=' +
          shiftDate
        $('#ng_quantity_table').data('crudTableConfig').read.url = criterai
        $('#ng_quantity_table')
          .closest('.dataTables_wrapper')
          .find('.stk-refresh-btn')
          .trigger('click')
      })
      var datepickerConfig = {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      }
      $('#query_date')
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      servkit.initSelectWithList(
        context.preCon.get_m_device_list,
        $('#machine_id')
      )
      servkit.crudtable({
        tableSelector: '#ng_quantity_table',
        rightColumn: [6],
        order: [[0, 'asc']],
        create: {
          url: '',
          unavailable: true,
        },
        read: {
          url: 'api/enhancement/workTracking',
        },
        update: {
          url: 'api/enhancement/workTracking',
        },
        delete: {
          url: 'api/stdcrud',
          unavailable: true,
        },
      })
    },
    util: {},
    preCondition: {
      get_m_device_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_name', 'device_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.device_id] = elem.device_name
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
