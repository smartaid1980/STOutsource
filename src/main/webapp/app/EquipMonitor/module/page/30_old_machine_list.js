export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.drawList(ctx)

      ctx.subscribe(ctx)

      ctx.$listBox.on('click', '.panel.pointer', function () {
        var machineId = $(this).parent().attr('id')
        location.assign(
          location.href
            .replace('index.html#', 'index.html?machineId=' + machineId + '#')
            .replace(ctx.funId, '31_old_machine_detail')
        )
      })
    },
    util: {
      $listBox: $('#list_box'),
      drawList: function (ctx) {
        ctx.$listBox.html(
          _.map(servkit.getMachineList(), function (machineId) {
            return ctx.panelTemplate({
              machineId: machineId,
              machineName: servkit.getMachineName(machineId),
            })
          }).join('')
        )
      },
      panelTemplate: _.template(
        '<div class="col-md-4" id="<%= machineId %>">' +
          ' <div class="panel">' +
          '   <div name="status" class="panel-heading" style="background-color: darkgrey;">' +
          '     <h3 name="title" class="panel-title"><%= machineName %></h3>' +
          '   </div>' +
          '   <div class="panel-body row">' +
          '     <div class="info col-xs-4">' +
          '       <h4 name="current">---</h4>' +
          '       <small>運行電流</small>' +
          '     </div>' +
          '     <div class="info col-xs-4">' +
          '      <h4 name="temperature">---</h4>' +
          '      <small>曲軸溫度</small>' +
          '    </div>' +
          '    <div class="info col-xs-4">' +
          '      <h4 name="times">---</h4>' +
          '      <small>沖壓次數</small>' +
          '    </div>' +
          '   </div>' +
          '   <div class="panel-footer">' +
          '     <b>潤滑油最近檢查時刻: </b>' +
          '     <b name="footer">---</b>' +
          '   </div>' +
          ' </div>' +
          '</div>'
      ),
      subscribe: function (ctx) {
        servkit.subscribe('js_old_machine', {
          machines: servkit.getMachineList(),
          handler: function (data) {
            $('.panel.pointer').removeClass('pointer')
            _.each(data, function (machineData, machineId) {
              ctx.updateData(machineId, machineData, ctx)
            })
          },
          noDataHandler: function () {
            $('.panel.pointer').removeClass('pointer')
            ctx.updateData('list_box', {}, ctx)
          },
        })
      },
      updateData: function (machineId, data, ctx) {
        data.status =
          data.status === undefined || data.status === 'B' ? '0' : data.status
        var machineData = ctx.commons.transformMachineData(
          data,
          ctx.preCon.paramConfig
        )
        try {
          $('#' + machineId)
            .find('.panel')
            .addClass(data.status != '0' ? 'pointer' : '')
            .end()
            .find('[name="status"]')
            .css('background-color', servkit.getMachineLightColor(data.status))
            .end()
            .find('[name="current"]')
            .text(machineData.current ? machineData.current.value : '---')
            .end()
            .find('[name="temperature"]')
            .text(
              machineData.temperature_probe
                ? machineData.temperature_probe.value
                : '---'
            )
            .end()
            .find('[name="times"]')
            .text(
              machineData.light1_on_times
                ? machineData.light1_on_times.value
                : '---'
            )
            .end()
            .find('[name="footer"]')
            .text(
              machineData.light3_last_on
                ? machineData.light3_last_on.value
                : '---'
            )
        } catch (error) {
          console.warn(error)
        }
      },
    },
    preCondition: {
      paramConfig: function (done) {
        try {
          servkit.ajax(
            {
              url:
                'api/stdcrud?tableModel=com.servtech.servcloud.module.model.UnitParam',
            },
            {
              success: function (data) {
                var paramConfig = _.reduce(
                  data,
                  function (memo, elem) {
                    if (!memo[elem.type]) {
                      memo[elem.type] = {}
                    }
                    memo[elem.type][elem.param_id] = elem
                    return memo
                  },
                  {}
                )
                done(paramConfig)
              },
            }
          )
        } catch (error) {
          console.warn(error)
          done(null)
        }
      },
    },
    delayCondition: ['machineList', 'machineLightList'],
  })
}
