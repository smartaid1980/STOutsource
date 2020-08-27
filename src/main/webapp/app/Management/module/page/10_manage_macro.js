import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      var pagefunction = function () {
        var $inputSelect = $('#input-select')
        var $macroValue = $('#macro-value')
        var $macroSubmit = $('#macro-submit')
        //建立box選單
        ;(function () {
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'm_box',
                columns: ['box_id'],
              }),
            },
            {
              success: function (data) {
                //初始化boxId選單
                _.each(data, function (ele) {
                  $inputSelect.append(
                    '<option value="' +
                      ele['box_id'] +
                      '">' +
                      ele['box_id'] +
                      '</option>'
                  )
                })
                readMacro($inputSelect.val())
                //smallBox({selectColor:"green", title:"資料讀取成功", icon:"fa fa-check", timeout:2000});
              },
              fail: function (data) {
                smallBox({
                  selectColor: 'red',
                  title: 'ServBox ids read fail',
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                })
              },
            }
          )
        })()

        //切換不同ServBox，重讀macro
        $inputSelect.on('change', function () {
          readMacro($inputSelect.val())
        })
        //submit時更新macro
        $macroSubmit.on('click', function () {
          updateMacro($inputSelect.val(), $macroValue.val())
          return false
        })

        function readMacro(boxId) {
          servkit.ajax(
            {
              url: 'api/box/readMacro',
              type: 'GET',
              contentType: 'application/json',
              data: { boxId: boxId },
            },
            {
              success: function (data) {
                $macroValue.val(data)
                smallBox({
                  selectColor: 'green',
                  title: 'read macro success',
                  icon: 'fa fa-check',
                  timeout: 2000,
                })
              },
              fail: function (data) {
                $macroValue.val('')
                smallBox({
                  selectColor: 'red',
                  title: 'read macro fail',
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                })
              },
            }
          )
        }

        function updateMacro(boxId, newMacro) {
          servkit.ajax(
            {
              url: 'api/box/updateMacro',
              type: 'PUT',
              contentType: 'application/json',
              data: JSON.stringify({
                boxId: boxId.toString(),
                macro: newMacro.toString(),
              }),
            },
            {
              success: function (data) {
                smallBox({
                  selectColor: 'green',
                  title: 'update macro success',
                  icon: 'fa fa-check',
                  timeout: 2000,
                })
                askRebootServBox(boxId)
              },
              fail: function (data) {
                smallBox({
                  selectColor: 'red',
                  title: 'update macro fail',
                  icon: 'fa fa-sign-out',
                  timeout: 2000,
                })
              },
            }
          )
        }

        function askRebootServBox(boxId) {
          // ask verification
          $.SmartMessageBox(
            {
              title:
                "<i class='fa fa-exclamation-circle txt-color-orangeDark'></i>" +
                "<span class='txt-color-orangeDark'><strong> Reboot ? </strong></span> ",
              content: `${i18n('Reboot_ServBox_hint')}`,
              buttons: '[No][Yes]',
            },
            function (ButtonPressed) {
              if (ButtonPressed == 'Yes') {
                setTimeout(function () {
                  servkit.ajax(
                    {
                      url: 'api/trex/restartServBox',
                      type: 'GET',
                      contentType: 'application/json',
                      //data: JSON.stringify({"boxId":boxId.toString()})
                    },
                    {
                      success: function (data) {
                        smallBox({
                          selectColor: 'green',
                          title: 'restart box success',
                          icon: 'fa fa-check',
                          timeout: 2000,
                        })
                      },
                      fail: function (data) {
                        smallBox({
                          selectColor: 'red',
                          title: 'restart box fail',
                          icon: 'fa fa-sign-out',
                          timeout: 6000,
                        })
                      },
                    }
                  )
                }, 1000)
              }
            }
          )
        }

        //成功或失敗訊息
        function smallBox(params) {
          //selectColor, title, icon, timeout
          var colors = { green: '#739E73', red: '#C46A69', yellow: '#C79121' }
          $.smallBox({
            sound: false, //不要音效
            title: params.title,
            content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
            color: colors[params.selectColor],
            iconSmall: params.icon,
            timeout: params.timeout,
          })
        }
      }
      pagefunction()
    },
  })
}
