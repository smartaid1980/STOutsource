import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import { ajax } from '../../../../js/servtech/module/servkit/ajax.js'
import {
  getPlantMachineOptionMap,
  renderPlantAndMachineSelect,
} from '../../../../js/servtech/module/servkit/form.js'
import servkit from '../../../../js/servtech/module/servkit/servkit.js'

export default async function () {
  const workShiftData = await new Promise((res) =>
    ajax(
      {
        url: 'api/workshift/read',
      },
      {
        success(data) {
          res(data)
        },
      }
    )
  )
  const disabledWorkShiftSet = new Set(
    workShiftData[0].work_shift_times
      .filter(({ is_open }) => is_open === '0')
      .map(({ name }) => name)
  )
  const plantMachineOptionMap = await getPlantMachineOptionMap()

  GoGoAppFun({
    gogo: function gogo(ctx) {
      servkit.addChartExport('#charthead', '#bar-chart-all')
      var oeetitle1 = $('#detail-oee1').text()
      var oeetitel2 = $('#detail-oee2').text()
      // 因為改成動態加了, 所以找不到
      var oeetitel3 = `${i18n('Capacity_Utilization')}` //$('#detail-oee3').text()
      const getTimeData = (rowData, columnIndexMap) => {
        let value
        return _.mapObject(columnIndexMap, (columnIndex, columnName) => {
          value = rowData[columnIndex]
          if (columnName == 'need_down_time') {
            return value
          }
          if (columnName === 'cutting_millisecond') {
            return value === 'N.A.' || value === '---'
              ? 0
              : value.HHmmssToMillisecond()
          } else {
            return value.HHmmssToMillisecond()
          }
        })
      }
      const getSummaryInfoText = (data, columnIndexMap) => {
        let timeData
        let denominator
        const sumData = data.reduce(
          (a, d) => {
            timeData = getTimeData(d, columnIndexMap)
            denominator = ctx.commons.getDenominator(timeData)

            a.denominator += denominator
            a.operationTime += timeData.operate_millisecond
            a.cuttingTime += timeData.cutting_millisecond
            a.needDownTime += timeData.need_down_time
            //a.down_time_m2 += timeData.down_time_m2
            //a.down_time_m3 += timeData.down_time_m3
            return a
          },
          {
            denominator: 0,
            operationTime: 0,
            cuttingTime: 0,
            needDownTime: 0,
            //down_time_m2: 0,
            //down_time_m3: 0,
          }
        )
        console.log(sumData.operationTime)

        const utilization = (
          sumData.operationTime / sumData.denominator
        ).floatToPercentage()
        const effectiveUtilization = (
          sumData.cuttingTime / sumData.denominator
        ).floatToPercentage()
        const capacityUtilization = (
          (sumData.operationTime + sumData.needDownTime) /
          //sumData.down_time_m2 +
          //sumData.down_time_m3) /
          sumData.denominator
        ).floatToPercentage()
        return `Avg. ${oeetitle1} : ${utilization} /        ${oeetitel2} : ${effectiveUtilization} /        ${oeetitel3} : ${capacityUtilization}`
      }

      let marckMap = ctx.preCon.getMacro
      //console.log(' marcList => '+marcoList)

      ctx.downTimeStartIndex = 18
      ctx.capIndex = 18
      var righCol = [] //11, 12, 13, 14, 15, 16]
      var exlFormat = []
      for (let i = 0; i < 18; ++i) {
        exlFormat.push('TEXT')
      }

      for (let key in marckMap) {
        console.log(' marco[' + key + ']=' + marckMap[key])
        $('#detail-table-input-filter').append(
          '<th class="hasinput" style="width: 5%;"><input type="text" class="form-control" /> </th>'
        )
        $('#detail-table-header-row').append(
          '<th>' + `${i18n('No_Work_Time')}` + '-' + marckMap[key] + '</th>'
        )
        righCol.push(ctx.capIndex)
        exlFormat.push('TEXT')
        ++ctx.capIndex
      }
      $('#detail-table-input-filter').append(
        '<th class="hasinput" style="width: 5%;"><input type="text" class="form-control" /> </th><th></th>'
      )
      $('#detail-table-header-row').append(
        '<th id="detail-oee3">' +
          `${i18n('Capacity_Utilization')}` +
          '</th><th>' +
          `${i18n('Edit')}` +
          '</th><th>{班次時間}}</th><th>{needDownTime}</th>'
      )
      exlFormat.push('TEXT')
      exlFormat.push('TEXT')
      exlFormat.push('TEXT')
      exlFormat.push('TEXT')
      var lastColIndex = ctx.capIndex + 2

      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          rightColumn: righCol, //[11, 12, 13, 14, 15, 16, 19],
          hideCols: [lastColIndex, lastColIndex + 1], //[22]
          summaryInfo: {
            text(data, tableApi) {
              return getSummaryInfoText(data, {
                power_millisecond: 6, //7,
                operate_millisecond: 7, //8,
                cutting_millisecond: 8, //9,
                work_shift_millisecond: lastColIndex, //22,
                need_down_time: lastColIndex + 1,
                //down_time_m2: 19,
                //down_time_m3: 20,
                //down_time_start: maroStartColIndex,
                //down_time_end: capSColIndex -1
              })
            },
          },
          onDraw: function onDraw(tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [15, 16],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: $('#detail-oee1').text(),
            }
            ctx.commons.drawChart(ctx.$barChartEle, chartConfig)

            $('.dataTables_length').addClass('hide')

            let sum = []
            for (let i = 0; i < pageData.length; ++i) {
              let row = pageData[i]
              if (i == 0) {
                for (let k = 0; k < 6; ++k) {
                  sum.push('')
                }
                for (let k = 6; k < 10; ++k) {
                  let items = row[k].split(':', -1)
                  let hh = parseInt(items[0])
                  let mm = parseInt(items[1])
                  let ss = parseInt(items[2])
                  let total = hh * 60 * 60 + mm * 60 + ss
                  sum.push(total * 1000)
                }
                for (let k = 10; k < 15; ++k) {
                  sum.push(parseInt(row[k]))
                }

                for (let k = 15; k < 18; ++k) {
                  sum.push('')
                }

                for (let k = 18; k < ctx.capIndex; ++k) {
                  let items = row[k].split(':', -1)
                  let hh = parseInt(items[0])
                  let mm = parseInt(items[1])
                  let ss = parseInt(items[2])
                  let total = hh * 60 * 60 + mm * 60 + ss
                  sum.push(total * 1000)
                }
              } else {
                for (let k = 6; k < 10; ++k) {
                  let items = row[k].split(':', -1)
                  let hh = parseInt(items[0])
                  let mm = parseInt(items[1])
                  let ss = parseInt(items[2])
                  let total = hh * 60 * 60 + mm * 60 + ss
                  sum[k] += total * 1000
                }
                for (let k = 10; k < 15; ++k) {
                  sum[k] += parseInt(row[k])
                }

                for (let k = 18; k < ctx.capIndex; ++k) {
                  let items = row[k].split(':', -1)
                  let hh = parseInt(items[0])
                  let mm = parseInt(items[1])
                  let ss = parseInt(items[2])
                  let total = hh * 60 * 60 + mm * 60 + ss
                  sum[k] += total * 1000
                }
              }
            }

            if (sum.length > 0) {
              let htmlText = ''
              for (let k = 0; k < ctx.capIndex; ++k) {
                if (k >= 6 && k <= 9) {
                  htmlText += '<td>' + sum[k].millisecondToHHmmss() + '</td>'
                } else if (k >= 18 && k <= ctx.capIndex) {
                  let found = false
                  for (let g = 0; g < ctx.hideDowntimeIndex.length; ++g) {
                    if (ctx.hideDowntimeIndex[g] == k) {
                      found = true
                      break
                    }
                  }
                  if (!found) {
                    htmlText += '<td>' + sum[k].millisecondToHHmmss() + '</td>'
                  }
                } else {
                  htmlText += '<td>' + sum[k] + '</td>'
                }
              }

              $('tbody').append(
                '<tr style="font-weight:bolder;color:green;">' +
                  htmlText +
                  '</tr>'
              )
            }
          },
          excel: {
            fileName: 'shift_production_info',
            format: exlFormat /*[
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ],*/,
            customHeaderFunc: function (tableHeader) {
              return tableHeader
                .slice(0, tableHeader.length - 3)
                .filter((name, i) => detailTable.table.columns().visible()[i])
            },
            customDataFunc: function (tableData) {
              return _.map(tableData, function (d) {
                var data = d.slice(0, d.length - 3)
                return _.filter(data, function (num, key) {
                  return detailTable.table.columns().visible()[key]
                })
              })
            },
          },
        })

      ctx.$startDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      ctx.$endDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      renderPlantAndMachineSelect(
        plantMachineOptionMap,
        ctx.$plantSelect,
        ctx.$machineSelect
      )

      if (ctx.preCon.getMacro) {
        servkit.initSelectWithList(
          ctx.preCon.getMacro,
          ctx.$idlecodeSelect,
          true
        )
      }

      ctx.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var funcName = $('#funcName').text().replace('>', ' ')
        var denominator = $('input[name="denominator"]:checked')
          .next()
          .next()
          .text()
        var datamode = $('input[name="dataName"]:checked').next().next().text()
        var title =
          ctx.$startDate.val() +
          ' - ' +
          ctx.$endDate.val() +
          ' ' +
          funcName +
          ' ( ' +
          datamode +
          ' / ' +
          denominator +
          ' )'
        $('#bar-chart-title').text(title)

        var reportType = $('input[name="dataName"]:checked').val()
        ctx[reportType](detailTable)
      })

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[ctx.appId][ctx.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2018/10/18',
          endDate: '2018/10/18',
          plant: '__ALL',
          machines: ['_DIGIFAC00017D01M01'],
        }
      }
      $('#showdemo').on('click', function (e) {
        e.preventDefault()

        ctx.$startDate.val(showdemoConfig.startDate)
        ctx.$endDate.val(showdemoConfig.endDate)
        $('[name=dataName]').eq(2).click()
        ctx.$plantSelect.val(showdemoConfig.plant)
        ctx.$plantSelect.change()
        ctx.$machineSelect.val(showdemoConfig.machines)
        ctx.$submitBtn.click()
      })

      ctx.$tableElement.on('click', '.stk-edit-btn', function (evt) {
        evt.preventDefault()
        var data = $(evt.target).data()
        ctx.$hippoOperatorId = data['operator_id']
        ctx.$hippoOrderNo = data['order_no']
        ctx.$hippoPartNo = data['part_no']

        ctx['updateTarget'] = this.parentNode.parentNode
        var machine_id = $(this).parent().parent().find('td').eq(0).text()
        var date = $(this).parent().parent().find('td').eq(1).text()
        var work_shift = $(this).parent().parent().find('td').eq(2).text()
        //  var program_name = $(this).parent().parent().find('td').eq(3).text()
        var operator_id = $(this).parent().parent().find('td').eq(3).text()
        var order_no = $(this).parent().parent().find('td').eq(4).text()
        var part_no = $(this).parent().parent().find('td').eq(5).text()

        var cycle_time = $(this).parent().parent().find('td').eq(10).text()
        var ng_quantity = $(this).parent().parent().find('td').eq(12).text()

        var act_output = $(this).parent().parent().find('td').eq(14).text()

        ctx.output = $(this).parent().parent().find('td').eq(11).text()

        ctx.operationTime = $(this).parent().parent().find('td').eq(7).text()

        ctx.$modalProductMachineId.val(machine_id)
        ctx.$modalProductDate.val(date)
        ctx.$modalproductWorkShift.val(work_shift)
        //ctx.$modalProductProg.val(program_name)
        ctx.$modalProductOperatorId.val(operator_id)
        ctx.$modalProductOrderId.val(order_no)
        ctx.$modalProductPartId.val(part_no)
        ctx.$modalProductCycleTime.val(cycle_time)
        ctx.$modalProductRejectedQty.val(ng_quantity)

        ctx.$modalProductActualOutput.val(act_output)

        ctx.$crudTableModal.modal('toggle')
        ctx.$modalProductDate.prop('disabled', true)
        ctx.$modalProductMachineId.prop('disabled', true)
        ctx.$modalProductProg.prop('disabled', true)
        ctx.$modalproductWorkShift.prop('disabled', true)
        $('.note-error').remove()
      })

      ctx.$modalProductSubmit.on('click', function (evt) {
        evt.preventDefault()
        ctx.removeErrorCode(ctx.$modalProductOperatorId, 'section')
        ctx.removeErrorCode(ctx.$modalProductOrderId, 'section')
        ctx.removeErrorCode(ctx.$modalProductPartId, 'section')
        ctx.removeErrorCode(ctx.$modalProductCycleTime, 'section')
        ctx.removeErrorCode(ctx.$modalProductRejectedQty, 'section')
        ctx.removeErrorCode(ctx.$modalProductActualOutput, 'section')

        var date = ctx.$modalProductDate.val()
        var machine_id = ctx.$modalProductMachineId.val()
        var work_shift = ctx.$modalproductWorkShift.val()
        // var program_name = ctx.$modalProductProg.val()
        var operator_id = ctx.$modalProductOperatorId.val()
        var order_no = ctx.$modalProductOrderId.val()
        var part_no = ctx.$modalProductPartId.val()
        var cycle_time = ctx.$modalProductCycleTime.val()
        var ng_quantity = ctx.$modalProductRejectedQty.val()
        var actual_output = ctx.$modalProductActualOutput.val()

        var errorCount = 0
        if (operator_id.length > 50) {
          ctx.appendErrorCode(
            ctx.$modalProductOperatorId,
            'section',
            `${i18n('Max_Value_50')}`
          )
          errorCount++
        } else if (!operator_id) {
          ctx.appendErrorCode(
            ctx.$modalProductOperatorId,
            'section',
            `${i18n('Required')}`
          )
          errorCount++
        } else {
          ctx.removeErrorCode(ctx.$modalProductOperatorId, 'section')
        }

        if (order_no.length > 20) {
          ctx.appendErrorCode(
            ctx.$modalProductOrderId,
            'section',
            `${i18n('Max_Value_20')}`
          )
          errorCount++
        } else if (!order_no) {
          ctx.appendErrorCode(
            ctx.$modalProductOrderId,
            'section',
            `${i18n('Required')}`
          )
          errorCount++
        } else {
          ctx.removeErrorCode(ctx.$modalProductOrderId, 'section')
        }

        if (part_no.length > 20) {
          ctx.appendErrorCode(
            ctx.$modalProductPartId,
            'section',
            `${i18n('Max_Value_20')}`
          )
          errorCount++
        } else if (!part_no) {
          ctx.appendErrorCode(
            ctx.$modalProductPartId,
            'section',
            `${i18n('Required')}`
          )
          errorCount++
        } else {
          ctx.removeErrorCode(ctx.$modalProductPartId, 'section')
        }

        if (cycle_time.length > 10) {
          ctx.appendErrorCode(
            ctx.$modalProductCycleTime,
            'section',
            `${i18n('Max_Value_10')}`
          )
          errorCount++
        } else if (!cycle_time) {
          ctx.appendErrorCode(
            ctx.$modalProductCycleTime,
            'section',
            `${i18n('Required')}`
          )
          errorCount++
        } else if (isNaN(cycle_time)) {
          ctx.appendErrorCode(
            ctx.$modalProductCycleTime,
            'section',
            `${i18n('Valid_Number')}`
          )
          errorCount++
        } else {
          ctx.removeErrorCode(ctx.$modalProductCycleTime, 'section')
        }
        if (ng_quantity.length > 10) {
          ctx.appendErrorCode(
            ctx.$modalProductRejectedQty,
            'section',
            `${i18n('Max_Value_10')}`
          )
          errorCount++
        } else if (!ng_quantity) {
          ctx.appendErrorCode(
            ctx.$modalProductRejectedQty,
            'section',
            `${i18n('Required')}`
          )
          errorCount++
        } else if (isNaN(ng_quantity)) {
          ctx.appendErrorCode(
            ctx.$modalProductRejectedQty,
            'section',
            `${i18n('Valid_Number')}`
          )
          errorCount++
        } else if (isNaN(actual_output)) {
          ctx.appendErrorCode(
            ctx.$modalProductActualOutput,
            'section',
            `${i18n('Valid_Number')}`
          )
          errorCount++
        } else {
          ctx.removeErrorCode(ctx.$modalProductRejectedQty, 'section')
        }
        if (errorCount > 0) {
          return false
        }

        var params = {
          date: date,
          machine_id: ctx.preCon.queryDeviceName2Id[machine_id].toString(),
          work_shift: work_shift.toString(),
          //program_name: program_name.toString(),
          operator_id: ctx.$hippoOperatorId.toString(),
          order_no: ctx.$hippoOrderNo.toString(),
          part_no: ctx.$hippoPartNo.toString(),
          db_operator_id: operator_id.toString(),
          db_order_no: order_no.toString(),
          db_part_no: part_no.toString(),
          cycle_time: cycle_time,
          ng_quantity: ng_quantity,
          actual_output: actual_output,
        }

        ctx.insertUpdateProduct(params)
      })
    },
    util: {
      $tableElement: $('#detail-table'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $idlecodeSelect: $('#idle_code'),
      $plantSelect: $('#plantAreaForm'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      $modalProductDate: $('#modal-product-date'),
      $modalProductMachineId: $('#modal-product-machine-id'),
      $modalproductWorkShift: $('#modal-product-work-shift'),
      $modalProductProg: $('#modal-product-program'),
      $modalProductOperatorId: $('#modal-product-operator-id'),
      $modalProductOrderId: $('#modal-product-order-id'),
      $modalProductPartId: $('#modal-product-part-id'),
      $modalProductCycleTime: $('#modal-product-cycle-time'),
      $modalProductRejectedQty: $('#modal-product-rejected-qty'),
      $modalProductActualOutput: $('#modal-product-acutal-output'),
      $modalProductSubmit: $('#modal-submit-btn'),
      $crudTableModal: $('#crud-table-modal'),
      $hippoOperatorId: null,
      $hippoOrderNo: null,
      $hippoPartNo: null,
      output: null,
      operationTime: null,
      needDowntime: 0,
      downTimeStartIndex: 18,
      capIndex: 0,
      hideDowntimeIndex: [],
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      getEditBtn: function (operatorId, orderNo, partNo) {
        var dataHtml =
          ' data-operator_id="' +
          operatorId +
          '" data-order_no="' +
          orderNo +
          '" data-part_no="' +
          partNo +
          '"'
        return (
          `<button class="btn btn-primary stk-edit-btn" title="${i18n(
            'Edit'
          )}" style="margin-right:5px"` +
          dataHtml +
          `>${i18n('Edit')}</button>`
        )
      },
      insertUpdateProduct: function (params) {
        var ctx = this
        var loadingBtn = servkit.loadingButton(
          document.querySelector('#modal-submit-btn')
        )
        loadingBtn.doing()
        try {
          servkit.ajax(
            {
              url: 'api/cosmos/product/insertUpdatePgProductionByShift',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success: function (data) {
                var smallParams = {
                  color: 'green',
                  title: `${i18n('Insert_Success')}`,
                  icon: 'fa fa-check',
                  timeout: 2000,
                }
                if (data.length) {
                  var node = ctx.updateTarget

                  $(node)
                    .find('td')
                    .eq(0)
                    .html(servkit.getMachineName(params.machine_id))
                  $(node).find('td').eq(1).html(params.date)
                  $(node).find('td').eq(2).html(params.work_shift)
                  // $(node).find('td').eq(3).html(params.program_name)
                  $(node).find('td').eq(3).html(params.db_operator_id)
                  $(node).find('td').eq(4).html(params.db_order_no)
                  $(node).find('td').eq(5).html(params.db_part_no)
                  $(node).find('td').eq(10).html(params.cycle_time)

                  $(node).find('td').eq(12).html(params.ng_quantity)

                  var qualifiedQty =
                    parseInt(ctx.output) - parseInt(params.ng_quantity)
                  $(node).find('td').eq(13).html(qualifiedQty)

                  $(node).find('td').eq(14).html(params.actual_output)

                  var operText = ctx.operationTime
                  var items = operText.split(':')
                  var hh = 0
                  var mm = 0
                  var ss = 0
                  if (items.length > 0) hh = parseInt(items[0])
                  if (items.length > 1) mm = parseInt(items[1])
                  if (items.length > 2) ss = parseInt(items[2])

                  var operSecs = hh * 60 * 60 + mm * 60 + ss

                  var operOee = (
                    (parseInt(params.actual_output) *
                      parseInt(params.cycle_time)) /
                    parseInt(operSecs)
                  ).floatToPercentage()

                  $(node).find('td').eq(17).html(operOee)

                  // $(node).find('td').eq(9).html('false');
                  ctx.commons.bling(
                    4,
                    300,
                    $(node).find('td'),
                    'rgba(0, 255, 0, 0.2)'
                  )
                  delete ctx.updateTarget
                }
                ctx.commons.smallBox(smallParams)
                ctx.$crudTableModal.modal('toggle')
              },
              fail: function (data) {
                console.warn(data)
                var smallParams = {
                  color: 'yellow',
                  title: `${i18n('Insert_Failed')}`,
                  content: data,
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                }
                ctx.commons.smallBox(smallParams)
              },
            }
          )
        } catch (e) {
          console.log(e)
        } finally {
          loadingBtn.done()
        }
      },
      appendErrorCode: function (ele, selector, content) {
        var ctx = this
        var code = $('<code class="note-error"></code>')
        var dom = ele.closest(selector)[0]
        code.html(content)
        if (!dom.querySelector('code')) {
          dom.insertAdjacentHTML('beforeend', code[0].outerHTML)
        }
      },
      removeErrorCode: function (ele, selector) {
        var dom = ele.closest(selector)[0]
        var node = dom.querySelector('code')
        if (node) {
          dom.removeChild(node)
        }
      },
      getKeys: function (timeData) {
        var keys =
          timeData.date.date8BitsToSlashed() +
          timeData.work_shift +
          timeData.machine_id +
          //timeData.program_name +
          timeData.operator_id +
          timeData.order_no +
          timeData.part_no
        return keys
      },
      strSplitByComma: function (machineArr) {
        var str = ''
        var lastIndex = machineArr.length - 1
        _.each(machineArr, function (machine) {
          if (machineArr[lastIndex] != machine) {
            str += '"' + machine + '", '
          } else {
            str += '"' + machine + '"'
          }
        })
        return str
      },
      detail: function detail(detailTable) {
        var ctx = this,
          startDate = ctx.$startDate.val(),
          endDate = ctx.$endDate.val(),
          machineList = ctx.$machineSelect.val() || [],
          idleCodeList = ctx.$idlecodeSelect.val() || [],
          loadingBtn = ctx.loadingBtn,
          queryProgProduction = {}

        var keys


        // 避免ALL導致的異常
        var tempIdleCode = []
        for(let i = 0; i < idleCodeList.length; ++i) {
          if(idleCodeList[i] == 'ALL') continue
          tempIdleCode.push(idleCodeList[i])
        }

        idleCodeList = tempIdleCode

        loadingBtn.doing()

        var whereClause =
          '(date BETWEEN "' + startDate + '" AND "' + endDate + '") '
        if (machineList.length > 0) {
          whereClause +=
            'AND machine_id IN (' + ctx.strSplitByComma(machineList) + ')'
        }

        console.log('idle code list :' + idleCodeList)

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_cosmos_program_production_by_shift',
              columns: [
                'DATE_FORMAT(date,"%Y/%m/%d") AS date',
                'work_shift',
                'machine_id',
                //'program_name',
                'operator_id',
                'order_no',
                'part_no',
                'db_operator_id',
                'db_order_no',
                'db_part_no',
                'cycle_time',
                'ng_quantity',
                'actual_output',
              ],
              whereClause: whereClause,
            }),
          },
          {
            success: function (data) {
              _.each(data, function (elem) {
                keys =
                  elem.date +
                  elem.work_shift +
                  elem.machine_id +
                  //elem.program_name +
                  elem.operator_id +
                  elem.order_no +
                  elem.part_no
                queryProgProduction[keys] = elem
              })

              var hideIdleColIndex = []

              let marckMap = ctx.preCon.getMacro
              let count = 0
              for (let key in marckMap) {
                let found = false
                for (let i = 0; i < idleCodeList.length; ++i) {
                  if (key == idleCodeList[i]) {
                    found = true
                    break
                  }
                }
                if (!found) {
                  hideIdleColIndex.push(
                    ctx.downTimeStartIndex + parseInt(count)
                  )
                }
                ++count
              }
              console.log(hideIdleColIndex)
              ctx.hideDowntimeIndex = hideIdleColIndex

              // 先還原所有DOWNTIME 欄位
              let max = ctx.downTimeStartIndex + count
              for (let i = ctx.downTimeStartIndex; i < max; ++i) {
                detailTable.table.column(i).visible(true)
              }

              hippo
                .newSimpleExhaler()
                .space('product_work_utilization_cosmos')
                .index('machine_id', machineList)
                .indexRange('date', startDate, endDate)
                .columns(
                  'machine_id',
                  'date',
                  'work_shift',
                  'program_name',
                  'power_millisecond',
                  'operate_millisecond',
                  'cutting_millisecond',
                  'idle_millisecond',
                  'alarm_millisecond',
                  'work_shift_millisecond',
                  'part_count',
                  'macro_idle_minute_array',
                  'operator_id',
                  'order_no',
                  'part_no',
                  'cycle_time'
                )
                .exhale(function (exhalable) {
                  var result = []

                  var lastItem = null

                  exhalable.each((data, groupKeys) => {
                    if (disabledWorkShiftSet.has(data.work_shift)) {
                      return
                    }
                    var downTime = {}
                    var macroIdle = JSON.parse(data.macro_idle_minute_array)
                    /*downTime.down_time_m2 =
                      macroIdle[2] == null ? 0 : macroIdle[2]
                    downTime.down_time_m3 =
                      macroIdle[3] == null ? 0 : macroIdle[3]
                    */

                    let marckMap = ctx.preCon.getMacro
                    for (let key in marckMap) {
                      downTime[key] =
                        macroIdle[key] == null ? 0 : parseInt(macroIdle[key])
                    }

                    //console.log(downTime)

                    var needDownTime = 0
                    for (let i = 0; i < idleCodeList.length; ++i) {
                      if (idleCodeList[i] === 'ALL') continue
                      needDownTime += downTime[idleCodeList[i]]
                    }
                    //console.log(needDownTime)

                    //ctx.needDowntime += needDownTime

                    // if (!data.length == 0) {
                    //   var macroIdle = JSON.parse(data.macro_idle_minute_array);
                    //   downTime.down_time_m2 = macroIdle[2] == null ? 0 : macroIdle[2];
                    //   downTime.down_time_m3 = macroIdle[3] == null ? 0 : macroIdle[3];
                    // } else {
                    //   downTime.down_time_m2 = 0;
                    //   downTime.down_time_m3 = 0;
                    // }

                    var mergeDownTimeData = _.extend(data, downTime)
                    //console.log(mergeDownTimeData)
                    var timeData = ctx.commons.millisecondparseInt(
                      mergeDownTimeData
                    )
                    // because indicator have no program and cutting time ,partcount
                    // use default 0 or other value will caue customer confuse
                    // so change it to N.A.
                    // 2017/01/25 by jaco

                    var brand = servkit.getMachineBrand(timeData.machine_id)
                    var capacityUtilization =
                      ctx.commons.getDenominator(timeData) == 0
                        ? 0
                        : (timeData.operate_millisecond + needDownTime) /
                          // timeData.down_time_m2 +
                          // timeData.down_time_m3) /
                          ctx.commons.getDenominator(timeData)
                    var key = ctx.getKeys(timeData)
                    var operatorId =
                      queryProgProduction[key] == undefined
                        ? timeData.operator_id
                        : queryProgProduction[key].db_operator_id
                    var orderNo =
                      queryProgProduction[key] == undefined
                        ? timeData.order_no
                        : queryProgProduction[key].db_order_no
                    var partNo =
                      queryProgProduction[key] == undefined
                        ? timeData.part_no
                        : queryProgProduction[key].db_part_no
                    //看板insert 不良品數流程其中cycle time 因為沒經過換算，所以改固定回傳1來存DB，報表頁面判斷DB已存cycle time為1則改box cycle time 呈現
                    var cycleTime =
                      queryProgProduction[key] == undefined
                        ? timeData.cycle_time
                        : queryProgProduction[key].cycle_time == 1
                        ? timeData.cycle_time
                        : queryProgProduction[key].cycle_time
                    var ngQty =
                      queryProgProduction[key] == undefined
                        ? 0
                        : queryProgProduction[key].ng_quantity

                    var actOut =
                      queryProgProduction[key] == undefined
                        ? 0
                        : queryProgProduction[key].actual_output

                    // 因為CYCLE TIME 單位為MS
                    // 避免和其它區(用時間字串計算的有差異)
                    var operText1 = timeData.operate_millisecond.millisecondToHHmmss()
                    var items1 = operText1.split(':')
                    var hh1 = 0
                    var mm1 = 0
                    var ss1 = 0
                    if (items1.length > 0) hh1 = parseInt(items1[0])
                    if (items1.length > 1) mm1 = parseInt(items1[1])
                    if (items1.length > 2) ss1 = parseInt(items1[2])
  
                    var operSecs1 = hh1 * 60 * 60 + mm1 * 60 + ss1

                    var oper_fee =
                      (actOut * cycleTime ) / (operSecs1 * 1000)

                    var hippoOperatorId = timeData.operator_id
                    var hippoOrderNo = timeData.order_no
                    var hippoPartNo = timeData.part_no

                    var addNew = false
                    if (result.length == 0) {
                      addNew = true
                    } else {
                      let last = result[result.length - 1]
                      if (
                        last[0] !=
                          servkit.getMachineName(timeData.machine_id) ||
                        last[1] != timeData.date.date8BitsToSlashed() ||
                        last[2] != timeData.work_shift
                      ) {
                        addNew = true
                      }
                    }

                    if (lastItem === null || addNew) {
                      lastItem = {}
                      lastItem.power_millisecond = timeData.power_millisecond
                      lastItem.operate_millisecond =
                        timeData.operate_millisecond
                      lastItem.cutting_millisecond =
                        timeData.cutting_millisecond
                      lastItem.idle_millisecond = timeData.idle_millisecond
                      lastItem.alarm_millisecond = timeData.alarm_millisecond
                      lastItem.work_shift_millisecond =
                        timeData.work_shift_millisecond
                      //lastItem.down_time_m2 = timeData.down_time_m2
                      //lastItem.down_time_m3 = timeData.down_time_m3
                      lastItem.downTime = downTime
                      lastItem.cycleTime = cycleTime

                      lastItem.part_count = parseInt(timeData.part_count)
                      lastItem.ngQty = parseInt(ngQty)
                      lastItem.actOut = parseInt(actOut)
                      lastItem.oper_fee = oper_fee
                     

                      lastItem.capacityUtilization =
                        ctx.commons.getDenominator(timeData) == 0
                          ? 0
                          : (timeData.operate_millisecond + needDownTime) /
                            // timeData.down_time_m2 +
                            // timeData.down_time_m3) /
                            ctx.commons.getDenominator(timeData)
                    } else {
                      lastItem.power_millisecond += timeData.power_millisecond
                      lastItem.operate_millisecond +=
                        timeData.operate_millisecond
                      lastItem.cutting_millisecond +=
                        timeData.cutting_millisecond
                      lastItem.idle_millisecond += timeData.idle_millisecond
                      lastItem.alarm_millisecond += timeData.alarm_millisecond
                      lastItem.work_shift_millisecond =
                        timeData.work_shift_millisecond
                      //lastItem.down_time_m2 += timeData.down_time_m2
                      //lastItem.down_time_m3 += timeData.down_time_m3
                      for (let key in lastItem.downTime) {
                        lastItem.downTime[key] += downTime[key]
                      }

                      lastItem.needDownTime = 0
                      for (let i = 0; i < idleCodeList.length; ++i) {
                        if (idleCodeList[i] === 'ALL') continue
                        lastItem.needDownTime +=
                          lastItem.downTime[idleCodeList[i]]
                      }

                      lastItem.part_count += parseInt(timeData.part_count)
                      lastItem.ngQty += parseInt(ngQty)
                      lastItem.actOut += parseInt(actOut)

                      var operText2 = lastItem.operate_millisecond.millisecondToHHmmss()
                      var items2 = operText2.split(':')
                      var hh2 = 0
                      var mm2 = 0
                      var ss2 = 0
                      if (items2.length > 0) hh2 = parseInt(items2[0])
                      if (items2.length > 1) mm2 = parseInt(items2[1])
                      if (items2.length > 2) ss2 = parseInt(items2[2])
    
                      var operSecs2 = hh2 * 60 * 60 + mm2 * 60 + ss2

                      // 因為CYCLE TIME 已在TIME DATA中乘上1000
                      lastItem.oper_fee =
                        (lastItem.actOut * lastItem.cycleTime ) /
                        (operSecs2*1000)

                      lastItem.capacityUtilization =
                        ctx.commons.getDenominator(lastItem) == 0
                          ? 0
                          : (lastItem.operate_millisecond +
                              lastItem.needDownTime) /
                            // timeData.down_time_m2 +
                            // timeData.down_time_m3) /
                            ctx.commons.getDenominator(lastItem)
                    }

                    if (addNew) {
                      var newRow = [
                        servkit.getMachineName(timeData.machine_id),
                        timeData.date.date8BitsToSlashed(),
                        timeData.work_shift,
                        /*brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                        -1
                          ? 'N.A.'
                          : timeData.program_name,*/
                        operatorId,
                        orderNo,
                        partNo,
                        timeData.power_millisecond.millisecondToHHmmss(),
                        timeData.operate_millisecond.millisecondToHHmmss(),
                        brand
                          .valueOf()
                          .toUpperCase()
                          .indexOf('INDICATORLAMP') != -1
                          ? 'N.A.'
                          : timeData.cutting_millisecond.millisecondToHHmmss(),
                        (
                          timeData.idle_millisecond + timeData.alarm_millisecond
                        ).millisecondToHHmmss(),
                        cycleTime / 1000,
                        timeData.part_count,
                        ngQty,
                        timeData.part_count - ngQty,
                        actOut, // 14
                        (
                          timeData.operate_millisecond /
                          ctx.commons.getDenominator(timeData)
                        ).floatToPercentage(),
                        brand
                          .valueOf()
                          .toUpperCase()
                          .indexOf('INDICATORLAMP') != -1
                          ? 'N.A.'
                          : (
                              timeData.cutting_millisecond /
                              ctx.commons.getDenominator(timeData)
                            ).floatToPercentage(),
                        oper_fee.floatToPercentage(), // 17
                      ]

                      let marckMap = ctx.preCon.getMacro
                      for (let key in marckMap) {
                        newRow.push(downTime[key].millisecondToHHmmss())
                      }
                      //  timeData.down_time_m2.millisecondToHHmmss(),
                      //  timeData.down_time_m3.millisecondToHHmmss(),

                      newRow.push(capacityUtilization.floatToPercentage())
                      newRow.push(
                        ctx.getEditBtn(
                          hippoOperatorId,
                          hippoOrderNo,
                          hippoPartNo
                        )
                      )

                      newRow.push(
                        timeData.work_shift_millisecond.millisecondToHHmmss()
                      )
                      newRow.push(needDownTime)

                      result.push(newRow)
                    } else {
                      let last = result[result.length - 1]
                      last[6] = lastItem.power_millisecond.millisecondToHHmmss()
                      last[7] = lastItem.operate_millisecond.millisecondToHHmmss()
                      last[8] =
                        brand
                          .valueOf()
                          .toUpperCase()
                          .indexOf('INDICATORLAMP') != -1
                          ? 'N.A.'
                          : lastItem.cutting_millisecond.millisecondToHHmmss()

                      last[9] = (
                        lastItem.idle_millisecond + lastItem.alarm_millisecond
                      ).millisecondToHHmmss()

                      last[11] = lastItem.part_count
                      last[12] = lastItem.ngQty
                      last[13] = lastItem.part_count - lastItem.ngQty
                      last[14] = lastItem.actOut
                      last[15] = (
                        lastItem.operate_millisecond /
                        ctx.commons.getDenominator(lastItem)
                      ).floatToPercentage()

                      last[16] =
                        brand
                          .valueOf()
                          .toUpperCase()
                          .indexOf('INDICATORLAMP') != -1
                          ? 'N.A.'
                          : (
                              lastItem.cutting_millisecond /
                              ctx.commons.getDenominator(lastItem)
                            ).floatToPercentage()

                      var operText3 = lastItem.operate_millisecond.millisecondToHHmmss()
                      var items3 = operText3.split(':')
                      var hh3 = 0
                      var mm3 = 0
                      var ss3 = 0
                      if (items3.length > 0) hh3 = parseInt(items3[0])
                      if (items3.length > 1) mm3 = parseInt(items3[1])
                      if (items3.length > 2) ss3 = parseInt(items3[2])      
                      var operSecs3 = hh3 * 60 * 60 + mm3 * 60 + ss3

                      lastItem.oper_fee =
                           (lastItem.actOut * lastItem.cycleTime ) /
                           (operSecs3*1000)

                      last[17] = lastItem.oper_fee.floatToPercentage()

                      let marckMap = ctx.preCon.getMacro
                      let curMIdx = 18
                      for (let key in marckMap) {
                        last[curMIdx] = downTime[key].millisecondToHHmmss()
                        ++curMIdx
                      }

                      last[
                        ctx.capIndex
                      ] = lastItem.capacityUtilization.floatToPercentage()

                      last[last.length - 1] = lastItem.needDownTime
                    }
                  })

                  detailTable.drawTable(result)

                  //detailTable.hideCols(hideIdleColIndex)

                  // 把不需要的欄位HIDE起來
                  for (let i = 0; i < hideIdleColIndex.length; ++i) {
                    detailTable.table.column(hideIdleColIndex[i]).visible(false)
                  }

                  detailTable.showWidget()
                  loadingBtn.done()
                })
            },
          }
        )
      },
    },
    preCondition: {
      queryDeviceName2Id: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_id', 'device_name'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.device_name] = elem.device_id
              })
              done(dataMap)
            },
          }
        )
      },

      getMacro: function (done) {
        servkit.ajax(
          {
            url: 'api/downtimeanalysis/macroidle/getMacro',
            type: 'GET',
          },
          {
            success: function (data) {
              var obj = {}
              _.each(data, function (ele) {
                obj[ele] = 'M' + ele
              })
              done(obj)
            },
            fail: function (data) {
              console.log(data)
            },
          }
        )
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
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
