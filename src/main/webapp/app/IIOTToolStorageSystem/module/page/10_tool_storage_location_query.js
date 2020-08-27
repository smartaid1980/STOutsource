export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 初始元件
      servkit.initDatePicker($('#start-date'), $('#end-date'), true, false)
      var locationList = {}
      _.each(
        context.preCon.getLocations,
        (val, key) => (locationList[key] = key)
      )
      servkit.initSelectWithList(locationList, $('#location'))
      $('#location')
        .prepend(
          '<option style="padding:3px 0 3px 3px;" value="">所有儲位</option>'
        )
        .val($('#location option:first').val())
      // $('#location').select2().select2('val', '')
      context.toolTableReportTable = createReportTable({
        $tableElement: $('#tool-table'),
        $tableWidget: $('#tool-table-widget'),
        customBtns: [
          '<div id="query-info"><div>異動時間：<span id="query-time"></span></div><div>儲位：<span id="query-location"></span></div><div>原因：<span id="query-reason"></span></div></div>',
        ],
      })

      // 查詢
      servkit.validateForm($('#query-form'), $('#submit-btn'))
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        context.loadingBtn.doing()
        const start = $('#start-date').val()
        const end = $('#end-date').val()
        const location = $('#location option:selected').val()
        const $reason = $('[name=use]:checked')
        context.reasonList = []

        // 查詢資料填入資訊欄
        $('#query-time').text(start + '~' + end)
        $('#query-location').text($('#location option:selected').text())
        $('#query-reason').text(
          _.map($reason, (ele) => {
            return $(ele).attr('text')
          }).join('、')
        )

        // 設定查詢條件
        var whereClause =
          `((move_in BETWEEN '${start} 00:00:00' AND '${end} 23:59:59')` +
          ` OR (move_out BETWEEN '${start} 00:00:00' AND '${end} 23:59:59'))`
        if (location) {
          var pos = location.split('_')
          whereClause += ` AND shelf_id='${pos[0]}' AND layer_id='${pos[1]}' AND position_id='${pos[2]}'`
        }
        if ($reason.length) {
          whereClause += ` AND (`
          _.each($reason, (ele, key) => {
            if (key) whereClause += ` OR `
            const value = $(ele).attr('value')
            context.reasonList.push(value)
            if (value === '1') whereClause += `move_out_by=2`
            else if (value === '2') whereClause += `move_in_by=2`
            else if (value === '3') whereClause += `move_in_by=1`
            else if (value === '4') whereClause += `move_out_by=1`
          })
          whereClause += `)`
        }

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_on_store',
              columns: [
                'shelf_id',
                'layer_id',
                'position_id',
                'move_in',
                'move_out',
                'tool_id',
                'move_in_by',
                'move_out_by',
              ],
              whereClause: whereClause,
            }),
          },
          {
            success: function (data) {
              context.toolTableRenderTable(data)
              context.loadingBtn.done()
            },
          }
        )
      })
    },
    util: {
      reasonList: [],
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      toolTableReportTable: null,
      toolTableRenderTable: function (data) {
        var result = []
        const reasonList = this.reasonList
        _.each(data, (val) => {
          if (
            !reasonList.length ||
            reasonList.find((ele) => {
              return (
                (ele === '2' && val.move_in_by === 2) ||
                (ele === '3' && val.move_in_by === 1)
              )
            })
          )
            result.push([
              val.move_in
                ? moment(val.move_in).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.shelf_id + '_' + val.layer_id + '_' + val.position_id,
              val.tool_id || '未匹配備刀單',
              val.move_in_by === 2
                ? '歸還'
                : val.move_in_by === 1
                ? '上架'
                : '---',
            ])
          if (
            val.move_out &&
            (!reasonList.length ||
              reasonList.find((ele) => {
                return (
                  (ele === '1' && val.move_out_by === 2) ||
                  (ele === '4' && val.move_out_by === 1)
                )
              }))
          )
            result.push([
              val.move_out
                ? moment(val.move_out).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              val.shelf_id + '_' + val.layer_id + '_' + val.position_id,
              val.tool_id || '未匹配備刀單',
              val.move_out_by === 2
                ? '領用'
                : val.move_out_by === 1
                ? '下架'
                : '---',
            ])
        })
        console.log(result)
        this.toolTableReportTable.drawTable(result)
      },
    },
    preCondition: {
      getLocations: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_shelf',
              columns: ['shelf_id', 'layer_id', 'position_id'],
            }),
          },
          {
            success: function (data) {
              var locationMap = {}
              _.each(data, (val) => {
                const location =
                  val.shelf_id + '_' + val.layer_id + '_' + val.position_id
                locationMap[location] = {
                  shelf_id: val.shelf_id,
                  layer_id: val.layer_id,
                  position_id: val.position_id,
                }
              })
              done(locationMap)
            },
          }
        )
      },
    },
    dependencies: [
      // [
      //   '/js/plugin/select2/select2.min.js'
      // ],
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
