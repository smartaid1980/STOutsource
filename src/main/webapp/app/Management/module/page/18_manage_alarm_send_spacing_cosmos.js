import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initSpacingTable()
      // pageSetUp();
      $('#stk-alarm-spacing-table tbody').on(
        'click',
        '.stk-cancel-btn,.stk-save-btn',
        function (e) {
          var elem = $('#stk-alarm-spacing-table').find('tbody tr')
          if (
            !($(elem).find('td').eq(0).html() === 'No data available in table')
          ) {
            if (elem.length > 0) {
              $('.stk-insert-btn').attr('disabled', true)
            } else {
              $('.stk-insert-btn').attr('disabled', false)
            }
          }
        }
      )
    },
    util: {
      $upperLimitSpacing: $('[name=upper_limit_spacing]'),
      $alarmSpacing: $('[name=alarm_spacing]'),
      machineObj: {},
      initSpacingTable: function () {
        function createAndUpdateSend(tdEles) {
          return {
            upper_limit_spacing: (function () {
              return '-1'
            })(),
          }
        }

        var createAndUpdateEnd = {
          1: function (td) {
            return $(td).css('display', 'none')
          },
        }

        servkit.crudtable({
          tableSelector: '#stk-alarm-spacing-table',
          create: {
            url: 'api/productionefficiency/sendspacing/create',
            start: function (tdEles) {
              var elem = $('#stk-alarm-spacing-table').find('tbody tr')
              $(elem).find('td').eq(1).css('display', 'none')
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            finalDo: function () {
              var elem = $('#stk-alarm-spacing-table').find('tbody tr')
              $(elem).find('td').eq(1).css('display', 'none')
              if (
                !(
                  $(elem).find('td').eq(0).html() ==
                  'No data available in table'
                )
              ) {
                if (elem.length > 0) {
                  $('.stk-insert-btn').attr('disabled', true)
                }
              } else {
                $('.stk-insert-btn').attr('disabled', false)
              }
            },
          },
          read: {
            url: 'api/productionefficiency/sendspacing/read',
            finalDo: function () {
              var elem = $('#stk-alarm-spacing-table').find('tbody tr')
              $(elem).find('td').eq(1).css('display', 'none')
              if (
                !(
                  $(elem).find('td').eq(0).html() ==
                  'No data available in table'
                )
              ) {
                if (elem.length > 0) {
                  $('.stk-insert-btn').attr('disabled', true)
                }
              } else {
                $('.stk-insert-btn').attr('disabled', false)
              }
            },
          },
          update: {
            url: 'api/productionefficiency/sendspacing/update',
            start: {
              1: function () {
                var elem = $('#stk-alarm-spacing-table').find('tbody tr')
                $(elem).find('td').eq(1).css('display', 'none')
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            finalDo: function () {
              var elem = $('#stk-alarm-spacing-table').find('tbody tr')
              $(elem).find('td').eq(1).css('display', 'none')
              if (
                !(
                  $(elem).find('td').eq(0).html() ==
                  'No data available in table'
                )
              ) {
                if (elem.length > 0) {
                  $('.stk-insert-btn').attr('disabled', true)
                }
              } else {
                $('.stk-insert-btn').attr('disabled', false)
              }
            },
            // send: createAndUpdateSend,
            // end:  createAndUpdateEnd
          },
          delete: {
            url: 'api/productionefficiency/sendspacing/delete',
            finalDo: function () {
              var elem = $('#stk-alarm-spacing-table').find('tbody tr')
              $(elem).find('td').eq(1).css('display', 'none')
              if (
                !(
                  $(elem).find('td').eq(0).html() ==
                  'No data available in table'
                )
              ) {
                if (elem.length > 0) {
                  $('.stk-insert-btn').attr('disabled', true)
                }
              } else {
                $('.stk-insert-btn').attr('disabled', false)
              }
            },
          },
          validate: {
            // 1: function(td, table) {
            //     var input = td.querySelector('input');
            //     var intValue = parseInt(input.value);
            //     if (intValue === '') {
            //         return `${i18n('Stk_Required')}`;
            //     } else if (intValue ==0 || intValue <0 ){
            //         return "發送間隔不可等於0或者小於0";
            //     } else if (isNaN(intValue)) {
            //         return "請輸入數字...";
            //     }
            // },
            2: function (td, table) {
              var input = td.querySelector('input')
              var intValue = parseInt(input.value)
              if (intValue === '') {
                return `${i18n('Stk_Required')}`
              } else if (intValue == 0 || intValue < 0) {
                return `${i18n('Value_Greater_Than_0')}`
              } else if (isNaN(intValue)) {
                return `${i18n('Valid_Number')}`
              }
            },
          },
        })
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
