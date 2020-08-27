import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.getMacroOptions = context.initMacroOptionsFunc()
      context.initReportTable()
      context.getData()
    },
    util: {
      loginInfo: JSON.parse(sessionStorage.getItem('loginInfo')),
      JSON_FILE_PATH: 'param/machine_idle_period.json',
      getMacroOptions: null,
      initMacroOptionsFunc() {
        const context = this
        const { macroMap } = context.preCon
        const sortedMacroList = Object.entries(macroMap).sort(
          ([macroId_a], [macroId_b]) => macroId_a - macroId_b
        )

        return (value) => {
          return (
            `<option value="" style="padding:3px 0 3px 3px;" disabled ${
              macroMap[value] ? '' : 'selected'
            }>${i18n('Idle_Code')}</option>` +
            sortedMacroList
              .map(
                ([id, name]) =>
                  `<option style="padding:3px 0 3px 3px;" value="${id}" ${
                    id === value ? 'selected' : ''
                  }>${name}</option>`
              )
              .join('')
          )
        }
      },
      initReportTable() {
        const context = this

        context.reportTable = createReportTable({
          $tableElement: $('#table'),
          $tableWidget: $('#table-widget'),
          customBtns: [
            `<button class="btn btn-primary" id="refresh-btn" title="${i18n(
              'Reorganize'
            )}"><span class='fa fa-refresh fa-lg'></span></button>`,
            `<button class="btn btn-primary hide" id="new-group-btn" title="${i18n(
              'New_Group'
            )}"><span class='fa fa-plus fa-lg'></span></button>`,
            `<button class="btn btn-success hide" id="restore-btn" title="${i18n(
              'Store'
            )}"><i class='fa fa-save fa-lg'></i></button>`,
            `<button class="btn btn-success" id="edit-btn" title="${i18n(
              'Modify'
            )}"><i class='fa fa-pencil fa-lg'></i></button>`,
            `<button class="btn btn-default hide" id="cancel-btn">${i18n(
              'Cancel'
            )}</button>`,
          ],
          paging: false,
          columns: [
            {
              name: 'remove',
              data: null,
              render() {
                return `<button class="btn btn-danger remove-row-btn" title="${i18n(
                  'Delete'
                )}"><span class='fa fa-trash-o fa-lg'></span></button>`
              },
            },
            {
              name: 'groupName',
              data: 'groupName',
              render(data, type, rowData) {
                if (type === 'display') {
                  if (rowData.isEdit) {
                    return `<input value="${data}" type="text" class="form-control full-width" name="group-name">`
                  } else {
                    return data || ''
                  }
                } else {
                  return data
                }
              },
            },
            {
              name: 'machineList',
              data: 'machineList',
              render(data, type, rowData) {
                if (type === 'display') {
                  if (rowData.isEdit) {
                    const machineSet = new Set(data)
                    return `<select name="machine_id" class="form-control custom-scroll full-width" multiple>${Object.values(
                      servkit.getMachineMap()
                    ).map(
                      ({ device_id, device_name }) =>
                        `<option value="${device_id}" ${
                          machineSet.has(device_id) ? 'selected' : ''
                        }>${device_name}</option>`
                    )}</select>`
                  } else {
                    return data
                      .map(
                        (machine_id) =>
                          `<span class='label label-primary' style='float:left;margin:5px;'><i class='fa fa-tag'></i>&nbsp;${servkit.getMachineName(
                            machine_id
                          )}</span>`
                      )
                      .join('')
                  }
                } else {
                  return data
                }
              },
            },
            {
              name: 'idlePeriod',
              data: 'idlePeriod',
              render(data, type, rowData) {
                if (type === 'display') {
                  if (rowData.isEdit) {
                    return (
                      data
                        .map(
                          (
                            obj
                          ) => `<div class="inline-group idle-time-edit-form">
                      <i class="fa fa-lg fa-times remove-idle-time-edit-group"></i>
                      <div class="idle-time-edit-group">
                        <div class="input-group">
                          <select class="form-control macro">${context.getMacroOptions(
                            obj.macroId
                          )}</select>
                        </div>
                        <span class="connect-symbol font-md">：</span>
                        <div class="input-group">
                          <input class="form-control clockpicker start-time" value="${
                            obj.startTime
                          }" type="text" placeholder="${i18n(
                            'Starting_Time'
                          )}" data-autoclose="true">
                          <span class="input-group-addon">
                            <i class="fa fa-clock-o"></i>
                          </span>
                        </div>
                        <span class="connect-symbol font-md">～</span>
                        <div class="input-group">
                          <input class="form-control clockpicker end-time" value="${
                            obj.endTime
                          }" type="text" placeholder="${i18n(
                            'End_Time'
                          )}" data-autoclose="true">
                          <span class="input-group-addon">
                            <i class="fa fa-clock-o"></i>
                          </span>
                        </div>
                      </div>
                    </div>`
                        )
                        .join('') +
                      `<button class="btn btn-primary text-center add-idle-time-edit-group"><span class='fa fa-plus fa-lg'></span></button>`
                    )
                  } else {
                    return data
                      .map(
                        (obj) =>
                          `<div class="idle-time"><span>${obj.startTime} ～ ${
                            obj.endTime
                          }</span><span>${
                            context.preCon.macroMap[obj.macroId] ||
                            obj.macroId ||
                            ''
                          }</span></div>`
                      )
                      .join('')
                  }
                } else {
                  return data
                }
              },
            },
          ],
          onDraw(tableData) {
            if (tableData[0] && tableData[0].isEdit) {
              const trs = context.reportTable.table.rows().nodes().toArray()
              let machineSelect
              let clockpickerEls
              trs.forEach((tr) => {
                machineSelect = tr.querySelector('[name=machine_id]')
                servkit.multiselectSettingSelectAll($(machineSelect))
                // Array.from(tr.querySelectorAll('.macro')).forEach(el => {
                //   servkit.initSelectWithList(context.preCon.macroMap, $(el));
                //   el.value = el.dataset.value;
                // });
                clockpickerEls = Array.from(tr.querySelectorAll('.clockpicker'))
                clockpickerEls.forEach((el, i) => {
                  $(el).clockpicker({
                    placement: 'left',
                    donetext: 'Done',
                  })
                })
              })
            }
          },
        })
        context.toggleEditData(false)
        // 隱藏選擇每頁筆數和跳頁的元件
        $('#table')
          .closest('.dataTables_wrapper')
          .find('.dt-toolbar-footer')
          .find('.dataTables_length, .dataTables_paginate')
          .addClass('hide')
        context.refreshLoadingBtn = servkit.loadingButton(
          document.getElementById('refresh-btn')
        )
        context.restoreLoadingBtn = servkit.loadingButton(
          document.getElementById('restore-btn')
        )
        $('#refresh-btn').on('click', context.getData.bind(context))
        $('#restore-btn').on('click', context.saveData.bind(context))
        $('#edit-btn').on('click', context.toggleEditData.bind(context, true))
        $('#cancel-btn').on(
          'click',
          context.toggleEditData.bind(context, false)
        )
        $('#new-group-btn').on('click', context.addNewRowBtn.bind(context))
        $('#table')
          .on('click', '.add-idle-time-edit-group', function () {
            const form = this.previousElementSibling
            const cloneForm = form.cloneNode(true)
            cloneForm.querySelector('.macro').value = ''
            Array.from(cloneForm.querySelectorAll('.clockpicker')).forEach(
              (el) => {
                el.value = ''
                $(el).clockpicker({
                  placement: 'left',
                  donetext: 'Done',
                })
              }
            )
            this.insertAdjacentElement('beforeBegin', cloneForm)
          })
          .on('click', '.remove-idle-time-edit-group', function () {
            const formLength = this.closest('td').querySelectorAll(
              '.idle-time-edit-form'
            ).length

            if (formLength === 1) {
              $.smallBox({
                title: `${i18n('Set_At_Least_One_Set_Of_Idle_Time')}`,
                color: servkit.statusColors.alarm,
                timeout: 4000,
              })
            } else {
              this.parentElement.remove()
            }
          })
          .on('click', '.remove-row-btn', function () {
            const rowCount = this.closest('tbody').querySelectorAll('tr').length

            if (rowCount === 1) {
              $.smallBox({
                title: `${i18n('Set_At_Least_One_Group')}`,
                color: servkit.statusColors.alarm,
                timeout: 4000,
              })
            } else {
              context.reportTable.table
                .row(this.closest('tr'))
                .remove()
                .draw(false)
            }
          })
      },
      getData() {
        const context = this
        const { refreshLoadingBtn, reportTable, JSON_FILE_PATH } = context
        refreshLoadingBtn.doing()
        servkit.ajax(
          {
            url: 'api/getdata/custParamJsonFile',
            type: 'GET',
            contentType: 'application/json',
            data: {
              filePath: JSON_FILE_PATH,
            },
          },
          {
            success(data) {
              reportTable.drawTable(
                JSON.parse(data).map((obj) =>
                  Object.assign(
                    {
                      isEdit: false,
                    },
                    obj
                  )
                )
              )
              refreshLoadingBtn.done()
            },
          }
        )
      },
      saveData() {
        const context = this
        const { JSON_FILE_PATH, reportTable } = context
        const validateDataMap = new Map()
        const trs = reportTable.table.rows().nodes().toArray()
        let jsonContent
        let group
        let machineList
        let idlePeriod
        let groupName
        context.restoreLoadingBtn.doing()
        trs.forEach((tr) => {
          groupName = tr.querySelector('[name=group-name]').value
          machineList = $(tr).find('[name=machine_id]').val() || []
          machineList = machineList.filter((v) => v !== 'ALL')
          idlePeriod = Array.from(tr.querySelectorAll('.inline-group'))
            .map((container) => {
              return {
                macroId: container.querySelector('.macro').value,
                startTime: container.querySelector('.start-time').value,
                endTime: container.querySelector('.end-time').value,
              }
            })
            .filter(({ startTime, endTime }) => startTime || endTime)
          group = {
            groupName,
            machineList,
            idlePeriod,
          }
          validateDataMap.set(tr, group)
        })

        if (!context.validate(validateDataMap)) {
          context.restoreLoadingBtn.done()
          return
        }

        jsonContent = Array.from(validateDataMap.values())

        servkit.ajax(
          {
            url: 'api/getdata/custParamFileSave',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              filePath: JSON_FILE_PATH,
              data: JSON.stringify(jsonContent),
            }),
          },
          {
            success(data) {
              context.reportTable.table.rows().remove()
              context.reportTable.table.rows.add(jsonContent)
              context.toggleEditData(false)
              context.restoreLoadingBtn.done()
            },
          }
        )
      },
      validate(dataMap) {
        const context = this
        const { reportTable } = context
        const highlightTr = new Set()
        const entriesIterator = dataMap.entries()
        const machineSet = new Set()
        const timeRegEx = /([01]\d|2[0-3]):[0-5]\d/
        let currIt = entriesIterator.next()
        let isDuplicateMachine = false
        let isEmptyMachine = false
        let isIncompleteTime = false
        let isWrongTimeRange = false
        let isWrongTimeFormat = false
        let isMissingPeriod = false
        while (!currIt.done) {
          const [tr, data] = currIt.value
          if (!data.machineList.length) {
            highlightTr.add(tr)
            isEmptyMachine = true
          } else if (data.machineList.some((id) => machineSet.has(id))) {
            highlightTr.add(tr)
            isDuplicateMachine = true
          } else if (!data.idlePeriod.length) {
            highlightTr.add(tr)
            isMissingPeriod = true
          } else if (
            data.idlePeriod.some((map) => !map.startTime || !map.endTime)
          ) {
            highlightTr.add(tr)
            isIncompleteTime = true
          } else if (
            data.idlePeriod.some(
              (map) =>
                !timeRegEx.test(map.startTime) || !timeRegEx.test(map.endTime)
            )
          ) {
            highlightTr.add(tr)
            isWrongTimeFormat = true
          } else if (!context.isValidTimeRange(data.idlePeriod)) {
            highlightTr.add(tr)
            isWrongTimeRange = true
          }
          data.machineList.forEach((id) => machineSet.add(id))
          currIt = entriesIterator.next()
        }
        if (highlightTr.size) {
          reportTable.blingRows(Array.from(highlightTr), 'rgba(255, 0, 0, 0.2)')
          let smallBoxContent = []
          if (isEmptyMachine) {
            smallBoxContent.push(`${i18n('The_Machine_Can_Not_Be_Null')}`)
          }
          if (isDuplicateMachine) {
            smallBoxContent.push(
              `${i18n('Intergroup_Machine_Can_Not_Be_Repeated')}`
            )
          }
          if (isIncompleteTime) {
            smallBoxContent.push(`${i18n('Idle_Interval_Is_Not_Set_Complete')}`)
          }
          if (isWrongTimeRange) {
            smallBoxContent.push(`${i18n('Wrong_Time')}`)
          }
          if (isWrongTimeFormat) {
            smallBoxContent.push(`${i18n('Time_Format_Error')}`)
          }
          if (isMissingPeriod) {
            smallBoxContent.push(`${i18n('Set_At_Least_One_Set_Of_Idle_Time')}`)
          }
          $.smallBox({
            title: `${i18n('Form_Information_Is_Wrong')}`,
            color: servkit.statusColors.alarm,
            content: smallBoxContent.join('<br>'),
            timeout: 4000,
          })
          return false
        } else {
          return true
        }
      },
      // 檢查時間區間是否重疊
      isValidTimeRange(data) {
        const sortedData = data.sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        )
        const flattenData = sortedData
          .map(({ startTime, endTime }) => [startTime, endTime])
          .flat()
        let isValid = true
        for (let i = 1, len = flattenData.length; i < len; i++) {
          if (flattenData[i].localeCompare(flattenData[i - 1]) < 0) {
            if (
              i === len - 1 &&
              flattenData[i].localeCompare(flattenData[0]) > 0
            ) {
              isValid = false
              break
            } else if (i < len - 1) {
              isValid = false
              break
            }
          }
        }
        return isValid
      },
      toggleEditData(isEdit = true) {
        const context = this
        const { reportTable } = context
        const trs = reportTable.table.rows().nodes().toArray()
        const filters = $('#table thead tr:first-child').find('input, select')
        let rowData

        $('#refresh-btn').toggleClass('hide', isEdit)
        $('#restore-btn').toggleClass('hide', !isEdit)
        $('#edit-btn').toggleClass('hide', isEdit)
        $('#cancel-btn').toggleClass('hide', !isEdit)
        $('#new-group-btn').toggleClass('hide', !isEdit)

        trs.forEach((tr) => {
          rowData = reportTable.table.row(tr).data()
          if (rowData && rowData.machineList.length) {
            reportTable.table
              .row(tr)
              .data(Object.assign({}, rowData, { isEdit }))
          } else if (rowData) {
            reportTable.table.row(tr).remove()
          }
        })
        // disable filter and clear search
        if (isEdit) {
          filters.toArray().forEach((el) => {
            el.value = ''
          })
          reportTable.table.columns().search('')
        }
        reportTable.table.column(0).visible(isEdit)
        reportTable.table.draw(false)
        filters.prop('disabled', isEdit)
      },
      addNewRowBtn() {
        const context = this
        const { reportTable } = context

        reportTable.table.rows
          .add([
            {
              isEdit: true,
              idlePeriod: [
                {
                  macroId: '',
                  startTime: '',
                  endTime: '',
                },
              ],
              machineList: [],
              groupName: '',
            },
          ])
          .draw(false)
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      macroMap(done) {
        this.commons.macroMap(done)
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
      ['/js/plugin/clockpicker/clockpicker.min.js'],
    ],
  })
}
