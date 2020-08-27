export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // 因為他只要查訂單的管編 所以不要把樣品的管編也放進autoComplete
      context.$manageId.autocomplete({
        source: _.uniq(_.pluck(context.preCon.getProductList, 'standard_id')),
      })
      context.clearTabs()

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        $('#order-widget').find('.fa-plus').click()
        context.getOrders()
        context.clearTabs()
      })

      context.$orderTable.on('click', '.btn', function (evt) {
        evt.preventDefault()
        console.log($(this).attr('data-macro'))

        context.loadingBtn.doing()
        context.clearTabs()
        context.getData($(this).attr('data-macro'))
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$manageId.val('')
        context.$submitBtn.click()
      })
    },
    util: {
      $manageId: $('#manage_id'),
      $orderTable: $('#order-table'),
      $widgetTab: $('#widget-tab'),
      $tabContent: $('#tab-content'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),

      widgetBodyToolbarHtml: $('#process1')
        .find('.widget-body-toolbar')
        .clone(),
      infoTableHtml: $('#process1').find('table[data-name=info-table]').clone(),
      materialTableHtml: $('#process1')
        .find('table[data-name=material-table]')
        .clone(),
      detailTableHtml: $('#process1')
        .find('table[data-name=detail-table]')
        .clone(),

      repairItemMap: {}, // repairItemMap[machineId][YYYYMMDD@@work_shift@@care_emp_id]="HH:mm~HH:mm repair_code_name*count|repair_code_name*count..."
      orderId: '',

      clearTabs: function () {
        this.$widgetTab.empty()
        this.$tabContent.empty()
      },
      getOrders: function () {
        var context = this
        var manageId = context.$manageId.val()
        var orderObjList = _.filter(context.preCon.getProductList, function (
          productObj
        ) {
          return productObj.standard_id == manageId
        })
        if (orderObjList.length != 0) {
          var tableHtml = ['<tbody class="text-center">']
          _.each(orderObjList, function (orderObj, index) {
            if (index == 0) {
              tableHtml.push('<tr>')
            } else if (index % 4 == 0) {
              tableHtml.push('</tr><tr>')
            }
            tableHtml.push(
              '<td><a class="btn btn-primary" data-macro="' +
                orderObj.macro523 +
                '">' +
                orderObj.order_id +
                '</a></td>'
            )
          })

          var tdCount = orderObjList.length
          while (tdCount % 4 != 0) {
            tableHtml.push('<td></td>')
            tdCount++
          }
          tableHtml.push('</tr></tbody>')

          context.$orderTable.html(tableHtml.join(''))
        } else {
          $.smallBox({
            sound: false, // 不要音效
            title: 'ERP資料未匯入',
            content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
            color: servkit.colors.red,
            icon: 'fa fa-times',
            timeout: 4000,
          })
        }
      },
      getData: function (n7macro523) {
        var loadingBtn = this.loadingBtn,
          context = this,
          machineIdList = servkit.getMachineList(),
          orderIdList = [n7macro523],
          multiProcessList = _.range(1, 11)
        multiProcessList.push('---')

        //取得所有機台該訂單所有製程資料
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

            .mashupKey('multi_process', 'machine_id')

            .exhale(function (exhalable) {
              console.log(exhalable.exhalable)

              if (_.keys(exhalable.exhalable).length) {
                exhalable.each(function (data, groupKeys) {
                  var $tabId = context.addTab(groupKeys[0])
                  var machineId = groupKeys[1]
                  context.renderInfoTable(
                    _.extend(data.fsue[0], data.fsu[0]),
                    $tabId,
                    machineId
                  )
                  context.renderMaterialTable(data.fsm, $tabId, machineId)
                  context.renderDetailTable(data.fssd, $tabId, machineId)

                  context.bindDownloadExcel(
                    $tabId.find('[name=download-excel]:last'),
                    data
                  )
                })
              } else {
                $.smallBox({
                  sound: false, // 不要音效
                  title: 'ERP資料未匯入或生產指令Macro未輸入於機台控制器',
                  content:
                    "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
                  color: servkit.colors.red,
                  icon: 'fa fa-times',
                  timeout: 4000,
                })
              }

              context.$widgetTab.find('a:first').click()
              context.loadingBtn.done()
            })
        } catch (e) {
          console.warn(e)
        }
      },
      addTab: function (multi_process) {
        var tabId = 'process' + multi_process
        var $tab = $('#' + tabId)

        if ($tab.length) {
          $tab.append('<legend></legend>')
          return $tab
        } else {
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

          $tab = $('<div class="tab-pane fade" id="' + tabId + '"></div>')
          this.$tabContent.append($tab)
          return $tab
        }
      },
      renderInfoTable: function (tableData, $tabId, machineId) {
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
        var $widgetToolBar = $(context.widgetBodyToolbarHtml.clone())
        $widgetToolBar.find('.product_type').text(tableData.product_type)
        $tabId.append($widgetToolBar)

        var $infoTable = $(context.infoTableHtml.clone()).attr(
          'data-machine-id',
          machineId
        )
        _.each(_.keys(tableData), function (key) {
          if (key == 'machine_id') {
            $infoTable
              .find('.machine_name')
              .text(servkit.getMachineName(tableData.machine_id))
          } else if (key == 'follow_up') {
            $infoTable
              .find('.follow_up')
              .html(tableData.follow_up.replace(/,/g, ',<br>'))
          } else if (key == 'order_id') {
            $infoTable
              .find('.order_id')
              .html(
                context.commons.getOrderId(
                  tableData.order_id,
                  context.preCon.getProductList
                )
              )
          } else {
            $infoTable.find('.' + key).text(tableData[key])
          }
        })
        $tabId.append($infoTable)
      },
      renderMaterialTable: function (tableData, $tabId, machineId) {
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
        var $materialTable = $(context.materialTableHtml.clone()).attr(
          'data-machine-id',
          machineId
        )
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

        $tabId.append($materialTable.html(tableHtml.join('')))
      },
      renderDetailTable: function (tableData, $tabId, machineId) {
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
          var $detailTable = $(context.detailTableHtml.clone()).attr(
            'data-machine-id',
            machineId
          )
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

          //於維修記錄維護輸入的維修項目 到DB查
          //因為request 回來的順序不定 所以要每個機台自己一個repairItemMap
          context.repairItemMap[machineId] = undefined
          context.getRepairItems(startDate, endDate, machineId)
          servkit
            .politeCheck()
            .until(function () {
              return !_.isUndefined(context.repairItemMap[machineId])
            })
            .thenDo(function () {
              console.log(context.repairItemMap)
              _.each(tableData, function (detailObj) {
                accumulated_partcount += parseInt(detailObj.care_partcount)
                var macroDescriptionAry = context.getMacroDescription(
                  detailObj.macro
                )
                //夾頭清洗記錄: 該班有出現Macro522=105(洗夾頭)
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
                    /*日期 */ '<td>' +
                    detailObj.date +
                    '</td>' +
                    /* 班次*/ '<td>' +
                    detailObj.work_shift_name +
                    '</td>' +
                    /* 累積工作數*/ '<td>' +
                    accumulated_partcount +
                    '</td>' +
                    /* 實際產量*/ '<td>' +
                    detailObj.care_partcount +
                    '</td>' +
                    /*生產效率(實/該班) */ '<td>' +
                    (
                      detailObj.care_partcount / detailObj.shift_partcount
                    ).floatToPercentage() +
                    '</td>' +
                    // 該班次該訂單，總QC後良品數量/總機台實際生產產量
                    /*品質稼動率 */ '<td>' +
                    detailObj.quality_utilization +
                    '%</td>' +
                    /* 異常品數量*/ '<td>' +
                    detailObj.examination_defective +
                    '</td>' +
                    /* 異常發生之原因*/ '<td>' +
                    detailObj.defective_reason +
                    '</td>' +
                    /* 顧車人員*/ '<td>' +
                    (context.preCon.getUserList[detailObj.macro521] || '') +
                    '</td>' +
                    /*Macro狀態 */ '<td>' +
                    macroDescriptionAry.join('</br>') +
                    '</td>' +
                    /*維修紀錄 */ '<td>' +
                    (context.repairItemMap[machineId][key] || '') +
                    '</td>' +
                    /*夾頭清洗紀錄 */ '<td>' +
                    clean_record.join('</br>') +
                    '</td>' +
                    /**/ '</tr>'
                )
              })

              $tabId
                .find(
                  '[data-name=material-table][data-machine-id=' +
                    machineId +
                    ']'
                )
                .after($detailTable.html(tableHtml.join('')))
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
      getRepairItems: function (startDate, endDate, machineId) {
        var context = this
        servkit.ajax(
          {
            url: 'api/huangliang/repair/read',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              startDate: startDate,
              endDate: endDate,
              machineIds: [machineId],
            }),
          },
          {
            success: function (data) {
              context.repairItemMap[machineId] = {}
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
                //有可能一個班次同一個顧車人員發生兩次警報?目前還沒有看到  但照規則是有可能的
                _.each(grouped_repair_records, function (
                  repair_records,
                  date_workShift_careEmpId
                ) {
                  context.repairItemMap[machineId][
                    date_workShift_careEmpId
                  ] = _.map(repair_records, function (record) {
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
                  }).join(' </br>')
                })
              } catch (e) {
                console.warn(e)
              }
            },
          }
        )
      },
      bindDownloadExcel: function ($excelBtn, data) {
        servkit.downloadCustomizedExcel($excelBtn, function () {
          var $infoTable = $excelBtn.closest('.widget-body-toolbar').next()
          var $materialTable = $infoTable.next()
          var $detailTable = $materialTable.next()

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
                    $excelBtn
                      .closest('.widget-body-toolbar')
                      .find('.product_type')
                      .text() || '',
                  ],
                ],
                format: ['text', 'text'],
              },
              {
                x: 1,
                y: 1,
                data: _.map($infoTable.find('tr'), function (tr, row) {
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
                }),
                format: _.times(10, function (n) {
                  return 'text'
                }),
              },
              {
                x: 1,
                y: 6,
                data: _.map($materialTable.find('tr:not(:first)'), function (
                  tr
                ) {
                  return _.map($(tr).find('td'), function (td) {
                    return $(td).text()
                  })
                }),
                format: ['text', 'text', 'text'],
              },
              {
                x: 1,
                y: 13,
                data: _.map($detailTable.find('tr:not(:first)'), function (tr) {
                  return _.map($(tr).find('td'), function (td) {
                    return $(td).html().replace(/<br>/g, '\n')
                  })
                }),
                format: _.times(12, function () {
                  return 'text'
                }),
              },
            ],
          }
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
