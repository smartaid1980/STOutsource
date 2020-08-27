export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      if (servtechConfig.ST_PLANT_AREA_AUTO_SHOW_OTHER_SIGNAL)
        $('#space').addClass('auto-show-other-signal')
      _.each(context.preCon.getIPCamIP, (val, key) => {
        $(`.angle-tab[data-config-key=${key}]`).data(
          'ip',
          `${val.ip}/video4.mjpg`
        )
      })

      const monitorImg =
        'C:/Servtech/Servolution/Vendor/hho/monitor/ConsoleGrabPic1.jpg'
      // 監控schedule
      const monitorSche = servkit
        .schedule('monitorSche')
        .freqMillisecond(2 * 1000)
        .action(function () {
          $('#update-info span').text(moment().format('YYYY/MM/DD HH:mm:ss'))

          // image轉成base24，避免拿圖檔時剛好在更新導致沒有畫面
          function toDataURL(url, callback) {
            var xhr = new XMLHttpRequest()
            xhr.onload = function () {
              var reader = new FileReader()
              reader.onloadend = function () {
                callback(reader.result)
              }
              reader.readAsDataURL(xhr.response)
            }
            xhr.open('GET', url)
            xhr.responseType = 'blob'
            xhr.send()
          }
          toDataURL(
            './api/equipmonitor/getPlantAreaImg?path=' +
              monitorImg +
              '&_' +
              new Date(),
            function (dataUrl) {
              if (dataUrl && dataUrl !== 'data:') context.dataUrl = dataUrl
              $('#monitor-img').attr('src', context.dataUrl)
            }
          )
        })
        .start()
      monitorSche.stop()

      $('#changeStyle').on('click', function () {
        var monitorHomePage = window.location.href
        if (monitorHomePage.search('index_dark') >= 0) {
          monitorHomePage = monitorHomePage.replace('index_dark', 'index')
        } else {
          monitorHomePage = monitorHomePage.replace('index', 'index_dark')
        }
        window.location.href = monitorHomePage
      })

      // 切換至「監控畫面」
      $('#monitor-btn').on('click', function () {
        $('#monitor-widget').closest('article').removeClass('hide')
        $('#plant-widget, #status-widget').closest('article').addClass('hide')
        servkit.unsubscribe('DeviceStatus')
        monitorSche.start()
      })

      // 切換至「生產狀態」
      $('#status-btn').on('click', function () {
        $('#status-widget').closest('article').removeClass('hide')
        $('#plant-widget, #monitor-widget').closest('article').addClass('hide')
        servkit.unsubscribe('DeviceStatus')
        monitorSche.stop()
        $('.angle-tab:first').trigger('click')
      })

      // 回到主畫面
      $('.back')
        .on('click', function () {
          $('#plant-widget').closest('article').removeClass('hide')
          $('#monitor-widget, #status-widget')
            .closest('article')
            .addClass('hide')
          context.commons.plantArea({
            plantAreaId: Object.keys(servkit.getPlantAreaMap())[0], // 直接取得第一個
            msg: {
              load: {
                incomplete: '該產區尚未設定完成!請先完成設定!',
              },
            },
            deivce: {
              disabled: true,
            },
          })
        })
        .trigger('click')

      // 選擇生產狀態的角度
      $('.angle-tab').on('click', function () {
        $('.angle-tab.active').removeClass('active')
        $(this).addClass('active')
        $('.angle-pane').html(
          `<iframe src="http://${$(this).data(
            'ip'
          )}" width="100%" height="100%" frameborder="0"></iframe>`
        )
      })
    },
    util: {
      dataUrl: null,
    },
    delayCondition: [
      'machineList',
      'machinePlantAreaList',
      'plantAreaList',
      'machineLightList',
    ],
    preCondition: {
      getIPCamIP: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/custParamJsonFile',
            type: 'GET',
            data: {
              filePath: 'equipMonitor/ipcam.json',
            },
          },
          {
            success: function (data) {
              var configData
              try {
                configData = JSON.parse(data)
              } catch (e) {
                configData = data
              }
              done(configData)
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
        // "/js/plugin/d3/d3.v4.min.js",
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.valuelabels.js',
      ],
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
    ],
  })
}
