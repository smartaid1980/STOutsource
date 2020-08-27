export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()

      context.initSelectAll()

      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        repairListTable = createReportTable({
          $tableWidget: $('#repair-list-widget'),
          $tableElement: $('#repair-list-table'),
          centerColumn: [2, 5, 6, 7],
          onRow: function (row, data) {
            $(row).find('td').eq(9).attr('style', 'display:none')
            $(row).find('td').eq(10).attr('style', 'display:none')
          },
          excel: {
            fileName: 'RepairListExcel',
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
            ],
          },
        })

      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))

      context.$breakdownID.on('change', function (evt) {
        evt.preventDefault()
        var key = context.$breakdownID.val()
        var value = context.getDBObject.getEntity[key]
        context.$entity.val(value)
      })
      context.$cusID.on('change', function (evt) {
        evt.preventDefault()
        var key = context.$cusID.val()
        var value = context.getDBObject.getCustomer[key]
        context.$cusReply.val(value.contact_name)
        context.$phone.val(value.phone)
        context.$extPhone.val(value.ext_phone)
        context.$cellPhone.val(value.cell_phone)
        context.$address.val(value.address)
        context.$fax.val(value.fax)
        context.$email.val(value.email)
      })

      context.$clearBtn.on('click', function (evt) {
        evt.preventDefault()
        context.$selCusID.prop('selectedIndex', -1)
        context.$selMachineID.prop('selectedIndex', -1)
        context.$selRepairID.prop('selectedIndex', -1)
        pageSetUp()
      })

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var startData = context.$startDate.val()
        var endDate = context.$endDate.val()
        var customer = context.$selCusID.val() || ''
        var machineID = context.$selMachineID.val() || ''
        var repairID = context.$selRepairID.val() || ''
        var status = []
        var urgency = []
        context.$selStatus.each(function () {
          if (this.checked) {
            status.push($(this).val())
          }
        })
        context.$selUrgency.each(function () {
          if (this.checked) {
            urgency.push($(this).val())
          }
        })
        context.drawTable(
          startData,
          endDate,
          customer,
          machineID,
          repairID,
          status,
          urgency,
          repairListTable
        )
      })

      $('#cancel_button').on('click', function (evt) {
        evt.preventDefault()
        $('#movieForm')[0].reset()
        $('select[name=repair_customer]').get(0).selectedIndex = -1
        $('select[name=kind_id]').get(0).selectedIndex = -1
        $('select[name=breakdown_id]').get(0).selectedIndex = -1
        $('select[name=machine_id]').get(0).selectedIndex = -1
        pageSetUp()
      })

      $('[name=addRepair-btn]').on('click', function (evt) {
        evt.preventDefault()
        $('#cancel_button').click()
        $('.modal-title')[0].innerHTML = '新增客訴單'
        $('#cancel_button').show()
        $('#repair_text').hide()
        $('#repair-add').modal('toggle')
      })

      $('#repair-list-table tbody').on(
        'click',
        '[name="repair-edit"]',
        function (evt) {
          evt.preventDefault()
          $('#cancel_button').click()
          var repair_id = $(this).parent().parent().find('td').eq(0).text()
          var kind_name = $(this).parent().parent().find('td').eq(1).text()
          var emergency = $(this).parent().parent().find('td').eq(2).text()
          var customer = $(this).parent().parent().find('td').eq(4).text()
          var machine = $(this).parent().parent().find('td').eq(5).text()
          var entity = $(this).parent().parent().find('td').eq(6).text()
          var alarm_id = $(this).parent().parent().find('td').eq(9).text()
          var break_note = $(this).parent().parent().find('td').eq(10).text()
          $('.modal-title')[0].innerHTML = '編輯客訴單'
          $('#cancel_button').hide()
          $('[name=repair_id]').val(repair_id)
          $('select[name=repair_customer] option:contains(' + customer + ')')
            .prop('selected', true)
            .change()
          $('select[name=machine_id] option:contains(' + machine + ')').prop(
            'selected',
            true
          )
          $('select[name=kind_id] option:contains(' + kind_name + ')').prop(
            'selected',
            true
          )
          $(
            'select[name=breakdown_id] option:contains(' +
              context.getDBObject.breakdownNameObj[entity].breakdown_id +
              ')'
          )
            .prop('selected', true)
            .change()

          $('[name=emergency]').each(function () {
            if ($(this).parent().find('span').text() == emergency) {
              var value = $(this).val()
              $('[name=emergency][value=' + value + ']').prop(
                'checked',
                'checked'
              )
            }
          })

          $('[name=trailer]').val(alarm_id)
          $('[name=break_note]').val(break_note)

          pageSetUp()
          $('#repair_text').hide()
          $('#repair-add').modal('toggle')
        }
      )

      $('#movieForm').validate({
        rules: {
          machine_id: {
            required: true,
          },
          repair_customer: {
            required: true,
          },
          kind_id: {
            required: true,
          },
          breakdown_id: {
            required: true,
          },
          phone: {
            number: true,
          },
          extphone: {
            number: true,
          },
          cellphone: {
            number: true,
          },
          fax: {
            number: true,
          },
          email: {
            email: true,
          },
        },
        messages: {
          machine_id: {
            required: '此欄為必選',
          },
          repair_customer: {
            required: '此欄為必選',
          },
          kind_id: {
            required: '此欄為必選',
          },
          breakdown_id: {
            required: '此欄為必選',
          },
          phone: {
            number: '電話應該為數字',
          },
          extphone: {
            number: '電話應該為數字',
          },
          cellphone: {
            number: '電話應該為數字',
          },
          fax: {
            number: '傳真應該為數字',
          },
          email: {
            email: '請輸入正確E-Mail格式',
          },
        },
        errorPlacement: function (error, element) {
          error.css('color', 'red')
          error.insertAfter(element)
        },
        submitHandler: function (form) {
          var repair_id = $('[name=repair_id]').val()
          var cus_id = $('select[name=repair_customer]').val()
          var kind_id = $('select[name=kind_id]').val()
          var machine_id = $('select[name=machine_id]').val()
          var breakdown_id = $(
            'select[name=breakdown_id] option:selected'
          ).text()
          var cus_reply = $('[name=cus_reply]').val()
          var phone = $('[name=phone]').val()
          var ext_phone = $('[name=extphone]').val()
          var cell_phone = $('[name=cellphone]').val()
          var address = $('[name=address]').val()
          var fax = $('[name=fax]').val()
          var email = $('[name=email]').val()
          var emergency = ''
          $('[name=emergency]').each(function () {
            if (this.checked) {
              emergency = $(this).val()
            }
          })
          var break_note = $('[name=break_note]').val()
          var alarm_id = $('[name=trailer]').val()
          if (repair_id == '' || repair_id === '') {
            var dbObj = {
              cus_id: cus_id,
              kind_id: kind_id,
              machine_id: machine_id,
              breakdown_id: breakdown_id,
              cus_reply: cus_reply,
              phone: phone,
              ext_phone: ext_phone,
              cell_phone: cell_phone,
              address: address,
              fax: fax,
              email: email,
              emergency: emergency,
              break_note: break_note,
              alarm_id: alarm_id,
            }
            servkit.ajax(
              {
                url: 'api/aftersalesservice/repair/create',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(dbObj),
              },
              {
                success: function (data) {
                  smallBox({
                    selectColor: 'green',
                    title: '客訴單新增成功',
                    icon: 'fa fa-check',
                    timeout: 2000,
                  })
                  $('#movieForm')[0].reset()
                  $('select[name=repair_customer]').get(0).selectedIndex = -1
                  $('select[name=kind_id]').get(0).selectedIndex = -1
                  $('select[name=breakdown_id]').get(0).selectedIndex = -1
                  $('select[name=machine_id]').get(0).selectedIndex = -1
                  context.drawTable(
                    moment().format('YYYY/MM/DD'),
                    moment().format('YYYY/MM/DD'),
                    '',
                    '',
                    '',
                    [],
                    [],
                    repairListTable
                  )
                  pageSetUp()
                  $('#repair-add').modal('toggle')
                },
                fail: function (data) {
                  smallBox({
                    selectColor: 'red',
                    title: '客訴單資料新增失敗',
                    icon: 'fa fa-sign-out',
                    timeout: 2000,
                  })
                },
              }
            )
          } else {
            let dbObj = {
              repair_id: repair_id,
              cus_id: cus_id,
              kind_id: kind_id,
              machine_id: machine_id,
              breakdown_id: breakdown_id,
              cus_reply: cus_reply,
              phone: phone,
              ext_phone: ext_phone,
              cell_phone: cell_phone,
              address: address,
              fax: fax,
              email: email,
              emergency: emergency,
              break_note: break_note,
              alarm_id: alarm_id,
            }
            servkit.ajax(
              {
                url: 'api/aftersalesservice/repair/update',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(dbObj),
              },
              {
                success: function (data) {
                  smallBox({
                    selectColor: 'green',
                    title: '客訴單更新成功',
                    icon: 'fa fa-check',
                    timeout: 2000,
                  })
                  $('#movieForm')[0].reset()
                  $('select[name=repair_customer]').get(0).selectedIndex = -1
                  $('select[name=kind_id]').get(0).selectedIndex = -1
                  $('select[name=breakdown_id]').get(0).selectedIndex = -1
                  $('select[name=machine_id]').get(0).selectedIndex = -1
                  context.drawTable(
                    moment().format('YYYY/MM/DD'),
                    moment().format('YYYY/MM/DD'),
                    '',
                    '',
                    '',
                    [],
                    [],
                    repairListTable
                  )
                  pageSetUp()
                  $('#repair-add').modal('toggle')
                },
                fail: function (data) {
                  smallBox({
                    selectColor: 'red',
                    title: '客訴單更新失敗',
                    icon: 'fa fa-sign-out',
                    timeout: 2000,
                  })
                },
              }
            )
          }

          return false
        },
      })

      function smallBox(params) {
        //selectColor, title, icon, timeout
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
      }

      context.drawTable(
        $('#start-date').val(),
        $('#end-date').val(),
        '',
        '',
        '',
        [],
        [],
        repairListTable
      )
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $selCusID: $('#cus_id'),
      $selMachineID: $('#machine_id'),
      $selRepairID: $('#repair_id'),
      $selStatus: $('[name=repairStatus]'),
      $selUrgency: $('[name=repairEmergency]'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      $submitBtn: $('#submit-btn'),
      $clearBtn: $('#clear-btn'),
      $cusID: $('select[name=repair_customer]'),
      $kindID: $('select[name=kind_id]'),
      $machineID: $('select[name=machine_id]'),
      $breakdownID: $('select[name=breakdown_id]'),
      $entity: $('[name=entity]'),
      $cusReply: $('[name=cus_reply]'),
      $phone: $('[name=phone]'),
      $extPhone: $('[name=extphone]'),
      $cellPhone: $('[name=cellphone]'),
      $address: $('[name=address]'),
      $fax: $('[name=fax]'),
      $email: $('[name=email]'),
      $emergency: $('[name=emergency]'),
      $breakNote: $('[name=break_note]'),
      $alarmId: $('[name=trailer]'),
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
      },
      initSelectAll: function () {
        this.initCustomerSelect()
        this.initEntityBreakdownSelect()
        this.initMachineSelect()
        this.initRepairKindSelect()
        this.initRepairSelect()
        this.initEntity()
        this.initUserData()
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
              that.$selMachineID[0].innerHTML = selectResultHtml
              that.$machineID.prop('selectedIndex', -1)
              that.$selMachineID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initCustomerSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getCustomer',
          tableName: 'a_aftersalesservice_customer',
          columns: [
            'cus_id',
            'cus_name',
            'contact_name',
            'phone',
            'ext_phone',
            'cell_phone',
            'fax',
            'email',
            'address',
          ],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          var dataMap2 = {}
          _.map(that.getDBObject.getCustomer, function (data) {
            dataMap[data.cus_id] = {
              cus_id: data.cus_name,
              cus_name: data.cus_name,
              contact_name: data.contact_name,
              phone: data.phone,
              ext_phone: data.ext_phone,
              cell_phone: data.cell_phone,
              fax: data.fax,
              email: data.email,
              address: data.address,
            }
            dataMap2[data.cus_id] = data.cus_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap && dataMap2
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject['customerObj'] = dataMap2
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' +
                  key +
                  '" >' +
                  result[key].cus_name +
                  '</option>'
              })
              selectResultHtml = selectHtml
              that.getDBObject.getCustomer = result
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
              that.$selCusID[0].innerHTML = selectResultHtml
              that.$cusID.prop('selectedIndex', -1)
              that.$selCusID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initRepairKindSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getRepairKind',
          tableName: 'a_aftersalesservice_repair_kind',
          columns: ['kind_id', 'kind_name'],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getRepairKind, function (data) {
            dataMap[data.kind_id] = {
              kind_id: data.kind_id,
              kind_name: data.kind_name,
            }
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject.kindObj = dataMap
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' +
                  key +
                  '" >' +
                  result[key].kind_name +
                  '</option>'
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
              that.$kindID[0].innerHTML = selectResultHtml
              that.$kindID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initEntityBreakdownSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getBreakdown',
          tableName: 'a_aftersalesservice_entity_breakdown',
          columns: ['breakdown_id', 'entity_id', 'breakdown_name'],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          var dataMap2 = {}
          _.map(that.getDBObject.getBreakdown, function (data) {
            dataMap[data.breakdown_id] = {
              breakdown_id: data.breakdown_id,
              entity_id: data.entity_id,
              breakdown_name: data.breakdown_name,
            }
            dataMap2[data.breakdown_name] = {
              breakdown_id: data.breakdown_id,
              entity_id: data.entity_id,
              breakdown_name: data.breakdown_name,
            }
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap && dataMap2
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject.getBreakdown = result
              that.getDBObject.breakdownNameObj = dataMap2
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' +
                  result[key].entity_id +
                  '" >' +
                  key +
                  '</option>'
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
              that.$breakdownID[0].innerHTML = selectResultHtml
              that.$breakdownID.prop('selectedIndex', -1)
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
      initEntity: function () {
        var that = this
        var dataConfig = {
          objKey: 'getEntity',
          tableName: 'a_aftersalesservice_entity',
          columns: ['entity_id', 'entity_name'],
        }
        var callbackfunction = function () {
          var result

          var dataMap = {}
          _.map(that.getDBObject.getEntity, function (data) {
            dataMap[data.entity_id] = data.entity_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              that.getDBObject.getEntity = result
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
              that.$selRepairID[0].innerHTML = selectResultHtml
              that.$selRepairID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      drawTable: function (
        startDate,
        endDate,
        customer,
        machine,
        repair,
        status,
        urgency,
        repairListTable
      ) {
        var that = this
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
              that.getDBObject.statusObj &&
              that.getDBObject.kindObj
            )
          })
          .thenDo(function () {
            try {
              servkit.ajax(
                {
                  url: 'api/aftersalesservice/repair/query',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify(dbObj),
                },
                {
                  success: function (data) {
                    var tableData = []
                    _.each(data, function (ele) {
                      var date = new Date(ele.create_time)

                      var orderDate

                      var orderTimeStamp = Date.parse(ele.order_date)
                      if (isNaN(orderTimeStamp) == false) {
                        orderDate = '---'
                      } else {
                        orderDate = moment(new Date(ele.order_date)).format(
                          'YYYY/MM/DD'
                        )
                      }
                      tableData.push([
                        // '<a href="javascript:void(0)" name="tableRepairID">' + ele.repair_id + '<a>',
                        ele.repair_id,
                        that.getDBObject.kindObj[ele.kind_id].kind_name,
                        that.getDBObject.emergencyObj[ele.emergency],
                        moment(date).format('YYYY/MM/DD HH:mm:ss'),
                        that.getDBObject.customerObj[ele.cus_id],
                        that.getDBObject.machineObj[ele.machine_id],
                        that.getDBObject.getBreakdown[ele.breakdown_id]
                          .breakdown_name,
                        that.getDBObject.statusObj[ele.status_id],
                        that.getDBObject.getUser[ele.create_by],
                        ele.alarm_id,
                        ele.break_note,
                        "<td style='width:2%'><button class='btn btn-xs btn-primary' name='repair-edit' title='Edit'><i class='fa fa-pencil'></i></button></td>",
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
                  },
                  fail: function () {},
                }
              )
            } catch (e) {
              console.warn(e)
            } finally {
              loadingBtn.done()
            }
          })
          .tryDuration(0)
          .start()
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
      ],
    ],
  })
}
