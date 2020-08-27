export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [5, 6, 7, 8, 9, 10],
        excel: {
          fileName: 'CustomerSampleAnalysis',
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
          ],
        },
      })

      context.$manageId.autocomplete({
        source: _.pluck(context.preCon.getSampleList, 'sample_id'),
      })
      context.$customer.autocomplete({
        source: _.uniq(_.pluck(context.preCon.getSampleList, 'customer_id')),
      })
      context.groupedSampleList = _.groupBy(
        context.preCon.getSampleList,
        'macro523'
      )

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()

        try {
          context.loadingBtn.doing()
          var manageIdList = context.getManageIdList()
          context.getDBData(manageIdList)
          context.getHippoData(manageIdList)

          //          context.getData();
          servkit
            .politeCheck()
            .until(function () {
              return context.DBData && context.hippoData
            })
            .thenDo(function () {
              context.processData()
            })
            .tryDuration(0)
            .start()
        } catch (e) {
          console.debug(e)
          context.loadingBtn.done()
        }
      })

      $('#showdemo').on('click', function (e) {
        e.preventDefault()
        context.$manageId.val('')
        context.$customer.val('')
        context.$submitBtn.click()
      })
    },
    util: {
      $manageId: $('#manage_id'),
      $customer: $('#customer'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      reportTable: undefined,
      DBData: undefined,
      hippoData: undefined,
      groupedSampleList: undefined,

      getManageIdList: function () {
        var manageIdList = [],
          manageId = this.$manageId.val(),
          customerId = this.$customer.val(),
          context = this
        //get customer id
        if (customerId == '' && manageId != '') {
          var sampleObj = _.find(context.preCon.getSampleList, function (elem) {
            return elem.sample_id == manageId
          })
          customerId = sampleObj ? [sampleObj.customer_id] : ''
          manageIdList.push(manageId) //if key in 608.009
        }

        //get manageIdList of the same customer
        var customerManageIdObjs = _.filter(
          context.preCon.getSampleList,
          function (sampleObj) {
            return sampleObj.customer_id == customerId
          }
        )

        _.each(customerManageIdObjs, function (obj) {
          manageIdList.push(obj.sample_id) //for db
          manageIdList.push(obj.macro523) //for hippo
          manageIdList.push(obj.macro523.substring(1)) //for silly
        })

        return _.uniq(manageIdList)
      },

      getDBData: function (manageIdList) {
        var context = this
        context.DBData = undefined
        if (manageIdList.length > 0) {
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
                  "manage_id in ( '" + manageIdList.join("','") + "' )",
              }),
            },
            {
              success: function (data) {
                context.DBData = data
                console.log(data)
              },
            }
          )
        } else {
          context.DBData = []
        }
      },
      getHippoData: function (manageIdList) {
        var context = this
        context.hippoData = undefined
        hippo
          .newSimpleExhaler()
          .space('HUL_sample_analysis')
          .index('machine_id', servkit.getMachineList())
          .index('manage_id', manageIdList)
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
            context.hippoData = exhalable.exhalable
          })
      },

      processData: function () {
        var context = this,
          sampleData = _.sortBy(
            context.DBData.concat(context.hippoData),
            'timestamp'
          )
        context.reportTable.drawTable(
          sampleData.map(function (data, groupedKey) {
            var sampleObj = context.commons.getOrderIdOrSampleId(
              {},
              context.groupedSampleList,
              data.manage_id
            )
            if (sampleObj.sample_id == '---') {
              sampleObj = {
                sample_id: data.manage_id,
                customer_id: data.manage_id.split('-')[1],
              }
            }

            return [
              //管編
              sampleObj.sample_id || '---',
              //客戶別
              sampleObj.customer_id || '---',
              //班次
              data.work_shift_name,
              //機台
              servkit.getMachineName(data.machine_id),
              //人員
              context.commons.getUserName(
                context.preCon.getUserList,
                data.employee_id
              ),
              //校車開始時間 : 計算基準以校車人員按Macro 300開始
              data.regulate_start_tsp.date20BitsToFormatted(),
              //生產開始時間 : 計算基準以校車人員按Macro 100開始
              data.produce_start_tsp.date20BitsToFormatted(),
              //生產結束時間 : 計算基準以校車人員按Macro 103開始
              data.produce_end_tsp.date20BitsToFormatted(),
              //校車時間 : 樣品生產時，校車人員校車時間總和-暫停(Macro522=305)
              context.getRegulateTime(data),
              //加工時間 : 樣品生產時(Macro522=100~103)，機台運轉時間總和
              data.produce_oper_ms.millisecondToHHmmss(),
              //樣品總時間 : 樣品生產結束時間-樣品生產開始時間-暫停(Macro522=105,215,305)
              context.getProduceTime(data),
              //總生產件數 : 樣品生產件數總計，(機台總生產數)從校車按Macro 300開始起算
              data.part_count + '件',
            ]
          })
        )
        context.loadingBtn.done()
      },

      //      getData: function () {
      //        var manageIdList = [],
      //            manageId = this.$manageId.val(),
      //            customerId = this.$customer.val(),
      //            loadingBtn = this.loadingBtn,
      //            context = this;
      //
      //        //客戶別 => 管編
      //        if (manageId != "") {
      //          var sampleObj = _.find(context.preCon.getSampleList, function (elem) {
      //            return elem.sample_id == manageId;
      //          });
      //          manageIdList = sampleObj ? [sampleObj.macro523] : [manageId];
      //        } else if (manageId == "" && customerId != "") {
      //          manageIdList = _.pluck(_.filter(context.preCon.getSampleList, function (sampleObj) {
      //            return sampleObj.customer_id == customerId;
      //          }), "macro523");
      //        }
      //        var manageIdListWithoutGorM = [];
      //        _.each(manageIdList, function (macro523) {
      //          if (macro523.startsWith("G") || macro523.startsWith("M")) {
      //            manageIdListWithoutGorM.push(macro523.substring(1));
      //          }
      //        });
      //        manageIdList = manageIdList.concat(manageIdListWithoutGorM);
      //        console.log(manageIdList);
      //
      //        /*//9/13 add
      //         servkit.ajax({
      //         url: "api/huangliang/sampleManageId/getAnalysisData",
      //         type: "GET",
      //         data: {
      //         manage_id: this.$manageId.val(),
      //         customer_id: this.$customer.val()
      //         }
      //         },
      //         {
      //         success: function (data) {
      //         dbData = data;
      //         //9/19 add
      //         console.log(data);
      //         var result = null;
      //         result = _.map(data, function (k, v) {
      //         return [
      //         k.manage_id,
      //         k.machine_id,
      //         k.regulate_start_tsp,
      //         k.regulate_tsp_sum,
      //         k.oper_millisecond_100,
      //         k.produce_tsp_sum_without_idle,
      //         k.partcount_sum
      //         ]
      //         });
      //         context.reportTable.drawTable(result);
      //         loadingBtn.done();
      //         }
      //         });
      //         */
      //
      //        hippo.newSimpleExhaler()
      //            .space("HUL_sample_analysis_new")
      //            .index("machine_id", servkit.getMachineList())
      //            .index("manage_id", manageIdList)
      //            .columns(
      //                "timestamp",
      //                "date",
      //                "machine_id",
      //                "work_shift_name",
      //                "employee_id",
      //                "manage_id",
      //                "regulate_start_tsp",//校車開始時間(300)
      //                "produce_start_tsp",//生產開始時間(100)
      //                "produce_end_tsp",//生產結束時間(103)
      //                "regulate_pause_ms",//校車閒置(305)
      //                "repair_pause_ms",//維修時間(215)
      //                "produce_pause_ms",//閒置時間(105)
      //                "produce_oper_ms",//生產時間(100的運轉時間)
      //                "part_count"//總生產件數
      //            ).exhale(function (exhalable) {
      //
      //              exhalable.exhalable = _.sortBy(exhalable.exhalable, "timestamp");
      //              context.reportTable.drawTable(exhalable.map(function (data, groupedKey) {
      //                var sampleObj = context.commons.getOrderIdOrSampleId({}, context.groupedSampleList, data.manage_id);
      //                return [
      //                  //管編
      //                  sampleObj.sample_id || "---",
      //                  //客戶別
      //                  sampleObj.customer_id || "---",
      //                  //班次
      //                  data.work_shift_name,
      //                  //機台
      //                  servkit.getMachineName(data.machine_id),
      //                  //人員
      //                  context.commons.getUserName(context.preCon.getUserList, data.employee_id),
      //                  //校車開始時間 : 計算基準以校車人員按Macro 300開始
      //                  data.regulate_start_tsp.date20BitsToFormatted(),
      //                  //生產開始時間 : 計算基準以校車人員按Macro 100開始
      //                  data.produce_start_tsp.date20BitsToFormatted(),
      //                  //生產結束時間 : 計算基準以校車人員按Macro 103開始
      //                  data.produce_end_tsp.date20BitsToFormatted(),
      //                  //校車時間 : 樣品生產時，校車人員校車時間總和-暫停(Macro522=305)
      //                  context.getRegulateTime(data),
      //                  //加工時間 : 樣品生產時(Macro522=100~103)，機台運轉時間總和
      //                  data.produce_oper_ms.millisecondToHHmmss(),
      //                  //樣品總時間 : 樣品生產結束時間-樣品生產開始時間-暫停(Macro522=105,215,305)
      //                  context.getProduceTime(data),
      //                  //總生產件數 : 樣品生產件數總計，(機台總生產數)從校車按Macro 300開始起算
      //                  data.part_count + "件"
      //                ];
      //              }));
      //              loadingBtn.done();
      //            });
      //
      //      },
      getRegulateTime: function (elem) {
        //校車時間 : 樣品生產時，校車人員校車時間總和-暫停(Macro522=305)
        var accumulatedMillisecond =
          moment(elem.produce_start_tsp, 'YYYYMMDDHHmmss').diff(
            moment(elem.regulate_start_tsp, 'YYYYMMDDHHmmss')
          ) - elem.regulate_pause_ms
        if (
          elem.produce_start_tsp == '---' ||
          elem.regulate_start_tsp == '---'
        ) {
          return '---'
        } else if (accumulatedMillisecond <= 0) {
          return '00:00:00'
        } else {
          return moment.utc(accumulatedMillisecond).format('HH:mm:ss')
          //去調毫秒部分最後三位數免得減完變負的
        }
      },
      getProduceTime: function (elem) {
        //樣品總時間 : 樣品生產結束時間-樣品生產開始時間-暫停(Macro522=105,215)
        var accumulatedMillisecond =
          moment(elem.produce_end_tsp, 'YYYYMMDDHHmmss').diff(
            moment(elem.produce_start_tsp, 'YYYYMMDDHHmmss')
          ) -
          elem.regulate_pause_ms -
          elem.repair_pause_ms -
          elem.produce_pause_ms
        if (elem.produce_end_tsp == '---' || elem.produce_start_tsp == '---') {
          return '---'
        } else if (accumulatedMillisecond <= 0) {
          return '00:00:00'
        } else {
          return moment.utc(accumulatedMillisecond).format('HH:mm:ss')
        }
      },
    },
    preCondition: {
      getSampleList: function (done) {
        this.commons.getSampleList(done)
      },
      getUserList: function (done) {
        this.commons.getUserList(done)
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
