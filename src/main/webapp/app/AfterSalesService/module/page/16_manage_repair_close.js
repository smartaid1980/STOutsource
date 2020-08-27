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
        repayLogTable = createReportTable({
          $tableWidget: $('#repair-log-widget'),
          $tableElement: $('#repair-log-table'),
        }),
        repairListTable = createReportTable({
          $tableWidget: $('#repair-close-widget'),
          $tableElement: $('#repair-close-table'),
          centerColumn: [1, 5, 6, 7],
          onRow: function (row, data) {
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
            ],
          },
        })

      context.drawTable('', '', '', '', '', ['3', '6'], [], repairListTable)

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
      $('#repair-close-table tbody').on(
        'click',
        'td button[name=repay-btn]',
        function (evt) {
          evt.preventDefault()
          var repairid = $(this).parent().parent().eq(0).find('td').eq(0).text()
          var assign_id = $(this)
            .parent()
            .parent()
            .eq(0)
            .find('td')
            .eq(10)
            .text()
          $('#closeRepairID')[0].innerHTML = repairid
          context.drawListTable(repairid, assign_id, repayLogTable)
        }
      )

      context.$repayCloseBtn.on('click', function (evt) {
        evt.preventDefault()
        var close_remark = $('[name=close_remark]').val()
        var status_id = $('[name=closeRepair]').val()
        var repair_id = $('#closeRepairID').text()
        context.closeSubmit(repair_id, status_id, close_remark)
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
        document.querySelector('#close_btn')
      ),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $cusID: $('#cus_id'),
      $machineID: $('#machine_id'),
      $repairID: $('#repair_id'),
      $status: $('[name=repairStatus]'),
      $urgency: $('[name=repairEmergency]'),
      $repayCloseBtn: $('#close_btn'),
      $repairModal: $('#repair-result'),
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
                        that.getDBObject.getUser[ele.create_by],
                        '<button class="btn btn-default" name="repay-btn">結案</button>',
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
      drawListTable: function (repairid, assign_id, logTable) {
        var that = this
        var usergroup, repayData

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
                        users += '' + that.getDBObject.getUser[ele.emp_id] + ','
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
                      moment(new Date(ele.order_date)).format('YYYY/MM/DD'),
                      ele.recommend,
                      moment(new Date(ele.maintain_time)).format('YYYY/MM/DD'),
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
                  logTable.drawTable(repayData)
                  logTable.showWidget()
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
      closeSubmit: function (repair_id, status_id, close_remark) {
        var that = this
        let loadingBtnByAssign = this.loadingBtnByAssign
        loadingBtnByAssign.doing()
        try {
          var dataConfig = {
            repair_id: repair_id,
            status_id: status_id,
            close_remark: close_remark,
          }
          servkit.ajax(
            {
              url: 'api/aftersalesservice/repair/close',
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
                      title: '結案成功',
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
                that.smallBox({
                  selectColor: 'red',
                  title: '結案失敗',
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
        '/js/servtech/servcloud.table.js',
      ],
    ],
  })
}
