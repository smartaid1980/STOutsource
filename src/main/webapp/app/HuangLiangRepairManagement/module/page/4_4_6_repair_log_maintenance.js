export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#report-table'),
        onRow: function (row, data) {
          //警報時間
          $(row).find('td').eq(0).addClass('hide')

          //機台
          $(row)
            .find('td')
            .eq(2)
            .html(
              servkit.getMachineName(data[2]) +
                ' (' +
                context.commons.priorityText(context.preCon.priority[data[2]]) +
                ')'
            )

          //data[15] = ["101":1, "201":2]
          var text = _.map(data[15], function (count, repairCode) {
            if (context.repairCodeMap[repairCode]) {
              return context.repairCodeMap[repairCode] + '*' + count
            } else {
              return repairCode + '*' + count
            }
          }).join(' |</br>')
          text = '<span class="repair_item">' + text + '</span> '

          var key = [data[0], data[2]].join('@@')
          //可修改多次 或是 只可改一次且尚未改過
          if (
            (!context.isEditOnce && !context.isQueryOnly) ||
            (context.isEditOnce && context.isUpdatedMap[key] != 1)
          ) {
            text +=
              '<br><a class="btn btn-primary repair-btn" href="#" aria-expanded="true">勾選</a>'
          }

          $(row).find('td').eq(15).html(text)
        },
        onDraw(tableData, pageData) {
          $('#detail-info').html(`總維修數量：${tableData.length}
            總達成數量： ${context.achievedNum}`)
        },
        excel: {
          fileName: 'Repair_Record_Maintainence',
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
          ],
          customHeaderFunc: function (tableHeader) {
            return _.rest(tableHeader)
          },
          customDataFunc: function (tableData) {
            var cloneTableData = $.extend(true, {}, tableData)
            return _.map(cloneTableData, function (elem) {
              elem[2] = servkit.getMachineName(elem[2])
              elem[15] = _.map(elem[15], function (count, repairCode) {
                if (context.repairCodeMap[repairCode]) {
                  return context.repairCodeMap[repairCode] + '*' + count
                } else {
                  return repairCode + '*' + count
                }
              }).join(', ')
              elem.shift()
              return elem
            })
          },
        },
      })
      context.repairCodeMap = context.preCon.repairCode.repairCodeMap
      context.repairCodeObjArray = context.preCon.repairCode.repairCodeObjArray

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)
      servkit.initSelectWithList(
        context.repairCodeMap,
        context.$repairCodeSelect
      )
      context.$userFilterSelect
        .on('change', function (e) {
          var group = $(this).val()
          servkit.initSelectWithList(
            context.preCon.customGroupUserList[group],
            context.$employeeSelect
          )
        })
        .trigger('change')

      context.initRepairCodeTable()
      context.setUserpermittedAuthes() // 設定權限

      servkit.validateForm($('#main-form'), context.$submitBtn)
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.getData()
      })

      $('#report-table').on('click', '.repair-btn', function (evt) {
        evt.preventDefault()
        var datatableRow = context.reportTable.table.row($(this).parents('tr'))
        var rowData = datatableRow.data()

        //clear
        context.$repairModal
          .find(':checkbox')
          .prop('checked', false)
          .removeAttr('checked')
          .end()
          .find('span')
          .removeClass('txt-color-red')
          .end()
          .find(':input')
          .val('')

        //preload data
        _.each(rowData[15], function (count, repairCode) {
          context.$repairCodeTable
            .find(':checkbox[data-repair-code=' + repairCode + ']')
            .prop('checked', true)
            .closest('td')
            .next()
            .find('span')
            .addClass('txt-color-red')
            .closest('td')
            .next()
            .find(':input')
            .val(count)
        })

        context.$repairModal.data('_target', datatableRow).modal('show')
        return false
      })

      $('#save').on('click', function (e) {
        var rs = []
        var examination_defective = 0
        var rowData = context.$repairModal.data('_target').data()
        var isStay = false
        var title =
          '請確認選取清單及數量\n-------------------------------------------------\n'
        var alert_message = ''
        var confirm_list = ''
        var repair_codes = {}

        context.$repairCodeTable.find(':checkbox:checked').each(function () {
          var $cb = $(this)
          var $cbTD = $cb.parent()
          var $spanTD = $cbTD.next()
          var $valTD = $spanTD.next()

          var repairText = $spanTD.text()
          var count = $valTD.find(':input').val()

          if (count == '' || count < 1) {
            alert_message += '【' + repairText + '】\n'
            isStay = true
          }

          rs.push(repairText + '*' + count)
          repair_codes[$cb.attr('data-repair-code')] = count //{code:count, ...}
          confirm_list += repairText + ': ' + count + '個\n'
        })

        if (!isStay) {
          var confirm_result = true
          if (confirm_list.length > 0) {
            confirm_result = confirm(
              title +
                confirm_list +
                '-------------------------------------------------'
            )
          }

          if (confirm_result) {
            //更新資料
            rowData[15] = repair_codes
            //寫入DB
            context.createRepairItems(rowData, function () {
              context.getData()
              //            context.reportTable.drawTable(context.reportTable.table.data());
              context.$repairModal.modal('hide')
            })
          }
        } else {
          alert_message += '請輸入數量後再送出!'
          alert(alert_message)
        }
      })
    },

    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $userRadio: $('[name=user]'),
      $userFilterSelect: $('#filter'),
      $userIdInput: $('#user_id'),
      $employeeSelect: $('#employee'),
      $repairCodeSelect: $('#repair_code'),
      $machineSelect: $('#machine'),
      $repairCodeTable: $('#repair-code-table'),
      $repairModal: $('#repair-modal'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      repairCodeMap: undefined,
      repairCodeObjArray: undefined,
      isQueryOnly: false,
      isEditOnce: false,
      isUpdatedMap: {}, //用來決定要不要長"勾選"按鈕的map
      achievedNum: 0,

      setUserpermittedAuthes: function () {
        var context = this
        //廠務校車、研發校車、維修、組長，只能看自己的記錄，並只能修改一次
        var editOnceGroup = [
            context.commons.factory_service_regulate,
            context.commons.rd_regulate,
            context.commons.repair,
            context.commons.leader,
          ],
          //業務副理、研發副理僅可查詢
          queryGroup = [
            context.commons.sales_manager,
            context.commons.rd_manager,
          ],
          //admin, 高階主管、廠務部副理、製一/製二課長、製一/製二副課長可多次修改
          noLimitedGroup = [
            context.commons.sys_super_admin_group,
            context.commons.sys_manager_group,
            context.commons.top_manager,
            context.commons.factory_service_deputy_manager,
            context.commons.process_manager_1,
            context.commons.process_manager_2,
            context.commons.process_deputy_manager_1,
            context.commons.process_deputy_manager_2,
          ]
        var userGroupList = JSON.parse(sessionStorage.loginInfo).user_group
        var userId = JSON.parse(sessionStorage.loginInfo).user_id

        //如果是只能登打一次的群組，因為能看到該筆資料的也只有自己，只要自己有改過就不能再修改了
        //如果同時屬於可修改多次跟修改一次的群組就不限制修改次數
        //包含可多次修改之群組
        if (_.intersection(userGroupList, noLimitedGroup).length) {
          //
        } else if (_.intersection(userGroupList, queryGroup).length) {
          //若包含有可多次修改的群組就不會進到這裡
          context.isQueryOnly = true
        } else if (_.intersection(userGroupList, editOnceGroup).length) {
          context.isEditOnce = true
        } else {
          console.warn(userGroupList)
          console.warn('不屬於事先定義好的任何一群組')
        }

        //僅可修改一次自己的資料, 把人員選取隱藏並將值設為登入者
        if (context.isEditOnce) {
          context.$userRadio.closest('.col').addClass('hide')
          //懶得找出是哪個群組  直接在當下的select 加入登入者的選項 反正也看不到
          context.$employeeSelect
            .append("<option value='" + userId + "'>" + userId + '<option>')
            .val(userId)
        }
      },

      alarmCodeView: function (alarmCode) {
        return alarmCode.replace(/,/g, '</br>')
      },

      alarmNoteView: function (machine_id, alarmCode) {
        var codeArr = alarmCode.split(','),
          context = this
        return _.map(codeArr, function (code, i) {
          return context.commons.getAlarmDescription(machine_id, code)
        }).join(' |</br>')
      },

      pauseTimeAccumulate: function (data) {
        var pauseStartEnd = [],
          statusArr = data.repair_status

        for (var i = 0; i < statusArr.length; i++) {
          var status = statusArr[i]
          if (status.macro === '215') {
            if (i !== statusArr.length - 1) {
              pauseStartEnd.push({
                start: status.start_time,
                end: statusArr[i + 1].start_time,
              })
            } else {
              pauseStartEnd.push({
                start: status.start_time,
                end: data.end_time,
              })
            }
          }
        }

        var ms = _.reduce(
          pauseStartEnd,
          function (memo, d) {
            var startMoment = moment(d.start, 'YYYY/MM/DD HH:mm:ss'),
              endMoment = moment(d.end, 'YYYY/MM/DD HH:mm:ss')
            return memo + endMoment.diff(startMoment)
          },
          0
        )

        return ms
        //      return moment.utc(ms).format("HH:mm:ss");
      },

      downtimeCodeView: function (data, ctx) {
        let macroList = _.pluck(data.repair_status, 'macro')
        return _.map(macroList, function (code) {
          if (code === '211') {
            return `211更改程式前: ${data.start_standard_second || '---'}${
              data.end_standard_second
                ? ',更改後: ' + data.end_standard_second
                : ''
            }`
          } else {
            return `${code} ${ctx.preCon.downtimeCode[code] || '---'}`
          }
        }).join(' |</br>')
      },

      repairItemView: function (data) {
        var key = [data.machine_id, data.alarm_time].join('@@')
        this.isUpdatedMap[key] = data.repair_item[0]
          ? data.repair_item[0].is_updated
          : 0

        return _.reduce(
          data.repair_item,
          function (memo, elem) {
            memo[elem.repair_code] = elem.count
            return memo
          },
          {}
        )
      },

      getData: function () {
        var context = this
        context.loadingBtn.doing()
        context.isUpdatedMap = {}
        var employeeFilter
        if ($('[name=user]:checked').val() == 'user_id') {
          employeeFilter = [context.$userIdInput.val()]
        } else {
          //DB的維修人員有補足5碼好棒棒
          employeeFilter = context.$employeeSelect.val()
        }
        context.achievedNum = 0

        servkit.ajax(
          {
            url: 'api/huangliang/repair/read',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              startDate: context.$startDate.val(),
              endDate: context.$endDate.val(),
              machineIds: context.$machineSelect.val() || [],
              employeeIds: employeeFilter.concat(
                _.map(employeeFilter, this.trimHeadZero)
              ), // 舊版的沒補足五碼，新版的有，所以有補跟沒補的都查
              repairCodes: context.$repairCodeSelect.val() || [],
            }),
          },
          {
            success: function (datas) {
              // alarm_code:"1234"
              // alarm_time:"2016/08/09 16:48:28"
              // care_emp_id:"user"
              // end_time:"---"
              // machine_id:"CNC3"
              // notify_time:"---"
              // repair_status:Array[0]
              // repair_item:Array[0]
              // start_time:"---"
              // work_shift:"B"
              // act_repair_emp_id: "maybe undefined"

              var dataMatrix = []
              _.each(datas, function (d) {
                var pauseTime = context.pauseTimeAccumulate(d)
                //沒有 repair_item 的是因為該筆警報有填維修項目，但是不包含查詢的維修項目
                if (d.repair_item && d.notify_time !== '---') {
                  let isAchieved = context.isAchieved(d, context, pauseTime)
                  if (isAchieved) {
                    context.achievedNum++
                  }
                  dataMatrix.push([
                    /* 0.警報發生時間 */ d.alarm_time,
                    /* 1.故障通報時間 */ d.notify_time,
                    /* 2.機台 */ d.machine_id,
                    /* 3.班別 */ d.work_shift,
                    /* 4.維修人員員編 */ context.commons.fillZeroTo5Digit(
                      d.act_repair_emp_id
                    ),
                    /* 5.維修人員姓名 */ context.commons.getUserName(
                      context.preCon.empTable,
                      d.act_repair_emp_id
                    ),
                    /* 6.維修起始時間 */ d.start_time === '---'
                      ? d.start_time
                      : d.start_time.substring(11),
                    /* 7.維修結束時間 */ d.end_time === '---'
                      ? d.end_time
                      : d.end_time.substring(11),
                    /* 8.暫停時間 */ moment.utc(pauseTime).format('HH:mm:ss'),
                    /* 9.累計時間 */ context.commons.calcDuration(
                      d.start_time,
                      d.end_time,
                      pauseTime
                    ),
                    /* 10.達成數 */ isAchieved ? 1 : 0,
                    /* 11.維修首件不良數*/ d.repair_first_defectives,
                    /* 12.故障代碼 */ context.alarmCodeView(d.alarm_code),
                    /* 13.故障代碼說明 */ context.alarmNoteView(
                      d.machine_id,
                      d.alarm_code
                    ),
                    /* 14.macro */ context.downtimeCodeView(d, context),
                    /* 15.維修項目 */ context.repairItemView(d),
                  ])
                }
              })

              context.reportTable.clearTable()
              context.reportTable.drawTable(dataMatrix)
            },
            fail: function (data) {
              console.warn(data)
            },
            always: function () {
              context.loadingBtn.done()
            },
          }
        )
      },

      isAchieved(data, ctx, pauseTime) {
        // 維修基準時間
        // 維修基準時間公式:(維修基本標準時間+量測時間)(aka 維修標工)+單顆標準工時(秒)
        return (
          data.repair_item.reduce((memo, item) => {
            memo += ctx.preCon.repairCodeStandardTimeMap[item.repair_code]
            return memo
          }, 0) *
            60 +
            (data.start_standard_second || 0) >=
          (moment(data.end_time) - moment(data.start_time) - pauseTime) / 1000
        )
      },

      createRepairItems: function (datatablesRowData, cb) {
        /*data = [{
         *   machine_id:"H001",
         *   alarm_time:"2016/08/23 11:49:52",
         *   repair_code:"207",
         *   count: 1,
         *   is_updated: 1
         * }, ...]
         * */

        var context = this
        var data = _.map(datatablesRowData[15], function (count, repairCode) {
          var key = [datatablesRowData[0], datatablesRowData[2]].join('@@')
          return {
            machine_id: datatablesRowData[2],
            alarm_time: datatablesRowData[0],
            repair_code: repairCode,
            count: count,
            //          is_updated: (context.isEditOnce && context.isUpdatedMap[key] != 0) ? 1 : 0
            is_updated: context.isEditOnce ? 1 : 0,
          }
        })
        if (_.isEmpty(data)) {
          data = [
            {
              machine_id: datatablesRowData[2],
              alarm_time: datatablesRowData[0],
            },
          ]
        }

        servkit.ajax(
          {
            url: 'api/huangliang/repair/createRepairItems',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
          },
          {
            success: function (data) {
              //          cb();
            },
            fail: function (data) {
              console.warn(data)
            },
            always: function () {
              cb()
            },
          }
        )
      },

      initRepairCodeTable: function () {
        var context = this
        // 只列出非刀具的維修代碼(維修類型代碼為9開頭)
        const filteredData = context.repairCodeObjArray.filter(
          (data) => data.repair_type_id[0] === '9'
        )
        var groupedData = _.groupBy(filteredData, 'repair_type_id')
        var groupedDataValues = Object.values(groupedData)
        var typeList = _.keys(groupedData).sort() // 照類型ID大小排序

        var tableHTML = []
        for (var j = 0; j < Math.ceil(typeList.length / 3); j++) {
          // 三個類型一列
          let filteredTypeList = typeList.filter(
              (type, index) => index <= (j + 1) * 3 - 1 && index >= j * 3
            ),
            filteredGroupedData = groupedDataValues.filter(
              (type, index) => index <= (j + 1) * 3 - 1 && index >= j * 3
            )

          // 維修類型標題 e.g. 類型一 10m
          tableHTML.push('<tr style="background-color: #f9f9f9">')
          filteredTypeList.forEach((typeId) =>
            tableHTML.push(
              '<td colspan="6" class="text-center" style="font-size: large;font-weight:bold;">' +
                context.preCon.repairType.repairTypeMap[typeId]
                  .repair_type_name +
                ' ' +
                context.preCon.repairType.repairTypeMap[typeId]
                  .standard_second +
                'm</td>'
            )
          )
          // 補空格，類型數量不足三就不補
          if (typeList.length > 3) {
            for (var t = 0; t < 3 - filteredTypeList.length; t++) {
              tableHTML.push(`<td colspan="6"></td>`)
            }
          }
          tableHTML.push('</tr>')

          // 維修項目
          var tdLength = _.max(
            _.map(filteredGroupedData, function (elem) {
              return elem.length
            })
          )
          for (var i = 0; i < Math.ceil(tdLength / 2); i++) {
            tableHTML.push('<tr>')
            _.each(filteredTypeList, function (type) {
              // 項目再分兩行顯示
              var data1 = groupedData[type][i * 2]
              var data2 = groupedData[type][i * 2 + 1]
              if (_.isUndefined(data1)) {
                tableHTML.push('<td></td><td></td><td></td>')
              } else {
                tableHTML.push(
                  '<td><input type="checkbox" data-repair-code="' +
                    data1.repair_code +
                    '"></td>'
                ) // checkbox
                tableHTML.push(
                  '<td><span>' + data1.repair_code_name + '</span></td>'
                ) // text
                tableHTML.push('<td><input type="textbox" size="3"> 個</td>') // value
              }

              if (_.isUndefined(data2)) {
                tableHTML.push('<td></td><td></td><td></td>')
              } else {
                tableHTML.push(
                  '<td><input type="checkbox" data-repair-code="' +
                    data2.repair_code +
                    '"></td>'
                ) // checkbox
                tableHTML.push(
                  '<td><span>' + data2.repair_code_name + '</span></td>'
                ) // text
                tableHTML.push('<td><input type="textbox" size="3"> 個</td>') // value
              }
            })
            // 補空格，類型數量不足三就不補
            if (typeList.length > 3) {
              for (var d = 0; d < 3 - filteredTypeList.length; d++) {
                tableHTML.push(
                  `<td></td><td></td><td></td><td></td><td></td><td></td>`
                )
              }
            }
            tableHTML.push('</tr>')
          }
        }
        context.$repairCodeTable.html(tableHTML.join(''))

        context.$repairCodeTable.on('click', ':checkbox', function (e) {
          var $this = $(this)
          var $td = $this.parent('td')
          if ($this.is(':checked')) {
            $td.next().find('span').addClass('txt-color-red')
          } else {
            $td.next().find('span').removeClass('txt-color-red')
          }
        })
      },

      trimHeadZero: function (userId) {
        while (userId && userId[0] === '0') {
          userId = userId.substring(1)
        }

        return userId
      },
    },

    delayCondition: ['machineList'],
    dependencies: [
      '/js/plugin/datatables/jquery.dataTables.min.js',
      '/js/plugin/datatables/dataTables.colVis.min.js',
      '/js/plugin/datatables/dataTables.tableTools.min.js',
      '/js/plugin/datatables/dataTables.bootstrap.min.js',
      '/js/plugin/datatable-responsive/datatables.responsive.min.js',
    ],
    preCondition: {
      empTable: function (done) {
        this.commons.getEmpTable(done)
      },
      //    alarmCodeTable: function (done) {
      //      this.commons.getAlarmCodeTable(done);
      //    },
      machineCncTypeMap: function (done) {
        this.commons.machineCncTypeMap(done)
      },
      machineTypeAlarmCodeMap: function (done) {
        this.commons.machineTypeAlarmCodeMap(done)
      },
      priority: function (done) {
        this.commons.getPriority(done)
      },
      repairCodeStandardTimeMap(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table:
                'a_huangliang_repair_code as c LEFT JOIN a_huangliang_repair_type as t on t.repair_type_id = c.repair_type_id',
              columns: ['c.repair_code', 't.standard_second'],
            }),
          },
          {
            success: function (data) {
              done(
                data.reduce((memo, elem) => {
                  memo[elem.repair_code] = elem.standard_second
                  return memo
                }, {})
              )
            },
            fail() {
              done({})
            },
          }
        )
      },
      repairCode: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_repair_code',
              columns: ['repair_code', 'repair_code_name', 'repair_type_id'],
            }),
          },
          {
            success: function (data) {
              /* repairCode =
               *  {
               *    repairCodeMap:{
               *      [repair_code]: repair_code_name,
               *    },
               *    repairCodeObjArray: [
               *      {
               *        repair_code: "",
               *        repair_code_name: "",
               *        repair_type_id: ""
               *      },
               *      ...
               *    ],
               *    repairCodeTypeMap: {
               *      [repair_code]: repair_type_id
               *    }
               *  }
               */
              var repairCode = {}
              repairCode.repairCodeMap = _.reduce(
                data,
                function (memo, elem) {
                  memo[elem.repair_code] = elem.repair_code_name
                  return memo
                },
                {}
              )
              repairCode.repairCodeTypeMap = _.reduce(
                data,
                function (memo, elem) {
                  memo[elem.repair_code] = elem.repair_type_id
                  return memo
                },
                {}
              )
              repairCode.repairCodeObjArray = data
              done(repairCode)
            },
          }
        )
      },
      repairType: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_repair_type',
              columns: [
                'repair_type_id',
                'repair_type_name',
                'standard_second',
              ],
            }),
          },
          {
            success: function (data) {
              let repairType = {}
              repairType.repairTypeMap = data.reduce((a, x) => {
                a[x.repair_type_id] = {
                  standard_second: x.standard_second,
                  repair_type_name: x.repair_type_name,
                }
                return a
              }, {})
              repairType.repairTypeObjArray = data
              done(repairType)
            },
          }
        )
      },
      downtimeCode: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_downtime_code',
              columns: ['downtime_code', 'downtime_code_name'],
            }),
          },
          {
            success: function (data) {
              var downtimeCode = _.reduce(
                data,
                function (memo, elem) {
                  memo[elem.downtime_code] = elem.downtime_code_name
                  return memo
                },
                {}
              )
              done(downtimeCode)
            },
          }
        )
      },
      customGroupUserList: function (done) {
        var commons = this.commons
        //維修人員名單、研發主管(甘副理)、研發校車人員名單、廠務主管(廠長、義副理、立副理、林課長、製一課副課長、製二課副課長)、廠務校車人員名單
        var userFilterObj = {
          //維修人員
          repair: {},
          //研發主管(甘副理)
          rd_manager: {},
          //研發校車人員名單
          rd_regulate: {},
          //廠務主管(廠長、義副理、立副理、林課長、製一課副課長、製二課副課長)
          fs_manager: {},
          //廠務校車人員名單
          fs_regulate: {},
        }
        var filterList = {
          //維修人員
          repair: [commons.repair],
          //研發主管(甘副理) = 研發副理
          rd_manager: [commons.rd_manager],
          //研發校車人員名單
          rd_regulate: [commons.rd_regulate],
          //廠務主管(廠長、義副理、立副理、林課長、製一課副課長、製二課副課長)
          fs_manager: [
            commons.factory_manager, //廠長
            commons.factory_service_deputy_manager, //廠務部副理(義副理、立副理)
            commons.process_manager_1, //製一課課長(林課長)
            commons.process_manager_2, //製二課課長(林課長)
            commons.process_deputy_manager_1, //製一課副課長
            commons.process_deputy_manager_2, //製二課副課長
          ],
          // 廠務校車人員名單
          fs_regulate: [commons.factory_service_regulate],
        }

        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              _.each(data, function (userObj) {
                var userGroups = _.pluck(userObj.sys_groups, 'group_id')
                var user_id = userObj.user_id
                var user_name = userObj.user_name

                _.each(filterList, function (groupList, key) {
                  if (_.intersection(userGroups, groupList).length != 0) {
                    userFilterObj[key][user_id] = user_name
                  }
                })
              })
              console.log(userFilterObj)
              done(userFilterObj)
            },
          }
        )
      },
    },
  })
}
