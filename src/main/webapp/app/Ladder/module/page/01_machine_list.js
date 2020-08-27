import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (ctx) {
      var notUploadTip = {
        intervalId: undefined,
        $card: undefined,
      }

      // 長卡
      $('.list')
        .html(
          _.map(servkit.getMachineList(), function (machineId) {
            return ctx.createCard(machineId, ctx.preCon.ladders[machineId])
          }).join('')
        )
        .on('click', '.card .header, .card .tab-chart', function (evt) {
          var $card = $(evt.target).parents('.card'),
            machineId = $card.attr('id')

          // 有就跳頁面
          if ($card.data('has-ladder')) {
            ctx.gogoAnother({
              appId: 'Ladder',
              funId: '02_ladder_monitor',
              currentTab: true,
              // graceTag: 'tagName',
              graceParam: {
                machineId: machineId,
              },
            })

            // 沒有就閃爍文字提示
          } else {
            if (notUploadTip.intervalId) {
              clearInterval(notUploadTip.intervalId)
              notUploadTip.$card
                .find('.ladder-name')
                .removeClass('txt-color-red')
            }
            var times = 10
            notUploadTip.intervalId = setInterval(function () {
              if (times) {
                $card.find('.ladder-name').toggleClass('txt-color-red')
                times -= 1
              } else {
                clearInterval(notUploadTip.intervalId)
                notUploadTip.intervalId = undefined
              }
            }, 100)
            notUploadTip.$card = $card
          }
        })

      // 聽狀態
      if (ctx.preCon.boxId) {
        servkit.subscribe('DeviceStatus', {
          machines: ctx.preCon.boxId,
          handler: function (data) {
            data[0].eachMachine('G_CONS()', function (multisystem, machineId) {
              var statusClass = ''
              switch (multisystem[0][0]) {
                case '11':
                  statusClass = 'online'
                  break
                case '12':
                  statusClass = 'idle'
                  break
                case '13':
                  statusClass = 'alarm'
                  break
                default:
                  break
              }
              $('#' + machineId)
                .removeClass('online idle alarm')
                .addClass(statusClass)
            })
          },
          dataModeling: true,
        })
      }

      // 弄上傳
      servkit.eachMachine(function (id, name) {
        var $card = $('#' + id),
          $form = $card.find('form'),
          $fileInput = $form.find('input[type="file"]')

        var uploader = servkit.uploader({
          formEle: $form[0],
          api: 'api/ladder/routine/upload',
          resolver: {
            success: function (data) {
              $card
                .data('has-ladder', true)
                .find('.tab-text .label')
                .removeClass('label-danger')
                .addClass('label-info')
                .html(data)
              $fileInput[0].disabled = false // 給你點
              $form.find('.upload-tip').html(`${i18n('Select_File')}`)
              $.bigBox({
                title: `${i18n('Upload_Success')}`,
                content: `${i18n('Ladder_Name')}` + data,
                color: '#739E73',
                icon: 'fa fa-check animated',
                number: '',
                timeout: 6000,
              })
            },
            fail: function (data) {
              $card
                .data('has-ladder', false)
                .find('.tab-text .label')
                .removeClass('label-info')
                .addClass('label-danger')
                .html(`${i18n('Not_Upload')}`)
              $fileInput[0].disabled = false // 給你點
              $form.find('.upload-tip').html(`${i18n('Select_File')}`)
              $.bigBox({
                title: `${i18n('Upload_Fail')}`,
                content: data,
                color: '#C46A69',
                icon: 'fa fa-warning animated',
                number: '',
              })
            },
          },
        })

        $fileInput.on('change', function (evt) {
          uploader.upload()
          $fileInput[0].disabled = true // 不給你點...
          $form
            .find('.upload-tip')
            .html(`<i class="fa fa-refresh fa-spin" /> ${i18n('Uploading')}`)
        })
      })
    },

    util: {
      createCard: function (machineId, ladder) {
        var ladderObj = {
          clazz: ladder ? 'label label-info' : 'label label-danger',
          text: ladder ? ladder : `${i18n('Not_Upload')}`,
        }

        return (
          '<div id="' +
          machineId +
          '" class="item card" data-has-ladder="' +
          (ladder ? 'true' : 'false') +
          '">' +
          '  <div class="header">' +
          '     <div class="title">' +
          servkit.getMachineName(machineId) +
          '</div>' +
          '     <div class="status"></div>' +
          '  </div>' +
          '  <div class="content">' +
          '     <div class="tab-chart row">' +
          '         <div class="col col-xs-12">' +
          '             <img src="./app/Ladder/img/equipment.png" width="100%" />' +
          '         </div>' +
          '     </div>' +
          '     <div class="tab-text">' +
          '         <div class="tab-panel">' +
          '             <div class="text"><span class="ladder-name ' +
          ladderObj.clazz +
          '">' +
          ladderObj.text +
          '</span></div>' +
          '         </div>' +
          '         <div class="tab-panel">' +
          '             <form class="smart-form" novalidate="novalidate">' +
          '                <fieldset>' +
          '                    <section>' +
          '                        <label for="file" class="input input-file">' +
          '                            <div class="button">' +
          `                              <input type="file" name="file"><span class="upload-tip">${i18n(
            'Select_File'
          )}</span>` +
          '                            </div>' +
          '                            <input type="hidden" name="machineId" value="' +
          machineId +
          '">' +
          '                            <input type="text" readonly="">' +
          '                        </label>' +
          '                    </section>' +
          '                </fieldset>' +
          '            </form>' +
          '         </div>' +
          '     </div>' +
          '  </div>' +
          '</div>'
        )
      },
    },

    delayCondition: ['machineList'],
    dependencies: [
      '/js/plugin/bootstrap-progressbar/bootstrap-progressbar.min.js',
    ],

    preCondition: {
      ladders: function (done) {
        servkit.ajax(
          {
            url: 'api/ladder/routine/ladders',
            type: 'GET',
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
      boxId: function (done) {
        servkit.ajax(
          {
            url: 'api/box/read',
            type: 'GET',
          },
          {
            success: function (datas) {
              done(
                _.chain(datas)
                  .map(function (box) {
                    return box.box_id
                  })
                  .first()
                  .value()
              )
            },
          }
        )
      },
    },
  })
}
