import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
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
          $tableWidget: $('#repair-assign-widget'),
          $tableElement: $('#repair-assign-table'),
          centerColumn: [1, 5, 6, 7],
          excel: {
            fileName: 'RepairAssignExcel',
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

      context.drawTable('', '', '', '', '', ['0'], [], repairListTable)
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
      context.$clearBtn.on('click', function (evt) {
        evt.preventDefault()
        // context.$cusID.get(0).selectedIndex = -1;
        // context.$machineID.get(0).selectedIndex = -1;
        // context.$repairID.get(0).selectedIndex = -1;
        context.$cusID.prop('selectedIndex', -1)
        context.$machineID.prop('selectedIndex', -1)
        context.$repairID.prop('selectedIndex', -1)
        pageSetUp()
      })
      $('#repair-assign-table tbody').on(
        'click',
        'td button[name=assign-btn]',
        function (evt) {
          evt.preventDefault()
          var repairid = $(this).parent().parent().eq(0).find('td').eq(0).text()
          context.repairAssign(context, repairid)
        }
      )

      context.$assignBtn.on('click', function (evt) {
        var repairid = $('#modal_repair_id').text()
        var users = []
        $('[name=user_group]').each(function () {
          users.push($(this).val())
        })
        var orderdate = $('[name=order_date]').val()
        var recommend = $('[name=recommend]').val()
        context.assingSubmit(repairid, users[0], orderdate, recommend)
      })

      // $('#repair-assign-table tbody').on('click', 'td a[name=tableRepairID]', function(evt) {
      //     evt.preventDefault();

      // });

      // $('#repair-assign-table tbody').on('mousemove', 'td', function(evt) {
      //     evt.preventDefault();
      //     if (this.cellIndex == 0) {
      //         $(this).children().attr("style", "text-decoration:underline");
      //     }
      // });

      // $('#repair-assign-table tbody').on('mouseout', 'td', function(evt) {
      //     evt.preventDefault();
      //     if (this.cellIndex == 0) {
      //         $(this).children().removeAttr("style");
      //     }
      // });
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $clearBtn: $('#clear-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      loadingBtnByAssign: servkit.loadingButton(
        document.querySelector('#assign_btn')
      ),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $cusID: $('#cus_id'),
      $machineID: $('#machine_id'),
      $repairID: $('#repair_id'),
      $status: $('[name=repairStatus]'),
      $urgency: $('[name=repairEmergency]'),
      $assignBtn: $('#assign_btn'),
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
      submitSelValue: {},
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
        this.submitSelValue['form'] = {
          startDate: startDate,
          endDate: endDate,
          customer: customer,
          machine: machine,
          repair: repair,
          status: status,
          urgency: urgency,
          repairListTable: repairListTable,
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
                  url: 'api/aftersalesservice/repairassign/query',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify(dbObj),
                },
                {
                  success: function (data) {
                    var tableData = []
                    _.each(data, function (ele) {
                      var date = new Date(ele.create_time)
                      tableData.push([
                        // '<a href="javascript:void(0)" name="tableRepairID">' + ele.repair_id + '<a>',
                        ele.repair_id,
                        that.getDBObject.emergencyObj[ele.emergency],
                        moment(date).format('YYYY/MM/DD HH:mm:ss'),
                        that.getDBObject.customerObj[ele.cus_id],
                        that.getDBObject.machineObj[ele.machine_id],
                        that.getDBObject.getBreakdown[ele.breakdown_id]
                          .breakdown_name,
                        that.getDBObject.statusObj[ele.status_id],
                        '<button class="btn btn-default" name="assign-btn">派工</button>',
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
                  fail: function (data) {
                    console.log(data)
                  },
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
      initSelectAll: function () {
        this.initCustomerSelect()
        this.initMachineSelect()
        this.initRepairSelect()
        this.initBreakdown()
        this.initUserData()
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
      repairAssign: function (util, repairid) {
        var that = this
        var usergroupHtml
        var usergroupData
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

              servkit.ajax(
                {
                  url: 'api/aftersalesservice/repairassign/getusergroup',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify(
                    util.getDBObject.getBreakdown[data.breakdown_id].entity_id
                  ),
                },
                {
                  success: function (userData) {
                    var groupData = userData
                    var result = {}
                    _.map(groupData, function (data) {
                      result[data.user_id] = data.user_name
                    })
                    servkit
                      .politeCheck()
                      .until(function () {
                        return result
                      })
                      .thenDo(function () {
                        usergroupData = result
                        var usergroupSelectHtml = ''
                        _.each(_.keys(usergroupData).sort(), function (key) {
                          usergroupSelectHtml +=
                            '<option value="' +
                            key +
                            '" >' +
                            usergroupData[key] +
                            '</option>'
                        })
                        usergroupHtml = usergroupSelectHtml
                      })
                      .tryDuration(0)
                      .start()

                    servkit
                      .politeCheck()
                      .until(function () {
                        return usergroupHtml
                      })
                      .thenDo(function () {
                        var date = new Date(data.create_time)
                        var assignTime = data.assign_time
                        if (assignTime) {
                          assignTime = moment(assignTime).format('YYYY/MM/DD')
                        } else {
                          assignTime = ''
                        }

                        var tableHtml = ''
                        var assignHtml = ''
                        tableHtml += '<tr>'
                        tableHtml += '<td> 客訴單代碼 </td>'
                        tableHtml +=
                          '<td id="modal_repair_id">' + data.repair_id + '</td>'
                        tableHtml += '<td> 客戶</td>'
                        tableHtml +=
                          '<td>' +
                          util.getDBObject.customerObj[data.cus_id] +
                          ' </td>'
                        tableHtml += '<td> 狀態 </td>'
                        tableHtml +=
                          '<td>' +
                          util.getDBObject.statusObj[data.status_id] +
                          '</td>'
                        tableHtml += '</tr>'
                        tableHtml += '<tr>'
                        tableHtml += '<td> 機號 </td>'
                        tableHtml +=
                          '<td>' +
                          util.getDBObject.machineObj[data.machine_id] +
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
                        tableHtml += '<td>' + data.alarm_id + '</td>'
                        tableHtml += '<td> 反應人傳真</td>'
                        tableHtml += '<td>' + data.fax + ' </td>'
                        tableHtml += '<td> 結案時間 </td>'
                        tableHtml += '<td>' + '' + '</td>'
                        tableHtml += '</tr>'
                        tableHtml += '<tr>'
                        tableHtml += '<td> 緊急度  </td>'
                        tableHtml +=
                          '<td>' +
                          util.getDBObject.emergencyObj[data.emergency] +
                          '</td>'
                        tableHtml += '<td> 反應人手機</td>'
                        tableHtml += '<td>' + data.cell_phone + ' </td>'
                        tableHtml += '<td> 建立者 </td>'
                        tableHtml +=
                          '<td>' +
                          that.getDBObject.getUser[data.create_by] +
                          '</td>'
                        tableHtml += '</tr>'
                        tableHtml += '<tr>'
                        tableHtml += '<td> 反應人Email</td>'
                        tableHtml += '<td>' + data.email + ' </td>'
                        tableHtml += '<td> 維修地址 </td>'
                        tableHtml += '<td colspan="3">' + data.address + '</td>'
                        tableHtml += '</tr>'
                        tableHtml += '<tr>'
                        tableHtml += '<td > 故障內容記錄 </td>'
                        tableHtml +=
                          '<td colspan="5">' + data.break_note + '</td>'
                        tableHtml += '</tr>'

                        assignHtml +=
                          '<div class="jarviswidget jarviswidget-color-blueDark" id="repair-assign-widget" data-widget-editbutton="false" data-widget-deletebutton="false" data-widget-colorbutton="false" data-widget-togglebutton="false" data-widget-fullscreenbutton="false" >'

                        assignHtml += '<header>'
                        assignHtml +=
                          '<span class="widget-icon"> <i class="fa fa-cloud-upload"></i> </span>'
                        assignHtml += `<h2>${i18n(
                          'Manage_Repair_Assign'
                        )}</h2></header>`
                        assignHtml += '<div class="row">'
                        assignHtml +=
                          '<form class="smart-form" novalidate="novalidate">'
                        assignHtml += '<fieldset>'
                        assignHtml += '<div class="row">'
                        assignHtml += '<section class="col-5">'
                        assignHtml += '<label class="label">*維修人員</label>'
                        assignHtml += '<label class="input">'
                        assignHtml +=
                          '<select multiple style="width:100%" class="select2" name="user_group"></select>'
                        assignHtml += '</label>'
                        assignHtml += '</div>'
                        assignHtml += '<div class="row">'
                        assignHtml += '<section class="col-3">'
                        assignHtml +=
                          '<label class="label">*預約前往日期</label>'
                        assignHtml +=
                          '<label class="input"> <i class="icon-append fa fa-calendar"></i>'
                        assignHtml +=
                          '<input type="text" name="order_date" id="order_date" />'
                        assignHtml += '</label>'
                        assignHtml += '</section>'
                        assignHtml += '</div>'
                        assignHtml += '<div class="row">'
                        assignHtml += '<section class="7">'
                        assignHtml += '<label class="label">*派工建議</label>'
                        assignHtml += '<label class="input">'
                        assignHtml +=
                          '<textarea class="form-control " rows="5" name="recommend"></textarea>'
                        assignHtml += '</label>'
                        assignHtml += '</section>'
                        assignHtml += '</div>'
                        assignHtml += '</fieldset>'
                        assignHtml += '</form>'
                        assignHtml += '</div>'

                        $('#repair-result-table')[0].innerHTML = tableHtml
                        $('#repair-result-assign')[0].innerHTML = assignHtml
                        $('#order_date')
                          .datepicker(datepickerConfig)
                          .val(moment().format('YYYY/MM/DD'))
                        $('[name=user_group]')[0].innerHTML = usergroupHtml
                        pageSetUp()
                        $('#repair-result').modal()
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
      },
      assingSubmit: function (repairid, users, orderdate, recommend) {
        var that = this
        let loadingBtnByAssign = this.loadingBtnByAssign
        loadingBtnByAssign.doing()
        try {
          var dataConfig = {
            repairId: repairid,
            users: users,
            orderDate: orderdate,
            recommend: recommend,
          }
          servkit.ajax(
            {
              url: 'api/aftersalesservice/repairassign/assingrepaircreate',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(dataConfig),
            },
            {
              success: function (data) {
                servkit
                  .politeCheck()
                  .until(function () {
                    return that.submitSelValue.form
                  })
                  .thenDo(function () {
                    var sel = that.submitSelValue.form
                    loadingBtnByAssign.done()
                    $('#repair-result').modal('hide')
                    that.smallBox({
                      selectColor: 'green',
                      title: '派工成功',
                      icon: 'fa fa-check',
                      timeout: 2000,
                    })

                    that.drawTable(
                      sel.startDate,
                      sel.endDate,
                      sel.customer,
                      sel.machine,
                      sel.repair,
                      sel.status,
                      sel.urgency,
                      sel.repairListTable
                    )
                  })
                  .tryDuration(0)
                  .start()
              },
              fail: function (data) {
                console.log(data)
                $.smallBox({
                  selectColor: 'red',
                  title: '派工失敗',
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
      smallBox: function (params) {
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
