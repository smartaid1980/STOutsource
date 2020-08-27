import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var zoneObj = {}
      _.each(context.preCon.getStoreData, (val, key) => {
        if (!zoneObj[val.zone]) {
          zoneObj[val.zone] = []
        }
        zoneObj[val.zone].push({
          zone_id: val.zone,
          store_id: key,
        })
      })
      context.commons.zoneMonitor(
        {
          zoneMap: context.preCon.getZoneData,
          zoneObj: zoneObj,
          storeMap: context.preCon.getStoreData,
          msg: {
            load: {
              incomplete: `${i18n('Zone_Not_Been_Set')}${i18n(
                'Complete_Setting_First'
              )}`,
              noBackground: `${i18n('Background_Image_Not_Been_Set')}${i18n(
                'Upload_Background_Image_First'
              )}`,
              noData: `${i18n('Zone_No_Data')}`,
              zone: `${i18n('Clear_Store')}`,
              store: `${i18n('Choose_Shelf')}`,
            },
            upload: {
              invalid: `${i18n('Only_Supports_PNG_File')}`,
              success: '',
              fail: `${i18n('File_Upload_Failed')}`,
            },
            save: {
              success: `${i18n('Save_Succeed')}`,
              fail: `${i18n('Save_Failed')}`,
            },
            dropzone: {
              info: `${i18n('Drag_Image_Here')}`,
              load: `${i18n('Upload')}`,
              click: `${i18n('Click')}`,
            },
            delete: {
              confirm: `${i18n('Confirm_Delete')}`,
            },
          },
        },
        'edit'
      )
      $('[name=allCheck]').on('change', function () {
        if ($(this).prop('checked')) {
          $('.selectStoreName').addClass('store-checked')
        } else {
          $('.selectStoreName').removeClass('store-checked')
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
          $('.stk-load-stores').trigger('click')
        })
        .on('change', '.store-info-position input', function () {
          let regPercent = /^-?[0-9]{0,2}.?[0-9]{0,5}$/
          if (regPercent.test(this.value)) {
            if ($(this).hasClass('left')) {
              $(this)
                .closest('.store-info-position')
                .find('p span.left')
                .text(this.value)
              $(this)
                .closest('.store')
                .css('left', this.value + '%')
            } else if ($(this).hasClass('top')) {
              $(this)
                .closest('.store-info-position')
                .find('p span.top')
                .text(this.value)
              $(this)
                .closest('.store')
                .css('top', this.value + '%')
            }
          } else {
            alert(`${i18n('Please_Input_Percent_Under_Hundred')}`)
            if ($(this).hasClass('left')) {
              this.value = $(this)
                .closest('.store-info-position')
                .find('p span.left')
                .text()
            } else if ($(this).hasClass('top')) {
              this.value = $(this)
                .closest('.store-info-position')
                .find('p span.top')
                .text()
            }
          }
        })
    },
    util: {},
    preCondition: {
      getZoneData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_zone',
              columns: ['zone_id', 'zone_name', 'zone_name_path'],
            }),
          },
          {
            success: function (data) {
              var zoneData = {}
              _.each(data, function (elem) {
                zoneData[elem.zone_id] = {
                  name: elem.zone_name,
                  path: elem.zone_name_path,
                }
              })
              done(zoneData)
            },
          }
        )
      },
      getStoreData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store',
              columns: ['store_id', 'store_name', 'zone_id'],
            }),
          },
          {
            success: function (data) {
              var storeData = {}
              _.each(data, function (elem) {
                storeData[elem.store_id] = {
                  name: elem.store_name,
                  zone: elem.zone_id,
                }
              })
              done(storeData)
            },
          }
        )
      },
    },
    dependencies: [
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}
