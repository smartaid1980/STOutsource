import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.pickupReportTable = createReportTable({
        $tableElement: $('#pickup-table'),
        $tableWidget: $('#pickup-table-widget'),
        customBtns: [
          '<button class="btn btn-primary stk-refresh-btn" title="Refresh"><span class="fa fa-refresh fa-lg"></span></button>',
        ],
      })
      $('.stk-refresh-btn')
        .on('click', function () {
          $('.stk-refresh-btn .fa-refresh').addClass('fa-spin')
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_storage_pickup_log',
                columns: [
                  'work_no',
                  'order_no',
                  'pickup_color',
                  'create_time',
                  'create_by',
                  'pickup_timestamp',
                  'sender_key',
                ],
                whereClause: `pickup_end_time is null`,
              }),
            },
            {
              success: function (data) {
                context.pickupRenderTable(data)
                setTimeout(function () {
                  $('.stk-refresh-btn .fa-refresh').removeClass('fa-spin')
                }, 500)
              },
            }
          )
        })
        .trigger('click')

      $('#pickup-table').on('click', '.stop-pickup-btn', function () {
        var sendData = $(this).data()
        servkit.ajax(
          {
            url: 'api/storage/workopmaterial/pickup',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              work_id: String(sendData.work_id),
              op: String(sendData.op),
              pickup_timestamp: String(sendData.pickup_timestamp),
              sender_key: String(sendData.sender_key),
            }),
          },
          {
            success: function () {
              $('.stk-refresh-btn').trigger('click')
            },
          }
        )
      })
    },
    util: {
      pickupReportTable: null,
      pickupRenderTable: function (data) {
        var ctx = this
        ctx.pickupReportTable.drawTable(
          _.map(data, (val) => {
            var createTime = new Date(val.create_time)
            var tempTime = moment.duration(
              new Date().getTime() - createTime.getTime()
            )
            var times = ''
            if (tempTime.days()) {
              times = tempTime.days() + `${i18n('Day')} `
            }
            times +=
              tempTime.hours() +
              `${i18n('Hour')} ` +
              tempTime.minutes() +
              `${i18n('Min')} ` +
              tempTime.seconds() +
              `${i18n('Second')}`
            return [
              val.work_no || '---',
              val.order_no || '---',
              val.pickup_color || '---',
              val.create_by || '---',
              val.create_time
                ? moment(createTime).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.create_time ? times : '---',
              `<button class="btn btn-primary stop-pickup-btn" data-work_id="${
                val.work_no
              }" data-op="${val.order_no}" data-pickup_timestamp="${
                val.pickup_timestamp
              }" data-sender_key="${val.sender_key}">${i18n(
                'Stop_Pickup'
              )}</button>`,
            ]
          })
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
