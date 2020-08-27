import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function () {
      console.log('hi')
      $('#stk-pg-table').on('click', '.stk-modal-btn', function (evt) {
        evt.preventDefault()
        $('#myModalLabel').data('pg', $(this).data('pg'))
        $('#myModalLabel').data('start', $(this).data('start'))
        $('#myModalLabel').data('end', $(this).data('end'))
        $('#myModalLabel').data('machine', $(this).data('machine'))
        $('#myModalLabel').html(
          `${i18n('Main_Program_Time')}` +
            $(this).data('pg') +
            ` ${i18n('Machine')}` +
            servkit.getMachineName($(this).data('machine')) +
            '(' +
            $(this).data('start') +
            '~' +
            $(this).data('end') +
            ')'
        )
        $('#stk-run-table').data('crudTableConfig').read.whereClause =
          'pg_name="' +
          $(this).data('pg') +
          '"&machine_id="' +
          $(this).data('machine') +
          '"&start_time="' +
          $(this).data('start') +
          '"&end_time="' +
          $(this).data('end') +
          '"'
        $('#stk-run-table_wrapper').find('.stk-refresh-btn').trigger('click')
        $('#run-modal').modal('show')
      })
      $('#run-modal').on('hidden.bs.modal', function () {
        $('#stk-pg-table_wrapper').find('.stk-refresh-btn').trigger('click')
      })
      servkit.crudtable({
        tableSelector: '#stk-pg-table',
        rightColumn: [6],
        create: {
          url: 'api/stdcrud',
          start: function (newTr) {
            var config = {
              format: 'YYYY/MM/DD HH:mm:ss',
              useCurrent: false,
              showClose: true,
              sideBySide: true,
            }
            $(newTr)
              .find('[name=start_time], [name=end_time]')
              .datetimepicker(config)
          },
          send: function () {
            return {
              tableModel: 'com.servtech.servcloud.module.model.MainProgram',
            }
          },
          end: {
            5: function (td) {
              return (
                '<span class="label label-primary" style="float:left;margin:5px;"><i class="fa fa-tag"></i>&nbsp;' +
                $(td).find('input').val() +
                '</span>'
              )
            },
            7: function (td, formData) {
              var start = '---',
                end = '---'
              if (formData.start_time) {
                start = moment(formData.start_time).format(
                  'YYYY/MM/DD HH:mm:ss'
                )
              }
              if (formData.end_time) {
                end = moment(formData.end_time).format('YYYY/MM/DD HH:mm:ss')
              }
              return (
                '<button class="btn btn-xs btn-primary stk-modal-btn" data-pg="' +
                (formData.pg_name || '---') +
                '" data-start="' +
                start +
                '" data-end="' +
                end +
                '" data-machine="' +
                (formData.machine_id || '---') +
                '"><i class="fa fa-pencil"></i></button>'
              )
            },
          },
        },
        read: {
          url: 'api/shzbg/single/read',
          end: {
            1: function (data) {
              return moment(data).format('YYYY/MM/DD HH:mm:ss')
            },
            2: function (data) {
              return moment(data).format('YYYY/MM/DD HH:mm:ss')
            },
            5: function (data, rowData) {
              if (rowData.run_program) {
                return _.map(rowData.run_program, function (ele) {
                  return ele.run_program
                })
              }
            },
            6: function (data, rowData) {
              var time = 0
              if (rowData.run_program) {
                _.each(rowData.run_program, function (ele) {
                  time += parseInt(ele.time)
                })
              }
              return time
            },
            7: function (data, rowData) {
              var start = '---',
                end = '---'
              if (rowData.start_time) {
                start = moment(rowData.start_time).format('YYYY/MM/DD HH:mm:ss')
              }
              if (rowData.end_time) {
                end = moment(rowData.end_time).format('YYYY/MM/DD HH:mm:ss')
              }
              return (
                '<button class="btn btn-xs btn-primary stk-modal-btn" data-pg="' +
                (rowData.pg_name || '---') +
                '" data-start="' +
                start +
                '" data-end="' +
                end +
                '" data-machine="' +
                (rowData.machine_id || '---') +
                '"><i class="fa fa-pencil"></i></button>'
              )
            },
          },
        },
        update: {
          unavailable: true,
        },
        delete: {
          url: 'api/shzbg/single/delete',
        },
        validate: {
          1: function (td) {
            // 起始時間
            var input = td.querySelector('input')

            // 不為空值
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }
          },
          2: function (td) {
            // 結束時間
            var input = td.querySelector('input')

            // 不為空值
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }
            var startTime = moment(
              $('[name=start_time]').val(),
              'YYYY/MM/DD HH:mm:ss'
            )
            if (
              moment(input.value, 'YYYY/MM/DD HH:mm:ss').isBefore(startTime)
            ) {
              return `${i18n('Set_Program_Time_Info')}`
            }
          },
          3: function (td) {
            // 主程式名稱
            var input = td.querySelector('input')

            // 不為空值
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }
          },
          4: function (td, table) {
            // 機台
            var input = td.querySelector('select')

            // 不為空值
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }

            var sameTimeSameMachine = false
            var inputStartTime = moment(
              $('[name=start_time]').val(),
              'YYYY/MM/DD HH:mm:ss'
            )
            var inputEndTime = moment(
              $('[name=end_time]').val(),
              'YYYY/MM/DD HH:mm:ss'
            )
            _.each(table.columns(3).data().eq(0), function (existMachine, key) {
              var startTime = moment(
                table.columns(0).data().eq(0)[key],
                'YYYY/MM/DD HH:mm:ss'
              )
              var endTime = moment(
                table.columns(1).data().eq(0)[key],
                'YYYY/MM/DD HH:mm:ss'
              )
              var sameTime = false,
                sameMachine = false
              if (
                !(
                  (inputStartTime.isBefore(startTime) &&
                    inputEndTime.isBefore(startTime)) ||
                  (inputStartTime.isAfter(endTime) &&
                    inputEndTime.isAfter(endTime))
                )
              ) {
                sameTime = true
              }
              if (existMachine === servkit.getMachineName(input.value)) {
                sameMachine = true
              }
              if (sameTime && sameMachine) {
                sameTimeSameMachine = true
              }
            })
            if (sameTimeSameMachine) {
              return `${i18n('Set_Program_Machine_Info')}`
            }
          },
          5: function (td) {
            // 子程式名稱
            var input = td.querySelector('input')

            // 不為空值
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }
          },
          6: function (td) {
            // 運行時間
            var value = td.querySelector('input').value
            var regExpPositiveInteger = /^[1-9][0-9]*$/

            // 不為空值
            if (value === '') {
              return `${i18n('Stk_Required')}`
            }

            // 為正整數
            if (!regExpPositiveInteger.test(value)) {
              return `${i18n('Time_Greater_Than_0')}`
            }
          },
        },
      })
      servkit.crudtable({
        tableModel: 'com.servtech.servcloud.module.model.MainProgram',
        tableSelector: '#stk-run-table',
        rightColumn: [2],
        create: {
          url: 'api/stdcrud',
          send: function () {
            return {
              pg_name: String($('#myModalLabel').data('pg')),
              start_time: String($('#myModalLabel').data('start')),
              end_time: String($('#myModalLabel').data('end')),
              machine_id: String($('#myModalLabel').data('machine')),
            }
          },
        },
        read: {
          url: 'api/stdcrud',
        },
        update: {
          url: 'api/stdcrud',
          send: function () {
            return {
              pg_name: String($('#myModalLabel').data('pg')),
              start_time: String($('#myModalLabel').data('start')),
              end_time: String($('#myModalLabel').data('end')),
              machine_id: String($('#myModalLabel').data('machine')),
            }
          },
        },
        delete: {
          url: 'api/stdcrud',
        },
        validate: {
          // 子程式名稱
          1: function (td, table) {
            var input = td.querySelector('input')

            // 不為空值
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }

            // 不得重複
            if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId.toLowerCase() === input.value.toLowerCase()
                })
              ) {
                return `${i18n('Stk_Pk')}`
              }
            }
          },
          // 運行時間
          2: function (td) {
            var value = td.querySelector('input').value
            var regExpPositiveInteger = /^[1-9][0-9]*$/

            // 不為空值
            if (value === '') {
              return `${i18n('Stk_Required')}`
            }

            // 為正整數
            if (!regExpPositiveInteger.test(value)) {
              return `${i18n('Time_Greater_Than_0')}`
            }
          },
        },
      })
    },
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js'],
    ],
  })
}
