export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.getTreeStructure()
    },
    util: {
      getTreeStructure: function () {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/custParamJsonFile',
            type: 'GET',
            contentType: 'application/json',
            data: {
              filePath: 'storage/structure.json',
            },
          },
          {
            success: function (response) {
              ctx.drawTree(JSON.parse(response))
            },
          }
        )
      },
      drawTree: function (data) {
        var treeHtml =
          '<ul><li><span><i class="fa fa-lg fa-minus-circle"></i>{}</span></li></ul>'
        var $ele = $('#structure')
        _.each(data, (val, key) => {
          if (key) {
            $ele.find('span:last').after(treeHtml.replace('{}', val.name))
            $ele = $ele.find('ul:last')
          } else {
            $ele.append(treeHtml.replace('{}', val.name))
          }
        })
        $('.tree > ul').attr('role', 'tree').find('ul').attr('role', 'group')
        $('.tree')
          .find('li:has(ul)')
          .addClass('parent_li')
          .attr('role', 'treeitem')
          .find(' > span')
          .on('click', function (e) {
            var children = $(this).parent('li.parent_li').find(' > ul > li')
            if (children.is(':visible')) {
              children.hide('fast')
              $(this)
                .attr('title', 'Expand this branch')
                .find(' > i')
                .removeClass()
                .addClass('fa fa-lg fa-plus-circle')
            } else {
              children.show('fast')
              $(this)
                .attr('title', 'Collapse this branch')
                .find(' > i')
                .removeClass()
                .addClass('fa fa-lg fa-minus-circle')
            }
            e.stopPropagation()
          })
      },
    },
    preCondition: {},
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
