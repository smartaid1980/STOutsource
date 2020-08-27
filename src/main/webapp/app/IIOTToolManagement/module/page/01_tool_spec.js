import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      servkit.validateForm($('#query-form'), $('#submit'))
      $('#tool-type').select2()
      servkit.initSelectWithList(ctx.preCon.getToolType, $('#tool-type'))
      $('#tool-code').select2()
      servkit.initSelectWithList(ctx.preCon.getToolCode, $('#tool-code'))
      ctx.init()

      ctx.appendLastSyncTimeMsg(ctx.preCon.systemJobLog)

      $('#erp-sync').on('click', function (evt) {
        evt.preventDefault()
        ctx.erpSync()
      })

      $('#submit').on('click', function (evt) {
        evt.preventDefault()
        ctx.getToolErpSync($('#tool-type').val(), $('#tool-code').val())
      })
    },
    util: {
      $toolErpSync: $('#tool-erp-sync'),
      $toolErpSyncBody: $('#tool-erp-sync-body'),
      $toolType: $('#tool-type'),
      $toolCode: $('#tool-code'),
      appendLastSyncTimeMsg: function (data) {
        var ctx = this
        var lastSyncTimeMsg =
          '<font style="color:' +
          servkit.colors.red +
          `;">${i18n('Last_Synchronization:')}` +
          (data.length == 0
            ? `${i18n('No_time_synchronization')}`
            : data[0]['end_time']) +
          '</font>'
        $('#erp-sync-msg').html(lastSyncTimeMsg)
      },
      init: function () {
        var ctx = this
        ctx.$toolType.prop('selectedIndex', -1)
        ctx.$toolCode.prop('selectedIndex', -1)
        ctx.getToolErpSync(ctx.$toolType.val(), ctx.$toolCode.val())
      },
      queryJobLog2apendMsg: function () {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_system_job_log',
              columns: [
                'DATE_FORMAT(end_time,"%Y-%m-%d %H:%i:%s") AS end_time',
              ],
              whereClause:
                'system_job_id LIKE "%tool_erp_sync%" order by end_time DESC limit 1;',
            }),
          },
          {
            success: function (data) {
              ctx.appendLastSyncTimeMsg(data)
            },
          }
        )
      },
      erpSync: function () {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/iiot/tool/management/syncErp',
            type: 'GET',
          },
          {
            success: function (data) {
              setTimeout(function () {
                ctx.queryJobLog2apendMsg()
              }, 3000)
            },
          }
        )
      },
      validateDecimal: function (val) {
        if (isNaN(val)) {
          return `${i18n('Please_fill_in_numbers')}`
        }
      },
      getToolErpSync: function (toolType, toolCode) {
        var ctx = this
        if (!ctx.crudOpTable) {
          var crudTable = ctx.$toolErpSync[0].cloneNode(true)
          ctx.crudOpTable = crudTable
        } else {
          ctx.$toolErpSyncBody.html(ctx.crudOpTable.cloneNode(true))
        }
        var whereClauseSql =
          'tool_type ' +
          (toolType == null ? 'IS NOT NULL' : "= '" + toolType + "'") +
          ' AND tool_code ' +
          (toolCode == null ? 'IS NOT NULL' : "= '" + toolCode + "'")
        servkit.crudtable({
          tableSelector: '#tool-erp-sync',
          tableModel: 'com.servtech.servcloud.app.model.iiot.IiotToolErpSync',
          customBtns: [
            `<button class="btn btn-primary undefinedBtn" title="erp-sync" id="erp-sync">${i18n(
              'Sync_With_ERP'
            )}</button><span id="erp-sync-msg"></span>`,
          ],
          rightColumn: [4, 5],
          order: [[0, 'asc']],
          create: {
            unavailable: true,
          },
          read: {
            url: 'api/stdcrud',
            whereClause: whereClauseSql,
          },
          update: {
            url: 'api/stdcrud',
            start: {
              2: function (oldTd, newTd, oldTr, newTr) {
                var toolSpec = $(oldTd).text()
                if (toolSpec == '') {
                  $(newTd).find('[name=tool_spec]').val(' ')
                } else {
                  $(newTd).find('[name=tool_spec]').val(toolSpec)
                }
              },
              3: function (oldTd, newTd, oldTr, newTr) {
                var toolType = $(oldTd).text()
                if (toolType == '') {
                  $(newTd).find('[name=tool_type]').val(' ')
                } else {
                  $(newTd).find('[name=tool_type]').val(toolType)
                }
              },
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            4: function (td, table) {
              var input = td.querySelector('input')
              return ctx.validateDecimal(input.value)
            },
            5: function (td, table) {
              var input = td.querySelector('input')
              return ctx.validateDecimal(input.value)
            },
          },
        })
      },
    },
    preCondition: {
      getToolType: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_erp_sync',
              columns: ['tool_type', 'tool_type'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.tool_type] = elem.tool_type
              })
              done(dataMap)
            },
          }
        )
      },
      getToolCode: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_tool_erp_sync',
              columns: ['tool_code', 'tool_code'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.tool_code] = elem.tool_code
              })
              done(dataMap)
            },
          }
        )
      },
      systemJobLog: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_iiot_system_job_log',
              columns: [
                'DATE_FORMAT(end_time,"%Y-%m-%d %H:%i:%s") AS end_time',
              ],
              whereClause:
                'system_job_id LIKE "%tool_erp_sync%" order by end_time DESC limit 1;',
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
