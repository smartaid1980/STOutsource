import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import { ajax } from '../../../../js/servtech/module/servkit/ajax.js'
import {
  getPlantMachineOptionMap,
  renderPlantAndMachineSelect,
} from '../../../../js/servtech/module/servkit/form.js'

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
      var oeetitel3 = $('#detail-oee3').text()
      const getTimeData = (rowData, columnIndexMap) => {
        let value
        return _.mapObject(columnIndexMap, (columnIndex, columnName) => {
          value = rowData[columnIndex]
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
            a.down_time_m2 += timeData.down_time_m2
            a.down_time_m3 += timeData.down_time_m3
            return a
          },
          {
            denominator: 0,
            operationTime: 0,
            cuttingTime: 0,
            down_time_m2: 0,
            down_time_m3: 0,
          }
        )
        const utilization = (
          sumData.operationTime / sumData.denominator
        ).floatToPercentage()
        const effectiveUtilization = (
          sumData.cuttingTime / sumData.denominator
        ).floatToPercentage()
        const capacityUtilization = (
          (sumData.operationTime +
            sumData.down_time_m2 +
            sumData.down_time_m3) /
          sumData.denominator
        ).floatToPercentage()
        return `Avg. ${oeetitle1} : ${utilization} /        ${oeetitel2} : ${effectiveUtilization} /        ${oeetitel3} : ${capacityUtilization}`
      }
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          rightColumn: [11, 12, 13, 14, 15, 16, 19],
          hideCols: [21],
          summaryInfo: {
            text(data, tableApi) {
              return getSummaryInfoText(data, {
                power_millisecond: 7,
                operate_millisecond: 8,
                cutting_millisecond: 9,
                work_shift_millisecond: 21,
                down_time_m2: 17,
                down_time_m3: 18,
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
          },
          excel: {
            fileName: 'daily_production_info',
            format: [
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
            ],
            customHeaderFunc: function (tableHeader) {
              return tableHeader
                .slice(0, tableHeader.length - 2)
                .filter((name, i) => detailTable.table.columns().visible()[i])
            },
            customDataFunc: function (tableData) {
              return _.map(tableData, function (d) {
                var data = d.slice(0, d.length - 2)
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
        var program_name = $(this).parent().parent().find('td').eq(3).text()
        var operator_id = $(this).parent().parent().find('td').eq(4).text()
        var order_no = $(this).parent().parent().find('td').eq(5).text()
        var part_no = $(this).parent().parent().find('td').eq(6).text()

        var cycle_time = $(this).parent().parent().find('td').eq(11).text()
        var ng_quantity = $(this).parent().parent().find('td').eq(13).text()
        ctx.output = $(this).parent().parent().find('td').eq(12).text()

        ctx.$modalProductMachineId.val(machine_id)
        ctx.$modalProductDate.val(date)
        ctx.$modalproductWorkShift.val(work_shift)
        ctx.$modalProductProg.val(program_name)
        ctx.$modalProductOperatorId.val(operator_id)
        ctx.$modalProductOrderId.val(order_no)
        ctx.$modalProductPartId.val(part_no)
        ctx.$modalProductCycleTime.val(cycle_time)
        ctx.$modalProductRejectedQty.val(ng_quantity)

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

        var date = ctx.$modalProductDate.val()
        var machine_id = ctx.$modalProductMachineId.val()
        var work_shift = ctx.$modalproductWorkShift.val()
        var program_name = ctx.$modalProductProg.val()
        var operator_id = ctx.$modalProductOperatorId.val()
        var order_no = ctx.$modalProductOrderId.val()
        var part_no = ctx.$modalProductPartId.val()
        var cycle_time = ctx.$modalProductCycleTime.val()
        var ng_quantity = ctx.$modalProductRejectedQty.val()

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
          program_name: program_name.toString(),
          operator_id: ctx.$hippoOperatorId.toString(),
          order_no: ctx.$hippoOrderNo.toString(),
          part_no: ctx.$hippoPartNo.toString(),
          db_operator_id: operator_id.toString(),
          db_order_no: order_no.toString(),
          db_part_no: part_no.toString(),
          cycle_time: cycle_time,
          ng_quantity: ng_quantity,
        }

        ctx.insertUpdateProduct(params)
      })
    },
    util: {
      $tableElement: $('#detail-table'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
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
      $modalProductSubmit: $('#modal-submit-btn'),
      $crudTableModal: $('#crud-table-modal'),
      $hippoOperatorId: null,
      $hippoOrderNo: null,
      $hippoPartNo: null,
      output: null,
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
              url: 'api/cosmos/product/insertUpdatePgProduction',
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
                  $(node).find('td').eq(3).html(params.program_name)
                  $(node).find('td').eq(4).html(params.db_operator_id)
                  $(node).find('td').eq(5).html(params.db_order_no)
                  $(node).find('td').eq(6).html(params.db_part_no)
                  $(node).find('td').eq(11).html(params.cycle_time)
                  $(node).find('td').eq(13).html(params.ng_quantity)
                  var qualifiedQty =
                    parseInt(ctx.output) - parseInt(params.ng_quantity)
                  $(node).find('td').eq(14).html(qualifiedQty)
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
          timeData.program_name +
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
          loadingBtn = ctx.loadingBtn,
          queryProgProduction = {}

        var keys

        loadingBtn.doing()

        var whereClause =
          '(date BETWEEN "' + startDate + '" AND "' + endDate + '") '
        if (machineList.length > 0) {
          whereClause +=
            'AND machine_id IN (' + ctx.strSplitByComma(machineList) + ')'
        }

        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_cosmos_program_production',
              columns: [
                'DATE_FORMAT(date,"%Y/%m/%d") AS date',
                'work_shift',
                'machine_id',
                'program_name',
                'operator_id',
                'order_no',
                'part_no',
                'db_operator_id',
                'db_order_no',
                'db_part_no',
                'cycle_time',
                'ng_quantity',
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
                  elem.program_name +
                  elem.operator_id +
                  elem.order_no +
                  elem.part_no
                queryProgProduction[keys] = elem
              })

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

                  exhalable.each((data, groupKeys) => {
                    if (disabledWorkShiftSet.has(data.work_shift)) {
                      return
                    }
                    var downTime = {}
                    var macroIdle = JSON.parse(data.macro_idle_minute_array)
                    downTime.down_time_m2 =
                      macroIdle[2] == null ? 0 : macroIdle[2]
                    downTime.down_time_m3 =
                      macroIdle[3] == null ? 0 : macroIdle[3]

                    // if (!data.length == 0) {
                    //   var macroIdle = JSON.parse(data.macro_idle_minute_array);
                    //   downTime.down_time_m2 = macroIdle[2] == null ? 0 : macroIdle[2];
                    //   downTime.down_time_m3 = macroIdle[3] == null ? 0 : macroIdle[3];
                    // } else {
                    //   downTime.down_time_m2 = 0;
                    //   downTime.down_time_m3 = 0;
                    // }

                    var mergeDownTimeData = _.extend(data, downTime)
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
                        : (timeData.operate_millisecond +
                            timeData.down_time_m2 +
                            timeData.down_time_m3) /
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

                    var hippoOperatorId = timeData.operator_id
                    var hippoOrderNo = timeData.order_no
                    var hippoPartNo = timeData.part_no

                    result.push([
                      servkit.getMachineName(timeData.machine_id),
                      timeData.date.date8BitsToSlashed(),
                      timeData.work_shift,
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                        ? 'N.A.'
                        : timeData.program_name,
                      operatorId,
                      orderNo,
                      partNo,
                      timeData.power_millisecond.millisecondToHHmmss(),
                      timeData.operate_millisecond.millisecondToHHmmss(),
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                        ? 'N.A.'
                        : timeData.cutting_millisecond.millisecondToHHmmss(),
                      (
                        timeData.idle_millisecond + timeData.alarm_millisecond
                      ).millisecondToHHmmss(),
                      cycleTime / 1000,
                      timeData.part_count,
                      ngQty,
                      timeData.part_count - ngQty,
                      (
                        timeData.operate_millisecond /
                        ctx.commons.getDenominator(timeData)
                      ).floatToPercentage(),
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                        ? 'N.A.'
                        : (
                            timeData.cutting_millisecond /
                            ctx.commons.getDenominator(timeData)
                          ).floatToPercentage(),
                      timeData.down_time_m2.millisecondToHHmmss(),
                      timeData.down_time_m3.millisecondToHHmmss(),
                      capacityUtilization.floatToPercentage(),
                      ctx.getEditBtn(
                        hippoOperatorId,
                        hippoOrderNo,
                        hippoPartNo
                      ),
                      timeData.work_shift_millisecond.millisecondToHHmmss(),
                    ])
                  })

                  detailTable.drawTable(result)
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
