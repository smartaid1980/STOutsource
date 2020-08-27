export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.ipCamMap = context.preCon.getIpCams
      var widgetWidth = context.$leftArticle.width()
      var widgetHeight = (widgetWidth / 16) * 9
      _.each(context.ipCamMap, function (elem, index) {
        var src =
          servkit.rootPath +
          '/app/EquipMonitor/video/' +
          elem.ip_cam_id +
          '.mp4'
        var $widget = context.widgetHtml(elem.ip_cam_id, src)
        $widget.find('video').width(widgetWidth).height(widgetHeight)
        if (index % 2 == 0) {
          context.$leftArticle.append($widget)
        } else {
          context.$rightArticle.append($widget)
        }
      })

      pageSetUp()
    },
    util: {
      $leftArticle: $('#left'),
      $rightArticle: $('#right'),
      widgetHtml: function (ip_cam_id, src) {
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
            '<video class="video-js vjs-default-skin" loop autoplay muted>' +
            '<source src="' +
            src +
            '" type="video/mp4">' +
            '</video>' +
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
              whereClause: 'ip <> ""',
            }),
          },
          {
            success: function (data) {
              done(_.first(_.sortBy(data, 'sequence'), 4))
            },
          }
        )
      },
    },
  })
}
