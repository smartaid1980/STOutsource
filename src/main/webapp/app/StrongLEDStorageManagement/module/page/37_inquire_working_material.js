import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      $('#store-widget .jarviswidget-toggle-btn').trigger('click')

      context.schedule = servkit
        .schedule('updateStoreData')
        .freqMillisecond(5 * 1000)
        .action(function () {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_storage_pickup_log',
                columns: ['work_no', 'order_no'],
                whereClause: `pickup_end_time is null`,
              }),
            },
            {
              success: function (data) {
                var workOp = []
                _.each(data, (val) => {
                  workOp.push({
                    work_id: val.work_no,
                    op: val.order_no,
                  })
                })
                // 取得倉庫裡的物料
                servkit.ajax(
                  {
                    url: 'api/getdata/db',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                      table: 'a_storage_store_thing_map',
                      columns: [
                        'store_id',
                        'grid_index',
                        'cell_start_index',
                        'cell_end_index',
                        'thing_cell',
                        'thing_id',
                        'thing_pcs',
                      ],
                    }),
                  },
                  {
                    success: function (data) {
                      context.storageData = {}
                      _.each(data, (val) => {
                        if (!context.storageData[val.store_id]) {
                          context.storageData[val.store_id] = {}
                        }
                        context.storageData[val.store_id][val.thing_id] = {
                          thing_id: val.thing_id,
                          grid_index: val.grid_index,
                          cell_start_index: val.cell_start_index,
                          cell_end_index: val.cell_end_index,
                          thing_cell: val.thing_cell,
                          thing_pcs: val.thing_pcs,
                          material_id: context.preCon.getMaterialThingData[
                            val.thing_id
                          ]
                            ? context.preCon.getMaterialThingData[val.thing_id]
                                .material_id
                            : null,
                          exp_date: context.preCon.getMaterialThingData[
                            val.thing_id
                          ]
                            ? context.preCon.getMaterialThingData[val.thing_id]
                                .exp_date
                            : null,
                        }
                      })

                      // 取得工單所需物料位置
                      context.getWorkOpMaterial(workOp, function () {
                        if (!Object.keys(context.materialData).length) {
                          $('#zoneId').text('')
                          $('#storeId').text('')
                          $('#store').html('')
                          $('#space').html('')
                          if (!$('#space').parent().find('.alert').length) {
                            $('#space').before(
                              `<div class="alert alert-info">${i18n(
                                'No_Work_Pick_Info'
                              )}</div>`
                            )
                          }
                          context.inited = false
                          if (
                            $(
                              '#zone-widget .jarviswidget-toggle-btn>i'
                            ).hasClass('fa-plus')
                          ) {
                            $('#zone-widget .jarviswidget-toggle-btn').trigger(
                              'click'
                            )
                          }
                          if (
                            $(
                              '#store-widget .jarviswidget-toggle-btn>i'
                            ).hasClass('fa-minus')
                          ) {
                            $('#store-widget .jarviswidget-toggle-btn').trigger(
                              'click'
                            )
                          }
                        }
                        if (
                          !context.inited &&
                          context.materialData &&
                          context.materialData.zone_id
                        ) {
                          $('#space').parent().find('.alert').remove()
                          $('#space').html('<div><img class="bg"></div>')
                          // 繪製區域的狀態
                          context.zoneId = context.materialData.zone_id
                          context.drawStoreEqip()
                          context.inited = true
                        }
                        if (context.storeId) {
                          // 繪製庫的狀態(需選取庫後才會畫)
                          $('.non-empty').removeClass('non-empty')
                          context.reDrawCellStatus()
                        }
                        _.each(context.storageData, (elem, storeId) => {
                          $('#' + storeId).addClass('online')
                        })
                        if (
                          context.materialData &&
                          context.materialData.stores &&
                          context.materialData.stores[context.storeId] &&
                          context.materialData.stores[context.storeId].things &&
                          context.materialData.stores[context.storeId].things
                            .length
                        ) {
                          _.each(
                            context.materialData.stores,
                            (elem, storeId) => {
                              if (elem.things && elem.things.length) {
                                $('#' + storeId).addClass('non-empty')
                              }
                            }
                          )
                        }
                      })
                    },
                  }
                )
              },
            }
          )
        })
        .start()

      $('#space').on('click', '.store', function () {
        context.storeId = this.getAttribute('id')
        $('#storeId').html(
          context.preCon.getStoreData[context.zoneId][context.storeId].name
        )
        context.cell =
          context.preCon.getStoreTypeData[
            context.materialData.stores[context.storeId].store_type_id
          ]
        context.grid =
          context.materialData.stores[context.storeId].store_grid_count
        // 重畫庫的格子
        context.init()
        // 繪製庫的狀態
        context.reDrawCellStatus()
        if ($('#store-widget .jarviswidget-toggle-btn>i').hasClass('fa-plus')) {
          $('#store-widget .jarviswidget-toggle-btn').trigger('click')
        }
        if ($('#zone-widget .jarviswidget-toggle-btn>i').hasClass('fa-minus')) {
          $('#zone-widget .jarviswidget-toggle-btn').trigger('click')
        }
      })
    },
    util: {
      materialData: null,
      grid: 0,
      cell: 0,
      cellHtml: [],
      storageData: {},
      zoneId: null,
      storeId: null,
      workId: null,
      op: null,
      schedule: null,
      inited: false,
      colorMap: {
        Y: `${i18n('Yellow')}`,
        G: `${i18n('Green')}`,
        R: `${i18n('Red')}`,
      },
      getWorkOpMaterial: function (workOpList, callback) {
        // 拿到工單要用的料
        var ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_pickup',
              columns: ['work_order_no', 'pickup_color'],
            }),
          },
          {
            success: function (cData) {
              var colorData = {}
              _.each(cData, (val) => {
                colorData[val.work_order_no] = val.pickup_color
              })
              var whereClause = []
              _.each(workOpList, (val) => {
                whereClause.push(
                  `(work_id='${val.work_id}' AND op='${
                    val.op
                  }' AND thing_profile='${val.work_id + val.op}')`
                )
              })
              ctx.materialData = {}
              if (whereClause.length) {
                servkit.ajax(
                  {
                    url: 'api/getdata/db',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                      table: 'a_storage_work_op_material_thing_view',
                      columns: [
                        'material_id',
                        'thing_id',
                        'zone_id',
                        'store_id',
                        'grid_index',
                        'cell_start_index',
                        'store_thing_pcs',
                        'thing_cell',
                        'exp_date',
                        'thing_profile',
                        'work_id',
                        'op',
                      ],
                      whereClause: `(${whereClause.join(
                        ' OR '
                      )}) AND store_id is not null`,
                    }),
                  },
                  {
                    success: function (data) {
                      var colorHtml = []
                      _.each(data, (thing) => {
                        ctx.materialData.zone_id = thing.zone_id
                        if (!ctx.materialData.stores) {
                          ctx.materialData.stores = JSON.parse(
                            JSON.stringify(
                              ctx.preCon.getStoreData[thing.zone_id]
                            )
                          )
                        }
                        if (!ctx.materialData.stores[thing.store_id].things) {
                          ctx.materialData.stores[thing.store_id].things = []
                        }
                        if (colorData[thing.thing_profile]) {
                          colorHtml.push(
                            ctx.colorMap[colorData[thing.thing_profile]] +
                              `(${i18n('Work_ID')}：` +
                              thing.work_id +
                              `, ${i18n('OP')}：` +
                              thing.op +
                              ')'
                          )
                          ctx.materialData.stores[thing.store_id].things.push({
                            grid_index: thing.grid_index,
                            cell_start_index: thing.cell_start_index,
                            thing_id: thing.thing_id,
                            thing_pcs: thing.store_thing_pcs,
                            thing_cell: thing.thing_cell,
                            material_id: thing.material_id,
                            exp_date: thing.exp_date,
                            work_id: thing.work_id,
                            op: thing.op,
                            color: colorData[thing.thing_profile],
                          })
                        }
                      })
                      $('#color-info').html(colorHtml.join('<br>'))
                      if (callback) {
                        callback(data)
                      }
                    },
                  }
                )
              }
            },
            fail: function (data) {
              alert(data)
            },
          }
        )
      },
      getTitle: function (data) {
        // 繪製tooltip
        var title = ''
        if (data.work_id) {
          title += `${i18n('Work_ID')}：` + data.work_id
          title += `\n${i18n('OP')}：` + data.op + '\n'
        }
        title += `${i18n('Thing_ID')}：` + data.thing_id
        title +=
          `\n${i18n('Material_Name')}：` +
          this.preCon.getMaterialData[data.material_id]
        title +=
          `\n${i18n('Exp_Date')}：` +
          moment(data.exp_date, 'MMMM Do YYYY').format('YYYY/MM/DD')
        title += `\n${i18n('Quantity')}：` + data.thing_pcs
        return title
      },
      drawStoreEqip: function () {
        var ctx = this
        $('#zoneId').html(ctx.preCon.getZoneData[ctx.zoneId])
        $('.bg').attr(
          'src',
          './api/equipmonitor/plantAreaBackground?id=' +
            ctx.zoneId +
            '&_' +
            new Date()
        )
        servkit.ajax(
          {
            url: 'api/getdata/file',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              type: 'zone',
              pathPattern: '{data}',
              pathParam: {
                data: [ctx.zoneId],
              },
            }),
          },
          {
            success: function (data) {
              var bodyHtml = []
              bodyHtml.push(
                '<div id="<%= id %>" class="store <%= status %>" style="top: <%= top %>; left: <%= left %>">'
              )
              bodyHtml.push('  <div>')
              bodyHtml.push('    <div class="store-title clearfix">')
              bodyHtml.push('      <div class="text">')
              bodyHtml.push('        <span><%= name %></span>')
              bodyHtml.push('        <span class="use-status"></span>')
              bodyHtml.push('      </div>')
              bodyHtml.push('    </div>')
              bodyHtml.push('    <div class="store-info clearfix <%= hide %>">')
              bodyHtml.push('      <table>')
              bodyHtml.push('        <%= labels %>')
              bodyHtml.push('      </table>')
              bodyHtml.push('    </div>')
              bodyHtml.push('  </div>')
              bodyHtml.push(
                '  <div class="store-img" style="width:<%= width %>;height:<%= height %>;"><img src="<%= imgsrc %>"></div>'
              )
              bodyHtml.push('</div>')
              var profile =
                data == '' || data.length == 0
                  ? null
                  : JSON.parse(unescape(data))
              var storeProfile
              if (profile) {
                storeProfile = _.uniq(profile.stores, (val) => {
                  return val.id
                })
              }
              var html = []
              console.log(storeProfile)
              console.log(ctx.storageData)
              _.each(storeProfile, function (d) {
                var status = ''
                if (ctx.storageData[d.id]) {
                  status = 'online'
                }
                if (
                  ctx.materialData &&
                  ctx.materialData.stores &&
                  ctx.materialData.stores[d.id] &&
                  ctx.materialData.stores[d.id].things &&
                  ctx.materialData.stores[d.id].things.length
                ) {
                  status = 'non-empty'
                }
                var labelHtml = []
                html.push(
                  _.template(bodyHtml.join(''))({
                    id: d.id,
                    name:
                      ctx.preCon.getStoreData[ctx.zoneId][d.id].name || d.id,
                    status: status,
                    width:
                      d.image && d.image.width ? d.image.width + 'px' : null,
                    height:
                      d.image && d.image.height ? d.image.height + 'px' : null,
                    imgsrc: null,
                    top: d.pos.y,
                    left: d.pos.x,
                    hide: d.labels.length ? '' : 'hide',
                    labels: labelHtml.join(''),
                  })
                )
              })
              $('#space>div').find('.store').remove()
              $('#space>div').append(html.join(''))
              ctx.schedule.start()
              if (
                $('#zone-widget .jarviswidget-toggle-btn>i').hasClass('fa-plus')
              ) {
                $('#zone-widget .jarviswidget-toggle-btn').trigger('click')
              }
            },
          }
        )
      },
      drawCell: function () {
        var ctx = this
        ctx.cellHtml = []
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
      reDrawCellStatus: function () {
        $('.online').removeClass('online')
        $('.cell-non-empty').removeClass('cell-non-empty')
        $('.border-right').removeClass('border-right')
        $('.border-left').removeClass('border-left')
        var ctx = this
        if (ctx.storageData[ctx.storeId]) {
          _.each(ctx.storageData[ctx.storeId], (val) => {
            ctx.changeCellStatus(val, 'online')
          })
        }
        if (
          ctx.materialData &&
          ctx.materialData.stores &&
          ctx.materialData.stores[ctx.storeId] &&
          ctx.materialData.stores[ctx.storeId].things
        ) {
          _.each(ctx.materialData.stores[ctx.storeId].things, (val) => {
            ctx.changeCellStatus(val, 'cell-non-empty')
          })
        }
      },
      changeCellStatus: function (val, className) {
        var ctx = this
        var $cell = $(
          '.grid[data-index=' +
            val.grid_index +
            '] .cell[data-index=' +
            val.cell_start_index +
            ']'
        )
        $cell.attr('title', ctx.getTitle(val))
        $cell.addClass(className)
        if (val.color) {
          $cell.addClass(val.color)
        }
        for (var index = 1; index < val.thing_cell; index++) {
          var $otherCell = $(
            '.grid[data-index=' +
              val.grid_index +
              '] .cell[data-index=' +
              (val.cell_start_index + index) +
              ']'
          )
          $cell.addClass('border-right')
          $otherCell.addClass('border-left')
          if (index < val.thing_cell - 1) {
            $otherCell.addClass('border-right')
          }
          $otherCell.attr('title', ctx.getTitle(val))
          $otherCell.addClass(className)
          if (val.color) {
            $otherCell.addClass(val.color)
          }
        }
      },
      init: function () {
        var ctx = this
        ctx.drawCell()

        var html = []
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
        $('#store').empty().append(html.join(''))
      },
    },
    preCondition: {
      getZoneData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_zone',
              columns: ['zone_id', 'zone_name'],
            }),
          },
          {
            success: function (data) {
              var zoneData = {}
              _.each(data, function (elem) {
                zoneData[elem.zone_id] = elem.zone_name
              })
              done(zoneData)
            },
          }
        )
      },
      getStoreData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store',
              columns: [
                'store_id',
                'store_name',
                'zone_id',
                'store_rule',
                'store_type_id',
                'store_grid_count',
              ],
            }),
          },
          {
            success: function (data) {
              var storeData = {}
              _.each(data, function (elem) {
                if (!storeData[elem.zone_id]) {
                  storeData[elem.zone_id] = {}
                }
                if (!storeData[elem.zone_id][elem.store_id]) {
                  storeData[elem.zone_id][elem.store_id] = {}
                }
                storeData[elem.zone_id][elem.store_id].name = elem.store_name
                storeData[elem.zone_id][elem.store_id].rule = JSON.parse(
                  elem.store_rule
                )
                storeData[elem.zone_id][elem.store_id].store_type_id =
                  elem.store_type_id
                storeData[elem.zone_id][elem.store_id].store_grid_count =
                  elem.store_grid_count
              })
              done(storeData)
            },
          }
        )
      },
      getStoreTypeData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store_type',
              columns: ['store_type_id', 'store_type_cell'],
            }),
          },
          {
            success: function (data) {
              var storeTypeData = {}
              _.each(data, function (elem) {
                storeTypeData[elem.store_type_id] = elem.store_type_cell
              })
              done(storeTypeData)
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
              columns: ['thing_id', 'material_id', 'exp_date'],
            }),
          },
          {
            success: function (data) {
              var materialThingData = {}
              _.each(data, function (elem) {
                materialThingData[elem.thing_id] = {
                  material_id: elem.material_id,
                  exp_date: elem.exp_date,
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
