import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo(context) {
      // 無效代碼輸入
      context.initMacroInsert()
      // 無效代碼紀錄查詢
      context.initRecordQueryForm()
      context.initMacroRecordTable()
      // 定期更新機台按鈕
      context.refreshMacroRecord()

      //context.preCon.subscribeDeviceStatus()


      // 訂閱機台狀態
      servkit.subscribe('DeviceStatus', {
        machines: context.preCon.getBoxList,
        handler: function (data) {
          _.each(data, function (elem, index) {
            elem.eachMachine('G_CONS()', function (multisystem, machineId) {
              var status = multisystem[0][0]

              context.selectedMachineId = machineId

              var needInsert = false
              if(status == '11') {
                if (context.latestMachineStatus[machineId] == null || 
                    context.latestMachineStatus[machineId] != '11') {
                    
                      needInsert = true

                }
              }
              context.latestMachineStatus[machineId] = status

              if(needInsert) {
                context.insertMacroRecord('999')
              }
          })
        })
      }
    })



    },
    util: {
      loginInfo: JSON.parse(sessionStorage.getItem('loginInfo')),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $deviceQuery: $('#device-query'),
      $macroDialog: $('#macro-dialog'),
      $macroBtns: $('#macro-btns'),
      $macroBtn: $('.macro-btn'),
      $macroRecordTable: $('#table_query'),
      $macroRecordEditModal: $('#edit-macro-record-modal'),
      $dialogMachineBtn: $('#dialog-machine-btn'),
      $plantSelect: $('#plant-select'),
      loadingBtnQuery: servkit.loadingButton(
        document.querySelector('#submit_query')
      ),
      macroRecordTable: null,
      selectedMachineId: null,
      dateTimeFormat: 'YYYY/MM/DD HH:mm:ss',
      latestWorkMacroMap: {},
      latestMachineStatus: {},
      getFormatTime(timeStr, outputType) {
        const context = this
        const viewFormat = context.dateTimeFormat
        const saveFormat = 'YYYYMMDDHHmmss'
        const input = timeStr.toString()
        let output
        switch (outputType) {
          case 'save':
            output = input.replace(/\/|:|\s/g, '')
            break
          case 'view':
            output = moment(input, saveFormat).format(viewFormat)
            break
        }
        return output
      },
      initMacroRecordTable() {
        const context = this
        const { $macroRecordEditModal, $macroRecordTable } = context
        const $macroSelect = (context.$macroSelect = $macroRecordEditModal.find(
          '[name=macro]'
        ))
        const $createBySelect = (context.$createBySelect = $macroRecordEditModal.find(
          '[name=create_by]'
        ))
        const $machineIdSelect = (context.$machineIdSelect = $macroRecordEditModal.find(
          '[name=machine_id]'
        ))
        const $macroCreateTimeInput = (context.$macroCreateTimeInput = $macroRecordEditModal.find(
          '[name=macro_create_time]'
        ))
        let isFirstQuery = false

        $macroCreateTimeInput.datetimepicker({
          format: context.dateTimeFormat,
        })
        servkit.initSelectWithList(context.preCon.macroMap, $macroSelect)
        servkit.initSelectWithList(
          context.preCon.userIdNameMap,
          $createBySelect
        )
        servkit.initMachineSelect($machineIdSelect)

        context.macroRecordTable = servkit.crudtable({
          tableSelector: '#table_query',
          tableModel:
            'com.servtech.servcloud.app.model.downtime_analysis.WorkMacroRecord',
          rightColumn: [2],
          columns: [
            {
              name: 'machine_id',
              data: 'machine_id',
              render(data, type) {
                if (type === 'display') {
                  return servkit.getMachineName(data) || data
                } else {
                  return data
                }
              },
            },
            {
              name: 'macro_create_time',
              data: 'macro_create_time',
              render(data, type) {
                if (type === 'display') {
                  return context.getFormatTime(data, 'view')
                } else {
                  return data
                }
              },
            },
            {
              name: 'macro',
              data: 'macro',
            },
            {
              name: 'macro_code_name',
              data(rowData) {
                return context.preCon.macroMap[rowData.macro] || '---'
              },
            },
            {
              name: 'create_by',
              data: 'create_by',
              render(data, type) {
                if (type === 'display') {
                  return context.preCon.userIdNameMap[data] || data
                } else {
                  return data
                }
              },
            },
          ],
          modal: {
            id: '#edit-macro-record-modal',
          },
          autoWidth: false,
          read: {
            url: 'api/stdcrud',
            preventReadAtFirst: true,
            end: {
              1(data) {
                return data
              },
              3(data) {
                return data
              },
              5(data) {
                return data
              },
            },
          },
          create: {
            url: 'api/v3/servcore/macro-downtime',
            start(newTr, table) {
              $createBySelect.val(context.loginInfo.user_id)
              $macroCreateTimeInput.prop('disabled', false)
              $machineIdSelect
                .val(_.without(context.$deviceQuery.val(), 'ALL')[0])
                .prop('disabled', false)
            },
            send(tds) {
              const macro_create_time = $macroCreateTimeInput.val()
              return {
                macro_create_time: context.getFormatTime(
                  macro_create_time,
                  'save'
                ),
              }
            },
            end: {
              1(td, formData) {
                return formData.machine_id
              },
              2(td, formData) {
                return formData.macro_create_time
              },
              3(td, formData) {
                return formData.macro
              },
              5(td, formData) {
                return formData.create_by
              },
            },
            fail(data) {
              if (data === `duplicated`) {
                return i18n(
                  `The_Same_Record_At_The_Same_Time_Machine_Already_Exists`
                )
              } else {
                return i18n(`Error`)
              }
            },
          },
          update: {
            url: 'api/v3/servcore/macro-downtime',
            start: {
              1(oldTd, newTd, oldTr, newTr, table) {
                const machineId = table.cell(oldTd).data()
                const select = $machineIdSelect[0]
                select.value = machineId
                select.disabled = true
              },
              3(oldTd, newTd, oldTr, newTr, table) {
                const macroCode = table.cell(oldTd).data()
                const select = $macroSelect[0]
                select.value = macroCode
              },
              5(oldTd, newTd, oldTr, newTr, table) {
                const userId = table.cell(oldTd).data()
                newTd.querySelector('select').value = userId
              },
            },
            send(tds) {
              const macro_create_time = $macroCreateTimeInput.val()
              return {
                macro_create_time: context.getFormatTime(
                  macro_create_time,
                  'save'
                ),
              }
            },
            end: {
              1(td, formData) {
                return formData.machine_id
              },
              2(td, formData) {
                return context.getFormatTime(formData.macro_create_time, 'save')
              },
              3(td, formData) {
                return formData.macro
              },
              5(td, formData) {
                return formData.create_by
              },
            },
          },
          delete: {
            url: 'api/v3/servcore/macro-downtime',
            unavailable: !servtechConfig.ST_DELETE_MACRO_RECORD,
            start(deleteId) {
              return {
                macro_create_time: deleteId.macro_create_time.toString(),
              }
            },
          },
          onDraw() {
            if (!isFirstQuery) {
              $macroRecordTable.closest('div').find('.dt-toolbar').hide()
              isFirstQuery = true
            }
          },
          validate: {
            1(td, table) {
              const value = td.querySelector('select').value
              const isOutOfRange = !context.$deviceQuery.val().includes(value)
              if (isOutOfRange) {
                return `${i18n(
                  'Has_Been_Out_Of_Range_Please_Adjust_The_Query'
                )}`
              }
            },
            2(td, table) {
              const value = td.querySelector('input').value
              if (!value) {
                return
              }
              const isOutOfRange =
                moment(value).isBefore(context.$startDate.val()) ||
                moment(value).isAfter(context.$endDate.val() + ' 23:59:59')
              if (isOutOfRange) {
                return `${i18n(
                  'Has_Been_Out_Of_Range_Please_Adjust_The_Query'
                )}`
              }
            },
          },
        })
      },
      initRecordQueryForm() {
        const context = this
        const toggleFilterQueryRange = () => {
          const machineIds = _.without(context.$deviceQuery.val(), 'ALL')
          const minDate = context.$startDate.val()
          const maxDate = context.$endDate.val()
          if (!context.dateTimePickerAPI) {
            context.dateTimePickerAPI = context.$macroCreateTimeInput.data(
              'DateTimePicker'
            )
          }
          context.dateTimePickerAPI.minDate(false)
          context.dateTimePickerAPI.maxDate(false)
          context.dateTimePickerAPI.minDate(minDate)
          context.dateTimePickerAPI.maxDate(maxDate + ' 23:59:59')
          context.$machineIdSelect.find('option').each((i, el) => {
            $(el).toggleClass('hide', !machineIds.includes(el.value))
          })
        }
        servkit.initDatePicker(
          context.$startDate,
          context.$endDate,
          false,
          30,
          '#submit_query'
        )
        servkit.initSelectWithList(
          context.preCon.machineByGroup,
          context.$deviceQuery
        )
        // 查詢
        $('#submit_query').on('click', function (e) {
          e.preventDefault()
          try {
            toggleFilterQueryRange()
            context.queryMacroRecord()
          } catch (e) {
            console.warn(e)
            context.loadingBtnQuery.done()
          }
        })
      },
      initMacroInsert() {
        const context = this
        // addDialog
        context.$macroDialog.dialog({
          autoOpen: false,
          resizable: true,
          modal: true,
          width: 1500,
          title:
            '<button id="dialog-machine-btn" class="btn machine-btn" machine-id=""></button>',
          open() {
            $('.ui-widget-overlay').bind('click', function () {
              context.$macroDialog.dialog('close')
            })
          },
          buttons: [
            {
              html: `${i18n('Close')}`,
              class: 'btn font-xl btn-primary',
              click() {
                $(this).dialog('close')
                context.selectedMachineId = null
              },
            },
          ],
        })

        context.$macroBtns.html(
          _.map(
            this.preCon.macroMap,
            (name, id) =>
              `<button id="${id}" type="button" class="btn btn-primary macro-btn">${name}</button>`
          ).join('')
        )

        const plantIds = _.keys(this.preCon.machinePlantMap).sort()
        const plantMap = plantIds.reduce((a, id) => {
          return _.extend(a, {
            [id]: servkit.getPlantAreaName(id),
          })
        }, {})
        servkit.initSelectWithList(plantMap, context.$plantSelect)
        context.$plantSelect
          .on('change', function (e) {
            context.renderMachineBtns(e.target.value)
          })
          .change()

        //按 機台 按鈕的行為
        $('#machine-btns').on('click', '.machine-unit', function (e) {
          e.preventDefault()
          context.selectedMachineId = e.currentTarget.getAttribute('id')
          context.updateDialog()
          context.$macroDialog.dialog('open')
        })
        // 按 macro 按鈕的行為
        context.$macroBtns.on('click', 'button', function (e) {
          e.preventDefault()
          var macro = $(this).attr('id')
          context.insertMacroRecord(macro)
        })
      },
      renderMachineBtns(plantId) {
        let machineBtnTemlpate = _.template(
          `<div class="machine-unit well" id="<%= id %>">
          <button class="btn machine-btn"><%= name %></button>
          <h3 class="machine-macro">---</h3>
        </div>`
        )
        let context = this
        let btnHtml = []
        //該廠區含有有權限瀏覽的機台
        let plantAuthorizedMachines = _.intersection(
          _.keys(context.preCon.machinePlantMap[plantId]),
          _.keys(context.preCon.machineByGroup)
        )
        //sort by name
        var machineSortByName = _.map(plantAuthorizedMachines, (machineId) => {
          let record = context.latestWorkMacroMap[machineId]
          return {
            id: machineId,
            name: servkit.getMachineName(machineId),
            macro: record
              ? `M${record.macro} : ${context.preCon.macroMap[record.macro]}`
              : '---',
          }
        }).sort(servkit.naturalCompareValue)
        _.each(machineSortByName, (machineObj) =>
          btnHtml.push(machineBtnTemlpate(machineObj))
        )
        $('#machine-btns').html(btnHtml.join(''))
      },
      updateDialog() {
        var context = this
        if (!context.selectedMachineId) {
          return true
        }
        var machineWorkMacro =
          context.latestWorkMacroMap[context.selectedMachineId]
        // var machineStatus = machineWorkMacro.status;
        $('#dialog-machine-btn').text(
          servkit.getMachineName(context.selectedMachineId)
        )
        // .css("background-color", servkit.getMachineLightColor(machineStatus));
        if (machineWorkMacro) {
          context.updateMacroBtnStatus(machineWorkMacro.macro)
        } else {
          this.$macroBtns
            .find('button')
            .removeClass('selected')
            .removeAttr('style')
        }
      },
      updateMacroBtnStatus(macro) {
        this.$macroBtns
          .find('button')
          .removeClass('selected')
          .removeAttr('style')
        $('#' + macro)
          .css({
            'background-color': servkit.getMachineLightMap()[12].color,
            'border-color': 'yellow',
          })
          .addClass('selected')
      },
      updateMachineBtns(data) {
        const context = this
        let machineId
        let macroNew
        let machineMacroElement
        $('#machine-btns')
          .children()
          .each((i, el) => {
            machineId = el.id
            machineMacroElement = el.querySelector('.machine-macro')
            if (Object.prototype.hasOwnProperty.call(data, machineId)) {
              macroNew = data[machineId].macro
              machineMacroElement.textContent = `M${macroNew} : ${context.preCon.macroMap[macroNew]}`
              context.latestWorkMacroMap[machineId] = data[machineId]
            } else {
              machineMacroElement.textContent = '---'
              context.latestWorkMacroMap = _.omit(
                context.latestWorkMacroMap,
                machineId
              )
            }
          })
      },
      insertMacroRecord(macro) {
        const context = this
        $('.macro-btn').attr('disabled', 'disabled')
        context.$macroDialog.addClass('progress')
        servkit.ajax(
          {
            url: 'api/v3/servcore/macro-downtime/record',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              machine_id: context.selectedMachineId,
              macro: macro,
            }),
          },
          {
            success(data) {
              context.updateMachineBtns(data)
              context.updateMacroBtnStatus(macro)
            },
            fail(res) {
              console.warn(res)
              $.smallBox({
                title: 'Please try again later.',
                color: servkit.colors.red,
                iconSmall: 'fa fa-times',
                timeout: 4000,
              })
            },
            always() {
              $('.macro-btn').removeAttr('disabled')
              context.$macroDialog.removeClass('progress')
            },
          }
        )
      },
      refreshMacroRecord() {
        const context = this
        servkit
          .schedule('refreshMacroRecord')
          .action(() => {
            servkit.ajax(
              {
                url: 'api/v3/servcore/macro-downtime/getLatestWorkMacro',
              },
              {
                success(data) {
                  // update DOM and latestWorkMacroMap
                  context.updateMachineBtns(data)
                },
              }
            )
          })
          .freqMillisecond(5000)
          .start()
      },
      queryMacroRecord() {
        const context = this
        const machineIds = context.$deviceQuery.val()
        if (_.isEmpty(machineIds)) {
          return
        }
        const timeStart = context.$startDate.val().replace(/\//g, '') + '000000'
        const timeEnd = context.$endDate.val().replace(/\//g, '') + '235959'
        const whereClause = `machine_id IN ('${machineIds.join("', '")}') AND
          macro_create_time >= ${timeStart} AND
          ${timeEnd} >= macro_create_time`
        $('#table_query').closest('div').find('.dt-toolbar').show()
        context.macroRecordTable.changeReadUrl({ whereClause })
        context.macroRecordTable.refreshTable()
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
       
      machineByGroup(done) {
        //{machineId1: machineName1, ...}
        this.commons.getMachineByGroup(done)
      },
      macroMap(done) {
        this.commons.macroMap(done)
      },
      machinePlantMap(done) {
        servkit.ajax(
          {
            url: 'api/plantarea/getMachinePlantArea',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success(data) {
              var platnAreaMap = {}
              _.each(data.machines, function (obj) {
                if (_.isUndefined(platnAreaMap[obj.plant_id])) {
                  platnAreaMap[obj.plant_id] = {}
                }
                platnAreaMap[obj.plant_id][
                  obj.device_id
                ] = servkit.getMachineName(obj.device_id)
              })
              done(platnAreaMap)
            },
          }
        )
      },
      userIdNameMap(done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
          },
          {
            success(data) {
              var userData = {}
              _.each(data, (elem) => {
                userData[elem.user_id] = elem.user_name
              })
              done(userData)
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
      ['/js/plugin/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js'],
    ],
  })
}
