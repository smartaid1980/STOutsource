export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.initMachineSelect(context.$machineSelect)
      context.initFollowupWorkSelect()
      context.setUserpermittedAuthes()
      context.clearTabs()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        context.loadingBtn.doing()
        context.machineId = context.$machineSelect.val()
        context.orderId = ''
        context.clearTabs()
        context.getData()
      })

      context.$tabContent.on('click', '[data-name=edit]', function (evt) {
        console.log('edit')
        evt.preventDefault()
        // preload data
        context.preloadData($(this).closest('.tab-pane'))
        context.$modal.modal('show')
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$submitBtn.click()
      })

      $('#save').on('click', function (e) {
        e.preventDefault()
        context.saveData()
      })
    },
    util: {
      $machineSelect: $('#machine_id'),
      $factoryServiceWidget: $('#factory-service-widget'),
      $widgetTab: $('#widget-tab'),
      $tabContent: $('#tab-content'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      $modal: $('#edit-modal'),
      $modalInfoTable: $('#modal-info-table'),
      $modalMaterialTable: $('#modal-material-table'),
      $followUpSelect: $('#follow-up'),
      tabTemplate: $('#process1').clone(),

      repairItemMap: undefined, // repairItemMap[YYYYMMDD@@work_shift@@care_emp_id]="HH:mm~HH:mm repair_code_name*count|repair_code_name*count..."
      editProcess: undefined,
      orderId: '',
      machineId: '',

      setUserpermittedAuthes: function () {
        var context = this

        // admin, 高階主管，廠務部副理，製一課課長，製二課課長，製一課副課長，製二課副課長，廠務校車，研發校車，組長，可修改多次
        var editableGroup = [
            context.commons.sys_super_admin_group,
            context.commons.sys_manager_group,
            context.commons.top_manager,
            context.commons.factory_service_deputy_manager,
            context.commons.process_manager_1,
            context.commons.process_manager_2,
            context.commons.process_deputy_manager_1,
            context.commons.process_deputy_manager_2,
            context.commons.factory_service_regulate,
            context.commons.rd_regulate,
            context.commons.leader,
          ],
          // 業務部副理，研發副理，業務副課，研發副課，僅可查詢
          queryGroup = [
            context.commons.sales_manager,
            context.commons.rd_manager,
            context.commons.sales_deputy_manager,
            context.commons.rd_deputy_manager,
          ]

        var userGroupList = JSON.parse(sessionStorage.loginInfo).user_group
        if (_.intersection(userGroupList, editableGroup).length > 0) {
          console.log('editable')
          $(context.tabTemplate).find('[data-name=edit]').removeClass('hide')
        }
      },
      clearTabs: function () {
        this.$widgetTab.empty()
        this.$tabContent.empty()
      },
      getData: function () {
        var context = this,
          machineIdList = [context.machineId],
          //          orderId = "GM160625005",
          // orderIdList = [""],
          orderIdList = [context.orderId],
          multiProcessList = _.range(1, 11)
        multiProcessList.push('---')

        // 取得機台當下執行之訂單
        servkit.ajax(
          {
            url: 'api/huangliang/mobile/get',
            method: 'GET',
            async: false,
            timeout: 10000,
            contentType: 'application/json',
            data: { machineId: context.machineId },
          },
          {
            success: function (data) {
              data.gOrM = data.gOrM == '' ? 'G' : data.gOrM
              // 因為API 有改  有幫他把0補足，但是廠務稼動的計算程式並沒有，所以還是要把0拿掉才查的到單
              context.orderId = data.gOrM + parseFloat(data.macro523)
              context.editProcess = data.op
              orderIdList = [context.orderId]
            },
            error: function (jqXHR, textStatus, errorThrown) {
              if (textStatus == 'timeout') {
                console.warn(
                  '拿機台目前執行訂單的同步ajax 超過10秒 timeout 囉!'
                )
              } else {
                console.warn(textStatus)
              }
            },
            exception: function (data, jqXHR, textStatus) {
              console.warn('後端(api/huangliang/mobile/get)發生錯誤: ' + data)
              context.orderId = 'G60818.004'
              orderIdList = [context.orderId]
            },
          }
        )

        // 取得該機台該訂單多次製程資料
        try {
          hippo
            .newMashupExhaler()
            // 4.3.2 機台當下廠務部稼動記錄表
            .space('HUL_factory_service_utilization_edit:fsue')
            .index('order_id', orderIdList)
            .index('machine_id', machineIdList)
            .index('multi_process', multiProcessList)
            .column('fsue', 'multi_process')
            .column('fsue', 'product_name')
            .column('fsue', 'order_id')
            .column('fsue', 'pg_name')
            .column('fsue', 'std_second')
            .column('fsue', 'shift_production_capacity')
            .column('fsue', 'manage_id')
            .column('fsue', 'quantity')
            .column('fsue', 'machine_id')
            .column('fsue', 'quality_utilizations')
            .column('fsue', 'n8')
            .column('fsue', 'residue')

            // 4.2.11 產品廠務部稼動紀錄表查詢
            .space('HUL_factory_service_utilization:fsu')
            .index('order_id', orderIdList)
            .index('machine_id', machineIdList)
            .index('multi_process', multiProcessList)
            .column('fsu', 'product_type')
            .column('fsu', 'reserved_width')
            .column('fsu', 'material')
            .column('fsu', 'comment')
            .column('fsu', 'clean_time')
            .column('fsu', 'follow_up')

            // 廠務部稼動材料子表
            .space('HUL_factory_service_material:fsm')
            .index('order_id', orderIdList)
            .index('machine_id', machineIdList)
            .index('multi_process', multiProcessList)
            .column('fsm', 'machine_id')
            .column('fsm', 'order_id')
            .column('fsm', 'multi_process')
            .column('fsm', 'purchase_id')
            .column('fsm', 'material_weight')
            .column('fsm', 'supplier')

            // 廠務部稼動班次明細子表
            .space('HUL_factory_service_shift_detail:fssd')
            .index('order_id', orderIdList)
            .index('machine_id', machineIdList)
            .index('multi_process', multiProcessList)
            .column('fssd', 'machine_id')
            .column('fssd', 'order_id')
            .column('fssd', 'multi_process')
            .column('fssd', 'date')
            .column('fssd', 'work_shift_name')
            .column('fssd', 'accumulated_partcount')
            .column('fssd', 'care_partcount')
            .column('fssd', 'shift_partcount')
            .column('fssd', 'quality_utilization')
            .column('fssd', 'examination_defective')
            .column('fssd', 'defective_reason')
            .column('fssd', 'macro521')
            .column('fssd', 'macro')
            .column('fssd', 'repair_code')
            .column('fssd', 'clean_record')

            .mashupKey('multi_process')

            .exhale(function (exhalable) {
              console.log(exhalable.exhalable)

              if (_.keys(exhalable.exhalable).length) {
                exhalable.each(function (data, multi_process) {
                  var $tabId = context.addTab(multi_process[0])
                  context.renderInfoTable(
                    _.extend(data.fsue[0], data.fsu[0]),
                    $tabId
                  )
                  context.renderMaterialTable(data.fsm, $tabId)
                  context.renderDetailTable(data.fssd, $tabId)

                  context.bindDownloadExcel($tabId, data)
                })
              } else {
                $.smallBox({
                  sound: false, // 不要音效
                  title:
                    'ERP資料未匯入 或 生產指令Macro未輸入於機台控制器 或 N6格式錯誤',
                  content:
                    "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
                  color: servkit.colors.red,
                  icon: 'fa fa-times',
                  timeout: 10000,
                })
              }

              if (
                context.editProcess &&
                context.$widgetTab.find(
                  'a[href=#process' + context.editProcess + ']'
                ).length
              ) {
                context.$widgetTab
                  .find('a[href=#process' + context.editProcess + ']')
                  .click()
              } else {
                context.$widgetTab.find('a:first').click()
              }

              context.loadingBtn.done()
            })
        } catch (e) {
          console.warn(e)
        }
      },
      addTab: function (multi_process) {
        var tabId = 'process' + multi_process
        this.$widgetTab.append(
          '<li>' +
            '<a data-toggle="tab" href="#' +
            tabId +
            '" aria-expanded="false">' +
            ' <span class="hidden-mobile hidden-tablet"> ' +
            (multi_process === '---' ? '---' : multi_process + '次製程') +
            '</span></a>' +
            '</li>'
        )

        this.$tabContent.append($(this.tabTemplate).clone().attr('id', tabId))
        return $('#' + tabId)
      },
      renderInfoTable: function (tableData, $tabId) {
        //      tableData = tableData || {
        //        "product_type": "汽機車",
        //        "product_name": "C172 DRV Ring (AL)",
        //        "order_id": "GM160818004",
        //        "pg_name": "O0202",
        //        "std_second": "10S, 20S, 21.5S/18S",
        //        "shift_production_capacity": "128 pcs",
        //        "manage_id": "0A246-00",
        //        "quantity": "300",
        //        "machine_id": "_HULPLATFORM01D01M01",
        //        "quality_utilizations": "90%, 87%, 93%",
        //        "reserved_width": "22 mm",
        //        "material": "鐵12L14",
        //        "comment": "",
        //        "n8": "走刀式",
        //        "residue": "200mm",
        //        "clean_time": "每 4 日洗  前  夾頭一次",
        //        "follow_up": "大略清洗 → 洗淨入庫,入庫 → 洗淨入庫"
        //      };
        var context = this
        $tabId.find('.product_type').text(tableData.product_type)
        var $processInfoTable = $tabId.find('table[data-name=info-table]')
        _.each(_.keys(tableData), function (key) {
          if (key == 'machine_id') {
            $processInfoTable
              .find('.machine_name')
              .text(servkit.getMachineName(tableData.machine_id))
          } else if (key == 'follow_up') {
            $processInfoTable
              .find('.follow_up')
              .html(tableData.follow_up.replace(/,/g, ',<br>'))
          } else if (key == 'order_id') {
            $processInfoTable
              .find('.order_id')
              .html(
                context.commons.getOrderId(
                  tableData.order_id,
                  context.preCon.getProductList
                )
              )
          } else {
            $processInfoTable.find('.' + key).text(tableData[key])
          }
        })
      },
      renderMaterialTable: function (tableData, $tabId) {
        //      tableData = tableData || [
        //        {
        //          "purchase_id": "151210004P/40A 2015/12/11",
        //          "material_weight": "0.2KG",
        //          "supplier": "聯岱"
        //        },
        //        {
        //          "purchase_id": "151210005P/40A 2015/12/30",
        //          "material_weight": "1.0KG",
        //          "supplier": "聯岱"
        //        }
        //      ];
        var context = this
        var tableHtml = [
          '<tbody>' +
            '<tr>' +
            '<th class="gray-th">材料採購單號</th>' +
            '<th class="gray-th">材料需求</th>' +
            '<th class="gray-th">材料商</th>' +
            '</tr>',
        ]
        _.each(tableData, function (materialObj) {
          tableHtml.push(
            '<tr>' +
              '<td class="purchase_id">' +
              materialObj.purchase_id +
              '</td>' +
              '<td class="material_weight">' +
              materialObj.material_weight +
              '</td>' +
              '<td class="supplier">' +
              materialObj.supplier +
              '</td>' +
              '</tr>'
          )
        })
        $tabId.find('table[data-name=material-table]').html(tableHtml.join(''))
      },
      renderDetailTable: function (tableData, $tabId) {
        //      tableData = tableData || [
        //        {
        //          "date": "2016/02/03", //日期
        //          "work_shift_name": "A",
        //          "accumulated_partcount": "126", //累積工作數
        //          "care_partcount": "126", //實際產量
        //          "shift_partcount": "128", //該班產能
        //          "quality_utilization": "98.44%", //品質稼動率
        //          "examination_defective": "4", //異常品數量(例檢不良品)
        //          "defective_reason": "溝實小 *3<br>總長短少 *1", //異常發生之原因
        //          "macro521": "00012", //顧車人員
        //          "macro": "08:29 改車中 <br>" +
        //              "08:30 首件ok <br>" +
        //              "08:43 量產中 <br>" +
        //              "08:53 故障待修 <br>" +
        //              "08:56 維修中 <br>" +
        //              "09:00 夾治具問題、刀具研磨 <br>" +
        //              "11:00 量產中", //Macro狀態
        //          "repair_code": "08:56~11:00 後修刀_刀片*1", //維修記錄
        //          "clean_record": "" //夾頭清洗記錄
        //        },
        //        {
        //          "date": "2016/02/03", //日期
        //          "work_shift_name": "B",
        //          "accumulated_partcount": "249", //累積工作數
        //          "care_partcount": "123", //實際產量
        //          "shift_partcount": "128", //該班產能
        //          "quality_utilization": "98.37%", //品質稼動率
        //          "examination_defective": "2", //異常品數量(例檢不良品)
        //          "defective_reason": "外觀 NG*2", //異常發生之原因
        //          "macro521": "00032", //顧車人員
        //          "macro": "16:01 量產中  <br>" +
        //              "18:35 故障待修  <br>" +
        //              "18:38 維修中  <br>" +
        //              "18:45 設備故障排除  <br>" +
        //              "19:00 量產中  <br>" +
        //              "20:00 故障待修  <br>" +
        //              "20:03 維修中 <br>" +
        //              "20:10 修改程式 <br>" +
        //              "20:18 量產中", //維修記錄
        //          "repair_code": "", //維修記錄
        //          "clean_record": "" //夾頭清洗記錄
        //        }
        //      ];

        if (!_.isEmpty(tableData)) {
          var context = this
          var tableHtml = [
            '<tbody>' +
              '<tr>' +
              '<th class="gray-th">日期</th>' +
              '<th class="gray-th">班次</th>' +
              '<th class="gray-th">累積工作數</th>' +
              '<th class="gray-th">實際產量</th>' +
              '<th class="gray-th">生產效率(實/該班)</th>' +
              '<th class="gray-th">品質稼動率</th>' +
              '<th class="gray-th">異常品數量</th>' +
              '<th class="gray-th">異常發生之原因</th>' +
              '<th class="gray-th">顧車人員</th>' +
              '<th class="gray-th">Macro狀態</th>' +
              '<th class="gray-th">維修紀錄</th>' +
              '<th class="gray-th">夾頭清洗紀錄</th>' +
              '</tr>',
          ]
          var accumulated_partcount = 0

          var startDate = _.min(tableData, function (elem) {
            return elem.date
          }).date.date8BitsToSlashed()
          var endDate = _.max(tableData, function (elem) {
            return elem.date
          }).date.date8BitsToSlashed()

          // 於維修記錄維護輸入的維修項目 到DB查
          context.repairItemMap = undefined
          context.getRepairItems(startDate, endDate)
          servkit
            .politeCheck()
            .until(function () {
              return !_.isUndefined(context.repairItemMap)
            })
            .thenDo(function () {
              _.each(tableData, function (detailObj) {
                accumulated_partcount += parseInt(detailObj.care_partcount)
                var macroDescriptionAry = context.getMacroDescription(
                  detailObj.macro
                )
                // 夾頭清洗記錄: 該班有出現Macro522=105(洗夾頭)
                var clean_record = _.filter(macroDescriptionAry, function (
                  macroDescription
                ) {
                  try {
                    return macroDescription.split(' ')[1] == '105'
                  } catch (e) {
                    console.warn(macroDescription)
                    return false
                  }
                })
                var key = [
                  detailObj.date,
                  detailObj.work_shift_name,
                  detailObj.macro521,
                ].join('@@')
                tableHtml.push(
                  '<tr>' +
                    /* 日期 */ '<td>' +
                    detailObj.date +
                    '</td>' +
                    /* 班次 */ '<td>' +
                    detailObj.work_shift_name +
                    '</td>' +
                    /* 累積工作數 */ '<td>' +
                    accumulated_partcount +
                    '</td>' +
                    /* 實際產量 */ '<td>' +
                    detailObj.care_partcount +
                    '</td>' +
                    /* 生產效率(實/該班) */ '<td>' +
                    (
                      detailObj.care_partcount / detailObj.shift_partcount
                    ).floatToPercentage() +
                    '</td>' +
                    // 該班次該訂單，總QC後良品數量/總機台實際生產產量
                    /* 品質稼動率 */ '<td>' +
                    detailObj.quality_utilization +
                    '%</td>' +
                    /* 異常品數量 */ '<td>' +
                    detailObj.examination_defective +
                    '</td>' +
                    /* 異常發生之原因 */ '<td>' +
                    detailObj.defective_reason +
                    '</td>' +
                    /* 顧車人員 */ '<td>' +
                    context.commons.getUserName(
                      context.preCon.getUserList,
                      detailObj.macro521
                    ) +
                    '</td>' +
                    /* Macro狀態 */ '<td>' +
                    macroDescriptionAry.join('</br>') +
                    '</td>' +
                    /* 維修紀錄 */ '<td>' +
                    (context.repairItemMap[key] || '') +
                    '</td>' +
                    /* 夾頭清洗紀錄 */ '<td>' +
                    clean_record.join('</br>') +
                    '</td>' +
                    /**/ '</tr>'
                )
              })

              $tabId
                .find('table[data-name=detail-table]')
                .html(tableHtml.join(''))
            })
            .tryDuration(0)
            .start()
        }
      },
      getMacroDescription: function (detailObjMacro) {
        var context = this
        var lastMacro = ''
        return _.map(_.initial(detailObjMacro.split('</br>')), function (
          time_macro
        ) {
          // HH:mm macro
          var macro = time_macro.split(' ')[1]
          var macroDescription = '---'
          if (lastMacro == '301' && macro == '100') {
            // 該班次該機台該訂單，所有輸入的Macro522狀態, 其中如果301有接著按100，301顯示「首件ok」
            macroDescription = '首件OK'
          } else {
            macroDescription = context.preCon.downtimeCode[macro] || '---'
          }
          lastMacro = macro
          return time_macro + ' (' + macroDescription + ')'
        })
      },
      getRepairItems: function (startDate, endDate) {
        var context = this
        servkit.ajax(
          {
            url: 'api/huangliang/repair/read',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              startDate: startDate,
              endDate: endDate,
              machineIds: [context.machineId],
            }),
          },
          {
            success: function (data) {
              context.repairItemMap = {}
              try {
                var grouped_repair_records = _.chain(data)
                  .filter(function (elem) {
                    // 只要有維修項目的
                    return elem.repair_item.length
                  })
                  .groupBy(function (elem) {
                    // 日期，班次，顧車人員(未補足5碼)
                    return [
                      elem.alarm_time.substr(0, 10).replace(/\//g, ''),
                      elem.work_shift,
                      context.commons.fillZeroTo5Digit(elem.care_emp_id),
                    ].join('@@')
                  })
                  .value()
                /*
                 * grouped_repair_records = {
                 *   20170206@@A@@00312: [ //repair_records
                 *   { //record  => 15:56 ~ 03:00 切刀*2
                 *     act_repair_emp_id: "312",
                 *     alarm_code: "-1",
                 *     alarm_time: "2017/02/06 11:07:04",
                 *     care_emp_id: "312",
                 *     end_time: "2017/02/06 12:03:00",
                 *     machine_id: "_HULPLATFORM01D01M123",
                 *     notify_time: "2017/02/06 11:07:04",
                 *     repair_emp_id: "00501",
                 *     repair_item: [{
                 *       alarm_time: "2017/02/06 11:07:04",
                 *       count: 2,
                 *       create_by: "huangliang",
                 *       create_time: "Feb 15, 2017 10:13:17 AM",
                 *       is_updated: 0,
                 *       machine_id: "_HULPLATFORM01D01M123",
                 *       repair_code: "101"
                 *     }, ...],
                 *     repair_status: [{}, ...],
                 *     start_time: "2017/02/06 11:15:56",
                 *     work_shift: "A"
                 *   },
                 *   ...], ...
                 * }
                 * */
                // 有可能一個班次同一個顧車人員發生兩次警報?目前還沒有看到  但照規則是有可能的
                _.each(grouped_repair_records, function (
                  repair_records,
                  date_workShift_careEmpId
                ) {
                  context.repairItemMap[date_workShift_careEmpId] = _.map(
                    repair_records,
                    function (record) {
                      var startTime = record.start_time.substr(11, 5) || '---'
                      var endTime = record.end_time.substr(11, 5) || '---'
                      return (
                        startTime +
                        ' ~ ' +
                        endTime +
                        '<br>' +
                        _.map(record.repair_item, function (repair_item) {
                          return (
                            context.preCon.repairCode[repair_item.repair_code] +
                            ' * ' +
                            repair_item.count
                          )
                        }).join(' |</br>')
                      )
                    }
                  ).join(' </br>')
                })
              } catch (e) {
                console.warn(e)
              }
            },
          }
        )
      },
      preloadData: function ($clickedTabContent) {
        var context = this

        // clear data
        context.$modal.find(':input:not(:radio)').val('').removeAttr('checked')

        // preload data
        context.$modal
          .find('.multi_process')
          .text(context.$widgetTab.find('li.active').find('a').text())

        var product_type = $clickedTabContent.find('.product_type').text()
        if (product_type) {
          context.$modal
            .find(':radio[value=' + product_type + ']')
            .prop('checked', 'checked')
        }

        // info
        var infoTableHtml = $clickedTabContent
          .find('table[data-name=info-table]')
          .html()
        var reservedWidth = $(infoTableHtml)
          .find('.reserved_width')
          .text()
          .replace('mm', '')
        var material = $(infoTableHtml).find('.material').text()
        var comment = $(infoTableHtml).find('.comment').text()
        var cleanTimeArray = $(infoTableHtml)
          .find('.clean_time')
          .text()
          .replace('每 ', '')
          .replace(' 日洗 ', ',')
          .replace(' 夾頭一次', '')
          .split(',')
        context.$modalInfoTable
          .html(infoTableHtml)
          .find('.follow_up')
          .prev()
          .prev()
          .nextAll()
          .remove()
        context.$modalInfoTable
          .find('.reserved_width')
          .html('<input type="textbox" size="4" value="' + reservedWidth + '">') // 單工件+切刀寬+預留量
          .end()
          .find('.material')
          .html('<input type="textbox" size="10" value="' + material + '">') // 材質
          .end()
          .find('.comment')
          .html(
            '<input type="textbox" placeholder="備註" size="10" value="' +
              comment +
              '" >'
          ) // 註解
          .end()
          .find('.clean_time')
          .attr('colspan', 3)
          .html(
            '每<input type="textbox" name="day" size="2" value="' +
              cleanTimeArray[0] +
              '">日洗' +
              '<input type="checkbox" name="position" value="前" ' +
              (_.contains(cleanTimeArray[1], '前') ? 'checked="checked"' : '') +
              '>前' +
              '<input type="checkbox" name="position" value="後" ' +
              (_.contains(cleanTimeArray[1], '後') ? 'checked="checked"' : '') +
              '>後夾頭一次'
          ) // 清洗時間

        // follow-up
        _.each($(infoTableHtml).find('.follow_up').text().split(','), function (
          followUp,
          index
        ) {
          context.$followUpSelect
            .find('.follow-up')
            .eq(index)
            .find('select:first')
            .val(followUp.split(' → ')[0])
            .end()
            .find('select:last')
            .val(followUp.split(' → ')[1])
        })

        // material
        var $materialTable = $clickedTabContent.find(
          'table[data-name=material-table]'
        )
        _.each($materialTable.find('tr'), function (tr, index) {
          context.$modalMaterialTable
            .find('tr')
            .eq(index)
            .find('.purchase_id')
            .val($(tr).find('.purchase_id').text())
            .end()
            .find('.material_weight')
            .val($(tr).find('.material_weight').text().split(' ')[0])
            .end()
            .find('.material_unit')
            .val($(tr).find('.material_weight').text().split(' ')[1])
            .end()
            .find('.supplier')
            .val($(tr).find('.supplier').text())
        })
      },
      saveData: function () {
        var context = this
        var multiprocess = context.$modal
          .find('.multi_process')
          .text()
          .replace('次製程', '')
          .trim()
        multiprocess =
          multiprocess == '---' ? multiprocess : multiprocess.substring(0, 1)
        context.editProcess = multiprocess
        var cleanTime = ''
        var day = context.$modalInfoTable
          .find('.clean_time')
          .find('[name=day]')
          .val()
        //      var position = context.$modalInfoTable.find('.clean_time').find(':checked').val().join('');
        var position = _.map($('[name=position]:checked'), function (elem) {
          return elem.value
        }).join('')
        if (day && parseFloat(day) && position) {
          cleanTime =
            '每 ' +
            day +
            ' ' +
            context.$modalInfoTable
              .find('.clean_time')
              .text()
              .replace('每', '')
              .replace('前後', ' ' + position + ' ')
        } else {
          alert('清洗時間輸入不正確，請確認！')
          return false
        }

        var followUp = []
        _.each(context.$modal.find('.follow-up'), function (p, index) {
          var step1 = $(p).find('select:first').val()
          var step2 = $(p).find('select:last').val()
          if (step1 && step2) {
            followUp.push(step1 + ' → ' + step2)
          }
        })

        // HUL_factory_service_utilization
        var inhalerFSU = hippo.newInhaler()
        inhalerFSU
          .space('HUL_factory_service_utilization')
          .index('order_id', context.orderId)
          .index('machine_id', context.machineId)
          .index('multi_process', multiprocess)

          .put('multi_process', multiprocess)
          .put(
            'product_type',
            context.$modal.find('[name=product_type]:checked').val() || ''
          )
          .put(
            'product_name',
            context.$modalInfoTable.find('.product_name').text()
          )
          .put('order_id', context.orderId)
          .put('pg_name', context.$modalInfoTable.find('.pg_name').text())
          .put('std_second', context.$modalInfoTable.find('.std_second').text())
          .put(
            'shift_production_capacity',
            context.$modalInfoTable.find('.shift_production_capacity').text()
          )
          .put('manage_id', context.$modalInfoTable.find('.manage_id').text())
          .put('quantity', context.$modalInfoTable.find('.quantity').text())
          .put('machine_id', context.machineId)
          .put(
            'quality_utilizations',
            context.$modalInfoTable.find('.quality_utilizations').text()
          )
          .put(
            'reserved_width',
            context.$modalInfoTable.find('.reserved_width').find('input').val()
          )
          .put(
            'material',
            context.$modalInfoTable.find('.material').find('input').val()
          )
          .put(
            'comment',
            context.$modalInfoTable.find('.comment').find('input').val()
          )
          .put('n8', context.$modalInfoTable.find('.n8').text())
          .put('residue', context.$modalInfoTable.find('.residue').text())
          .put('clean_time', cleanTime)
          .put('follow_up', followUp.join(','))
          .next()

        // HUL_factory_service_material
        var inhalerFSM = hippo.newInhaler()
        inhalerFSM
          .space('HUL_factory_service_material')
          .index('order_id', context.orderId)
          .index('machine_id', context.machineId)
          .index('multi_process', multiprocess)

        _.each(context.$modalMaterialTable.find('tr'), function (tr, index) {
          if ($(tr).find('.purchase_id').val() != '' && index != 0) {
            var materialWeight =
              $(tr).find('.material_weight').val() +
              ' ' +
              $(tr).find('.material_unit').val()

            inhalerFSM
              .put('machine_id', context.machineId)
              .put('order_id', context.orderId)
              .put('multi_process', multiprocess)
              .put('purchase_id', $(tr).find('.purchase_id').val())
              .put('material_weight', materialWeight)
              .put('supplier', $(tr).find('.supplier').val())
              .next()
          }
        })

        try {
          inhalerFSU.inhale(function () {})

          inhalerFSM.inhale(function () {
            context.$modal.modal('hide')
            // reload data
            context.$submitBtn.click()
            // context.loadingBtnEdit.done();
          })
        } catch (e) {
          console.warn(e)
        }
      },
      bindDownloadExcel: function ($tab, data) {
        servkit.downloadCustomizedExcel(
          $tab.find('[name=download-excel]'),
          function () {
            return {
              templateName: 'HuangLiangFactoryServiceUtilization',
              fileName:
                'HuangLiangFactoryServiceUtilization_' +
                moment().format('YYYYMMDDHHmmss'),
              matrices: [
                {
                  x: 1,
                  y: 0,
                  data: [
                    [
                      $('#widget-tab').find('li.active').text().trim() || '',
                      $tab.find('.product_type').text() || '',
                    ],
                  ],
                  format: ['text', 'text'],
                },
                {
                  x: 1,
                  y: 1,
                  data: _.map(
                    $tab.find('table[data-name=info-table]').find('tr'),
                    function (tr, row) {
                      return _.map($(tr).find('td, th'), function (td, col) {
                        if (row == 2 && col == 1) {
                          return (
                            $(td).find('.material').text() +
                            '\n' +
                            $(td).find('.comment').text()
                          )
                        } else {
                          return $(td).html().replace(/<br>/g, '\n')
                        }
                      })
                    }
                  ),
                  format: _.times(10, function (n) {
                    return 'text'
                  }),
                },
                {
                  x: 1,
                  y: 6,
                  data: _.map(
                    $tab
                      .find('table[data-name=material-table]')
                      .find('tr:not(:first)'),
                    function (tr) {
                      return _.map($(tr).find('td'), function (td) {
                        return $(td).text()
                      })
                    }
                  ),
                  format: ['text', 'text', 'text'],
                },
                {
                  x: 1,
                  y: 13,
                  data: _.map(
                    $tab
                      .find('table[data-name=detail-table]')
                      .find('tr:not(:first)'),
                    function (tr) {
                      return _.map($(tr).find('td'), function (td) {
                        return $(td).html().replace(/<br>/g, '\n')
                      })
                    }
                  ),
                  format: _.times(12, function () {
                    return 'text'
                  }),
                },
              ],
            }
          }
        )
      },
      initFollowupWorkSelect: function () {
        var context = this,
          options = '<option></option>',
          data = Object.values(context.preCon.followupWork)
        _.each(data, function (followup_work_name) {
          let option = `<option value="${followup_work_name}">${followup_work_name}</option>`
          options += option
        })
        _.each($('#follow-up>div'), function (div, index) {
          let elements = '',
            i = index * 5 + 1,
            max = i + 5
          for (; i < max; i++) {
            elements += `<p class="follow-up">${i + (i === 10 ? '' : ' .')}
            <select>${options}</select>
            &nbsp;→&nbsp;
            <select>${options}</select></p>`
          }
          $(div).append(elements)
        })
      },
    },
    preCondition: {
      getUserList: function (done) {
        this.commons.getUserList(done)
      },
      getProductList: function (done) {
        this.commons.getProductList(done)
      },
      getSampleList: function (done) {
        this.commons.getSampleList(done)
      },
      downtimeCode: function (done) {
        servkit.ajax(
          {
            url: 'api/downtimeCode/read',
            type: 'GET',
            contentType: 'application/json',
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
      repairCode: function (done) {
        servkit.ajax(
          {
            url: 'api/repairCode/read',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var repairCode = _.reduce(
                data,
                function (memo, elem) {
                  memo[elem.repair_code] = elem.repair_code_name
                  return memo
                },
                {}
              )
              done(repairCode)
            },
          }
        )
      },
      followupWork: function (done) {
        servkit.ajax(
          {
            url:
              'api/stdcrud?tableModel=com.servtech.servcloud.app.model.huangliang.FollowupWork',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              var followupWork = _.reduce(
                data,
                function (memo, elem) {
                  memo[elem.followup_work_id] = elem.followup_work_name
                  return memo
                },
                {}
              )
              done(followupWork)
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
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
