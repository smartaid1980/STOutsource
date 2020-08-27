export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.ipCamMap = context.preCon.getIpCams
      var widgetWidth = context.$leftArticle.width()
      var widgetHeight = (widgetWidth / 16) * 9
      _.each(context.ipCamMap, function (elem, index) {
        //        var videoSrc = servkit.rootPath + "/app/EquipMonitor/video/" + elem.ip_cam_id + ".mp4";
        var blackSrc =
          servkit.rootPath + '/app/EquipMonitor/img/ip_cam/blackBackGround.png'
        //        var imgSrc = 'http://' + elem.ip + '/mjpg/video.mjpg';
        var imgSrc = 'http://' + elem.ip
        //        var $widget = context.widgetHtml(elem.ip_cam_id, videoSrc, imgSrc);
        var $widget = context.widgetHtml(elem.ip_cam_id, blackSrc, imgSrc)
        //        $widget.find("video").width(widgetWidth).height(widgetHeight);
        if (index % 2 == 0) {
          context.$leftArticle.append($widget)
        } else {
          context.$rightArticle.append($widget)
        }
        $widget.find('#real').load(function (e) {
          $(this).removeClass('hide')
          $widget.find('#fake').remove()
        })
        $widget.on('click', '.widget-body', function (e) {
          e.preventDefault()
          if (!$('#jarviswidget-fullscreen-mode').length) {
            $(this).closest('.jarviswidget').find('i.fa-expand').click()
          }
        })
      })

      pageSetUp()
    },
    util: {
      $leftArticle: $('#left'),
      $rightArticle: $('#right'),
      widgetHtml: function (ip_cam_id, fakeSrc, imgSrc) {
        return $(
          '<div class="jarviswidget jarviswidget-color-darken" data-widget-editbutton="false" ' +
            'data-widget-colorbutton="false" data-widget-togglebutton="false" data-widget-deletebutton="false">' +
            '<header>' +
            '<span class="widget-icon"> <i class="fa fa-edit"></i> </span>' +
            '<h2 class="ip-cam-id">' +
            ip_cam_id +
            '</h2>' +
            '</header>' +
            '<div>' +
            '<div class="widget-body no-padding" style="overflow: hidden;">' +
            '<img height="100%" width="100%" id="real" class="hide" src="' +
            imgSrc +
            '"/>' +
            '<img height="100%" width="100%" id="fake" src="' +
            fakeSrc +
            '"/>' +
            //          '<video class="video-js vjs-default-skin" loop autoplay muted>' +
            //          '<source src="' + videoSrc + '" type="video/mp4">' +
            //          '</video>' +
            '</div>' +
            '</div>' +
            '</div>'
        )
      },
      ipCamMap: {},
    },
    preCondition: {
      getIpCams: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_ip_cam',
              colunms: ['ip_cam_id', 'ip', 'port', 'sequence'],
              whereClause: 'sequence <= 4',
            }),
          },
          {
            success: function (data) {
              done(_.sortBy(data, 'sequence'))
            },
          }
        )
      },
    },
  })
}
