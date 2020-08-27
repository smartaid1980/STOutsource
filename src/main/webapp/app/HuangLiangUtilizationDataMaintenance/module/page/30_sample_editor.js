export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        onRow: function (row, data) {
          $(row).find('td').eq(1).html(servkit.getMachineName(data[1]))
          $(row).find('td').eq(5).html(data[5].date20BitsToFormatted())
          $(row).find('td').eq(6).html(data[6].date20BitsToFormatted())
          if (context.isEditable) {
            //id = timestamp
            $(row)
              .find('td')
              .eq(7)
              .html(
                '<input type = "text" size=20 id="' +
                  data[8] +
                  '" value="' +
                  data[7] +
                  '">'
              )
          }

          $(row).find('td').eq(8).addClass('hide')
          $(row).find('td').eq(9).addClass('hide')
          $(row).find('td').eq(10).addClass('hide')
          $(row).find('td').eq(11).addClass('hide')
          $(row).find('td').eq(12).addClass('hide')
          $(row).find('td').eq(13).addClass('hide')
          $(row).find('td').eq(14).addClass('hide')
        },
        onDraw: function (tableData, pageData, api) {
          //        $(".ColVis_collection").find(":checkbox").eq(8).nextAll()
          api.columns([8, 9, 10, 11, 12, 13, 14]).visible(false)
        },
      })

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initMachineSelect(context.$machineSelect)
      servkit.initSelectWithList(
        context.preCon.getShiftList,
        context.$shiftSelect
      )
      servkit.initSelectWithList(
        context.preCon.getUserListByGroup.regulate,
        context.$regulateEmpSelect
      )
      context.setUserpermittedAuthes()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.getData()
      })

      context.$submitEditBtn.on('click', function (evt) {
        evt.preventDefault()
        context.saveData()
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $shiftSelect: $('#shift'),
      $machineSelect: $('#machine'),
      $regulateEmpSelect: $('#regulate-emp'),
      $submitBtn: $('#submit-btn'),
      $submitEditBtn: $('#submit_edit'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      loadingBtnEdit: servkit.loadingButton(
        document.querySelector('#submit_edit')
      ),
      reportTable: undefined,
      sampleDataObj: undefined, //{timestamp1:[{}], timestamp2:[{}], ...}
      isEditable: false,

      setUserpermittedAuthes: function () {
        var context = this
        //廠務部副理、研發副理、廠務部製造課長、廠務部製造副課長、廠務校車、研發校車，僅可查詢自己的紀錄並修改
        var editSelfGroup = [
            context.commons.sys_super_admin_group,
            context.commons.factory_service_deputy_manager,
            context.commons.rd_manager,
            context.commons.process_manager_1,
            context.commons.process_manager_2,
            context.commons.process_deputy_manager_1,
            context.commons.process_deputy_manager_2,
            context.commons.factory_service_regulate,
            context.commons.rd_regulate,
          ],
          //admin, 高階主管，僅可查詢
          queryGroup = [
            context.commons.sys_super_admin_group,
            context.commons.sys_manager_group,
            context.commons.top_manager,
          ]

        var userGroupList = JSON.parse(sessionStorage.loginInfo).user_group
        var userId = JSON.parse(sessionStorage.loginInfo).user_id
        if (_.intersection(userGroupList, editSelfGroup).length > 0) {
          context.$regulateEmpSelect
            .val([userId])
            .closest('div')
            .addClass('hide')
          context.isEditable = true
        }
      },

      getData: function () {
        var shiftList = this.$shiftSelect.val() || [],
          machineList = this.$machineSelect.val() || [],
          regulateEmpList = this.$regulateEmpSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this,
          startDate = context.$startDate.val(),
          endDate = context.$endDate.val(),
          dbData,
          hippoData

        context.sampleDataObj = undefined
        loadingBtn.doing()

        //from DB
        servkit.ajax(
          {
            url: 'api/getdata/db',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_sample_fill_manage_id',
              columns: [
                'timestamp',
                'date',
                'machine_id',
                'work_shift_name',
                'employee_id',
                'manage_id',
                'regulate_start_tsp',
                'produce_start_tsp',
                'produce_end_tsp',
                'regulate_pause_ms',
                'repair_pause_ms',
                'produce_pause_ms',
                'produce_oper_ms',
                'part_count',
              ],
              whereClause:
                "date between '" +
                startDate.replace(/\//g, '') +
                "' AND '" +
                endDate.replace(/\//g, '') +
                "' AND " +
                "work_shift_name in ( '" +
                shiftList.join("','") +
                "' ) AND " +
                "machine_id in ( '" +
                machineList.join("','") +
                "' ) AND " +
                "employee_id in ( '" +
                regulateEmpList.join("','") +
                "' )",
            }),
          },
          {
            success: function (data) {
              dbData = data
              console.log(data)
            },
          }
        )

        //from hippo
        // modify by jacokao at 2016/10/8
        // because hippo 's column different
        // oper_millisecond_100 to 100_oper_millisecond
        // todo : should to be fix in the future
        // 100_xxxx can't be column of object
        hippo
          .newSimpleExhaler()
          .space('HUL_sample_no_id')
          .index('machine_id', machineList)
          .index('employee_id', regulateEmpList)
          .index('work_shift_name', shiftList)
          .indexRange('date', startDate, endDate)
          .columns(
            'timestamp',
            'date',
            'machine_id',
            'work_shift_name',
            'employee_id',
            'manage_id',
            'regulate_start_tsp', //校車開始時間(300)
            'produce_start_tsp', //生產開始時間(100)
            'produce_end_tsp', //生產結束時間(103)
            'regulate_pause_ms', //校車閒置(305)
            'repair_pause_ms', //維修時間(215)
            'produce_pause_ms', //閒置時間(105)
            'produce_oper_ms', //生產時間(100的運轉時間)
            'part_count' //總生產件數
          )
          .exhale(function (exhalable) {
            hippoData = exhalable.exhalable
          })

        try {
          servkit
            .politeCheck()
            .until(function () {
              return dbData && hippoData
            })
            .thenDo(function () {
              var groupedHippoData = _.groupBy(hippoData, 'timestamp')
              var groupedDbData = _.groupBy(dbData, 'timestamp')
              context.sampleDataObj = _.extend(groupedHippoData, groupedDbData)
              var dataList = _.sortBy(
                _.flatten(_.toArray(context.sampleDataObj)),
                'timestamp'
              )

              context.reportTable.drawTable(
                dataList.map(function (sampleData) {
                  return [
                    //0 日期(班次天)
                    sampleData.date,
                    //1 機台
                    sampleData.machine_id,
                    //2 員編
                    sampleData.employee_id,
                    //3 人員姓名(反正他也只查的到校車人員的紀錄)
                    context.preCon.getUserListByGroup.regulate[
                      sampleData.employee_id
                    ] || '',
                    //4 班別
                    sampleData.work_shift_name,
                    //5 生產起始時間(100)
                    sampleData.produce_start_tsp || '---',
                    //6 生產結束時間(103)
                    sampleData.produce_end_tsp || '---',
                    //7 管編號碼 如果是0不用比對，如果是DB裡的那使用者再補填管編的時候也就應該要是正確的格式
                    sampleData.manage_id == '0' ||
                    sampleData.manage_id == 'G0' ||
                    sampleData.manage_id == 'M0'
                      ? ''
                      : sampleData.manage_id,
                    sampleData.timestamp, //8
                    sampleData.regulate_start_tsp || '---', //9 校車開始時間(300)
                    sampleData.regulate_pause_ms, //10 校車閒置(305)
                    sampleData.repair_pause_ms, //11 維修時間(215)
                    sampleData.produce_pause_ms, //12 閒置時間(105)
                    sampleData.produce_oper_ms, //13 生產時間(100的運轉時間)
                    sampleData.part_count, //14 單位生產件數
                  ]
                })
              )
              loadingBtn.done()
            })
            .tryDuration(500)
            .start()
        } catch (e) {
          console.log(e)
          loadingBtn.done()
        }
      },

      saveData: function () {
        var context = this,
          datasToSave = [],
          pageData = context.reportTable.table.rows({ page: 'current' }).data()
        //          tableData = context.reportTable.table.data();

        _.each(pageData, function (elem) {
          var timestamp = elem[8]
          var manageId = $('#' + timestamp).val()
          var sampleData = context.sampleDataObj[timestamp][0]
          sampleData.manage_id = manageId
          datasToSave.push(sampleData)
        })

        console.log(datasToSave)

        //      $('#table tbody tr').each(function () {
        //        var rowData = tableData.row(this).data();
        //        var $this = $(this);
        //        var manage_id = $this.find('.manage_id').val();
        //        rowData[7] = manage_id;
        //      });
        //
        //      var data = tableData;
        //      var dataAry = [];
        //
        //      for (var i = 0; i < data.length; i++) {
        //        dataAry[i] = data[i];
        //      }

        servkit.ajax(
          {
            url: 'api/huangliang/sampleManageId/save',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datasToSave),
          },
          {
            success: function (data) {
              console.log('success')
              context.loadingBtnEdit.done()
              context.getData()
              $.smallBox({
                sound: false, //不要音效
                title: '儲存成功!',
                content:
                  "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
                color: servkit.colors.green,
                icon: 'fa fa-check',
                timeout: 4000,
              })
            },
            fail: function (data) {
              console.log(data)
              $.smallBox({
                sound: false, //不要音效
                title: '儲存失敗，請檢查資料合理性',
                content:
                  "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
                color: servkit.colors.red,
                icon: 'fa fa-times',
                timeout: 4000,
              })
            },
          }
        )
      },
    },
    preCondition: {
      getShiftList: function (done) {
        this.commons.getShiftList(done)
      },
      getUserListByGroup: function (done) {
        this.commons.getUserListByGroup(done)
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
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
