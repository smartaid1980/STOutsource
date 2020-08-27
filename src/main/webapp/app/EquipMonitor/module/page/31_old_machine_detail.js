export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      ctx.machineID = servkit.getURLParameter('machineId')
      if (ctx.machineID) {
        ctx.subscribe(ctx)
      } else {
        console.warn('no machineId in location.search, please check.')
      }
    },
    util: {
      $monitorPanel: $('#monitor-panel'),
      block: _.template(
        '<div class="col-md-3 col-sm-4 col-xs-12">' +
          ' <div class="block">' +
          '   <div class="icon fa fa-4x <%= icon %>" style="background-color: <%= icon_bgc %>"></div>' +
          '   <p><%= param_name %></p>' +
          '   <h2 class="<%= txtColor %>"><%= value %></h2>' +
          '   <div class="comment"><%= comment %></div>' +
          ' </div>' +
          '</div>'
      ),
      subscribe: function (ctx) {
        servkit.subscribe('js_old_machine', {
          machines: ctx.machineID,
          handler: function (data) {
            var machineData = ctx.commons.transformMachineData(
              data[ctx.machineID],
              ctx.preCon.paramConfig
            )
            ctx.renderPanel(ctx, machineData)
          },
          noDataHandler: function () {
            ctx.renderPanel(ctx, {})
          },
        })
      },
      renderPanel: function (ctx, machineData) {
        var sortedData = _.sortBy(_.values(machineData), 'sequence')
        ctx.$monitorPanel.html(
          _.map(sortedData, function (elem) {
            try {
              return ctx.block(elem)
            } catch (error) {
              // console.warn(error);
              return ''
            }
          }).join('')
        )
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
