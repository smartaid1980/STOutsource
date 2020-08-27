import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      if (servtechConfig.ST_PLANT_AREA_AUTO_SHOW_OTHER_SIGNAL) {
        $('#space').addClass('auto-show-other-signal')
      }

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

      var zoneId = servkit.getURLParameter('zoneId')
      var zonePath = ''
      var zoneMap = {}
      _.each(context.preCon.getZoneData, (val, key) => {
        var path = val.path || ''
        path = path.replace(/\/NULL\//g, '')

        if (!zoneMap[path]) {
          zoneMap[path] = []
        }
        zoneMap[path].push({
          // 改以路徑作為key來存
          id: key,
          name: val.name,
        })
        if (zoneId && zoneId === key) {
          // 找到預設區域的路徑
          zonePath = path
        }
      })

      var zonePathMap = {} // 為了自然排序
      _.each(Object.keys(zoneMap), (val) => {
        zonePathMap[val] = val
      })
      servkit.initSelectWithList(zonePathMap, $('#zone-path')) // 設定區域路徑的下拉式選項

      if (
        Object.keys(zoneMap).includes('') &&
        Object.keys(zoneMap).length === 1
      ) {
        // 如果只有空的選項就不要顯示下拉式選單
        $('.zone-path-select').addClass('hide')
      }
      if (zonePath) {
        $('#zone-path').val(zonePath) // 設定預設路徑
      }

      context.commons.zoneMonitor({
        zoneMap: context.preCon.getZoneData,
        zoneObj: zoneObj,
        storeMap: context.preCon.getStoreData,
        msg: {
          load: {
            incomplete: `${i18n('Zone_Not_Been_Set')}${i18n(
              'Complete_Setting_First'
            )}`,
          },
        },
      })

      $('#zone-path')
        .on('change', function () {
          // 選擇區域的路徑
          $('#zone-list').empty()
          var zoneList = []
          _.each(zoneMap[this.value], (val) => {
            // 為了自然排序
            zoneList.push({
              key: val.id,
              name: val.name,
            })
          })
          var zoneListHtml = []
          _.each(zoneList.sort(servkit.naturalCompareValue), (val) => {
            zoneListHtml.push(
              '<li><a href="javascript:void(0);" data-id="' +
                val.key +
                '">' +
                (val.name || val.key) +
                '</a></li>'
            )
          })
          $('#zone-list').append(zoneListHtml.join(''))
          if (zoneId) {
            $('#zone-list a[data-id=' + zoneId + ']').trigger('click')
          } else {
            $('#zone-list a:first').trigger('click')
          }
        })
        .trigger('change')
    },
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
              columns: ['store_id', 'store_name', 'zone_id', 'store_rule'],
            }),
          },
          {
            success: function (data) {
              var storeData = {}
              _.each(data, function (elem) {
                storeData[elem.store_id] = {
                  name: elem.store_name,
                  zone: elem.zone_id,
                  rule: JSON.parse(elem.store_rule),
                }
              })
              done(storeData)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        // '/js/plugin/d3/d3.v4.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.valuelabels.js',
      ],
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
    ],
  })
}
