import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo(context) {
      console.log('hi')
      const tableSelector = '#macro-edit'
      const colorPickerSelector = '.color-select'
      $(tableSelector).on('click', '.color-pick', function () {
        const colorBox = this.closest('.color-picker').querySelector(
          '.color-box'
        )
        const colorName = this.title
        context.changeColor(colorBox, colorName)
      })
      context.initColorPicker(colorPickerSelector)
      context.marcoTable = servkit.crudtable({
        tableSelector,
        order: [[0, 'asc']],
        hideCols: [6],
        create: {
          unavailable: true,
        },
        read: {
          url: 'api/v3/macro/config/read',
          end: {
            3(data) {
              const colorName = data
              return `<span class="color-box bg-color-${colorName}" title="${colorName}"></span>`
            },
          },
          finalDo() {},
        },
        update: {
          url: 'api/v3/macro/config/update',
          start: {
            3(oldTd, newTd, oldTr, newTr, table) {
              const colorName = oldTd.querySelector('.color-box').title
              const colorBox = newTd.querySelector('.color-box')
              colorBox.color = colorName
              context.changeColor(colorBox, colorName)
            },
          },
          send(tds) {
            const colorNameIndex = 2
            const colorNameTd = tds[colorNameIndex]
            const colorBox = colorNameTd.querySelector('.color-box')
            const colorName = colorBox.title
            const colorCode = context.colorMap[colorName]
            return {
              color_code: colorCode,
              color_name: colorName,
            }
          },
          end: {
            3(td) {
              const colorBox = td.querySelector('.color-box')
              const colorName = colorBox.title
              return `<span class="color-box bg-color-${colorName}" title="${colorName}"></span>`
            },
          },
        },
        delete: {
          url: 'api/v3/macro/config/delete',
        },
        onRow(tr, rowData) {
          /**
           * 禁止修改：
           * 用disable操作鈕，不管是onDraw跟onRow都沒用，crudTable最後還是會執行disableFeature把全部enable
           * 所以改成隱藏操作鈕
           * */
          const can_modify = rowData[5] === 'Y'
          $(tr)
            .find(':checkbox')
            .toggleClass('hide', !can_modify)
            .end()
            .find('button')
            .toggleClass('hide', !can_modify)
        },
        validate: {
          1: function (td, table) {
            var input = td.querySelector('input')

            // 不為空值
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }

            // 不得重複
            if (!input.disabled) {
              if (
                _.find(table.columns(0).data().eq(0), function (existId) {
                  return existId.toLowerCase() === input.value.toLowerCase()
                })
              ) {
                return `${i18n('Stk_Pk')}`
              }
            }
          },
          2: function (td) {
            var input = td.querySelector('input')
            // 不為空值
            if (input.value === '') {
              return `${i18n('Stk_Required')}`
            }
          },
        },
      })
    },
    util: {
      colorMap: {
        default: '#ffa500',
        blue: '#57889c',
        blueLight: '#92a2a8',
        blueDark: '#4c4f53',
        green: '#356e35',
        greenLight: '#71843f',
        greenDark: '#496949',
        red: '#a90329',
        yellow: '#b09b5b',
        orange: '#c79121',
        orangeDark: '#a57225',
        pink: '#ac5287',
        pinkDark: '#a8829f',
        purple: '#6e587a',
        darken: '#404040',
        lighten: '#d5e7ec',
        white: '#ffffff',
        grayDark: '#525252',
        magenta: '#6e3671',
        teal: '#568a89',
        redLight: '#a65858',
      },
      initColorPicker(selector) {
        const context = this
        const { colorMap } = context
        const getColorHtml = (colorName) =>
          `<li><span class="color-pick bg-color-${colorName}" title="${colorName}"></span></li>`
        const html = Object.keys(colorMap)
          .map((name) => getColorHtml(name))
          .join('')
        $(selector).append(html)
      },
      changeColor(colorBox, colorName) {
        const colorClass = `bg-color-${colorName}`
        colorBox.title = colorName
        colorBox.classList = [
          ...Array.from(colorBox.classList).filter(
            (s) => !/^bg-color-.+/.test(s)
          ),
          colorClass,
        ].join(' ')
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
