import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.storeId = servkit.getURLParameter('storeId')
      $('#storeId').text(
        context.preCon.getStoreData[context.storeId].name || context.storeId
      )
      servkit.ajax(
        {
          url: 'api/storage/store/' + context.storeId + '/thing',
          type: 'GET',
        },
        {
          success: function (data) {
            context.grid = data.store_grid_count
            context.cell = data.store_type_cell
            context.init()
          },
        }
      )

      servkit
        .schedule('updateStoreData')
        .freqMillisecond(10 * 1000)
        .action(function () {
          servkit.ajax(
            {
              url: 'api/storage/store/' + context.storeId + '/thing',
              type: 'GET',
            },
            {
              success: function (data) {
                _.each(data.things, (val) => {
                  var $cell = $(
                    '.grid[data-index=' +
                      val.grid_index +
                      '] .cell[data-index=' +
                      val.cell_start_index +
                      ']'
                  )
                  // var html = []
                  // html.push('<span class="thing-name">' + val.thing.thing_name + '</span>')
                  // html.push(`<span>${i18n('Quantity')}：` + val.thing_pcs + '</span>')
                  // $cell.html(html.join(''))
                  $cell.css('background-color', servkit.statusColors.online)
                  $cell.attr(
                    'title',
                    context.getTitle(val.thing, val.thing_pcs)
                  )
                  // $cell.css('flex-basis', 5 * val.thing.thing_cell + '%')
                  for (var index = 1; index < val.thing.thing_cell; index++) {
                    var $otherCell = $(
                      '.grid[data-index=' +
                        val.grid_index +
                        '] .cell[data-index=' +
                        (val.cell_start_index + index) +
                        ']'
                    )
                    $cell.css('border-right-color', 'rgb(46, 139, 87)')
                    $otherCell.css('border-left-color', 'rgb(46, 139, 87)')
                    if (index < val.thing.thing_cell - 1) {
                      $otherCell.css('border-right-color', 'rgb(46, 139, 87)')
                    }
                    $otherCell.css(
                      'background-color',
                      servkit.statusColors.online
                    )
                    $otherCell.attr(
                      'title',
                      context.getTitle(val.thing, val.thing_pcs)
                    )
                  }
                })
              },
            }
          )
        })
        .start()

      $('#leave-btn').on('click', function () {
        window.location.href =
          '#app/StrongLEDMonitorManagement/function/' +
          servkit.getCookie('lang') +
          '/10_zone.html?zoneId=' +
          servkit.getURLParameter('zoneId')
      })
    },
    util: {
      storeId: null,
      lastItem: null,
      grid: 0,
      cell: 0,
      cellHtml: [],
      statusMap: {
        RED: 'alarm',
        YELLOW: 'idle',
        GREEN: 'online',
      },
      getTitle: function (data, thingPcs) {
        // 繪製tooltip
        var title = ''
        var materialData = this.preCon.getMaterialThingData[data.thing_id]
        var materialName = '---'
        var expDate = '---'
        if (materialData) {
          materialName =
            materialData.material_name ||
            this.preCon.getMaterialData[materialData.material_id]
          expDate = moment(materialData.exp_date, 'MMMM Do YYYY').format(
            'YYYY/MM/DD'
          )
        }
        title += `${i18n('Thing_ID')}：` + data.thing_id
        title += `\n${i18n('Material_Name')}：` + materialName
        title += `\n${i18n('Exp_Date')}：` + expDate
        title += `\n${i18n('Quantity')}：` + thingPcs
        return title
      },
      drawCell: function () {
        var ctx = this
        for (var cellIndex = 0; cellIndex < ctx.cell; cellIndex++) {
          ctx.cellHtml.push(
            '<div class="cell" data-index="' +
              cellIndex +
              '"><span class="cell-name">' +
              (cellIndex + 1) +
              '</span></div>'
          )
        }
        if (ctx.cell > 20 && ctx.cell % 20) {
          var empty = 20 - (ctx.cell % 20)
          for (var emptyIndex = 0; emptyIndex < empty; emptyIndex++) {
            ctx.cellHtml.push('<div class="cell empty"></div>')
          }
        }
      },
      init: function () {
        var ctx = this
        ctx.drawCell()

        var html = []
        // html.push('<div class="cell-name-title">')
        // html.push('  <span class="grid-name"></span>')
        // html.push('  <div class="cell-name-body">')
        // html = html.concat(ctx.cellHtml)
        // html.push('  </div>')
        // html.push('</div>')
        for (var gridIndex = 0; gridIndex < ctx.grid; gridIndex++) {
          var gridHtml = []
          gridHtml.push('<div class="grid" data-index="' + gridIndex + '">')
          var index = gridIndex + 1
          if (servkit.getCookie('lang') === 'en') {
            if (index === 1) {
              index = index + 'st'
            } else if (index === 2) {
              index = index + 'nd'
            } else if (index === 3) {
              index = index + 'rd'
            } else {
              index = index + 'th'
            }
          }
          gridHtml.push(
            '  <span class="grid-name">' +
              `${i18n('Grid_Name')}`.replace('{index}', index) +
              '</span>'
          )
          gridHtml.push('<div class="grid-body">')
          gridHtml = gridHtml.concat(ctx.cellHtml)
          gridHtml.push('  </div>')
          gridHtml.push('</div>')
          html.unshift(gridHtml.join(''))
        }
        $('#store').append(html.join(''))
      },
    },
    preCondition: {
      getStoreData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store',
              columns: ['store_id', 'store_name', 'store_rule'],
            }),
          },
          {
            success: function (data) {
              var storeData = {}
              _.each(data, function (elem) {
                storeData[elem.store_id] = {
                  name: elem.store_name,
                  rule: JSON.parse(elem.store_rule),
                }
              })
              done(storeData)
            },
          }
        )
      },
      getMaterialData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_material',
              columns: ['material_id', 'material_name'],
            }),
          },
          {
            success: function (data) {
              var materialData = {}
              _.each(data, function (elem) {
                materialData[elem.material_id] = elem.material_name
              })
              done(materialData)
            },
          }
        )
      },
      getMaterialThingData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_material_thing',
              columns: ['thing_id', 'material_id', 'exp_date', 'remark'],
            }),
          },
          {
            success: function (data) {
              var materialThingData = {}
              _.each(data, function (elem) {
                materialThingData[elem.thing_id] = {
                  material_id: elem.material_id,
                  exp_date: elem.exp_date,
                  material_name: elem.remark,
                }
              })
              done(materialThingData)
            },
          }
        )
      },
    },
  })
}
