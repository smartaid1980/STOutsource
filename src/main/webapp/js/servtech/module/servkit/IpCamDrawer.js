import { servtechConfig } from '../servtech.config.js'

/**
 * 網路監視錄影機
 * @memberof module:servkit
 * @letructor
 * @this {IpCamDrawer}
 */
function IpCamDrawer() {}

IpCamDrawer.prototype = {
  /**
   * 顯示攝影畫面
   * @this {IpCamDrawer}
   * @param {Object} ipCamObj 影像資訊
   * @returns {Object} 移除的動作
   */
  attach(ipCamObj) {
    let that = this
    let $body = $('body')
    let $main = $('#main')
    let url =
      ipCamObj.user_name && ipCamObj.password
        ? 'http://' +
          ipCamObj.user_name +
          ':' +
          ipCamObj.password +
          '@' +
          ipCamObj.ip
        : 'http://' + ipCamObj.ip
    let w = window.open(url, '_blank', 'height=10,width=10')
    setTimeout(function () {
      try {
        let $drawer = $(
          '<div class="video">' +
            ' <span id="video-icon"><i class="fa fa-video-camera fa-times txt-color-blueDark"></i></span>' +
            ' <img class="real hide" height="100%" width="0" src="http://' +
            ipCamObj.ip +
            '" style="float:right;"/>' +
            ' <img class="fake hide" height="100%" width="100%" src="' +
            servkit.rootPath +
            '/img/blackBackGround.png"/>' +
            ' <video class="vjs-default-skin hide" style="float:right;" loop autoplay muted>' +
            '   <source src="' +
            servkit.rootPath +
            '/app/EquipMonitor/video/demo.mp4' +
            '"type="video/mp4">' +
            ' </video>' +
            '</div>'
        )
        let $real = $drawer.find('.real')
        let $fake = servtechConfig.ST_UI_IP_CAM_SHOW_VIDEO
          ? $drawer.find('video')
          : $drawer.find('.fake')
        $main.before($drawer)

        $real.load(function (e) {
          $(this).removeClass('hide') // 顯示真的畫面
          $fake.remove()
        })

        $drawer.on('click', function (e) {
          if ($real.width() > 0) {
            // close
            $real.width(0)
            $fake.width(0)
            $body.removeClass('minified')
            $main.removeClass('margin-right')
          } else {
            // open
            let videoWidth = $body.width() * 0.4
            $real.width(videoWidth)
            $fake.width(videoWidth).removeClass('hide')
            $body.addClass('minified')
            $main.addClass('margin-right')
          }

          $(this).toggleClass('active')
          $(this).find('i').toggleClass('fa-video-camera') // icon
        })

        that.$drawer = $drawer
        w.close()
      } catch (e) {
        console.warn(e)
      }
    }, 2500)

    $(window).on('hashchange', function removeMinified(evt) {
      $body.removeClass('minified')
      $main.removeClass('margin-right')
      $(window).off('hashchange', removeMinified)
    })
    return {
      removeDrawer() {
        this.$drawer.remove()
      },
    }
  },
}

export default IpCamDrawer
