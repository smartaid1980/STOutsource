export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.machineByGroupList = _.keys(context.preCon.getMachineByGroup)
      context.macroObj = context.preCon.getMacroMap
      context.tableQuery = createReportTable({
        $tableElement: $('#table_query'),
        rightColumn: [2, 3, 4, 8],
        onRow: function (row, data) {
          $(row).find('td').eq(0).html(servkit.getMachineName(data[0]))
          $(row)
            .find('td')
            .eq(5)
            .html(
              '<span class="badge bg-color-' +
                (data[5] == 'M4' ? 'red' : 'blue') +
                '">' +
                (context.macroObj[data[5]] || '') +
                '</span>'
            )
          $(row)
            .find('td')
            .eq(6)
            .html(
              '<span class="label ' +
                data[6] +
                '">' +
                (data[6] == 'on' ? '上班(On)' : '下班(Off)') +
                '</span>'
            )
        },
      })
      //    context.tableEdit = context.initDataTable();
      //    context.init();
      //    context.subscribeDeviceStatus();
      //    console.log("click");
      //
      //    $(".machine-filter").on("change", function (e) {
      //      var selectedMachine = $(this).find("select").val() == "" ?
      //          "" : '^' + $(this).find("select").val() + '$';
      //
      //      context.tableEdit.column(0)
      //          .search(selectedMachine, true, false) //regexp
      //          .draw();
      ////      $(".table-search:first").find("input").val(selectedMachine).keyup();
      //    });
      //
      //    //提交時若有全部上班或全部下班，則將所有機台改成該狀態後並寫入資料
      //    $("#submit_edit").on('click', function (e) {
      //      e.preventDefault();
      //      var $checkedRadio = $(":radio:checked");
      //      var allOnOff = $checkedRadio.val();//全部上班或全部下班
      //
      //      if (allOnOff && $(".machineBtn:not(." + allOnOff + ")").length != 0) {
      //        context.loadingBtnEdit.doing();
      //        //將非該狀態的所有機台點擊換成該狀態
      //        $(".machineBtn:not(." + allOnOff + ")").click();
      //      }
      //
      //      //將radio都變為未選取的狀態
      //      $checkedRadio.prop("checked", false);
      //
      //    });
      //
      //    context.$machineMacroBtns
      //        .on('click', '.on', function (e) {
      //          e.preventDefault();
      //          $(this).switchClass("on", "off");
      //          var $btnGroup = $(this).closest(".btn-group");
      //          var machineId = $btnGroup.attr("id");
      //          //下班時把狀態清掉
      //          $btnGroup.find(".macroBtn").removeAttr("style").attr("macro", "").text("---");
      //          context.addTableData(machineId, "", "off");
      //        })
      //        .on('click', '.off', function (e) {
      //          e.preventDefault();
      //          $(this).switchClass("off", "on");
      //          var $btnGroup = $(this).closest(".btn-group");
      //          var machineId = $btnGroup.attr("id");
      //          var macro = $btnGroup.find(".macroBtn").attr("macro");
      //          context.addTableData(machineId, macro, "on");
      //        })
      //        .on('click', '.macroBtn', function (e) {
      //          e.preventDefault();
      //        })
      //        .on('click', '.dropdown-menu', function (e) {
      //          e.preventDefault();
      //          var $this = $(e.target);
      //          var macro = $this.attr("macro");
      //          var $parentDiv = $this.closest(".btn-group");
      //          var machineId = $parentDiv.attr("id");
      //          var $macroBtn = $parentDiv.find(".macroBtn");
      //
      //          $macroBtn.attr("macro", macro).text(context.macroObj[macro]);
      //          if (macro == "M4") {
      //            $macroBtn.attr("style", "background-color:" + servkit.colors.red + ";color:white;");
      //          } else {
      //            $macroBtn.attr("style", "background-color:" + servkit.colors.blue + ";color:white;");
      //          }
      //
      //          context.addTableData(machineId, macro, ($parentDiv.find(".machineBtn").hasClass("on") ? "on" : "off"));
      //        });

      /***************** query *****************/
      //init date and machine select
      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initSelectWithList(
        context.preCon.getMachineByGroup,
        context.$deviceQuery
      )
      $('#submit_query').on('click', function (e) {
        e.preventDefault()
        context.loadingBtnQuery.doing()
        context.drawTableQuery()
      })
    },
    util: {
      $formEdit: $('#form_edit'),
      $deviceQuery: $('[name=device_query]'),
      $startDate: $('[name=startDate]'),
      $endDate: $('[name=endDate]'),
      $machineMacroBtns: $('#machine-macro-btns'),
      //    loadingBtnEdit: servkit.loadingButton(document.querySelector('#submit_edit')),
      loadingBtnQuery: servkit.loadingButton(
        document.querySelector('#submit_query')
      ),
      $tableEdit: $('#table_edit'),
      today: moment().format('YYYY/MM/DD'),
      lastMonth: moment().add(-1, 'months').format('YYYY/MM/DD'),
      YMDHms: 'YYYY/MM/DD HH:mm:ss',
      machineByGroupList: [],
      macroObj: {},
      tableEdit: undefined,
      tableQuery: undefined,
      groupedTableEditData: undefined,
      macroDropdownMenuHTML: function () {
        return _.map(this.macroObj, function (macro, key) {
          return (
            '<li>' +
            '<a href="" macro="' +
            key +
            '">' +
            macro +
            '</a>' +
            '</li>'
          )
        }).join('')
      },
      machineBtnsHTML: function (machine, lastWorkMacro) {
        var lastOnOff = lastWorkMacro ? lastWorkMacro.on_off : 'off'
        var lastMacro = lastWorkMacro ? lastWorkMacro.macro : ''
        var macroColor = ''
        if (lastMacro == 'M4') {
          macroColor =
            'background-color:' + servkit.colors.red + ';color:white;'
        } else if (lastMacro !== '') {
          macroColor =
            'background-color:' + servkit.colors.blue + ';color:white;'
        }
        return (
          '<div class="btn-group" id="' +
          machine +
          '">' +
          '<button class="btn machineBtn ' +
          lastOnOff +
          '" machine-id="' +
          machine +
          '">' +
          servkit.getMachineName(machine) +
          '</button>' +
          '<button class="btn macroBtn" macro="' +
          lastMacro +
          '" style="' +
          macroColor +
          '">' +
          (this.macroObj[lastMacro] || '---') +
          '</button>' +
          '<button class="btn dropdown-toggle statusBtn" data-toggle="dropdown" aria-expanded="false"> <span class="caret"></span></button>' +
          '<ul class="dropdown-menu">' +
          this.macroDropdownMenuHTML() +
          '</ul>' +
          '</div>'
        )
      },
      init: function () {
        var context = this

        if (new Date().getSeconds() % 20 != 0) {
          context.drawTableEdit()
        }
        //setup date and time
        var clock = servkit
          .schedule('clock')
          .freqMillisecond(1000)
          .action(function () {
            $('[name=timestmap]').text(
              moment(new Date()).format('YYYY/MM/DD HH:mm:ss')
            )

            //refresh data every 20 seconds
            if (new Date().getSeconds() % 20 == 0) {
              context.drawTableEdit()
            }
          })
          .start()
      },
      renderMacroBtns: function () {
        var context = this
        var machineMacroBtnsHTML = []
        _.each(context.machineByGroupList, function (machineId) {
          var lastWorkMacro = _.last(context.groupedTableEditData[machineId])
          machineMacroBtnsHTML.push(
            context.machineBtnsHTML(machineId, lastWorkMacro)
          )
        })
        context.$machineMacroBtns.html(machineMacroBtnsHTML.join(''))
      },
      initDataTable: function () {
        var responsiveHelper,
          breakpointDefinition = {
            tablet: 1024,
            phone: 480,
          },
          $tableEdit = this.$tableEdit,
          context = this,
          machineFilterHTML = [
            '<label><select class="form-control"><option value="">ALL</option>',
            _.map(context.preCon.getMachineByGroup, function (
              machineName,
              machineId
            ) {
              return (
                '<option value="' + machineId + '">' + machineName + '</option>'
              )
              //              return '<option value="' + machineName + '">' + machineName + '</option>';
            }),
            '<select></label>',
          ].join('')

        return $tableEdit.DataTable({
          sDom:
            "<'dt-toolbar'<'col-xs-12 col-sm-6 machine-filter'><'col-xs-12 col-sm-6 table-search hide'f>r>" +
            "t<'dt-toolbar-footer'<'col-xs-12 col-sm-2'><'col-xs-12 col-sm-3 hidden-xs'l><'col-xs-12 col-sm-3 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
          columns: [
            //在此設置col的 class和 col寬度
            {
              className: 'text-center',
              data: 'machine_id',
              title: '機台(Machine)',
            },
            { className: 'text-center', data: 'date', title: '日期(Date)' },
            {
              className: 'text-center',
              data: 'start_time',
              title: '開始時間(Start Time)',
            },
            {
              className: 'text-center',
              data: 'end_time',
              title: '結束時間(End Time)',
            },
            {
              className: 'text-center',
              data: 'duration',
              title: '持續時間(Duration)',
            },
            {
              className: 'text-center',
              data: 'macro',
              title: 'Macro',
              defaultContent: '',
            },
            {
              className: 'text-center',
              data: 'on_off',
              title: '上下班(On off)',
            },
            {
              className: 'text-center',
              data: 'update_by',
              title: '修改者(Updated By)',
              defaultContent: '',
            },
            {
              className: 'text-center',
              data: 'update_time',
              title: '修改時間(Updated Time)',
              defaultContent: '',
            },
          ],
          order: [[2, 'asc']],
          autoWidth: false,
          preDrawCallback: function () {
            // Initialize the responsive datatables helper once.
            try {
              if (!responsiveHelper) {
                responsiveHelper = new ResponsiveDatatablesHelper(
                  $tableEdit,
                  breakpointDefinition
                )
              }
            } catch (e) {
              console.warn(e)
            }
          },
          rowCallback: function (row, data) {
            responsiveHelper.createExpandIcon(row)
            $(row)
              .find('td')
              .eq(0)
              .html(servkit.getMachineName(data.machine_id)) //'+ (data.macro == "M4" ? "red" : "blue") +'
            $(row)
              .find('td')
              .eq(5)
              .html(
                '<span class="badge bg-color-' +
                  (data.macro == 'M4' ? 'red' : 'blue') +
                  '">' +
                  (context.macroObj[data.macro] || '') +
                  '</span>'
              )
            $(row)
              .find('td')
              .eq(6)
              .html(
                '<span class="label ' +
                  data.on_off +
                  '">' +
                  (data.on_off == 'on' ? '上班(On)' : '下班(Off)') +
                  '</span>'
              )
          },
          drawCallback: function (oSettings) {
            responsiveHelper.respond()
            if ($('.machine-filter').html() == '') {
              $('.machine-filter').html(machineFilterHTML)
            }
          },
        })
      },
      exhaleWorkMacro: function (machines, startDate, endDate, cb) {
        hippo
          .newSimpleExhaler()
          .space('work_macro')
          .index('machine_id', machines)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'date',
            'start_time',
            'end_time',
            'on_off',
            'macro',
            'duration',
            'update_by',
            'update_time'
          )
          .exhale(function (data) {
            if (cb) {
              cb(data.exhalable)
            }
          })
      },
      drawTableEdit: function () {
        var context = this
        hippo
          .newSimpleExhaler()
          .space('work_macro_latest_date')
          .index('machine_id', context.machineByGroupList)
          .columns('machine_id', 'date')
          .exhale(function (machineLatestDateArray) {
            context.groupedTableEditData = {}
            var tableData = []
            var machineLatestDateMap = _.reduce(
              machineLatestDateArray.exhalable,
              function (memo, obj) {
                memo[obj.machine_id] = obj.date
                return memo
              },
              {}
            )

            console.log(machineLatestDateMap)

            //只找有權限查詢的機台的最新資料
            _.each(context.machineByGroupList, function (machineId) {
              var date = machineLatestDateMap[machineId]
              if (date) {
                context.exhaleWorkMacro([machineId], date, date, function (
                  exhalable
                ) {
                  context.groupedTableEditData[machineId] = _.sortBy(
                    exhalable,
                    'start_time'
                  )
                  tableData = tableData.concat(exhalable)
                })
              } else {
                context.groupedTableEditData[machineId] = []
              }
            })

            servkit
              .politeCheck('drawTableEdit')
              .until(function () {
                //確定每個機台都已經拿回來了
                return (
                  _.keys(context.groupedTableEditData).length ==
                  context.machineByGroupList.length
                )
              })
              .thenDo(function () {
                //長表格
                context.tableEdit.clear().rows.add(tableData).draw()
                context.tableEdit.page('last').draw(false)
                //反饋到按鈕
                context.renderMacroBtns()
              })
              .tryDuration(0)
              .start()
          })
      },
      drawTableQuery: function () {
        var context = this
        context.exhaleWorkMacro(
          context.$deviceQuery.val(),
          context.$startDate.val(),
          context.$endDate.val(),
          function (exhalable) {
            context.tableQuery.drawTable(
              _.map(exhalable, function (elem) {
                var duration = elem.end_time
                  ? (
                      moment(elem.end_time) - moment(elem.start_time)
                    ).millisecondToDHHmmss()
                  : '---'
                return [
                  servkit.getMachineName(elem.machine_id),
                  elem.date,
                  elem.start_time,
                  elem.end_time,
                  duration,
                  elem.macro,
                  elem.on_off,
                  elem.update_by,
                  elem.update_time,
                ]
              })
            )
            context.loadingBtnQuery.done()
          }
        )
      },
      addTableData: function (machineId, macro, on_off) {
        var context = this
        context.loadingBtnEdit.doing()

        //寫入同一機台最後一筆的結束時間並新增該狀態的開始資料
        var machineLastData = _.chain(context.tableEdit.data())
          .filter(function (elem) {
            return elem.machine_id == machineId
          })
          .sortBy('start_time')
          .last()
          .value()

        if (machineLastData) {
          machineLastData.end_time = moment().format(context.YMDHms)
          machineLastData.duration = (
            new Date().getTime() -
            new Date(machineLastData.start_time).getTime()
          ).millisecondToHHmmss()
          machineLastData.update_by = JSON.parse(
            sessionStorage.loginInfo
          ).user_id
          machineLastData.update_time = moment().format(context.YMDHms)

          //TODO:找出要刪掉的那一行  因為所有機台都混在一起所以已經不一定是最後一行了
          //        context.tableEdit.rows(context.tableEdit.rows().data().length - 1).remove();

          //使出大絕，全部清除再重長XD
          var tempTableData = context.tableEdit.data()
          context.tableEdit.clear().rows.add(tempTableData)
        } else {
          console.warn('不應該找不到' + machineId + '最新的資料')
        }

        context.tableEdit.rows
          .add([
            {
              machine_id: machineId,
              date: moment().format('YYYY/MM/DD'),
              start_time: moment().format(context.YMDHms),
              end_time: '---',
              duration: '---',
              macro: macro,
              on_off: on_off,
              update_by: JSON.parse(sessionStorage.loginInfo).user_id,
              update_time: moment().format(context.YMDHms),
            },
          ])
          .draw()
        context.tableEdit.page('last').draw(false)

        context.saveMachineLatestDate(machineId)
        context.saveWorkMacroData(machineId)
      },
      saveMachineLatestDate: function (machineId) {
        var inhaler = hippo.newInhaler()
        inhaler
          .space('work_macro_latest_date')
          .index('machine_id', machineId)
          .put('machine_id', machineId)
          .put('date', moment().format('YYYYMMDD'))
          .next()

        try {
          inhaler.inhale(function () {
            //          console.log(machineId + "saved.");
          })
        } catch (e) {
          console.warn(e)
        }
      },
      saveWorkMacroData: function (machineId) {
        var context = this
        //只存當下有新增資料的機台
        var machineTableData = _.filter(context.tableEdit.data(), function (
          elem
        ) {
          return elem.machine_id == machineId
        })
        //避免資料有跨天，還是把拿來的資料先分天再存入
        _.each(_.groupBy(machineTableData, 'date'), function (objs, date) {
          var inhaler = hippo.newInhaler()
          inhaler
            .space('work_macro')
            .index('machine_id', machineId)
            .index('date', date)

          _.each(objs, function (data) {
            inhaler
              .put('machine_id', machineId)
              .put('date', date)
              .put('start_time', data.start_time)
              .put('end_time', data.end_time)
              .put('on_off', data.on_off)
              .put('macro', data.macro)
              .put('duration', data.duration)
              .put('update_by', data.update_by)
              .put('update_time', data.update_time)
              .next()
          })

          try {
            inhaler.inhale(function () {
              context.loadingBtnEdit.done()
            })
          } catch (e) {
            console.warn(e)
          }
        })
      },
      subscribeDeviceStatus: function () {
        var context = this
        servkit.subscribe('DeviceStatus', {
          machines: context.preCon.getBoxList,
          handler: function (data) {
            _.each(data, function (elem, index) {
              elem.eachMachine('G_CONS()', function (multisystem, machineId) {
                var status = multisystem[0][0]
                var $machineBtnGroup = $('#' + machineId)
                var $macroBtn = $machineBtnGroup.find('.macroBtn')
                $machineBtnGroup
                  .find('.statusBtn')
                  .attr(
                    'style',
                    'background-color:' + servkit.getMachineLightColor(status)
                  )

                if (
                  status == '11' &&
                  $macroBtn.length &&
                  $macroBtn.attr('macro') !== ''
                ) {
                  //機台存在且 12=>11 ，則清除上一次閒置狀況，並寫入macro的結束時間
                  $macroBtn.removeAttr('style').attr({ macro: '' }).text('---')
                  console.log('subscribeDeviceStatus')
                  context.addTableData(
                    machineId,
                    $macroBtn.attr('macro') || '',
                    $machineBtnGroup.find('.machineBtn').hasClass('on')
                      ? 'on'
                      : 'off'
                  )
                }
              })
            })
          },
          dataModeling: true,
        })
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      getMachineByGroup: function (done) {
        //{machineId1: machineName1, ...}
        this.commons.getMachineByGroup(done)
      },
      getMacroMap: function (done) {
        //只有這頁要求要macro同時有中英文
        done({
          M1: '更換刀具/Change Tool (M1)',
          M2: '設定時間/Setting Time (M2)',
          M3: '工件量測/Measuring (M3)',
          M4: '故障待修/Failure to be Repaired (M4)',
          M5: '待料/Wait for Material (M5)',
          M6: '待刀具/Wait for Tool (M6)',
          M7: '待人設定/Wait for Setting (M7)',
          M8: '待單/Wait for Order (M8)',
          M9: '機台清理/Cleaning (M9)',
          M10: '治具加工/Fixture Processing (M10)',
          M999: '待人顧車/Wait for taking care of car (M999)',
        })

        //      var macroPath = "app/" + document.location.hash.split('/').slice(1, 4).join("/") + "/macro.json";
        //      $.getJSON(macroPath)
        //          .done(function (macroObj) {
        //            done(macroObj);
        //          })
        //          .fail(function (d, textStatus, error) {
        //            done({});
        //            console.error("getJSON failed, status: " + textStatus + ", error: " + error);
        //          });
      },
      getBoxList: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_box',
              columns: ['box_id'],
            }),
          },
          {
            success: function (boxes) {
              done(_.pluck(boxes, 'box_id'))
            },
          }
        )
      },
    },
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
