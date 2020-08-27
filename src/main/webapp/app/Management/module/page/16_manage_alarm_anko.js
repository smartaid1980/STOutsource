import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      function createAndUpdateSend(tdEles) {
        return {
          cnc_id: (function () {
            return $(tdEles[0]).find('select').val()
          })(),
          alarm_id: (function () {
            var alarm10 = $(tdEles[1]).find('input').val()
            // console.log("alarm10: ", alarm10);
            return alarm10
            // return $(tdEles[0]).find('select').val();
          })(),
          /* machine_type_id: (function () {
           return $(tdEles[1]).find('select').val();
           } ()),
           source: (function () {
           if ($(tdEles[5]).find('input:checked').length) {
           return 1;
           } else {
           return 0;
           }
           } ()), */
          machine_type_id: 'OTHER', // 安口沒機種，所以使用預設值
          source: 0, // 安口沒故障排除，所以使用預設值
        }
      }

      var createAndUpdateEnd = {
        /* 3: function (td) {
         //console.log($(td).find('input:checked').length);
         if ($(td).find('input:checked').length) {
         return '<span class="label label-success" style="cursor:pointer">ON</span>';
         } else {
         return '<span class="label label-default" style="cursor:pointer">OFF</span>';
         }
         }, */
        /* 7: function (td) {
         //console.log($(td).find('input:checked').length);
         if ($(td).find('input:checked').length) {
         return '<span class="label label-success" style="cursor:pointer">ON</span>';
         } else {
         return '<span class="label label-default" style="cursor:pointer">OFF</span>';
         }
         }, */
      }

      initCrudtable()

      function initCrudtable() {
        servkit.crudtable({
          tableSelector: '#stk-machine-name-table',
          create: {
            url: 'api/alarm/create',
            send: createAndUpdateSend,
            start: function (newTr, table) {
              // 預設都選'OTHER'
              $(newTr[0]).find('option[value="OTHER"]').prop('selected', true)
              $(newTr[1]).find('option[value="OTHER"]').prop('selected', true)
            },
            end: createAndUpdateEnd,
            fail: function (data) {
              if (data.indexOf('Duplicate') > -1) {
                return `${i18n('ID_Already_Exists')}`
              } else {
                return `${i18n('Exception_Msg')}`
              }
            },
          },
          read: {
            url: 'api/alarm/read',
            end: {
              1: function (data) {
                return [data.name]
              },
              3: function (data) {
                // 轉成十六進位
                var alarm16 = parseInt(data).toString(16).toUpperCase()
                if (alarm16.toString().length == 1) {
                  alarm16 = 0 + alarm16
                }
                return alarm16.toString()
              },
              5: function (data) {
                if (data === undefined) {
                  return ''
                } else {
                  return data
                }
              },
              /* 7: function (data) {
               if (data === 1) {
               return '<span class="label label-success" style="cursor:pointer">ON</span>';
               } else {
               return '<span class="label label-default" style="cursor:pointer">OFF</span>';
               }
               } */
            },
          },
          update: {
            url: 'api/alarm/update',
            start: {
              /* 7: function (oldTd, newTd, oldTr, newTr) {
               console.log(oldTd.textContent);
               if (oldTd.textContent.indexOf('ON') != -1) {
               newTd.querySelector('input').checked = true;
               } else {
               newTd.querySelector('input').checked = false;
               }
               }, */
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            fail: function (data) {
              console.log('update fail: ', data)
              return data
            },
          },
          delete: {
            url: 'api/alarm/delete',
            fail: function (data) {
              console.log('delete fail: ', data)
              if (data.indexOf('FOREIGN KEY') > -1) {
                return `${i18n('Delete_FK_Error_Msg')}`
              } else {
                return `${i18n('Exception_Msg')}`
              }
            },
          },
          validate: {
            2: function (td, table) {
              // 驗證資料
              var input = td.querySelector('input')
              var alarm10Val = input.value

              var alarm16Td = $(td).siblings().find("input[cust='alarm16']")[0]
              var alarm16Val = $(td)
                .siblings()
                .find("input[cust='alarm16']")
                .val()

              if (
                alarm10Val.trim().length > 0 &&
                alarm16Val.trim().length > 0
              ) {
                // 兩欄都填
                return `${i18n('10_And_16_Only_One_Selected')}`
              } else if (
                alarm10Val.trim().length == 0 &&
                alarm16Val.trim().length == 0
              ) {
                // 兩欄都沒填
                return `${i18n('10_And_16_Is_Null')}`
              }
            },
            3: function (td, table) {
              // 驗證資料與轉換
              var input = td.querySelector('input')
              var alarm16Val = input.value

              var alarm10Td = $(td).siblings().find("input[cust='alarm10']")[0]
              var alarm10Val = $(td)
                .siblings()
                .find("input[cust='alarm10']")
                .val()

              if (
                alarm10Val.trim().length > 0 &&
                alarm16Val.trim().length > 0
              ) {
                // 兩欄都填
                return `${i18n('10_And_16_Only_One_Selected')}`
              } else if (
                alarm10Val.trim().length == 0 &&
                alarm16Val.trim().length == 0
              ) {
                // 兩欄都沒填
                return `${i18n('10_And_16_Is_Null')}`
              } else if (alarm10Val.trim().length > 0) {
                // 十進位有值
                var newAlarm16 = parseInt(alarm10Val).toString(16).toUpperCase()
                if (newAlarm16.toString().length == 1) {
                  newAlarm16 = '0' + newAlarm16
                }
                $(td).find('input').val(newAlarm16.toString()) // 轉回十六進位
              } else {
                // 十六進位有值
                console.log(alarm10Td)
                $(alarm10Td).val(parseInt(alarm16Val, 16)) // 轉回十進位
              }
              /* if (input.value === '') {
               return `${i18n('Stk_Required')}`;
               } */
            },
          },
        })
      }
    },
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
