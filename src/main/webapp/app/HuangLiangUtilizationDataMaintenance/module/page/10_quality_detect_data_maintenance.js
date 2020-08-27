export default function () {
  //# sourceURL=10_quality_detect_data_maintenance.js
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#table'),
        $tableWidget: $('#table-widget'),
        rightColumn: [7, 8, 10, 11, 12, 13, 14, 15],
        onRow: function (row, data) {
          var edited_group = data[16].split('@') //編輯過資料的群組
          var edit_permission_reason_and_number = false //是否有修改權限
          var edit_permission_first_defectives = false //是否有修改權限
          var edited_reason = false //是否修改過例檢不良原因
          var edited_number = false //是否修改過QC不良品
          var edited_repair = false //是否修改過維修首車不良品
          var edited_calibration = false //是否修改過校車首車不良品

          //可修改多次的群組有權限修改且資料都當作沒編輯過
          if (
            _.intersection(context.edit_multiple_group, context.userGroupList)
              .length != 0
          ) {
            edit_permission_reason_and_number = true
            edited_reason = false
            edited_number = false
          }
          // 僅可修改一次的群組
          else if (
            _.intersection(context.edit_once_group, context.userGroupList)
              .length != 0
          ) {
            edit_permission_reason_and_number = true
            edited_reason =
              _.intersection(
                _.intersection(context.edit_once_group, context.userGroupList), // 登入者可編輯一次的群組
                _.map(edited_group, function (elem) {
                  return elem.replace('_REASON', '')
                })
              ).length != 0

            edited_number =
              _.intersection(
                _.intersection(context.edit_once_group, context.userGroupList),
                _.map(edited_group, function (elem) {
                  return elem.replace('_NUMBER', '')
                })
              ).length != 0
          }

          if (
            _.intersection(
              context.edit_firstDefectives_group,
              context.userGroupList
            ).length != 0
          ) {
            edit_permission_first_defectives = true
            edited_repair =
              _.intersection(
                _.intersection(
                  context.edit_firstDefectives_group,
                  context.userGroupList
                ),
                _.map(edited_group, function (elem) {
                  return elem.replace('_REPAIR', '')
                })
              ).length != 0

            edited_calibration =
              _.intersection(
                _.intersection(
                  context.edit_firstDefectives_group,
                  context.userGroupList
                ),
                _.map(edited_group, function (elem) {
                  return elem.replace('_CALIBRATION', '')
                })
              ).length != 0
          }

          var editable_defective_reason =
            '<span class="defective_reason">' +
            data[9] +
            '</span> ' +
            '<a class="btn btn-primary btn-xs reason_choose" href="#" aria-expanded="true">勾選</a>' +
            '<a class="btn btn-primary btn-xs no_defectives" style="margin-left: 5px;" aria-expanded="true">無不良品</a>'
          var uneditable_defective_reason =
            '<span class="defective_reason">' + data[9] + '</span>'
          var editable_qc_defectives =
            '<input type="text" size=4 class="qc_defectives" value="' +
            data[14] +
            '">'
          var uneditable_qc_defectives =
            '<span class="qc_defectives">' + data[14] + '</span>'
          // var editable_repair_first_defectives = '<input type="text" size=4 class="repair_first_defectives" value="' + data[11] + '">'
          // var uneditable_repair_first_defectives = '<span class="repair_first_defectives">' + data[11] + '</span>'
          // var editable_calibration_first_defectives = '<input type="text" size=4 class="calibration_first_defectives" value="' + data[12] + '">'
          // var uneditable_calibration_first_defectives = '<span class="calibration_first_defectives">' + data[12] + '</span>'

          // 根據 編輯紀錄 和 是否為可編輯群組 決定顯示input
          // 維修 / 校車首件不良品 由廠務(助理)來填
          if (edit_permission_reason_and_number) {
            $(row)
              .find('td')
              .eq(9)
              .html(
                edited_reason
                  ? uneditable_defective_reason
                  : editable_defective_reason
              )
            $(row)
              .find('td')
              .eq(14)
              .html(
                edited_number
                  ? uneditable_qc_defectives
                  : editable_qc_defectives
              )
          } else {
            $(row).find('td').eq(9).html(uneditable_defective_reason)
            $(row).find('td').eq(14).html(uneditable_qc_defectives)
          }

          // if (edit_permission_first_defectives) {
          //   $(row).find('td').eq(11).html(edited_repair ? uneditable_repair_first_defectives : editable_repair_first_defectives);
          //   $(row).find('td').eq(12).html(edited_calibration ? uneditable_calibration_first_defectives : editable_calibration_first_defectives);
          // } else {
          //   $(row).find('td').eq(11).html(uneditable_repair_first_defectives);
          //   $(row).find('td').eq(12).html(uneditable_calibration_first_defectives);
          // }

          $(row).find('td').eq(4).html(servkit.getMachineName(data[4]))
          $(row).find('td').eq(6).html(context.commons.getMultiProcess(data[6]))
          $(row)
            .find('td')
            .eq(7)
            .html('<span class = "part_count">' + data[7] + '</span>')
          $(row)
            .find('td')
            .eq(8)
            .html(
              '<span class = "examination_defective">' + data[8] + '</span>'
            )
          $(row)
            .find('td')
            .eq(10)
            .html('<span class="examination_goods">' + data[10] + '</span>')
          $(row)
            .find('td')
            .eq(13)
            .html('<span class="qc_partcount">' + data[13] + '</span>')
          $(row)
            .find('td')
            .eq(15)
            .html('<span class="qc_goods">' + data[15] + '</span>')
          $(row)
            .find('td')
            .eq(16)
            .addClass('hide')
            .html('<span class="edit_group">' + data[16] + '</span>')

          // $(row).find('td').eq(4).text(servkit.getMachineName(data[4]))
          // $(row).find('td').eq(6).text(context.commons.getMultiProcess(data[6]))
          // $(row).find('td').eq(7).addClass('part_count')
          // $(row).find('td').eq(8).addClass('examination_defective')
          // $(row).find('td').eq(10).addClass('examination_goods')
          // $(row).find('td').eq(13).addClass('qc_partcount')
          // $(row).find('td').eq(15).addClass('qc_goods')
          // $(row).find('td').eq(16).addClass('hide')

          //2016/10/16
          $(row)
            .find('td')
            .eq(5)
            .html(
              context.commons.getOrderId(data[5], context.preCon.getProductList)
            )
        },
        excel: {
          fileName: 'QualityDetectData',
          format: [
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            '0',
            '0',
            'text',
            '0',
            '0',
            '0',
            '0',
            '0',
            '0',
            'text',
          ],
          customDataFunc: function (tableData) {
            return _.map(tableData, function (elem) {
              elem[4] = servkit.getMachineName(elem[4])
              elem[5] = context.commons.getOrderId(
                elem[5],
                context.preCon.getProductList
              )
              return _.initial(elem)
            })
          },
        },
      })
      context.initAuthGroup()

      context.groupedProductList = _.groupBy(
        context.preCon.getProductList,
        'macro523'
      )
      context.groupedSampleList = _.groupBy(
        context.preCon.getSampleList,
        'macro523'
      )

      servkit.initDatePicker(context.$startDate, context.$endDate)
      servkit.initSelectWithList(
        context.preCon.getShiftList,
        context.$shiftSelect
      )
      servkit.initMachineSelect(context.$machineSelect)

      // 查詢資料
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        context.getData()
      })

      // 輸入完資料(不良品)提交
      context.$submitEditBtn.on('click', function (e) {
        e.preventDefault()
        context.saveData(context.reportTable.table)
      })

      // $modal.modal('show')的callback
      context.$modal.on('show.bs.modal', function () {
        // context.$modalInputs || (context.$modalInputs = context.$modal.find('input[type="number"]'));
        // $(this).find(':checkbox').prop('checked', false).removeAttr('checked')
        //   .end().find(':input').val('')
        //   .end().find('span').removeAttr('style')
      })
      // 開啟modal時
      $('#table').on('click', '.reason_choose', function (e) {
        context.$modal.data('_target', $(this).parents('tr'))
        context.preLoadData($(this).parents('tr'))
        context.$modal.modal('show')
        return false
      })

      $('#reason_table').on('click', ':checkbox', function (e) {
        var $this = $(this)
        var $td = $this.parent('td')
        if ($this.is(':checked')) {
          $td.next().find('span').css('color', 'red')
        } else {
          $td.next().find('span').removeAttr('style')
        }
      })

      // 按下「無不良品」
      $('#table').on('click', '.no_defectives', function (e) {
        $(e.target)
          .attr('disabled', true)
          .siblings('span')
          .html('---')
          .end()
          .prev()
          .attr('data-edited', 'true')
          .parents('tr')
          .data('selected-reason', {})
        context.adjustQuatity($(this).parents('tr'), 0)
      })

      // 提交例檢不良品原因
      $('#repay_btn').on('click', function (e) {
        var rs = []
        var selectedReasonMap = {}
        var examination_defective = 0
        var $row = context.$modal.data('_target')
        var part_count = parseInt($row.find('span.part_count').html())
        var $qc_defectives = $row.find('.qc_defectives')
        var qc_defectives =
          $qc_defectives[0].nodeName === 'INPUT'
            ? $qc_defectives.val()
            : $qc_defectives.text()
        if (qc_defectives == '') {
          qc_defectives = 0
        }

        var isStay = false
        var alert_message = ''
        var title =
          '請確認選取清單及數量\n-------------------------------------------------\n'
        var confirm_list = ''

        $('#reason_table :checked').each(function () {
          var $cb = $(this)
          var $cbTD = $cb.parent()
          var $spanTD = $cbTD.next()
          var $valTD = $spanTD.next()
          var reason = $spanTD.text()
          var count = $valTD.find(':input').val()

          if (!context.regEx.positiveInt.test($valTD.find(':input').val())) {
            alert_message += '【' + $spanTD.text() + '】\n'
            isStay = true
          }

          rs.push(reason + '*' + count)
          selectedReasonMap[$spanTD.data('defect-code')] = count
          examination_defective += parseInt($valTD.find(':input').val())
          confirm_list +=
            $spanTD.text() + ': ' + $valTD.find(':input').val() + '個\n'
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
            if (
              part_count - examination_defective < 0 ||
              part_count - examination_defective - qc_defectives < 0
            )
              alert('數字有誤，請檢查數量是否太大')
            else {
              $row.find('.reason_choose').attr('data-edited', 'true')

              //console.log(context.$modal.data('_target'));
              //console.log(context.$modal.data('_target')[0]);
              $row
                .data('selected-reason', selectedReasonMap)
                .find('span.defective_reason')
                .html(rs.length ? rs.join('、') : '---')
              // context.$modal.data('_target').find('span.examination_defective').html(examination_defective)
              // context.$modal.data('_target').find('span.examination_goods').html(part_count - examination_defective)
              // context.$modal.data('_target').find('span.qc_partcount').html(part_count - examination_defective)
              // context.$modal.data('_target').find('span.qc_goods').html(part_count - examination_defective - qc_defectives)
              context.adjustQuatity($row, examination_defective)
              if (rs.length) {
                $row.find('a.no_defectives').attr('disabled', false)
              } else {
                $row.find('a.no_defectives').attr('disabled', true)
              }
              context.$modal.modal('hide')
            }
          }
        } else {
          alert_message += '數量請填大於0之整數'
          alert(alert_message)
        }
      })

      //算出QC後良品數量
      $('#table').on('change', '.qc_defectives', function (e) {
        var $this = $(this)
        var qc_defectives = $this.val()
        var $qc_partcount = parseInt(
          $this.parents('tr').find('span.qc_partcount').html()
        )
        if (qc_defectives === '') qc_defectives = 0
        $this
          .parents('tr')
          .find('span.qc_goods')
          .html($qc_partcount - parseInt(qc_defectives))
      })

      context.$modal.modal({
        show: false,
      })

      context.initDefectCodes()
      //例檢不良品原因
      // servkit.ajax({
      //   url: servkit.rootPath + '/api/getdata/db',
      //   type: 'POST',
      //   contentType: 'application/json',
      //   data: JSON.stringify({
      //     table: 'a_huangliang_defect_code',
      //     columns: ['defect_code', 'defect_code_name', 'defect_type']
      //   })
      // }, {
      //   success: function (data) {
      //     // var groupedData = data.reduce((a, x) => {
      //     //     if (!a[x.defect_type]) a[x.defect_type] = []
      //     //     a[x.defect_type].push(x.defect_code_name);
      //     //     return a;
      //     //   }, {}),
      //     //   html;
      //     // var accordion = $('<div class="panel-group smart-accordion-default" id="accordion"></div>')
      //     // var panelTemplate = (i, type, itemsStr) => `<div class="panel panel-default">
      //     //           <div class="panel-heading">
      //     //             <h4 class="panel-title">
      //     //               <a data-toggle="collapse" data-parent="#accordion" href="#collapse-${i}" aria-expanded="false" class="collapsed text-center font-lg">
      //     //                 <i class="fa fa-lg fa-angle-down pull-right"></i>
      //     //                 <i class="fa fa-lg fa-angle-up pull-right"></i>
      //     //                 ${type}
      //     //               </a>
      //     //             </h4>
      //     //           </div>
      //     //           <div id="collapse-${i}" class="panel-collapse collapse" aria-expanded="false" style="height: 0px;">
      //     //             <div class="panel-body no-padding">
      //     //               <table class="table table-bordered table-condensed table-striped smart-form" id="table-defectives-${i}">
      //     //                 <tbody>
      //     //                   ${itemsStr}
      //     //                 </tbody>
      //     //               </table>
      //     //             </div>
      //     //           </div>
      //     //         </div>`
      //     // var i = 0, j = 0;
      //     // for (var type in groupedData) {
      //     //   // html.push('<tr><td colspan="8" class="defective-reason-type">' + type + '</td></tr>')
      //     //   i = 0;
      //     //   html = [];
      //     //   for (var item of groupedData[type]) {
      //     //     if (!(i % 4)) html.push('<tr>')
      //     //     html.push(`
      //     //       <td class="defective col-3" style="position:relative;" data-defective="${item}">
      //     //         <label class="checkbox" style="display:inline-block;">
      //     //           <input type="checkbox" name="checkbox">
      //     //           <i></i>${item}
      //     //         </label>
      //     //       <input class="form-control" type="number" min="1" placeholder="個數" style="width:45px;padding:0 5px;margin-bottom:4px;position:absolute;right:15px;top:2px;" /></td>`)
      //     //     if (i % 4 === 3) html.push('</tr>')
      //     //     i++;
      //     //   }
      //     //   for (var k=0; k<4-groupedData[type].length%4; k++) {
      //     //     html.push('<td class="col-3"></td>')
      //     //   }
      //     //   if (groupedData[type].length % 4) html.push('</tr>');
      //     //   accordion.append(panelTemplate(j, type, html.join('')));
      //     //   j++;
      //     // }

      //     var o = {}
      //     //var type = {};
      //     var tdLength = 0

      //     _.map(data, function (data) {
      //       var ary = o[data.defect_type]
      //       if (_.isUndefined(ary)) {
      //         ary = o[data.defect_type] = []
      //       }
      //       ary.push(data.defect_code_name)
      //       if (tdLength < ary.length) {
      //         tdLength = ary.length
      //       }
      //     })
      //     //console.log(o);

      //     var html = []
      //     html.push('<tr>')
      //     _.each(o, function (v, k) {
      //       html.push('<td colspan="3">' + k + '</td>')
      //     })

      //     html.push('</tr>')
      //     for (var i = 0; i < tdLength; i++) {
      //       html.push('<tr>')
      //       _.each(o, function (v, k) {
      //         if (_.isUndefined(v[i])) {
      //           html.push('<td></td><td></td><td></td>')
      //         } else {
      //           html.push('<td><input type="checkbox"></td>') // checkbox
      //           html.push('<td class="reason ' + v[i] + '"><span>' + v[i] + '</span></td>') // text
      //           html.push('<td><input type="textbox" size="3"> 個</td>') // value
      //         }
      //       })
      //       html.push('</tr>')
      //     }
      //     // $('.modal .modal-body').append(accordion)
      //     $('#reason_table tbody').html(html.join(''))
      //   },
      //   fail: function (data) {
      //     console.log(data)
      //   }
      // })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $shiftSelect: $('#shift'),
      $machineSelect: $('#machine'),
      $submitBtn: $('#submit-btn'),
      $submitEditBtn: $('#submit_edit'),
      $modal: $('.modal'),
      $modalInputs: undefined,
      $modalCheckboxes: undefined,
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      loadingBtnEdit: servkit.loadingButton(
        document.querySelector('#submit_edit')
      ),
      reportTable: undefined,
      groupedProductList: undefined,
      groupedSampleList: undefined,
      userGroupList: undefined, // 目前登入使用者群組
      edit_once_group: undefined, // 可修改一次的群組
      edit_multiple_group: undefined, // 可修改多次的群組
      edit_firstDefectives_group: undefined, // 可修改維修、校車首件不良品的群組
      regEx: {
        nonNegativeInt: /^([1-9]\d*|0)$/,
        positiveInt: /^[1-9]\d*$/,
      },

      // 取得用戶權限群組、init可修改資料的群組
      initAuthGroup: function () {
        var context = this
        context.userGroupList = JSON.parse(sessionStorage.loginInfo).user_group
        context.edit_once_group = [
          context.commons.factory_service_assistant,
          context.commons.leader,
        ]
        context.edit_multiple_group = [
          context.commons.sys_super_admin_group,
          context.commons.sys_manager_group,
        ]
        context.edit_firstDefectives_group = [
          context.commons.factory_service_assistant,
        ]
      },

      getData: function () {
        var shiftList = this.$shiftSelect.val() || [],
          machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this
        loadingBtn.doing()

        //2016/08/23 新增
        //=============================================================================
        var nObj = {}
        servkit.ajax(
          {
            url: 'api/huangliang/qualityExamData/getData',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              shiftList: this.$shiftSelect.val(),
              machineList: this.$machineSelect.val(),
              startDate: this.$startDate.val(),
              endDate: this.$endDate.val(),
            }),
            async: false,
          },
          {
            success: function (datas) {
              _.each(datas, function (v, k) {
                nObj[
                  moment(new Date(v.date)).format('YYYYMMDD') +
                    '/' +
                    v.employee_id +
                    '/' +
                    v.work_shift_name +
                    '/' +
                    v.machine_id +
                    '/' +
                    v.order_id +
                    '/' +
                    v.multi_process
                ] = v
              })
            },
            fail: function (res) {
              console.warn(res)
              $.smallBox({
                title: res,
                color: 'red',
                iconSmall: 'fa fa-times',
                timeout: 4000,
              })
              loadingBtn.done()
            },
          }
        )

        hippo
          .newSimpleExhaler()
          .space('part_count_huangliang')
          .index('machine_id', machineList)
          .index('work_shift_name', shiftList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns(
            'date',
            'employee_id',
            'work_shift_name',
            'machine_id',
            'order_id',
            'multi_process',
            'part_count',
            'maintain_partcount',
            'regulate_partcount'
          )
          .exhale(function (exhalable) {
            var result = null
            try {
              exhalable.exhalable = context.mergeData(exhalable.exhalable)
              result = exhalable.map(function (v) {
                var pchlData = v
                var key =
                  v.date +
                  '/' +
                  v.employee_id +
                  '/' +
                  v.work_shift_name +
                  '/' +
                  v.machine_id +
                  '/' +
                  v.order_id +
                  '/' +
                  v.multi_process
                var hqedData = nObj[key] || {}
                pchlData.employee_id = context.commons.fillZeroTo5Digit(
                  pchlData.employee_id
                )

                return [
                  pchlData.date.date8BitsToSlashed(),
                  pchlData.employee_id,
                  context.commons.getUserName(
                    context.preCon.getUserList,
                    pchlData.employee_id
                  ),
                  pchlData.work_shift_name,
                  pchlData.machine_id,
                  pchlData.order_id,
                  pchlData.multi_process,
                  pchlData.part_count,

                  hqedData.examination_defective || 0,
                  hqedData.defective_reason || '',
                  hqedData.examination_goods || pchlData.part_count,
                  pchlData.maintain_partcount,
                  pchlData.regulate_partcount,
                  hqedData.qc_partcount || pchlData.part_count,
                  hqedData.qc_defectives || '',
                  hqedData.qc_goods || pchlData.part_count,
                  hqedData.edit_group || '',
                ]
              })
            } catch (e) {
              console.warn(e)
            } finally {
              context.reportTable.drawTable(result)
              loadingBtn.done()
            }
          })
      },

      mergeData: function (exhalable) {
        // part_count_huangliang 的顆數有可能被 --- 或其他原因中斷分成兩筆，把他合併
        var groupedData = {}
        _.each(exhalable, function (elem) {
          var key = [
            elem.date,
            elem.employee_id,
            elem.work_shift_name,
            elem.machine_id,
            elem.order_id,
            elem.multi_process,
          ].join('@@')
          if (!groupedData[key]) {
            groupedData[key] = elem
          } else {
            groupedData[key].part_count += elem.part_count
          }
        })

        return _.toArray(groupedData)
      },

      saveData: function (tableData) {
        var context = this
        var reasonable = true
        //console.log(tableData);
        //console.log(tableData.data());

        var isEditMultipleGroup =
          _.intersection(context.edit_multiple_group, context.userGroupList)
            .length != 0
        var editOnceGroups = _.intersection(
          context.edit_once_group,
          context.userGroupList
        )
        // var editFirstDefectivesGroups = _.intersection(context.edit_firstDefectives_group, context.userGroupList);
        // 不屬於可多次修改的群組且屬於僅可修改一次的群組
        var canOnlyEditOnce =
          !isEditMultipleGroup && editOnceGroups.length !== 0
        // var canOnlyEditFirstDefectivesOnce = (!isEditMultipleGroup && editFirstDefectivesGroups.length !== 0)
        var saveData = []
        var isReasonEdited = true

        $('#table tbody tr').each(function () {
          var rowData = tableData.row(this).data()
          var $this = $(this)
          // var examination_defective = $this.find('.examination_defective').val();
          // 例檢不良品
          var examination_defective = $this
            .find('span.examination_defective')
            .text()
          rowData[8] = parseInt(examination_defective) || 0
          // 例檢不良品原因
          var defective_reason = $this.find('span.defective_reason').text()
          if (
            $this.find('.reason_choose').length !== 0 &&
            defective_reason === ''
          ) {
            isReasonEdited = false
          }
          rowData[9] = defective_reason
          // 例檢良品
          var examination_goods = $this.find('span.examination_goods').text()
          rowData[10] = parseInt(examination_goods) || 0
          if (rowData[10] < 0) {
            alert('例檢良品不得小於 0')
            reasonable = false
            return false
          }

          // // 維修首件不良品
          // var repair_first_defectives = $this.find('input.repair_first_defectives').val()
          // if (repair_first_defectives == undefined) { // 非input
          //   repair_first_defectives = $this.find('span.repair_first_defectives').text()
          // } else if (repair_first_defectives !== '' && !context.regEx.nonNegativeInt.test(repair_first_defectives)) { // 不是沒key in 且是 不合理的input
          //   repair_first_defectives = '';
          //   alert('維修首件不良品非正整數，請確認。')
          //   reasonable = false
          //   return false
          // }
          // rowData[11] = repair_first_defectives;

          // // 校車首件不良品
          // var calibration_first_defectives = $this.find('input.calibration_first_defectives').val()
          // if (calibration_first_defectives == undefined) { // 非input
          //   calibration_first_defectives = $this.find('span.calibration_first_defectives').text()
          // } else if (calibration_first_defectives !== '' && !context.regEx.nonNegativeInt.test(calibration_first_defectives)) { // 不是沒key in 且是 不合理的input
          //   calibration_first_defectives = '';
          //   alert('校車首件不良品非正整數，請確認。')
          //   reasonable = false
          //   return false
          // }
          // rowData[12] = calibration_first_defectives;

          // QC總數量
          var qc_partcount = $this.find('span.qc_partcount').text()
          rowData[13] = parseInt(qc_partcount) || 0
          // QC不良品
          var qc_defectives = $this.find('input.qc_defectives').val()
          if (qc_defectives == undefined) {
            // 非input
            qc_defectives = $this.find('span.qc_defectives').text()
          } else if (
            qc_defectives != '' &&
            (_.isNaN(parseInt(qc_defectives)) || qc_defectives < 0)
          ) {
            // 不是沒key in 且是 不合理的input
            qc_defectives = ''
            alert('QC不良品非正整數，請確認。')
            reasonable = false
            return false
          } else if (parseInt(qc_partcount) < parseInt(qc_defectives)) {
            qc_defectives = ''
            alert('QC不良品不得大於QC總數量')
            reasonable = false
            return false
          }
          rowData[14] = qc_defectives
          // QC後良品數量
          var qc_goods = $this.find('span.qc_goods').text()
          rowData[15] = parseInt(qc_goods) || 0
          if (rowData[15] < 0) {
            alert('QC後良品數量不得小於 0')
            reasonable = false
            return false
          }

          // 可修改多次的群組就不用把修改紀錄存進DB
          // 不是可修改多次的群組且有編輯過例檢不良原因
          // if (canOnlyEditOnce && $this.find('.reason_choose').attr('data-edited') == 'true') {
          if (
            canOnlyEditOnce &&
            $this.find('.defective_reason').html() !== ''
          ) {
            // 該使用者所屬的所有可修改一次的群組都記錄起來
            rowData[16] = _.uniq(
              _.compact(
                rowData[16].split('@').concat(
                  _.map(editOnceGroups, function (elem) {
                    return elem + '_REASON'
                  })
                )
              )
            ).join('@')
          }
          // 僅可修改一次且有輸入QC不良品
          if (canOnlyEditOnce && qc_defectives != '') {
            // 該使用者所屬的所有可修改一次的群組都記錄起來
            rowData[16] = _.uniq(
              _.compact(
                rowData[16].split('@').concat(
                  _.map(editOnceGroups, function (elem) {
                    return elem + '_NUMBER'
                  })
                )
              )
            ).join('@')
          }
          // // 僅可修改一次且有輸入維修首件不良品
          // if (canOnlyEditFirstDefectivesOnce && repair_first_defectives != '') {
          //   // 該使用者所屬的所有可修改一次的群組都記錄起來
          //   rowData[16] = _.uniq(
          //     _.compact(
          //       rowData[16].split('@').concat(
          //         _.map(editFirstDefectivesGroups, function (elem) {
          //           return elem + '_REPAIR';
          //         })
          //       )
          //     )
          //   ).join('@')
          // }
          // // 僅可修改一次且有輸入校車首件不良品
          // if (canOnlyEditFirstDefectivesOnce && calibration_first_defectives != '') {
          //   // 該使用者所屬的所有可修改一次的群組都記錄起來
          //   rowData[16] = _.uniq(
          //     _.compact(
          //       rowData[16].split('@').concat(
          //         _.map(editFirstDefectivesGroups, function (elem) {
          //           return elem + '_CALIBRATION';
          //         })
          //       )
          //     )
          //   ).join('@')
          // }
          saveData.push(_.map(rowData)) // copy array 一維陣列用map就好
        })

        if (!isReasonEdited) {
          alert('例檢不良品原因必填，無不良品也請點擊對應的按鈕，感謝')
          return
        }

        saveData = _.map(saveData, function (data) {
          // 將維修 / 校車首件不良品轉成INT或NULL
          data[11] = data[11] === '' ? null : parseInt(data[11])
          data[12] = data[12] === '' ? null : parseInt(data[12])
          return data.concat(data.splice(11, 2))
        })
        // console.log(_.map(tableData.data()))
        if (reasonable) {
          servkit.ajax(
            {
              url: 'api/huangliang/qualityExamData/save',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(saveData),
            },
            {
              success: function (data) {
                console.log('success')
                context.loadingBtnEdit.done()
                context.reportTable.drawTable(tableData.data())
                $.smallBox({
                  sound: false, // 不要音效
                  title: '儲存成功!',
                  content:
                    "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
                  color: servkit.colors.green,
                  icon: 'fa fa-check',
                  timeout: 4000,
                })
              },
              fail: function (data) {
                console.log('fail')
                $.smallBox({
                  sound: false, // 不要音效
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
        }
      },

      initDefectCodes: function () {
        var groupByType = {}
        //var type = {};
        var maxTdLength = 0
        var context = this
        var data = context.preCon.getDefectCode

        for (var code in data) {
          var type = data[code].defect_type
          if (!groupByType[type]) groupByType[type] = []
          groupByType[type].push({
            defect_code: code,
            defect_code_name: data[code].defect_code_name,
          })
          maxTdLength = Math.max(maxTdLength, groupByType[type].length)
        }
        // _.map(data, function (data) {
        //   var ary = o[data.defect_type]
        //   if (_.isUndefined(ary)) {
        //     ary = o[data.defect_type] = []
        //   }
        //   ary.push(data.defect_code_name)
        //   if (tdLength < ary.length) {
        //     tdLength = ary.length
        //   }
        // })
        //console.log(o);

        var html = []
        // 類型
        html.push('<tr>')
        _.each(groupByType, function (v, k) {
          html.push('<td colspan="3">' + k + '</td>')
        })
        html.push('</tr>')

        // 項目
        for (var i = 0; i < maxTdLength; i++) {
          html.push('<tr>')
          _.each(groupByType, function (v, k) {
            if (_.isUndefined(v[i])) {
              html.push('<td></td><td></td><td></td>')
            } else {
              html.push('<td><input type="checkbox"></td>') // checkbox
              html.push(
                `<td class="reason" data-defect-code="${v[i].defect_code}"><span>${v[i].defect_code_name}</span></td>`
              ) // text
              html.push('<td><input type="textbox" size="3"> 個</td>') // value
            }
          })
          html.push('</tr>')
        }
        // $('.modal .modal-body').append(accordion)
        $('#reason_table tbody').html(html.join(''))
      },
      // parseEditedGroup: function (groups) {
      //   let result, group, arr, item;
      //   if (typeof groups === 'string') {
      //     result = {};
      //     arr = groups.split('@');
      //     for (group of arr) {
      //       item = group.match(/_[A-Z]+/);
      //       if (result[group.slice(item.index + 1)]) result[group.slice(item.index + 1)].push(group.slice(0, item.index))
      //       else result[group.slice(item.index + 1)] = [group.slice(0, item.index)];
      //     }
      //     return result;

      //   } else if (typeof groups === 'object') {
      //     arr = [];
      //     for (item in groups) {
      //       for (group of groups[item]) {
      //         arr.push(group + '_' + item);
      //       }
      //     }
      //     return arr.join('@');
      //   } else {
      //     console.warn('Parameter editedGroup must be an object or a string.')
      //   }
      // },

      adjustQuatity: function ($row, examination_defective) {
        let part_count = parseInt($row.find('span.part_count').html()),
          $qc_defectives = $row.find('.qc_defectives'),
          qc_defectives =
            $qc_defectives[0].nodeName === 'INPUT'
              ? $qc_defectives.val()
              : $qc_defectives.text()

        if (qc_defectives === '') qc_defectives = 0
        $row.find('span.examination_defective').html(examination_defective)
        $row
          .find('span.examination_goods')
          .html(part_count - examination_defective)
        $row.find('span.qc_partcount').html(part_count - examination_defective)
        $row
          .find('span.qc_goods')
          .html(part_count - examination_defective - qc_defectives)
      },

      preLoadData: function ($tr) {
        var context = this
        console.log($tr)
        var defectiveReasonList = $tr.data('selected-reason') || {} //find('span.defective_reason').text()
        var length = Object.values(defectiveReasonList).length
        // defectiveReasonList = defectiveReasonList === '---' ? null : defectiveReasonList.split('、')
        if (length) {
          // defectiveReasonList = defectiveReasonList.reduce((a, x) => {
          //   var ar = x.split('*'),
          //     reason = ar[0],
          //     count = ar[1]

          //   a[reason] = count
          //   return a
          // }, {})
          context.$modal.find('td.reason').each((i, el) => {
            var $el = $(el),
              $input = $el.next().find('input'),
              $checkbox = $el.prev().find(':checkbox'),
              code = $el.data('defect-code')

            if (
              Object.prototype.hasOwnProperty.call(defectiveReasonList, code)
            ) {
              $checkbox.prop('checked', true)
              $input.val(defectiveReasonList[code])
              $el.find('span').css('color', 'red')
            } else {
              $checkbox.prop('checked', false)
              $input.val('')
              $el.find('span').removeAttr('style')
            }
          })
          // _.each(defectiveReasonList, function (elem) {
          //   if (elem != '') {
          //     var reason = elem.split('*')[0]
          //     var count = elem.split('*')[1]
          //     var $reasonTd = context.$modal.find('td.' + CSS.escape(reason))
          //     $reasonTd.prev().find(':checkbox').prop('checked', 'checked')
          //     $reasonTd.next().find('input').val(count)
          //     $reasonTd.css('color', 'red');
          //     // var $reasonTd = context.$modal.find(`td[data="${reason}"]`)
          //     // $reasonTd.find(':checkbox').prop('checked', 'checked')
          //     // $reasonTd.find('input[type="number"]').val(count)
          //   }
          // })
        } else {
          context.$modal.find('td.reason').each((i, el) => {
            var $el = $(el),
              $input = $el.next().find('input'),
              $checkbox = $el.prev().find(':checkbox')

            $checkbox.prop('checked', false)
            $input.val('')
            $el.find('span').removeAttr('style')
          })
        }
      },
    },
    preCondition: {
      getShiftList: function (done) {
        this.commons.getShiftList(done)
      },
      getUserList: function (done) {
        this.commons.getUserList(done)
      },
      getProductList: function (done) {
        this.commons.getProductList(done)
      },
      getSampleList: function (done) {
        this.commons.getSampleList(done)
      },
      getDefectCode: function (done) {
        servkit.ajax(
          {
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_defect_code',
              columns: ['defect_code', 'defect_code_name', 'defect_type'],
            }),
          },
          {
            success: function (data) {
              done(
                data.reduce((a, x) => {
                  a[x.defect_code] = x
                  return a
                }, {})
              )
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
