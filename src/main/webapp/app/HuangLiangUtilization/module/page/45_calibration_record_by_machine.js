export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [7, 8, 9, 10, 11],
        onDraw: function (tableData, pageData, api) {
          // 最後一列加上總共累積時間
          $('tbody').append(
            '<tr style="font-weight:bolder;color:green;">' +
              '<td colspan="11">Total: </td>' +
              '<td class="text-right">' +
              _.reduce(
                api.column(11, { page: 'current' }).data(),
                function (memo, elem) {
                  return memo + elem.HHmmssToMillisecond()
                },
                0
              ).millisecondToHHmmss() +
              '</td><td></td></tr>'
          )
        },
        excel: {
          fileName: 'MachineRegulateRecord',
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
          ],
        },
      })

      context.groupedProductList = _.groupBy(
        context.preCon.getProductList,
        'macro523'
      )
      context.groupedSampleList = _.groupBy(
        context.preCon.getSampleList,
        'macro523'
      )
      // 若使用者只能查看自己的紀錄(廠務校車、研發校車)，帶入員工編號並隱藏中間篩選人員的section
      context.setUserpermittedAuthes()
      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)
      context.$userFilterSelect.on('change', function (e) {
        var group = $(this).val()
        servkit.initSelectWithList(
          context.preCon.customGroupUserList[group],
          context.$employeeSelect
        )
      })
      context.$userFilterSelect.change()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.getData()
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$startDate.val('2016/07/16')
        context.$endDate.val('2016/07/17')
        context.$machineSelect.val(['_HULPLATFORM01D01M01'])
        context.$userNameSelect.val(['00142', '01234'])
        context.$submitBtn.click()
      })

      context.commons.testMachineBtn()
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $userFilterSelect: $('#filter'),
      $employeeSelect: $('#employee'),
      $userIdInput: $('#user_id'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      groupedProductList: undefined,
      groupedSampleList: undefined,
      setUserpermittedAuthes: function () {
        var context = this
        //廠務校車、研發校車，僅可查詢自己的紀錄
        var queryGroup = [
            context.commons.factory_service_regulate,
            context.commons.rd_regulate,
          ],
          //admin, 高階主管，廠務部副理，業務副理，研發副理，業務副課，研發副課，製一課課長，製二課課長，可查詢所有人
          noLimitGroup = [
            context.commons.sys_super_admin_group,
            context.commons.sys_manager_group,
            context.commons.top_manager,
            context.commons.factory_service_deputy_manager,
            context.commons.sales_manager,
            context.commons.rd_manager,
            context.commons.sales_deputy_manager,
            context.commons.rd_deputy_manager,
            context.commons.process_manager_1,
            context.commons.process_manager_2,
          ]

        var userGroupList = JSON.parse(sessionStorage.loginInfo).user_group
        var userId = JSON.parse(sessionStorage.loginInfo).user_id
        //不包含可查詢全部的群組，僅包含查詢自己的群組
        if (
          _.intersection(userGroupList, noLimitGroup).length == 0 &&
          _.intersection(userGroupList, queryGroup).length > 0
        ) {
          $('[name=user]:last').click()
          context.$userIdInput.val([userId]).closest('div').addClass('hide')
        }
      },
      getData: function () {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this,
          calibration_first_defectives
        loadingBtn.doing()

        var employeeFilter
        //因為M521在rawdata裡前面的0會不見，所以建的資料夾也是沒有0的員編，為了讓hippo取的到值，要把使用者查詢的員編都當整數查
        //結果後來計算程式幫我補0了，所以不用轉了
        if ($('[name=user]:checked').val() == 'user_id') {
          employeeFilter = [context.$userIdInput.val()]
        } else {
          employeeFilter = context.$employeeSelect.val()
        }

        servkit.ajax(
          {
            url: 'api/huangliang/qualityExamData/getData',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              shiftList: ['A', 'B', 'C'],
              machineList: machineList,
              startDate: this.$startDate.val(),
              endDate: this.$endDate.val(),
            }),
            async: false,
          },
          {
            success: function (datas) {
              calibration_first_defectives = datas.reduce((a, data) => {
                let key = [
                  moment(data.date).format('YYYYMMDD'),
                  data.work_shift_name,
                  data.order_id,
                  data.machine_id,
                  data.multi_process,
                ]
                a[key.join('/')] =
                  data.calibration_first_defectives === undefined
                    ? '---'
                    : data.calibration_first_defectives
                return a
              }, {})
            },
          }
        )

        hippo
          .newSimpleExhaler()
          .space('HUL_machine_regulate_record')
          .index('machine_id', machineList)
          .index('employee_id', employeeFilter)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns(
            'logically_date',
            'work_shift_name',
            'machine_id',
            'employee_id',
            'order_id',
            'multi_process',
            'regulate_start_timestamp',
            'regulate_end_timestamp',
            'regulate_pause_millisecond',
            'production_start_timestamp'
          )
          .exhale(function (exhalable) {
            var tableData = _.map(exhalable.exhalable, function (elem) {
              let key = [
                elem.logically_date,
                elem.work_shift_name,
                elem.order_id,
                elem.machine_id,
                elem.multi_process,
              ]
              return [
                // 日期
                elem.logically_date,
                // 員編
                elem.employee_id,
                // 姓名
                context.commons.getUserName(
                  context.preCon.getUserListByGroup.all,
                  elem.employee_id
                ),
                // 班別
                elem.work_shift_name,
                // 機台
                servkit.getMachineName(elem.machine_id),
                // 訂單
                context.commons.getOrderIdOrSampleId(
                  context.groupedProductList,
                  context.groupedSampleList,
                  elem.order_id
                ).order_id,
                // 多次製程
                context.commons.getMultiProcess(elem.multi_process),
                // 校車起始時間
                elem.regulate_start_timestamp
                  .date20BitsToFormatted()
                  .substring(11, 20),
                // 校車結束時間
                elem.regulate_end_timestamp
                  .date20BitsToFormatted()
                  .substring(11, 20),
                // 開始量產時間
                elem.production_start_timestamp === '---'
                  ? '---'
                  : elem.production_start_timestamp
                      .date20BitsToFormatted()
                      .substring(11, 20),
                // 暫停時間
                context.getRegulatePauseTime(elem.regulate_pause_millisecond),
                // 累積時間
                context.getAccumulatedMillisecond(elem),
                // 校車首件不良品
                calibration_first_defectives[key.join('/')] === undefined
                  ? '---'
                  : calibration_first_defectives[key.join('/')],
              ]
            })

            context.reportTable.drawTable(tableData)
            loadingBtn.done()
          })
      },
      getRegulatePauseTime: function (regulate_pause_millisecond) {
        if (regulate_pause_millisecond > 8 * 3600 * 1000 - 1000) {
          return '07:59:59'
        }
        return regulate_pause_millisecond.millisecondToHHmmss()
      },
      getAccumulatedMillisecond: function (elem) {
        var accumulatedMillisecond =
          moment(elem.regulate_end_timestamp, 'YYYYMMDDHHmmss').diff(
            moment(elem.regulate_start_timestamp, 'YYYYMMDDHHmmss')
          ) - elem.regulate_pause_millisecond
        if (accumulatedMillisecond <= 0) {
          return '00:00:00'
        } else {
          return moment
            .utc(
              moment(elem.regulate_end_timestamp, 'YYYYMMDDHHmmss').diff(
                moment(elem.regulate_start_timestamp, 'YYYYMMDDHHmmss')
              ) -
                parseInt(elem.regulate_pause_millisecond / 1000) * 1000
            )
            .format('HH:mm:ss')
          //去調毫秒部分最後三位數免得減完變負的
        }
      },
    },
    preCondition: {
      getUserListByGroup: function (done) {
        this.commons.getUserListByGroup(done)
      },
      getProductList: function (done) {
        this.commons.getProductList(done)
      },
      getSampleList: function (done) {
        this.commons.getSampleList(done)
      },
      customGroupUserList: function (done) {
        var commons = this.commons
        //校車人員名單、研發主管(甘副理)、研發校車人員名單、廠務主管(廠長、義副理、立副理、林課長、製一課副課長、製二課副課長)、廠務校車人員名單
        var userFilterObj = {
          //校車人員
          regulate: {},
          //研發主管(甘副理)
          rd_manager: {},
          //研發校車人員名單
          rd_regulate: {},
          //廠務主管(廠長、義副理、立副理、林課長、製一課副課長、製二課副課長)
          fs_manager: {},
          // 廠務校車人員名單
          fs_regulate: {},
        }
        var filterList = {
          //校車人員 = 廠務校車群組 + 研發校車
          regulate: [commons.factory_service_regulate, commons.rd_regulate],
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
    delayCondition: ['machineList'],
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/dataTables.sum.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
