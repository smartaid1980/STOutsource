export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initSelectAll()

      pageSetUp()
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        repairListTable = createReportTable({
          $tableWidget: $('#repair-repay-widget'),
          $tableElement: $('#repair-repay-table'),
          centerColumn: [1, 5, 6, 7],
          onRow: function (row, data) {
            $(row).find('td').eq(9).attr('style', 'display:none')
          },
          excel: {
            fileName: 'RepairRepayExcel',
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ],
          },
        })

      let materLogTable = createReportTable({
        $tableWidget: $('#material-list-widget'),
        $tableElement: $('#material-list-table'),
      })

      let repayLogTable = createReportTable({
        $tableWidget: $('#repair-log-widget'),
        $tableElement: $('#repair-log-table'),
      })

      if (context.isGraced) {
        var result
        var alarmClearSteps = context.graceParam.alarmClearSteps
        var customParam = context.graceParam.preGraceParam.custom
        var alarm_log_id = context.graceParam.logId
        context.drawTable(
          context,
          customParam.startDate,
          customParam.endDate,
          customParam.customer,
          customParam.formMachine,
          customParam.repair,
          customParam.status,
          customParam.urgency,
          repairListTable,
          repayLogTable,
          materLogTable
        )

        context.repairRepay(
          context,
          customParam.modalRepair,
          customParam.assignid,
          repayLogTable,
          materLogTable,
          alarm_log_id
        )
      }

      context.drawTable(
        context,
        '',
        '',
        '',
        '',
        '',
        ['1', '2'],
        [],
        repairListTable,
        repayLogTable,
        materLogTable
      )

      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var startData = context.$startDate.val()
        var endDate = context.$endDate.val()
        var customer = context.$cusID.val() || ''
        var machineID = context.$machineID.val() || ''
        var repairID = context.$repairID.val() || ''
        var status = []
        var urgency = []
        context.$status.each(function () {
          if (this.checked) {
            status.push($(this).val())
          }
        })
        context.$urgency.each(function () {
          if (this.checked) {
            urgency.push($(this).val())
          }
        })
        context.drawTable(
          context,
          startData,
          endDate,
          customer,
          machineID,
          repairID,
          status,
          urgency,
          repairListTable,
          repayLogTable,
          materLogTable
        )
      })
      context.$clearBtn.on('click', function (evt) {
        evt.preventDefault()
        context.$cusID.prop('selectedIndex', -1)
        context.$machineID.prop('selectedIndex', -1)
        context.$repairID.prop('selectedIndex', -1)
        pageSetUp()
      })

      // $('.modal').on('shown.bs.modal', function() {
      //     var margin_vertical = parseInt($(this).find('.modal-dialog').css('margin-top')) + parseInt($(this).find('.modal-dialog').css('margin-bottom'));
      //     var height_header = parseInt($(this).find('.modal-header').css('height'));
      //     var height_footer = parseInt($(this).find('.modal-footer').css('height'));
      //     var height_body = (window.innerHeight - height_header - height_footer - margin_vertical - 10) + 'px';
      //     $(this).find('.modal-body').css('height', height_body).css('overflow', 'auto');
      // });
      $('#stk-material-table tbody').on(
        'change',
        '[name=material_id]',
        function (evt) {
          evt.preventDefault()
          var material = context.getDBObject.getMaterial[$(this).val()]
          $('[name=material_name]').val(material.material_name)
          $('[name=price]').val(material.price)
          $('[name=amount]').val('')
          $('[name=discount]').val('')
          $('[name=total]').val('')
        }
      )

      $('#stk-material-table tbody').on('change', '[name=amount]', function (
        evt
      ) {
        evt.preventDefault()
        var amount = $(this).val()
        var price = $('[name=price]').val()
        var discount = $('[name=discount]').val() || 1
        var total_price = amount * price * discount
        $('[name=total]').val(total_price)
      })

      $('#stk-material-table tbody').on('change', '[name=discount]', function (
        evt
      ) {
        evt.preventDefault()
        var amount = $('[name=amount]').val() || 0
        var price = $('[name=price]').val()
        var discount = $(this).val()
        var total_price = amount * price * discount
        $('[name=total]').val(total_price)
      })

      $('#repair-result-table').on(
        'mousemove',
        'td a[name=modal_alarm_id]',
        function (evt) {
          evt.preventDefault()
          $(this).attr('style', 'text-decoration:underline')
          $(this).css('cursor', 'pointer')
        }
      )

      $('#repair-result-table').on(
        'mouseout',
        'td a[name=modal_alarm_id]',
        function (evt) {
          evt.preventDefault()
          $(this).removeAttr('style')
        }
      )
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $clearBtn: $('#clear-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      loadingBtnByAssign: servkit.loadingButton(
        document.querySelector('#repay_btn')
      ),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $cusID: $('#cus_id'),
      $machineID: $('#machine_id'),
      $repairID: $('#repair_id'),
      $status: $('[name=repairStatus]'),
      $urgency: $('[name=repairEmergency]'),
      $repayBtn: $('#repay_btn'),
      getDBObject: {
        emergencyObj: {
          '1': "<font color='red'>高</font>",
          '0': '<font>一般</font>',
          '2': "<font color='blue'>低</font>",
        },
        statusObj: {
          '0': '未派工',
          '1': '已派工尚未回報',
          '2': '處理中',
          '3': '處理完成',
          '4': '結案',
          '5': '待料',
          '6': '暫不處理',
        },
        resultObj: {
          '0': '處理中',
          '1': '處理完成',
        },
        repayFlag: false,
        modalSubmit: false,
        alarmClearFlag: false,
        alarmClearFlag2: false,
      },
      submitSelValue: {},
      drawTable: function (
        context,
        startDate,
        endDate,
        customer,
        machine,
        repair,
        status,
        urgency,
        repairListTable,
        repayLogTable,
        materLogTable
      ) {
        var that = this
        this.submitSelValue['form'] = {
          context: context,
          startDate: startDate,
          endDate: endDate,
          customer: customer,
          machine: machine,
          repair: repair,
          status: status,
          urgency: urgency,
          repairListTable: repairListTable,
          repayLogTable: repayLogTable,
          materLogTable: materLogTable,
        }

        var result
        let loadingBtn = this.loadingBtn
        loadingBtn.doing()
        var dbObj = {
          startDate: startDate,
          endDate: endDate,
          customer: customer,
          machine: machine,
          repair: repair,
          status: status,
          urgency: urgency,
        }
        servkit
          .politeCheck()
          .until(function () {
            return (
              that.getDBObject.customerObj &&
              that.getDBObject.emergencyObj &&
              that.getDBObject.machineObj &&
              that.getDBObject.getBreakdown &&
              that.getDBObject.statusObj
            )
          })
          .thenDo(function () {
            try {
              servkit.ajax(
                {
                  url: 'api/aftersalesservice/repairrepay/query',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify(dbObj),
                },
                {
                  success: function (data) {
                    var tableData = []
                    _.each(data, function (ele) {
                      var date = new Date(ele.create_time)
                      var orderDate = new Date(ele.order_date)
                      tableData.push([
                        // '<a href="javascript:void(0)" name="tableRepairID">' + ele.repair_id + '<a>',
                        ele.repair_id,
                        that.getDBObject.emergencyObj[ele.emergency],
                        moment(date).format('YYYY/MM/DD HH:mm:ss'),
                        that.getDBObject.customerObj[ele.cus_id],
                        that.getDBObject.machineObj[ele.machine_id],
                        that.getDBObject.getBreakdown[ele.breakdown_id]
                          .breakdown_name,
                        moment(orderDate).format('YYYY/MM/DD'),
                        that.getDBObject.statusObj[ele.status_id],
                        '<button class="btn btn-default" name="repay-btn">回報</button>',
                        ele.assign_id,
                      ])
                    })
                    servkit
                      .politeCheck()
                      .until(function () {
                        return tableData
                      })
                      .thenDo(function () {
                        result = tableData
                        repairListTable.drawTable(result)
                        repairListTable.showWidget()
                      })
                      .tryDuration(0)
                      .start()
                    if (!that.getDBObject.repayFlag) {
                      that.getDBObject.repayFlag = true
                      $('#repair-repay-table tbody').on(
                        'click',
                        'td button[name=repay-btn]',
                        function (evt) {
                          evt.preventDefault()
                          var repairid = $(this)
                            .parent()
                            .parent()
                            .eq(0)
                            .find('td')
                            .eq(0)
                            .text()
                          var assign_id = $(this)
                            .parent()
                            .parent()
                            .eq(0)
                            .find('td')
                            .eq(9)
                            .text()

                          context.repairRepay(
                            context,
                            repairid,
                            assign_id,
                            repayLogTable,
                            materLogTable
                          )
                        }
                      )
                    }
                  },
                  fail: function (data) {
                    console.log(data)
                  },
                }
              )
            } catch (e) {
              console.warn(e)
            } finally {
              that.loadingBtn.done()
            }
          })
          .tryDuration(0)
          .start()
      },
      initSelectAll: function () {
        this.initCustomerSelect()
        this.initMachineSelect()
        this.initRepairSelect()
        this.initBreakdown()
        this.initUserData()
        this.initMaterialList()
      },
      initCustomerSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getCustomer',
          tableName: 'a_aftersalesservice_customer',
          columns: ['cus_id', 'cus_name'],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getCustomer, function (data) {
            dataMap[data.cus_id] = data.cus_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject['customerObj'] = result
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' + key + '" >' + result[key] + '</option>'
              })
              selectResultHtml = selectHtml
            })
            .tryDuration(0)
            .start()
          servkit
            .politeCheck()
            .until(function () {
              return selectResultHtml
            })
            .thenDo(function () {
              that.$cusID[0].innerHTML = selectResultHtml
              that.$cusID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initUserData: function () {
        var that = this
        var dataConfig = {
          objKey: 'getUser',
          tableName: 'm_sys_user',
          columns: ['user_id', 'user_name'],
        }
        var callbackfunction = function () {
          var result

          var dataMap = {}
          _.map(that.getDBObject.getUser, function (data) {
            dataMap[data.user_id] = data.user_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject.getUser = result
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initMachineSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getMachine',
          tableName: 'm_device',
          columns: ['device_id', 'device_name'],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getMachine, function (data) {
            dataMap[data.device_id] = data.device_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject['machineObj'] = result
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' + key + '" >' + result[key] + '</option>'
              })
              selectResultHtml = selectHtml
            })
            .tryDuration(0)
            .start()
          servkit
            .politeCheck()
            .until(function () {
              return selectResultHtml
            })
            .thenDo(function () {
              that.$machineID[0].innerHTML = selectResultHtml
              that.$machineID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initRepairSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getRepair',
          tableName: 'a_aftersalesservice_repair',
          columns: ['repair_id'],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getRepair, function (data) {
            dataMap[data.repair_id] = data.repair_id
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject['repairObj'] = result
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' + key + '" >' + result[key] + '</option>'
              })
              selectResultHtml = selectHtml
            })
            .tryDuration(0)
            .start()
          servkit
            .politeCheck()
            .until(function () {
              return selectResultHtml
            })
            .thenDo(function () {
              that.$repairID[0].innerHTML = selectResultHtml
              that.$repairID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initBreakdown: function () {
        var that = this
        var dataConfig = {
          objKey: 'getBreakdown',
          tableName: 'a_aftersalesservice_entity_breakdown',
          columns: ['breakdown_id', 'entity_id', 'breakdown_name'],
        }
        var callbackfunction = function () {
          var result

          var dataMap = {}
          _.map(that.getDBObject.getBreakdown, function (data) {
            dataMap[data.breakdown_id] = {
              breakdown_id: data.breakdown_id,
              entity_id: data.entity_id,
              breakdown_name: data.breakdown_name,
            }
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject.getBreakdown = result
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initMaterialList: function () {
        var that = this
        var dataConfig = {
          objKey: 'getMaterial',
          tableName: 'a_aftersalesservice_material',
          columns: ['material_id', 'material_name', 'price'],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getMaterial, function (data) {
            dataMap[data.material_id] = {
              material_id: data.material_id,
              material_name: data.material_name,
              price: data.price,
            }
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject.getMaterial = result
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' +
                  result[key].material_id +
                  '" >' +
                  key +
                  '</option>'
              })
              selectResultHtml = selectHtml
              that.getDBObject['getMaterialHtml'] = selectHtml
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      repairRepay: function (
        context,
        repairid,
        assign_id,
        repayLogTable,
        materLogTable,
        alarm_log_id
      ) {
        var that = this
        var result
        if (context.isGraced) {
          var alarmClearSteps = context.graceParam.alarmClearSteps

          var resultHtml = ''
          _.each(alarmClearSteps, function (data) {
            if (data.result == 'Y') {
              resultHtml +=
                '(' +
                data.seq +
                ') ' +
                data.step_desc +
                ' ? ' +
                data.result +
                '\r\n'
            } else {
              resultHtml +=
                '(' +
                data.seq +
                ') ' +
                data.step_desc +
                ' ? ' +
                data.result +
                ' : ' +
                data.clear_desc +
                '\r\n'
            }
          })

          result = resultHtml
        }

        servkit
          .politeCheck()
          .until(function () {
            return (
              that.getDBObject.customerObj &&
              that.getDBObject.emergencyObj &&
              that.getDBObject.machineObj &&
              that.getDBObject.getBreakdown &&
              that.getDBObject.statusObj
            )
          })
          .thenDo(function () {
            servkit.ajax(
              {
                url: 'api/aftersalesservice/repairassign/getrepairdata',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(repairid),
              },
              {
                success: function (obj) {
                  var datepickerConfig = {
                    dateFormat: 'yy/mm/dd',
                  }

                  var data = obj[0]
                  var date = new Date(data.create_time)
                  var assignTime = data.assign_time
                  if (assignTime) {
                    assignTime = moment(new Date(assignTime)).format(
                      'YYYY/MM/DD'
                    )
                  } else {
                    assignTime = ''
                  }
                  var tableHtml = ''
                  var repayHtml = ''
                  var repairListHtml = ''
                  var materialHtml = ''
                  tableHtml += '<tr>'
                  tableHtml += '<td> 客訴單代碼 </td>'
                  tableHtml +=
                    '<td id="modal_repair_id">' + data.repair_id + '</td>'
                  tableHtml += '<td> 客戶</td>'
                  tableHtml +=
                    '<td>' +
                    context.getDBObject.customerObj[data.cus_id] +
                    ' </td>'
                  tableHtml += '<td> 狀態 </td>'
                  tableHtml +=
                    '<td>' +
                    context.getDBObject.statusObj[data.status_id] +
                    '</td>'
                  tableHtml += '</tr>'
                  tableHtml += '<tr>'
                  tableHtml += '<td > 機號 </td>'
                  tableHtml +=
                    '<td id="modal_machine_id">' +
                    context.getDBObject.machineObj[data.machine_id] +
                    '</td>'
                  tableHtml += '<td> 反應人</td>'
                  tableHtml += '<td>' + data.cus_reply + ' </td>'
                  tableHtml += '<td> 最後一次回報結果 </td>'
                  tableHtml += '<td>' + '' + '</td>'
                  tableHtml += '</tr>'
                  tableHtml += '<tr>'
                  tableHtml += '<td> 問題類別 </td>'
                  tableHtml += '<td>' + data.breakdown_id + '</td>'
                  tableHtml += '<td> 反應人電話</td>'
                  tableHtml += '<td>' + data.phone + ' </td>'
                  tableHtml += '<td> 建立時間 </td>'
                  tableHtml +=
                    '<td>' +
                    moment(date).format('YYYY/MM/DD HH:mm:ss') +
                    '</td>'
                  tableHtml += '</tr>'
                  tableHtml += '<tr>'
                  tableHtml += '<td> 問題項目 </td>'
                  tableHtml += '<td>' + data.breakdown_id + '</td>'
                  tableHtml += '<td> 反應人分機</td>'
                  tableHtml += '<td>' + data.ext_phone + ' </td>'
                  tableHtml += '<td> 派工時間 </td>'
                  tableHtml += '<td>' + assignTime + '</td>'
                  tableHtml += '</tr>'
                  tableHtml += '<tr>'
                  tableHtml += '<td> 故障代碼 </td>'
                  tableHtml +=
                    '<td><span>' +
                    data.alarm_id +
                    '</span>(<a name="modal_alarm_id">故障指引</a>)</td>'
                  tableHtml += '<td> 反應人傳真</td>'
                  tableHtml += '<td>' + data.fax + ' </td>'
                  tableHtml += '<td> 結案時間 </td>'
                  tableHtml += '<td>' + '' + '</td>'
                  tableHtml += '</tr>'
                  tableHtml += '<tr>'
                  tableHtml += '<td> 緊急度  </td>'
                  tableHtml +=
                    '<td>' +
                    context.getDBObject.emergencyObj[data.emergency] +
                    '</td>'
                  tableHtml += '<td> 反應人手機</td>'
                  tableHtml += '<td>' + data.cell_phone + ' </td>'
                  tableHtml += '<td> 建立者 </td>'
                  tableHtml +=
                    '<td>' + that.getDBObject.getUser[data.create_by] + '</td>'
                  tableHtml += '</tr>'
                  tableHtml += '<tr>'
                  tableHtml += '<td> 反應人Email</td>'
                  tableHtml += '<td>' + data.email + ' </td>'
                  tableHtml += '<td> 維修地址 </td>'
                  tableHtml += '<td colspan="3">' + data.address + '</td>'
                  tableHtml += '</tr>'
                  tableHtml += '<tr>'
                  tableHtml += '<td > 故障內容記錄 </td>'
                  tableHtml += '<td colspan="5">' + data.break_note + '</td>'
                  tableHtml += '</tr>'

                  repayHtml +=
                    '<div class="jarviswidget jarviswidget-color-blueDark" data-widget-editbutton="false" data-widget-deletebutton="false" data-widget-colorbutton="false" data-widget-togglebutton="false" data-widget-fullscreenbutton="false" >'
                  repayHtml += '<header>'
                  repayHtml +=
                    '<span class="widget-icon"> <i class="fa fa-cloud-upload"></i> </span>'
                  repayHtml += '<h2>回報</h2></header>'
                  repayHtml += '<div class="row">'
                  repayHtml +=
                    '<form class="smart-form" novalidate="novalidate">'
                  repayHtml += '<fieldset>'
                  repayHtml += '<div class="row">'
                  repayHtml += '<section class="col-3">'
                  repayHtml += '<label class="label">*實際維修日期</label>'
                  repayHtml +=
                    '<label class="input"> <i class="icon-append fa fa-calendar"></i>'
                  repayHtml +=
                    '<input type="text" name="order_date" id="order_date" />'
                  repayHtml += '</label>'
                  repayHtml += '</section>'
                  repayHtml += '</div>'
                  repayHtml += '<div class="row">'
                  repayHtml += '<section class="col-12">'
                  repayHtml += '<label class="label">*維修內容</label>'
                  repayHtml += '<label class="input">'
                  repayHtml +=
                    '<textarea class="form-control " rows="5" name="recommend"></textarea>'
                  repayHtml += '</label>'
                  repayHtml += '</section>'
                  repayHtml += '</div>'
                  repayHtml += '<div class="row">'
                  repayHtml += '<section class="col-3">'
                  repayHtml += '<label class="label">*處理結果</label>'
                  repayHtml += '<label class="radio-inline">'
                  repayHtml +=
                    '<input type="radio" name="repairResult" value="0" class="radiobox style-2" />'
                  repayHtml += '<span>尚在處理中</span>'
                  repayHtml += '</label>'
                  repayHtml += '<label class="radio-inline">'
                  repayHtml +=
                    '<input type="radio" name="repairResult" value="1" checked="checked" class="radiobox style-2" />'
                  repayHtml += '<span>處理完成</span>'
                  repayHtml += '</label>'
                  repayHtml += '</lable>'
                  repayHtml += '</section>'
                  repayHtml += '</div>'
                  repayHtml += '</fieldset>'
                  repayHtml += '</form>'
                  repayHtml += '</div>'

                  $('#repair-result-table')[0].innerHTML = tableHtml

                  if (!that.getDBObject.alarmClearFlag2) {
                    that.getDBObject.alarmClearFlag2 = true
                    $('#repair-result-table').on(
                      'click',
                      'td a[name=modal_alarm_id]',
                      function (evt) {
                        evt.preventDefault()
                        var modalMachine = $('#modal_machine_id').text()
                        var alarmCode = $(this).prev().text()
                        context.alarmClear(
                          context,
                          context.getDBObject.machineObj[data.machine_id],
                          alarmCode,
                          assign_id,
                          data.repair_id
                        )
                      }
                    )
                  }
                  // $('#repair-list-div')[0].innerHTML = repairListHtml;
                  // $('#material-list-div')[0].innerHTML =materialHtml;
                  $('#repair-result-repay')[0].innerHTML = repayHtml
                  if (
                    result &&
                    context.graceParam.preGraceParam.custom.modalRepair ==
                      data.repair_id
                  ) {
                    $('[name=recommend]').val(result)
                  } else {
                    $('[name=recommend]').val('')
                  }
                  $('#order_date')
                    .datepicker(datepickerConfig)
                    .val(moment().format('YYYY/MM/DD'))
                  // $('[name=user_group]')[0].innerHTML = usergroupHtml;
                  pageSetUp()

                  var repayData, usergroup

                  servkit.ajax(
                    {
                      url: 'api/aftersalesservice/repairrepay/readrepaylog',
                      type: 'POST',
                      contentType: 'application/json',
                      data: JSON.stringify({
                        repair_id: repairid,
                      }),
                    },
                    {
                      success: function (data) {
                        servkit.ajax(
                          {
                            url: servkit.rootPath + '/api/getdata/db',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({
                              table: 'a_aftersalesservice_repair_assign_emp',
                              columns: ['assign_id', 'emp_id'],
                            }),
                          },
                          {
                            success: function (data2) {
                              var users = ''
                              _.each(data2, function (ele) {
                                if (ele.assign_id == assign_id) {
                                  users +=
                                    '' +
                                    that.getDBObject.getUser[ele.emp_id] +
                                    ','
                                  users = users.substring(0, users.length - 1)
                                }
                              })
                              usergroup = users
                            },
                            fail: function (data2) {
                              console.log(data2)
                            },
                          }
                        )
                        servkit
                          .politeCheck()
                          .until(function () {
                            return usergroup
                          })
                          .thenDo(function () {
                            var result = []
                            _.each(data, function (ele) {
                              result.push([
                                usergroup,
                                moment(new Date(ele.order_date)).format(
                                  'YYYY/MM/DD'
                                ),
                                ele.recommend,
                                moment(new Date(ele.maintain_time)).format(
                                  'YYYY/MM/DD'
                                ),
                                that.getDBObject.resultObj[ele.result],
                                ele.repay_note,
                                that.getDBObject.getUser[ele.repay],
                              ])
                            })
                            repayData = result
                          })
                          .tryDuration(0)
                          .start()

                        servkit
                          .politeCheck()
                          .until(function () {
                            return repayData
                          })
                          .thenDo(function () {
                            that.drawRepayTable(
                              repairid,
                              assign_id,
                              repayData,
                              repayLogTable,
                              materLogTable,
                              alarm_log_id
                            )
                          })
                          .tryDuration(0)
                          .start()
                      },
                      fail: function (data) {
                        console.log(data)
                      },
                    }
                  )
                },
                fail: function (data) {
                  console.log(data)
                },
              }
            )
          })
          .tryDuration(0)
          .start()
      },
      drawRepayTable: function (
        repairid,
        assignid,
        repayData,
        repayLogTable,
        materLogTable,
        alarm_log_id
      ) {
        let that = this
        if (that.getDBObject.checkTable) {
          $('#material-body')[0].innerHTML = ''
          $('#material-body').append(that.getDBObject.materialTable)
          that.getDBObject['materialTable'] = $(
            '#stk-material-table'
          )[0].cloneNode(true)
          $('#stk-material-table tbody').on(
            'change',
            '[name=material_id]',
            function (evt) {
              evt.preventDefault()
              var material = that.getDBObject.getMaterial[$(this).val()]
              $('[name=material_name]').val(material.material_name)
              $('[name=price]').val(material.price)
              $('[name=amount]').val('')
              $('[name=discount]').val('')
              $('[name=total]').val('')
            }
          )

          $('#stk-material-table tbody').on(
            'change',
            '[name=amount]',
            function (evt) {
              evt.preventDefault()
              var amount = $(this).val()
              var price = $('[name=price]').val()
              var discount = $('[name=discount]').val() || 1
              var total_price = amount * price * discount
              $('[name=total]').val(total_price)
            }
          )

          $('#stk-material-table tbody').on(
            'change',
            '[name=discount]',
            function (evt) {
              evt.preventDefault()
              var amount = $('[name=amount]').val() || 0
              var price = $('[name=price]').val()
              var discount = $(this).val()
              var total_price = amount * price * discount
              $('[name=total]').val(total_price)
            }
          )
        } else {
          var materialTable = $('#stk-material-table')[0].cloneNode(true)
          that.getDBObject['materialTable'] = materialTable
          that.getDBObject['checkTable'] = true
        }
        that.crudTable(repairid)
        repayLogTable.drawTable(repayData)

        $('#repair-result').modal()
        if (!that.getDBObject.modalSubmit) {
          that.getDBObject.modalSubmit = true
          $('#repay_btn').on('click', function () {
            var resultDate = $('[name=order_date]').val()
            var repayNote = $('[name=recommend]').val()

            var result = $('[name=repairResult]:checked').val()
            that.replySubmit(
              repairid,
              assignid,
              resultDate,
              repayNote,
              result,
              alarm_log_id
            )
          })
        }
      },
      replySubmit: function (
        repair_id,
        assign_id,
        maintain_time,
        repay_note,
        result,
        alarm_log_id
      ) {
        var that = this
        let loadingBtnByAssign = this.loadingBtnByAssign
        loadingBtnByAssign.doing()
        var logId
        if (alarm_log_id == undefined) {
          logId = ''
        } else {
          logId = alarm_log_id
        }
        try {
          var dataConfig = {
            alarm_log_id: logId,
            repair_id: repair_id,
            assign_id: assign_id,
            maintain_time: maintain_time,
            repay_note: repay_note,
            result: result,
          }
          servkit.ajax(
            {
              url: 'api/aftersalesservice/repairrepay/repay',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(dataConfig),
            },
            {
              success: function (data) {
                servkit
                  .politeCheck()
                  .until(function () {
                    return that.submitSelValue['form']
                  })
                  .thenDo(function () {
                    var sel = that.submitSelValue['form']
                    loadingBtnByAssign.done()
                    $('#repair-result').modal('hide')
                    that.smallBox({
                      selectColor: 'green',
                      title: '回報成功',
                      icon: 'fa fa-check',
                      timeout: 2000,
                    })
                    that.drawTable(
                      sel.context,
                      sel.startDate,
                      sel.endDate,
                      sel.customer,
                      sel.machine,
                      sel.repair,
                      sel.status,
                      sel.urgency,
                      sel.repairListTable,
                      sel.repayLogTable,
                      sel.materLogTable
                    )
                  })
                  .tryDuration(0)
                  .start()
              },
              fail: function (data) {
                that.smallBox({
                  selectColor: 'red',
                  title: '回報失敗',
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                })
              },
            }
          )
        } catch (e) {
          console.warn(e)
        }
      },
      crudTable: function (repairid) {
        var that = this
        var createAndUpdateEnd = {
          1: function (td) {
            var materialID = $(td).find(':selected').val()
            return materialID
          },
          7: function (td) {
            var createDate = moment(new Date()).format('YYYY/MM/DD')
            return createDate
          },
        }

        servkit.crudtable({
          tableSelector: '#stk-material-table',
          create: {
            url:
              'api/aftersalesservice/repairrepay/creatematerial?repairid=' +
              repairid,
            start: function (tdEles) {
              // $(tdEles).eq(0).find('input').prop("disabled", "disabled");
              $(tdEles).eq(0).find('select')[0].innerHTML =
                that.getDBObject.getMaterialHtml
              $(tdEles).eq(0).find('select').prop('selectedIndex', -1)
              $(tdEles).eq(1).find('input').prop('disabled', 'disabled')
              $(tdEles).eq(2).find('input').prop('disabled', 'disabled')
              $(tdEles).eq(5).find('input').prop('disabled', 'disabled')
              $(tdEles).eq(6).find('input').prop('disabled', 'disabled')
              $(tdEles).eq(7).find('input').prop('disabled', 'disabled')
              $(tdEles).eq(8).find('input').prop('disabled', 'disabled')
              pageSetUp()
              $(tdEles).eq(0).find('div').eq(0).remove()
            },
            end: createAndUpdateEnd,
            finalDo: function () {
              $('.stk-refresh-btn').trigger('click')
            },
          },
          read: {
            url:
              'api/aftersalesservice/repairrepay/readmaterial?repairid=' +
              repairid,
            end: {
              7: function (td) {
                var date = moment(new Date(td)).format('YYYY/MM/DD')
                return date
              },
            },
          },
          update: {
            url:
              'api/aftersalesservice/repairrepay/updatematerial?repairid=' +
              repairid,
            start: {
              1: function (oldTd, newTd) {
                var oldMaterial = $(oldTd).eq(0).text()
                $('[name=material_id]')[0].innerHTML =
                  that.getDBObject.getMaterialHtml
                $(
                  '[name=material_id] option[value="' + oldMaterial + '"]'
                ).prop('selected', true)
                $('#s2id_autogen9').remove()
                pageSetUp()
              },
              2: function (oldTd, newTd) {
                var oldMaterialName = $(oldTd).eq(0).text()
                $('[name=material_name]').prop('disabled', 'disabled')
                $('[name=material_name]').val(oldMaterialName)
              },
              3: function (oldTd, newTd) {
                var oldprice = $(oldTd).eq(0).text()
                $('[name=price]').prop('disabled', 'disabled')
                $('[name=price]').val(oldprice)
              },
              7: function (oldTd, newTd) {
                var createTime = $(oldTd).eq(0).text()
                $('[name=create_time]').prop('disabled', 'disabled')
                $('[name=create_time]').val(createTime)
              },
              8: function (oldTd, newTd) {
                var rmID = $(oldTd).eq(0).text()
                $('[name=rm_id]').prop('disabled', 'disabled')
                $('[name=rm_id]').val(rmID)
              },
            },
            end: createAndUpdateEnd,
          },
          delete: {
            url: 'api/aftersalesservice/repairrepay/deletematerial',
          },
          validate: {},
        })
      },
      smallBox: function (params) {
        // selectColor, title, icon, timeout
        var colors = {
          green: '#739E73',
          red: '#C46A69',
          yellow: '#C79121',
        }
        $.smallBox({
          title: params.title,
          content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
          color: colors[params.selectColor],
          iconSmall: params.icon,
          timeout: params.timeout,
        })
      },
      alarmClear: function (context, machine, alarmid, assignid, repairid) {
        var that = this

        $('#repair-result').modal('toggle')
        if (!that.getDBObject.alarmClearFlag) {
          that.getDBObject.alarmClearFlag = true
          $('#repair-result').on('hidden.bs.modal', function () {
            servkit.ajax(
              {
                url: 'api/machinealarm/createByMachineIdAndAlarmId',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  machine_id: machine,
                  alarm_id: alarmid,
                }),
              },
              {
                success: function (data) {
                  servkit
                    .politeCheck()
                    .until(function () {
                      return that.submitSelValue['form']
                    })
                    .thenDo(function () {
                      var sel = that.submitSelValue['form']

                      context.gogoAnother({
                        appId: data['app_id'], // 'AlarmClear',
                        funId: data['alarm_clear_page'], // '01_alarm_clear_troubleshooting',
                        currentTab: true,
                        graceParam: {
                          logId: data['log_id'],
                          custom: {
                            startDate: sel.startDate,
                            endDate: sel.endDate,
                            customer: sel.customer,
                            formMachine: sel.machine,
                            repair: sel.repair,
                            modalRepair: repairid,
                            status: sel.status,
                            urgency: sel.urgency,
                            assignid: assignid,
                            modalMachine: machine,
                            alarmid: alarmid,
                          },
                        },
                      })
                    })
                    .tryDuration(0)
                    .start()
                },
                fail: function (data) {
                  window.alert(data)
                },
              }
            )
          })
        }
      },
    },
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
        '/js/servtech/servcloud.table.js',
      ],
    ],
  })
}
