export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var plantArea = context.commons.plantArea(
        {
          byBrand: true,
        },
        'machineEdit'
      )
      pageSetUp()

      $('#load-modal table thead').on('click', function (evt) {
        evt.preventDefault()
        $('#load-modal table tbody').addClass('hide')
        $('#load-modal table thead i')
          .removeClass('fa-plus')
          .addClass('fa-minus')
        $(this).closest('table').find('tbody').removeClass('hide')
        $(this)
          .closest('table')
          .find('thead i')
          .removeClass('fa-minus')
          .addClass('fa-plus')
      })

      $('#load-modal').on('hidden.bs.modal', function () {
        context.machineId = plantArea.getMachineInfo().machineId
        context.brandId = plantArea.getMachineInfo().brandId
        if (context.brandId) {
          context.sourceMap.id = context.brandId
          context.sourceMap.name = servkit.getBrandName(context.brandId)
          context.sourceMap.by = 'brand'
        } else {
          context.sourceMap.id = context.machineId
          context.sourceMap.name = servkit.getMachineName(context.machineId)
          context.sourceMap.by = 'machine'
        }

        function paramBuffer(csv) {
          context.paramMap = {}
          var template = 1
          for (var rowIndex = 1; rowIndex < csv.length; rowIndex++) {
            var param = {}
            for (var colIndex = 0; colIndex < csv[0].length; colIndex++) {
              if (csv[0][colIndex] === 'groupName') {
                param['groupName-zh_tw'] = csv[rowIndex][colIndex] || ''
              } else if (csv[0][colIndex] === 'zh_cn') {
                param['zh'] = csv[rowIndex][colIndex] || ''
              } else {
                param[csv[0][colIndex]] = csv[rowIndex][colIndex] || ''
              }
            }
            var alphabets = /[A-Za-z]/
            if (!alphabets.test(param.position)) {
              if (Number(param.position) < 2) {
                param.position = 'T1-A'
              } else if (Number(param.position) < 6) {
                param.position = 'T1-B'
              } else if (Number(param.position) < 10) {
                param.position = 'T1-C'
              } else if (Number(param.position) < 11) {
                param.position = 'P_' + param.position.split('.')[1]
              } else {
                param.position = 'O' + (Number(param.position) - 10)
              }
            }

            if (param.position.charAt(0).toUpperCase() === 'T') {
              template = parseInt(param.position.split('-')[0].replace('T', ''))
            }
            context.addToParamMap(param)
          }
          context.addTemplate()
          context.machineMonitor = context.commons.machineMonitor(
            context.paramMap,
            context.sourceMap.name,
            'edit'
          )
          $('.template button[data-id=' + template + ']').trigger('click')
        }

        //讀取參數檔
        context.getParamFile(paramBuffer)
      })

      $('.template button').on('click', function () {
        $('.template button').removeClass('clicked')
        $(this).addClass('clicked')
        var template = $(this).data('id')
        context.machineMonitor.changeTemplate(template)
        context.machineMonitor.param = context.paramMap
        context.machineMonitor.draw()
        console.log(context.machineMonitor)
      })

      $('#createWidget').on('click', function () {
        var id = $(this).closest('div').prev().find('.group-frame').data('id')
        if (id.indexOf('O') < 0) {
          id = 'O1'
        } else {
          id = 'O' + (parseInt(id.replace('O', '')) + 1)
        }
        context.paramMap[id] = []
        context.paramMap[id].push(context.getInitParam())
        context.machineMonitor.draw()
      })

      $('.stk-machine-save').on('click', function () {
        var dataList = []
        var template = $('.template>button.clicked').data('id')
        _.each(context.paramMap, (group, groupKey) => {
          if (
            groupKey.indexOf('T' + template) >= 0 ||
            groupKey.indexOf('T') < 0
          ) {
            if (_.isArray(group)) {
              var find = _.find(group, (val) => {
                return _.isArray(val)
              })
              _.each(group, (index, indexKey) => {
                if (_.isArray(index)) {
                  _.each(index, (param) => {
                    param.position = groupKey + '_' + (indexKey + 1)
                    dataList.push(param)
                  })
                } else {
                  if (find) {
                    index.position = groupKey + '_' + (indexKey + 1)
                  } else {
                    index.position = groupKey
                  }
                  dataList.push(index)
                }
              })
            } else {
              group.position = groupKey
              dataList.push(group)
            }
          }
        })
        var saveData = {
          data: dataList,
        }
        if (context.sourceMap.by === 'brand') {
          saveData.brand_id = context.brandId
        } else {
          saveData.device_id = context.machineId
        }
        servkit.ajax(
          {
            url: 'api/equipmonitor/saveMachineParamsToFile',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(saveData),
          },
          {
            success: function () {
              alert('存檔成功!')
            },
            fail: function () {
              alert('存檔失敗!')
            },
          }
        )
      })

      $('#widget-grid')
        .off('click')
        .on('click', function () {
          // 點旁邊全部回到預覽
          context.changeWidgetHeader()
          context.changeGroupTitle()
        })
        .on('click', '.stk-widget-delete', function () {
          // 刪掉widget
          if (confirm('確認刪除widget?')) {
            var id = Number(
              $(this)
                .closest('article')
                .find('.widget-body')
                .data('id')
                .replace('O', '')
            )
            var max = 0
            _.each(context.paramMap, (val, key) => {
              var index = Number(key.replace('O', ''))
              if (key.indexOf('O') >= 0 && Number(key.replace('O', '')) > id) {
                context.paramMap['O' + index - 1] = val
              }
              if (max < index) {
                max = index
              }
            })
            if (max) {
              context.paramMap['O' + max] = null
              delete context.paramMap['O' + max]
            }
            $(this).closest('article').remove()
            context.machineMonitor.draw()
          }
        })
        .on('click', '.dropdown-menu > li', function () {
          // 選擇widget占比
          var value = $(this).find('a').attr('value')
          $(this).closest('.btn-group').find('button > span').html(value)
          $(this).closest('.btn-group').find('button').attr('value', value)
          var $article = $(this).closest('article')
          var id = $article.find('.group-frame').data('id')
          var classIndex = _.findIndex($article[0].classList, (className) => {
            return className.indexOf('col-lg') >= 0
          })
          $article
            .removeClass($article[0].classList[classIndex])
            .addClass('col-lg-' + value)
          classIndex = _.findIndex($article[0].classList, (className) => {
            return className.indexOf('col-md') >= 0
          })
          $article
            .removeClass($article[0].classList[classIndex])
            .addClass('col-md-' + value)
          _.each(context.paramMap[id], (param) => {
            if (_.isArray(param)) {
              _.each(param, (p) => {
                p.groupGrid = value
              })
            } else {
              param.groupGrid = value
            }
          })
        })
        .on('click', '.stk-source-show', function () {
          $(this).addClass('hide')
          $(this).next().removeClass('hide')
          $(this)
            .closest('header')
            .next()
            .find('.widget-body-toolbar')
            .removeClass('hide')
        })
        .on('click', '.stk-source-hide', function () {
          $(this).addClass('hide')
          $(this).prev().removeClass('hide')
          $(this)
            .closest('header')
            .next()
            .find('.widget-body-toolbar')
            .addClass('hide')
        })
        .on(
          'change',
          '.widget-body-toolbar input, .widget-body-toolbar select',
          function () {
            var value = this.value
            var className = this.classList[1]
            var id = $(this).closest('article').find('.group-frame').data('id')
            _.each(context.paramMap[id], (param) => {
              if (_.isArray(param)) {
                _.each(param, (p) => {
                  p[className] = value
                })
              } else {
                param[className] = value
              }
            })
            if (className === 'sourceType') {
              if (value === 'DeviceStatus') {
                $(this).closest('.widget-body-toolbar').find('.source').val('')
                $(this)
                  .closest('.widget-body-toolbar')
                  .find('.source')
                  .trigger('change')
                $(this)
                  .closest('.widget-body-toolbar')
                  .find('.source')
                  .closest('.source-group')
                  .addClass('hide')
              } else {
                $(this)
                  .closest('.widget-body-toolbar')
                  .find('.source')
                  .closest('.source-group')
                  .removeClass('hide')
              }
            }
          }
        )
        .on('click', '.change-title', function (evt) {
          // 換widget的header內容
          evt.stopPropagation()
          context.changeWidgetHeader()
          $(this).addClass('hide')
          $(this).next().removeClass('hide')
          var $input = $(this).next().find('input')
          $input.focus()
          $input.val($(this).html())
        })
        .on('click', '.change-title-input', function (evt) {
          // 編輯widget header時不要切成預覽
          evt.stopPropagation()
        })
        .on('click', '.group-label', function (evt) {
          // 換group的title label內容
          evt.stopPropagation()
          context.changeGroupTitle()
          $(this).addClass('hide')
          $(this).next().removeClass('hide')
          var $input = $(this).next().find('input')
          $input.focus()
          $input.val($(this).html())
        })
        .on('click', '.change-group-label-input', function (evt) {
          // 編輯group title label時不要切成預覽
          evt.stopPropagation()
        })
        .on('click', '.stk-edit', function () {
          // 展開編輯區
          $(this).next().next('.table-div').removeClass('hide')
          $(this).addClass('hide')
        })
        .on('click', '.stk-hide-edit', function () {
          // 隱藏編輯區時順便重畫
          var $param = $(this).closest('.table-div').prev()
          var group = $(this).closest('.group-frame').data('id')
          var index = $param.data('id')
          var param = undefined
          if ($param.attr('class') === 'param' || index === undefined) {
            param = index
            index = $(this).closest('.index').data('id')
          }
          if (group === undefined) {
            group = $(this)
              .closest('.table-div')
              .prev('.group-frame')
              .data('id')
            index = undefined
          }
          $(this)
            .closest('.table-div')
            .find('input:visible, select:visible')
            .each(function () {
              var className = $(this).attr('class')
              var value = String($(this).val())
              if (group === 'T1-A') {
                index = $(this).data('id')
              }
              console.log(className, value, group, index, param)
              context.changeParamValue(className, value, group, index, param)
            })
          context.machineMonitor.param = context.paramMap
          context.machineMonitor.draw()
          // 隱藏編輯區
          $(this).closest('.table-div').addClass('hide')
          $(this)
            .closest('.table-div')
            .siblings('.stk-edit')
            .removeClass('hide')
        })
        .on('change', '.table-div input, .table-div select', function () {
          // 修改參數
          var $table = $(this).closest('table')
          var className = $(this).attr('class')
          var value = String($(this).val())
          var $param = $(this).closest('.table-div').prev()
          var group = $(this).closest('.group-frame').data('id')
          var index = $param.data('id')
          var param = undefined
          if ($param.attr('class') === 'param' || index === undefined) {
            param = index
            index = $(this).closest('.index').data('id')
          }
          switch (className) {
            case 'lang':
              if (group === undefined) {
                $param.prev().prev().prev().html(value)
              } else {
                $param.find('.title').html(value)
              }
              break
            case 'cardGrid':
              var $parent = $param.parent()
              if ($parent.hasClass('index')) {
                $parent = $parent.parent()
              }
              var classIndex = _.findIndex(
                $parent[0].classList,
                (className) => {
                  return className.indexOf('col-lg') >= 0
                }
              )
              $parent
                .removeClass($parent[0].classList[classIndex])
                .addClass('col-lg-' + value)
              classIndex = _.findIndex($parent[0].classList, (className) => {
                return className.indexOf('col-md') >= 0
              })
              $parent
                .removeClass($parent[0].classList[classIndex])
                .addClass('col-md-' + value)
              break
            case 'type':
              if (
                value === 'line_chart' ||
                value === 'mulitiple_line_chart' ||
                value === 'mulitiple_yaxes_line_chart'
              ) {
                $table.find('.cardGrid').closest('tr').addClass('hide')
                $table.find('.type').closest('tr').removeClass('hide')
                $table.find('.type option').addClass('hide')
                $table
                  .find('.type option[value=line_chart]')
                  .removeClass('hide')
                $table
                  .find('.type option[value=mulitiple_line_chart]')
                  .removeClass('hide')
                $table
                  .find('.type option[value=mulitiple_yaxes_line_chart]')
                  .removeClass('hide')
                $table.find('.color').closest('tr').addClass('hide')
                $table.find('.min').closest('tr').addClass('hide')
                $table.find('.max').closest('tr').addClass('hide')
                $table.find('.unit').closest('tr').addClass('hide')
                $table.find('.format').closest('tr').addClass('hide')
                if (
                  value === 'mulitiple_line_chart' ||
                  value === 'mulitiple_yaxes_line_chart'
                ) {
                  if ($table.find('.signal').length === 1) {
                    $table.find('.signal:eq(0)').data('id', '0')
                    $table.find('.index:eq(0)').data('id', '0')
                    $table.find('.lang:eq(0)').data('id', '0')
                    $table
                      .find('.signal')
                      .after(
                        '<input type="text" placeholder="signal2" class="signal" data-id="1">'
                      )
                    $table
                      .find('.index')
                      .after(
                        '<input type="text" placeholder="signal2 index" class="index" data-id="1">'
                      )
                    $table
                      .find('.lang')
                      .after(
                        '<input type="text" placeholder="text2" class="lang" data-id="1">'
                      )
                    if (_.isArray(context.paramMap['T1-A'])) {
                      $table
                        .find('.signal:eq(1)')
                        .val(context.paramMap['T1-A'][1].signal)
                      $table
                        .find('.index:eq(1)')
                        .val(context.paramMap['T1-A'][1].index)
                      $table
                        .find('.lang:eq(1)')
                        .val(context.paramMap['T1-A'][1][context.lang])
                    }
                    $('[data-id=T1-A-title]').addClass('group-label')
                  }
                } else {
                  $table.find('.signal:eq(0)').removeData()
                  $table.find('.index:eq(0)').removeData()
                  $table.find('.lang:eq(0)').removeData()
                  $table.find('.signal:eq(1)').remove()
                  $table.find('.index:eq(1)').remove()
                  $table.find('.lang:eq(1)').remove()
                  $('[data-id=T1-A-title]').removeClass('group-label')
                  $('[data-id=T1-A-title-edit]').addClass('hide')
                }
              } else if (value === 'progress') {
                $table.find('.cardGrid').closest('tr').removeClass('hide')
                $table.find('.type').closest('tr').removeClass('hide')
                $table.find('.color').closest('tr').removeClass('hide')
                $table.find('.min').closest('tr').removeClass('hide')
                $table.find('.max').closest('tr').removeClass('hide')
                $table.find('.unit').closest('tr').removeClass('hide')
                $table.find('.format').closest('tr').addClass('hide')
              } else if (value === 'pie_chart') {
                $table.find('.cardGrid').closest('tr').removeClass('hide')
                $table.find('.type').closest('tr').removeClass('hide')
                $table.find('.color').closest('tr').removeClass('hide')
                $table.find('.min').closest('tr').addClass('hide')
                $table.find('.max').closest('tr').removeClass('hide')
                $table.find('.unit').closest('tr').addClass('hide')
                $table.find('.format').closest('tr').addClass('hide')
              } else if (value === 'time_format') {
                $table.find('.cardGrid').closest('tr').addClass('hide')
                $table.find('.type').closest('tr').removeClass('hide')
                $table.find('.color').closest('tr').addClass('hide')
                $table.find('.min').closest('tr').addClass('hide')
                $table.find('.max').closest('tr').addClass('hide')
                $table.find('.unit').closest('tr').addClass('hide')
                $table.find('.format').closest('tr').removeClass('hide')
              } else if (value === 'switch') {
                $table.find('.cardGrid').closest('tr').removeClass('hide')
                $table.find('.type').closest('tr').removeClass('hide')
                $table.find('.color').closest('tr').removeClass('hide')
                $table.find('.min').closest('tr').addClass('hide')
                $table.find('.max').closest('tr').addClass('hide')
                $table.find('.unit').closest('tr').addClass('hide')
                $table.find('.format').closest('tr').addClass('hide')
              } else if (value === 'img') {
                $table.find('.cardGrid').closest('tr').removeClass('hide')
                $table.find('.type').closest('tr').removeClass('hide')
                $table.find('.color').closest('tr').addClass('hide')
                $table.find('.min').closest('tr').addClass('hide')
                $table.find('.max').closest('tr').addClass('hide')
                $table.find('.unit').closest('tr').addClass('hide')
                $table.find('.format').closest('tr').addClass('hide')
              } else if (value === 'gragus') {
                $table.find('.cardGrid').closest('tr').removeClass('hide')
                $table.find('.type').closest('tr').removeClass('hide')
                $table.find('.color').closest('tr').addClass('hide')
                $table.find('.min').closest('tr').removeClass('hide')
                $table.find('.max').closest('tr').removeClass('hide')
                $table.find('.unit').closest('tr').addClass('hide')
                $table.find('.format').closest('tr').addClass('hide')
              } else {
                $table.find('.cardGrid').closest('tr').removeClass('hide')
                $table.find('.type').closest('tr').removeClass('hide')
                $table.find('.color').closest('tr').addClass('hide')
                $table.find('.min').closest('tr').addClass('hide')
                $table.find('.max').closest('tr').addClass('hide')
                $table.find('.unit').closest('tr').addClass('hide')
                $table.find('.format').closest('tr').addClass('hide')
              }
              break
            default:
              break
          }
          if (group === undefined) {
            group = $(this)
              .closest('.table-div')
              .prev('.group-frame')
              .data('id')
            index = undefined
            if (
              value === 'mulitiple_line_chart' ||
              value === 'mulitiple_yaxes_line_chart'
            ) {
              index = $(this).data('id')
            }
          }
          context.changeParamValue(className, value, group, index, param)
        })
        .on('click', '.stk-delete', function () {
          // 刪除參數
          if (confirm('確認刪除參數?')) {
            var $param = $(this).next().next()
            var group = $(this).closest('.group-frame').data('id')
            var index = $param.data('id')
            var param = undefined
            if ($param.attr('class') === 'param') {
              param = index
              index = $(this).closest('.index').data('id')
            }
            if (param !== undefined) {
              context.paramMap[group][index].splice(param, 1)
              $(this).next().remove()
              $(this).next().remove()
              $(this).next().remove()
              $(this).remove()
              if (context.paramMap[group][index].length === 1) {
                context.paramMap[group][index] =
                  context.paramMap[group][index][0]
              }
            } else {
              context.paramMap[group].splice(index, 1)
              $(this).closest('.param-editor').remove()
            }
            context.machineMonitor.param = context.paramMap
            context.machineMonitor.draw()
          }
        })
        .on('click', '.demo-index', function () {
          var group = $(this).closest('.group-frame').data('id')
          if (group.indexOf('P') < 0) {
            context.paramMap[group].push(context.getInitParam())
          } else {
            context.paramMap[group].push([context.getInitParam()])
          }
          context.machineMonitor.draw()
        })
        .on('click', '.mul-param', function () {
          var group = $(this).closest('.group-frame').data('id')
          var index = $(this).closest('.param-editor').find('.index').data('id')
          var thisParam = context.paramMap[group][index]
          context.paramMap[group][index] = []
          context.paramMap[group][index].push(thisParam)
          context.paramMap[group][index].push(context.getInitParam())
          context.machineMonitor.draw()
        })
    },
    util: {
      machineId: null,
      brandId: null,
      machineMonitor: null,
      sourceMap: {},
      paramMap: {},
      lang: servkit.getCookie('lang'),
      changeWidgetHeader: function () {
        var ctx = this
        $('.change-title.hide').each(function () {
          var value = $(this).next().find('input').val()
          var id = $(this).closest('article').find('.group-frame').data('id')
          _.each(ctx.paramMap[id], (param) => {
            if (_.isArray(param)) {
              _.each(param, (p) => {
                p['groupName-' + ctx.lang] = value
              })
            } else {
              param['groupName-' + ctx.lang] = value
            }
          })
          $(this).html(value)
        })
        $('.change-title-input').addClass('hide')
        $('.change-title').removeClass('hide')
      },
      changeGroupTitle: function () {
        var ctx = this
        $('.group-label.hide').each(function () {
          var value = $(this).next().find('input').val()
          var id = $(this).closest('.group-frame').data('id')
          if ($(this).data('id') === 'T1-A-title') {
            id = 'T1-A'
          }
          var data = ctx.paramMap[id]
          if ($(this).closest('.param-group').data('id')) {
            data = ctx.paramMap[id][$(this).closest('.param-group').data('id')]
          }
          _.each(data, (param) => {
            param['label-' + ctx.lang] = value
          })
          $(this).html(value || '---')
          if (value) {
            $(this).removeClass('auto-hide-group-label')
          } else {
            $(this).addClass('auto-hide-group-label')
          }
        })
        $('.change-group-label-input').addClass('hide')
        $('.group-label').removeClass('hide')
      },
      changeParamValue: function (className, value, group, index, param) {
        var ctx = this
        var name = className
        if (className === 'lang') {
          name = ctx.lang
        }
        if (index === undefined) {
          if (group === 'T1-A' && className === 'type') {
            var paramData
            if (value === 'line_chart') {
              if (_.isArray(ctx.paramMap[group])) {
                paramData = JSON.parse(JSON.stringify(ctx.paramMap[group][0]))
                ctx.paramMap[group] = paramData
                ctx.paramMap[group]['zh_tw'] =
                  ctx.paramMap[group]['label-zh_tw']
                ctx.paramMap[group]['zh'] = ctx.paramMap[group]['label-zh']
                ctx.paramMap[group]['en'] = ctx.paramMap[group]['label-en']
                ctx.paramMap[group]['label-zh_tw'] = ''
                ctx.paramMap[group]['label-zh'] = ''
                ctx.paramMap[group]['label-en'] = ''
              }
              ctx.paramMap[group][name] = value
            } else {
              if (!_.isArray(ctx.paramMap[group])) {
                paramData = JSON.stringify(ctx.paramMap[group])
                ctx.paramMap[group] = []
                ctx.paramMap[group].push(JSON.parse(paramData))
                ctx.paramMap[group].push(JSON.parse(paramData))
                ctx.paramMap[group][1].signal = ''
                ctx.paramMap[group][1].index = ''
              }
              ctx.paramMap[group][0][name] = value
              ctx.paramMap[group][1][name] = value
            }
          } else {
            ctx.paramMap[group][name] = value
          }
        } else {
          if (param !== undefined) {
            ctx.paramMap[group][index][param][name] = value
            if (name === 'cardGrid') {
              _.each(ctx.paramMap[group][index], (p, key) => {
                ctx.paramMap[group][index][key][name] = value
              })
            }
          } else {
            if (group === 'P') {
              var isChange = false
              var type, temp
              if (name === 'signal') {
                type = 'text'
              } else if (name === 'labelSignal') {
                type = 'label'
              } else if (name === 'unitSignal') {
                type = 'unit'
              }
              _.each(ctx.paramMap[group][index], (p, key) => {
                if (name.toLowerCase().indexOf('signal') >= 0) {
                  if (p.type === type) {
                    ctx.paramMap[group][index][key].signal = value
                    isChange = true
                    if (value === '') {
                      temp = key
                    }
                  }
                } else {
                  ctx.paramMap[group][index][key][name] = value
                  isChange = true
                }
              })
              if (!isChange) {
                ctx.paramMap[group][index].push(
                  ctx.getInitParam({
                    signal: value,
                    type: type,
                  })
                )
              }
              if (temp !== undefined) {
                ctx.paramMap[group][index].splice(temp, 1)
              }
            } else {
              ctx.paramMap[group][index][name] = value
            }
          }
        }
      },
      addToParamMap: function (param) {
        var ctx = this
        var paramKey = param.position.split('_')[0]
        if (ctx.paramMap[paramKey]) {
          var lastParam
          if (!_.isArray(ctx.paramMap[paramKey])) {
            lastParam = ctx.paramMap[paramKey]
            ctx.paramMap[paramKey] = []
            ctx.paramMap[paramKey].push(lastParam)
          }
          if (param.position.indexOf('_') >= 0) {
            var index = Number(param.position.split('_')[1]) - 1
            if (ctx.paramMap[paramKey][index]) {
              if (!_.isArray(ctx.paramMap[paramKey][index])) {
                lastParam = ctx.paramMap[paramKey][index]
                ctx.paramMap[paramKey][index] = []
                ctx.paramMap[paramKey][index].push(lastParam)
              }
              ctx.paramMap[paramKey][index].push(param)
            } else {
              if (paramKey === 'P') {
                ctx.paramMap[paramKey][index] = [param]
              } else {
                ctx.paramMap[paramKey][index] = param
              }
            }
          } else {
            ctx.paramMap[paramKey].push(param)
          }
        } else {
          if (paramKey !== 'T1-A' && paramKey !== 'T2-C') {
            ctx.paramMap[paramKey] = []
            if (paramKey === 'P') {
              ctx.paramMap[paramKey].push([param])
            } else {
              ctx.paramMap[paramKey].push(param)
            }
          } else {
            ctx.paramMap[paramKey] = param
          }
        }
      },
      addTemplate: function () {
        var ctx = this

        if (!ctx.paramMap['T1-A']) {
          ctx.paramMap['T1-A'] = ctx.getInitParam({
            type: 'line_chart',
          })
          ctx.paramMap['T1-B'] = []
          ctx.paramMap['T1-B'].push(
            ctx.getInitParam({
              cardGrid: '12',
              type: 'progress',
            })
          )
          ctx.paramMap['T1-B'].push(
            ctx.getInitParam({
              cardGrid: '12',
              type: 'progress',
            })
          )
          ctx.paramMap['T1-B'].push(
            ctx.getInitParam({
              cardGrid: '12',
              type: 'progress',
            })
          )
          ctx.paramMap['T1-B'].push(
            ctx.getInitParam({
              cardGrid: '12',
              type: 'progress',
            })
          )
          ctx.paramMap['T1-C'] = []
          ctx.paramMap['T1-C'].push(
            ctx.getInitParam({
              type: 'pie_chart',
            })
          )
          ctx.paramMap['T1-C'].push(
            ctx.getInitParam({
              type: 'pie_chart',
            })
          )
          ctx.paramMap['T1-C'].push(
            ctx.getInitParam({
              type: 'pie_chart',
            })
          )
          ctx.paramMap['T1-C'].push(
            ctx.getInitParam({
              type: 'pie_chart',
            })
          )
          if (!ctx.paramMap['T2-A']) {
            ctx.paramMap['T2-A'] = []
          }
          if (!ctx.paramMap['T2-B']) {
            ctx.paramMap['T2-B'] = []
          }
          if (!ctx.paramMap['T2-D']) {
            ctx.paramMap['T2-D'] = []
          }
        }
        if (!ctx.paramMap['T2-A']) {
          ctx.paramMap['T2-A'] = [ctx.getInitParam()]
          ctx.paramMap['T2-B'] = [ctx.getInitParam()]
          ctx.paramMap['T2-C'] = ctx.getInitParam({
            type: 'img',
            zh_tw: 'EquipMonitor/img/machine/machine.png',
          })
          ctx.paramMap['T2-D'] = []
          ctx.paramMap['T2-D'].push(
            ctx.getInitParam({
              cardGrid: '6',
            })
          )
          ctx.paramMap['T2-D'].push([])
          ctx.paramMap['T2-D'][1].push(
            ctx.getInitParam({
              cardGrid: '6',
            })
          )
          ctx.paramMap['T2-D'][1].push(
            ctx.getInitParam({
              cardGrid: '6',
            })
          )
          ctx.paramMap['T2-D'].push([])
          ctx.paramMap['T2-D'][2].push(
            ctx.getInitParam({
              cardGrid: '6',
            })
          )
          ctx.paramMap['T2-D'][2].push(
            ctx.getInitParam({
              cardGrid: '6',
            })
          )
          ctx.paramMap['T2-D'][2].push(
            ctx.getInitParam({
              cardGrid: '6',
            })
          )
          ctx.paramMap['T2-D'].push([])
          ctx.paramMap['T2-D'][3].push(
            ctx.getInitParam({
              type: 'progress',
              cardGrid: '6',
            })
          )
          ctx.paramMap['T2-D'][3].push(
            ctx.getInitParam({
              type: 'progress',
              cardGrid: '6',
            })
          )
          ctx.paramMap['T2-D'][3].push(
            ctx.getInitParam({
              type: 'progress',
              cardGrid: '6',
            })
          )
          ctx.paramMap['T2-D'][3].push(
            ctx.getInitParam({
              type: 'progress',
              cardGrid: '6',
            })
          )
          if (!ctx.paramMap['T1-A']) {
            ctx.paramMap['T1-A'] = []
          }
          if (!ctx.paramMap['T1-B']) {
            ctx.paramMap['T1-B'] = []
          }
        }
        if (!ctx.paramMap['P']) {
          ctx.paramMap['P'] = []
        }
      },
      getInitParam: function (setting) {
        var data = {
          'signal': '',
          'sourceType': 'DeviceStatus',
          'source': '',
          'groupIcon': '<i class="fa fa-reorder"></i>',
          'groupName-zh_tw': '',
          'groupName-en': '',
          'groupName-zh': '',
          'groupGrid': '12',
          'cardGrid': '3',
          'label-zh_tw': '',
          'label-en': '',
          'label-zh': '',
          'index': '',
          'position': '',
          'type': 'text',
          'color': 'black',
          'min': '0',
          'max': '100',
          'unit': '',
          'foramt': '',
          'zh_tw': '',
          'en': '',
          'zh': '',
        }
        _.each(setting, (val, key) => {
          data[key] = val
        })
        return data
      },
      getParamFile: function (callback) {
        var ctx = this
        var data = {}
        var userId = JSON.parse(window.sessionStorage.getItem('loginInfo'))[
          'user_id'
        ]
        data.filePath = 'equipMonitor/users/' + ctx.sourceMap.id + '.csv'
        if (ctx.sourceMap.by === 'brand') {
          data.filePath = 'equipMonitor/template/' + ctx.sourceMap.id + '.csv'
        }
        ctx.getParamByFile(
          'api/getdata/custParamFile',
          data,
          callback,
          createMachineParamFile
        )

        function createMachineParamFile() {
          data = {
            userId: userId,
            machineId: ctx.sourceMap.id,
          }
          if (ctx.sourceMap.by !== 'brand') {
            ctx.getParamByFile(
              'api/equipmonitor/createMachineParamFile',
              data,
              callback,
              callback([])
            )
          } else {
            callback([])
            $.smallBox({
              title:
                'brand: ' +
                servkit.getBrandName(ctx.sourceMap.id) +
                ' not found',
              content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
              color: '#C79121',
              iconSmall: '',
              timeout: 60000,
            })
          }
        }
      },
      getParamByFile: function (url, data, successCallback, failCallback) {
        servkit.ajax(
          {
            url: url,
            type: 'GET',
            contentType: 'application/json',
            data: data,
          },
          {
            success: function (response) {
              var csv = []
              _.each(response, function (row) {
                csv.push(row.split(','))
              })
              successCallback(csv)
            },
            fail: function (response) {
              failCallback(response)
            },
          }
        )
      },
    },
    delayCondition: ['machineList', 'machinePlantAreaList', 'plantAreaList'],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
      ['/js/plugin/d3/d3.min.js', '/js/plugin/jqBullet/bullet.js'],
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}
