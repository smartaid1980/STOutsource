import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var line = context.commons.productionLine(
        {
          msg: {
            load: {
              incomplete: '該產線尚未設定完成!請先完成設定!',
              noBackground: '尚未設定背景圖，請先上傳背景圖!',
              noData: '該產線尚無資料!',
            },
            upload: {
              invalid: `${i18n('Monitor_File_Must_Be_PNG')}`,
              success: '',
              fail: `${i18n('Monitor_Upload_Fail')}!`,
            },
            save: {
              success: '儲存成功!',
              fail: '儲存失敗!',
            },
          },
        },
        'edit'
      )

      // var template;
      // // compiled
      // context.widgetBodyCompiled = _.template(context.widgetBody);
      // context.template = context.widgetBodyCompiled({labels: _(context.widgetLabelSize).times(function(n){ return context.widgetLabel;}).join('')})
      // context.debug && console.debug('=== template ===' + '\n' + template);

      // // image loaded
      // context.$main.imagesLoaded( function() {
      //  context.debug && console.debug('image load done');
      //  context.debug && console.debug(context.$bg[0]);
      //  var bg = context.$bg[0];
      //  context.$main.width(bg.naturalWidth).height(bg.naturalHeight);
      // });

      // // bind event
      // context.$body
      //  .on('click', '.stk-new', function(ev){
      //    context.debug && console.debug('event new');
      //    context.empty();
      //  })
      //  .on('click', '.stk-load', function(ev){
      //    context.debug && console.debug('event load');
      //    var str = prompt('請輸入設定JSON');
      //    context.load(JSON.parse(str));
      //  })
      //  .on('click', '.stk-add', function(ev){
      //    context.debug && console.debug('event add');
      //    context.add();
      //  })
      //  .on('click', '.stk-save', function(ev){
      //    context.debug && console.debug('event save');
      //    context.save();
      //  });
      // context.$main
      //  .on('click', '.stk-delete', function(ev){
      //    var $tar = $(this);
      //    if (confirm('確認刪除?')) {
      //      $tar.parents('.device:first').remove();
      //    }
      //  });

      // // init modal
      // $('#save-modal').modal({show: false});

      // // $('.draggable').draggable({ containment: '#space'});
    },
    util: {
      debug: true,
      $win: $(window),
      $body: $('body'),
      $main: $('#space'),
      $bg: $('#space .bg'),
      widgetBody:
        '<div class="device draggable" style="top: 10px; left: 10px;">' +
        ' <div class="device-title clearfix">' +
        '   <div class="img">' +
        '     <img src="./app/EquipMonitor/img/machine/machine.png" />' +
        '   </div>' +
        '   <div class="text">' +
        '     <span>' +
        '       <input type="text" name="id" placeholder="id">' +
        '       <a href="javascript:void(0);" class="btn btn-xs btn-danger stk-delete" title="Delete"><i class="fa fa-times"></i></a>' +
        '     </span>' +
        '   </div>' +
        ' </div>' +
        ' <div class="device-info clearfix">' +
        '   <table>' +
        '     <%= labels %>' +
        '   </table>' +
        ' </div>' +
        '</div>',
      widgetLabel:
        '<tr>' +
        ' <th class="value-head"><div><input type="text" name="name" placeholder="label"></div></th>' +
        ' <td class="value-text">' +
        '   <div class="value">' +
        '     <input type="text" name="param" placeholder="param">' +
        '     <select name="type">' +
        '       <option value="text">Text</option>' +
        '       <option value="progress">Progress</option>' +
        '     </select>' +
        '   </div>' +
        ' </td>' +
        '</tr>',
      widgetBodyCompiled: undefined,
      widgetLabelSize: 5,
      template: undefined,
      empty: function () {
        var _self = this
        _self.$main.find('.device').remove()
      },
      load: function (profile) {
        var _self = this
        var _profile = profile
        // empty
        _self.empty()
        // load
        console.debug(_profile)
        _.each(_profile.devices, function (d) {
          console.debug('come device')
          var $device = _self.add()
          var $labels = $device.find('table tr')
          $device.find(':input[name="id"]').val(d.id)
          $device.find('img').attr('src', d.image)
          $device.css({
            top: d.pos.y,
            left: d.pos.x,
          })
          $labels.each(function (i) {
            var $label = $(this)
            var l = d.labels[i]
            $label.find(':input[name="name"]').val(l.name)
            $label.find(':input[name="param"]').val(l.value.param)
            $label.find(':input[name="type"]').val(l.value.type)
          })
        })
      },
      add: function () {
        var _self = this
        return $(_self.template)
          .appendTo(_self.$main)
          .draggable({ containment: _self.$main })
      },
      save: function () {
        var _self = this
        var obj = {
          id: '',
          title: 'Line',
          devices: [],
        }

        _self.$main.find('.device').each(function () {
          var $device = $(this)
          var position = $device.position()

          var labels = []
          $device.find('table tr').each(function () {
            var $label = $(this)
            labels.push({
              name: $label.find(':input[name="name"]').val(),
              value: {
                type: $label.find(':input[name="type"]').val(),
                param: $label.find(':input[name="param"]').val(),
              },
            })
          })

          obj.devices.push({
            id: $device.find(':input[name="id"]').val(),
            image: './app/EquipMonitor/img/machine/machine.png',
            pos: {
              x: position.left,
              y: position.top,
            },
            labels: labels,
          })
        })

        _self.debug && console.debug('=== save ===')
        _self.debug && console.debug(obj)

        $('#save-modal').modal('show').find('textarea').val(JSON.stringify(obj))
      },
    },
    delayCondition: ['machineList'],
    dependencies: [
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}
