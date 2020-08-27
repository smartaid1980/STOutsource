export default function () {
  GoGoAppFun({
    gogo: function (context) {
      if (servtechConfig.ST_PLANT_AREA_AUTO_SHOW_OTHER_SIGNAL) {
        $('#space').addClass('auto-show-other-signal')
      }
      context.commons.plantArea(
        {
          labelSize: 1,
          msg: {
            load: {
              incomplete: '該廠區尚未設定完成!請先完成設定!',
              noBackground: '尚未設定背景圖，請先上傳背景圖!',
              noData: '該產區尚無資料!',
            },
            upload: {
              invalid: '僅支援PNG格式圖片',
              success: '',
              fail: '檔案上傳失敗!',
            },
            save: {
              success: '儲存成功!',
              fail: '儲存失敗!',
            },
          },
        },
        'edit'
      )
      $('[name=allCheck]').on('change', function () {
        if ($(this).prop('checked')) {
          $('.selectDeviceName').addClass('machine-checked')
        } else {
          $('.selectDeviceName').removeClass('machine-checked')
        }
      })
      $('#space>div')
        .contextmenu(function (event) {
          let currentTargetRect = event.currentTarget.getBoundingClientRect()
          const event_offsetX = event.pageX - currentTargetRect.left,
            event_offsetY =
              event.pageY -
              currentTargetRect.top -
              document.documentElement.scrollTop
          $('#load-modal').data('cardPostion', {
            left: event_offsetX,
            top: event_offsetY,
          })
          $('.stk-load-machines').trigger('click')
        })
        .on('change', '.device-info-position input', function () {
          let regPercent = /^-?[0-9]{0,2}.?[0-9]{0,5}$/
          if (regPercent.test(this.value)) {
            if ($(this).hasClass('left')) {
              $(this)
                .closest('.device-info-position')
                .find('p span.left')
                .text(this.value)
              $(this)
                .closest('.device')
                .css('left', this.value + '%')
            } else if ($(this).hasClass('top')) {
              $(this)
                .closest('.device-info-position')
                .find('p span.top')
                .text(this.value)
              $(this)
                .closest('.device')
                .css('top', this.value + '%')
            }
          } else {
            alert('只能輸入不超過百位的數字百分比')
            if ($(this).hasClass('left')) {
              this.value = $(this)
                .closest('.device-info-position')
                .find('p span.left')
                .text()
            } else if ($(this).hasClass('top')) {
              this.value = $(this)
                .closest('.device-info-position')
                .find('p span.top')
                .text()
            }
          }
        })
        .on('change', '.img-edit input', function () {
          let regPercent = /^-?[0-9]{0,2}.?[0-9]{0,5}$/
          var $div = $(this).closest('.device-img').find('.img-div')
          if (regPercent.test(this.value)) {
            if ($(this).hasClass('width')) {
              $div.css('width', this.value + 'px')
            } else if ($(this).hasClass('height')) {
              $div.css('height', this.value + 'px')
            }
            $div.css('left', '')
            $div.css('top', '')
          } else {
            alert('只能輸入不超過百位的數字百分比')
            if ($(this).hasClass('width')) {
              this.value = $div.width()
            } else if ($(this).hasClass('height')) {
              this.value = $div.height()
            }
          }
        })
      $('.hasDeviceImage').on('click', function (evt) {
        evt.preventDefault()
        $('.hasDeviceImageLabel').html(this.innerHTML)
      })
    },
    util: {},
    delayCondition: ['machineList'],
    dependencies: [
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}
