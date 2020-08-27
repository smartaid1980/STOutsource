import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var machineId = $('#machine_id').val()
      var shiftDate = $('#query_date').val()
      servkit.validateForm($('#idle_form'), $('#submit_btn'))
      var datepickerConfig = {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      }
      $('#submit_btn').on('click', function (evt) {
        evt.preventDefault()
        var machineId = $('#machine_id').val()
        var shiftDate = $('#query_date').val()
        var criterai =
          'api/enhancement/idleRecord?machine_id=' +
          machineId +
          '&shift_date=' +
          shiftDate
        var tableModel = $('#idle_table').data('crudTableConfig').tableModel
        $('#idle_table').data('crudTableConfig').read.url = criterai
        delete $('#idle_table').data('crudTableConfig').tableModel
        $('#idle_table')
          .closest('.dataTables_wrapper')
          .find('.stk-refresh-btn')
          .trigger('click')
      })
      $('#query_date')
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      servkit.initSelectWithList(
        context.preCon.get_m_device_list,
        $('#machine_id')
      )
      servkit.crudtable({
        tableSelector: '#idle_table',
        order: [[0, 'asc']],
        create: {
          unavailable: true,
        },
        read: {
          url:
            'api/enhancement/idleRecord?machine_id=' +
            machineId +
            '&shift_date=' +
            shiftDate,
          end: {
            7: function (data, rowData) {
              return '<button class="btn btn-xs btn-warning fix-btn" title="Fix"><i class="fa fa-gear"></i></button>'
            },
          },
        },
        update: {
          url: 'api/stdcrud',
          send: function () {
            return {
              tableModel:
                'com.servtech.servcloud.app.model.enhancement.IdleRecord',
            }
            // $('#idle_table').data('crudTableConfig').tableModel =
          },
          end: {
            7: function (data, rowData) {
              return '<button class="btn btn-xs btn-warning fix-btn" title="Fix"><i class="fa fa-gear"></i></button>'
            },
          },
          finalDo: function () {
            delete $('#idle_table').data('crudTableConfig').tableModel
          },
        },
        delete: {
          unavailable: true,
        },
      })

      $('#split_count').on('change', function (evt) {
        $('#modal_table > tbody').html('')
        var count = this.value
        if (count === '') count = 0
        if (!isNaN(count) && Number(count) > 0) {
          for (var i = 0; i < Number(count); i++) {
            var $tr = $('<tr name="split_data"></tr>')
            var $idleCode = $(
              '<td><input type="text" class="form-control"></td>'
            )
            var $startTime = context.initDateTimePicker(
              $('#modal_start').val(),
              'record_start'
            )
            var $endTime = context.initDateTimePicker(
              $('#modal_end').val(),
              'record_end'
            )
            $tr.append($idleCode)
            $tr.append($startTime)
            $tr.append($endTime)
            $('#modal_table > tbody').append($tr)
            if ($tr.prev().length) {
              var $prev = $tr.prev()
              var $prevEndTime = $prev.find('td input').eq(2)
              $prevEndTime.removeAttr('disabled')
              $prevEndTime.val('')
              $prevEndTime.blur()
            }
          }
          $('#modal_table').show()
        } else {
          $('#modal_table').hide()
        }
      })

      $('#fix-modal').on('hidden.bs.modal', function (evt) {
        $('#split_count').val('0')
        $('#split_count').change()
      })

      $('#modal_table').on('blur', 'input[name="record_end"]', function (evt) {
        $(this)
          .closest('tr')
          .next()
          .find('input[name="record_start"]')
          .eq(0)
          .val(this.value)
      })

      $('#modal-submit-btn').on('click', function (evt) {
        evt.preventDefault()
        var isOk = true
        var data = []
        var failDom = []
        _.each($('#modal_table > tbody').find('[name="split_data"]'), function (
          dom
        ) {
          var code = $(dom).find('td  input:eq(0)').val()
          var startTime = $(dom).find('td  input:eq(1)').val()
          var endTime = $(dom).find('td  input:eq(2)').val()
          if (!context.validateData(code, startTime, endTime)) {
            failDom.push(dom)
            isOk = false
          } else {
            var obj = {
              machine_id: $('#modal_machine_id').val(),
              shift_date: $('#modal_query_date').val(),
              status: $('#modal_status').val(),
              idle_id: code,
              start_time: startTime,
              end_time: endTime,
              tag: 'A',
            }
            data.push(obj)
          }
        })
        if (isOk) {
          context.appendIdleDatas(data)
        } else {
          _.each(failDom, function (dom) {
            context.blingbling(dom)
          })
        }
      })
      $('#idle_table').on('click', '.fix-btn', function (evt) {
        var $tr = $(this).closest('tr')
        var arr = []
        _.each($tr.find('td'), function (ele) {
          var val = $(ele).text()
          if (val !== '') {
            arr.push(val)
          }
        })
        context.fixData = arr
        $('#modal_machine_id').val(arr[0])
        $('#modal_query_date').val(arr[1])
        $('#modal_status').val(arr[2])
        $('#modal_code').val(arr[3])
        $('#modal_start').val(arr[4])
        $('#modal_end').val(arr[5])
        $('#fix-modal').modal('toggle')
      })
    },
    util: {
      fixData: [],
      initDateTimePicker: function (val, name) {
        var $td = $('<td></td')
        var $div = $('<div class="input-group date"></div>')
        var $input = $('<input type="text" class="form-control" disabled/>')
        var $span = $(
          '<span class="input-group-addon" ><span class="glyphicon glyphicon-calendar"></span></span>'
        )
        $div.append($input)
        $div.append($span)
        $input.attr('name', name)
        var config = {
          format: 'YYYY/MM/DD HH:mm:ss',
          useCurrent: false,
          showClose: true,
          sideBySide: true,
        }
        $div.datetimepicker(config)
        $input.val(val)
        $td.append($div)
        return $td
      },
      validateData: function (idle, start, end) {
        var flagStartTime = new Date($('#modal_start').val()).getTime()
        var flagEndTime = new Date($('#modal_end').val()).getTime()
        var startTime = new Date(start).getTime()
        var endTime = new Date(end).getTime()
        if (idle === '' || idle === undefined || idle === null) {
          return false
        }
        if (
          startTime < flagStartTime ||
          startTime > flagEndTime ||
          startTime >= endTime
        ) {
          return false
        }
        if (
          endTime <= startTime ||
          endTime < flagStartTime ||
          endTime > flagEndTime
        ) {
          return false
        }
        return true
      },
      appendIdleDatas: function (datas) {
        servkit.ajax(
          {
            url: 'api/enhancement/idleRecord',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(datas),
          },
          {
            success: function (data) {
              $('#fix-modal').modal('hide')
              var $refresh = $(document.querySelector('.stk-refresh-btn'))
              $refresh.trigger('click')
              $.smallBox({
                title: `${i18n('Add_Success')}`,
                content:
                  "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
                color: '#739E73',
                iconSmall: 'fa fa-check',
                timeout: 4000,
              })
            },
            fail: function (data) {
              console.log(data)
              $.smallBox({
                title: `${i18n('Add_Fail')}`,
                content:
                  "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
                color: '#C79121',
                iconSmall: 'fa fa-sign-out',
                timeout: 4000,
              })
            },
          }
        )
      },
      blingbling: function (dom) {
        var $elements = $(dom)
        var actBlingTimes = 5 * 2 + 1
        var blingCount = 1
        setTimeout(function change() {
          if (blingCount < actBlingTimes) {
            if (blingCount++ % 2 === 0) {
              $elements.css('background-color', '')
            } else {
              $elements.css('background-color', 'rgba(255, 0, 0, 0.2)')
            }
            setTimeout(change, 200)
          }
        }, 0)
      },
    },
    preCondition: {
      get_m_device_list: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_name', 'device_id'],
            }),
          },
          {
            success: function (data) {
              var dataMap = {}
              _.each(data, function (elem, key) {
                dataMap[elem.device_id] = elem.device_name
              })
              done(dataMap)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js',
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
