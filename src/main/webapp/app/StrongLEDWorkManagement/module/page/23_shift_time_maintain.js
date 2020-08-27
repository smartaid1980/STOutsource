import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      var createAndUpdateEnd = {
        2: function (td) {
          var result = $(td).find('input').val()
          return '<p align="right">' + parseFloat(result).toFixed(2) + '<p>'
        },
      }
      servkit.crudtable({
        tableSelector: '#stk-work-shift-table',
        create: {
          unavailable: true,
          url: 'api/servtrack/shifttime/create',
          start: ctx.initDatepicker,
          end: createAndUpdateEnd,
        },
        read: {
          url: 'api/servtrack/shifttime/read',
          end: {
            2: function (data) {
              return '<p align="right">' + parseFloat(data).toFixed(2) + '<p>'
            },
          },
          finalDo: ctx.activeCheck,
        },
        update: {
          url: 'api/servtrack/shifttime/update',
          start: {
            1: function (oldTd, newTd) {
              ctx.initDatepicker(newTd)
              $(newTd).find('[name=start_time]').val(oldTd.textContent)
            },
          },
          end: createAndUpdateEnd,
        },
        delete: {
          unavailable: true,
        },
        validate: {
          1: function (td) {
            var input = td.querySelector('input')
            if (input.value === '') {
              return `${i18n('ServTrackManagement_000019')}`
            }
          },
          2: function (td) {
            var input = td.querySelector('input')
            var regFloat = /^[0-9]+(.[0-9]{0,2})?$/
            if (input.value === '') {
              return `${i18n('ServTrackManagement_000090')}`
            } else if (isNaN(input.value)) {
              return `${i18n('ServTrackManagement_000006')}`
            } else if (Number(input.value) > 24) {
              return `${i18n('ServTrackManagement_000126')}`
            } else if (!regFloat.test(input.value)) {
              return `${i18n('ServTrackManagement_000128')}`
            }
          },
        },
      })

      $('.dt-toolbar').hide()
      $('#stk-work-shift-table')
        .closest('div')
        .find('div > .stk-delete-btn')
        .hide()
      $('#stk-work-shift-table')
        .closest('div')
        .find('div > .stk-insert-btn')
        .hide()
      $('#stk-work-shift-table')
        .closest('div')
        .find('div > .stk-refresh-btn')
        .hide()
      $('#stk-work-shift-table > thead')
        .find('tr')
        .eq(1)
        .find('tr')
        .eq(0)
        .html('')
    },
    util: {
      initDatepicker: function (parent) {
        var $clockPicker = $('.clockpicker')
        if (parent) {
          $clockPicker = $(parent).find('.clockpicker')
        }

        $clockPicker.each(function (i, e) {
          $(e).clockpicker({
            placement: 'left',
            donetext: 'Done',
          })
        })
      },
      activeCheck: function () {
        _.each($('#stk-work-shift-table').find('tbody > tr'), function (trEle) {
          var tdCheckBoxEle = $(trEle).find('td:first-child input')
          tdCheckBoxEle.hide()
          _.each(
            document.querySelectorAll('.stk-delete-all-checkbox'),
            function (ele) {
              ele.style.display = 'none'
            }
          )
        })
      },
    },
    dependencies: [
      ['/js/plugin/clockpicker/clockpicker.min.js'],
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
