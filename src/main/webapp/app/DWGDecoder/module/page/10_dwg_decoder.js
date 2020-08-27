export default function () {
  // degree symbol html code: &#176;
  // plus or minus symboy code: &#177;
  // uppercase slashed o code: &#216;
  GoGoAppFun({
    gogo: function (context) {
      // document.getElementById('file').addEventListener('change', function (evt){
      //   context.readFile(evt.target.files[0]);
      // }, false);
      $('.click-bar').on('click', function () {
        $('.upload-file').toggleClass('selected')
        // console.log(this)
        $(this)
          .find('.fa')
          .each((index, el) => {
            // console.log(el)
            $(el).toggleClass('hide')
          })
      })
      // let dropZone = $('#drop-zone');
      // dropZone.on('dragover', function (evt){

      // }, false);
      // dropZone.on('drop', function (evt){

      // }, false);
      // $('#upload-dxf').on('change', function (evt){

      // })
      servkit.requireJs(['/js/plugin/dropzone/dropzone.min.js'], function () {
        Dropzone.autoDiscover = false

        $('#dropzone').dropzone({
          url: 'api/dwgdecoder/dwg2dxf',
          // paramName: "file",
          // addRemoveLinks: true,
          maxFilesize: 20, // MB
          acceptedFiles: '.dwg, .dxf',
          // previewsContainer: '.dropzone-previews',
          dictResponseError: '檔案格式錯誤',
          accept: function (file, done) {
            // var reader = new FileReader();
            // reader.addEventListener("loadend", function (event) { console.log(event.target.result);});
            // reader.readAsText(file);
            let fileName = file.name
            if (/\.dwg$/.test(fileName)) {
              // var $fileResult = $(file.previewElement);
              // $fileResult.removeClass('dz-success').addClass('dz-error');
              // ctx.errorDialog("<br>檔案格式錯誤:請上傳.xlsx格式檔案</br>");
              done()
            } else if (/\.dxf$/.test(fileName)) {
              context.readFile(file)
            }
          },
          init: function () {
            // this.on('sending', function (file, xhr, data) {

            // })
            this.on('addedfile', function () {
              if (this.files[1] != null) {
                this.removeFile(this.files[0])
              }
            })
            // this.on("uploadprogress", function (x, progress) {
            //   console.log(progress);
            // });
            this.on('success', function (file, res) {
              // console.log(typeof res);
              // window.res = res;
              $('.click-bar').trigger('click')
              context.parseDXF(res)
              context.renderTable(context.entities)
            })
          },
        })
      })
    },
    util: {
      $tableBasic: $('#basic-info'),
      $tableStation: $('#station-info'),
      $tableTolerance: $('#tolerance-info'),
      $tableResult: $('#result'),
      $progressBar: $('.progress-bar'),
      $accordionFirst: $('#accordion>div:first a'),
      suitProcess: [],
      stationData: undefined,
      entities: undefined,
      size: {
        mOrMc: '',
        gOrGp: '',
      },
      renderTable: function (data) {
        let context = this,
          datas = [],
          infos = [],
          station,
          tolerance
        for (var key in data) {
          datas.push([key, JSON.stringify(data[key])])

          switch (key) {
            case 'station':
              station = data[key]
              break
            case 'tolerance':
              tolerance = data[key]
              break
            default:
              infos.push([key, data[key]])
              break
          }
        }
        context.renderBasicInfo(infos)
        context.renderStation(station)
        context.renderTolerance(tolerance)
        if (context.$accordionFirst.hasClass('collapsed'))
          context.$accordionFirst.trigger('click')
        context.renderProcess()
      },
      renderStation: function (data) {
        let context = this,
          tableData = [],
          typeMap = {
            THR: '通孔',
            DEP: '盲孔',
          },
          specMap = {
            spacing: '間隙',
            depth: '深度',
            diameter: '直徑',
            count: '數量',
            screwModel: '螺絲型號',
          },
          otherMap = {
            isCA: '清角',
            isCB: '沉頭',
            BOT: '下切',
            TOP: '上切',
          }
        for (let station in data) {
          data[station].forEach((x) => {
            let type = typeMap[x.type] ? typeMap[x.type] : 'N/A',
              spec = [],
              other = [],
              recommend = [],
              isCBorScrew = false,
              isHighPrecision = false
            for (var s in x.spec) {
              spec.push([specMap[s], x.spec[s]])
              if (/\.\d{2,}/.test(x.spec[s]) && !isHighPrecision)
                isHighPrecision = true
              if (s === 'screwModel' && x.spec[s] !== 'N/A' && !isCBorScrew)
                isCBorScrew = true
            }
            for (var o in x.other) {
              if (!x.other[o] || x.other[o] === 'N/A') continue
              if (o === 'botOrTop') other.push(otherMap[x.other[o]])
              else {
                other.push(otherMap[o])
                if (o === 'isCB' && !isCBorScrew) isCBorScrew = true
              }
            }
            if (isHighPrecision) {
              other.push('高精度')

              if (type === typeMap['DEP']) {
                recommend.push(context.size.mOrMc, 'CNC')
              } else if (type === typeMap['THR']) {
                recommend.push(context.size.mOrMc, 'WE')
              }
            } else if (type === typeMap['THR']) {
              recommend.push(context.size.mOrMc)
            }
            if (isCBorScrew && !recommend.includes(context.size.mOrMc))
              recommend.push(context.size.mOrMc)
            context.suitProcess.push(...recommend)
            // console.log(recommend, context.suitProcess)
            tableData.push([station, type, spec, other, recommend])
          })
        }

        // onRow
        let rowString = (key, value) =>
            `<div class="row"><div class="col-md-3 text-right">${key}：</div><div class="col-md-9">${value}</div></div>`,
          labelString = (value) =>
            `<span class="label label-primary" style="margin: 5px;">${value}</span>`

        context.stationData = tableData.map((rowData) => {
          let spec = rowData[2],
            other = rowData[3],
            recommend = rowData[4]
          rowData[2] = spec.map((item) => rowString(item[0], item[1])).join('')
          rowData[3] = other.map((item) => labelString(item)).join('')
          rowData[4] = recommend.map((item) => labelString(item)).join('')
          return rowData
        })
        context.drawTable(context.$tableStation, context.stationData)
      },
      renderTolerance: function (data) {
        let context = this,
          tableData = []
        for (var key in data) {
          tableData.push([key, data[key]])
        }
        context.drawTable(context.$tableTolerance, tableData)
      },
      renderBasicInfo: function (data) {
        let context = this,
          map = {
            'FINISH': '硬度',
            'MATL': '材質',
            "MAT'L": '材質',
            'REVX': '版本',
            'SPEC.(L*W*H)': '大小',
            "UNIT'S": '單位',
          }

        context.basicInfoData = data.reduce((a, x) => {
          if (map[x[0]]) {
            x.push([])
            switch (x[0]) {
              // 根據硬度判斷是否需要「H」
              case 'FINISH':
                if (x[1] !== '' && x[1] !== 'none') {
                  x[2].push('H')
                  context.suitProcess.push('H')
                }
                break
              // 根據SPEC判斷
              // 1. 最大表面積 > 4000(mm) 選擇 「GP」，反之，「G」
              // 2. 長寬最小尺寸 > 250(mm) 選擇 「MC」，反之，「M」
              case 'SPEC.(L*W*H)':
                var specArr = x[1][0].split('*'),
                  [l, w, h] = specArr

                context.size.gOrGp = l * w > 4000 ? 'GP' : 'G'
                context.size.mOrMc = Math.min(l, w) > 250 ? 'MC' : 'M'
                if (/\.\d{2,}/.test(h)) x[2].push(context.size.gOrGp)
                if (l > 250 && w > 90) x[2].push('DM')
                break
            }
            x[0] = map[x[0]]
            context.suitProcess.push(...x[2])
            x[2] = context
              .labelWrapper(x[2], 'margin: 5px;', 'primary')
              .join('')
            // console.log(context.suitProcess)
            a.push(x)
          }
          return a
        }, [])
        context.drawTable(context.$tableBasic, context.basicInfoData)
      },
      renderProcess: function () {
        let context = this,
          processString = (process) =>
            process
              .map(
                (x) =>
                  `<span class="label label-primary" style="margin: 10px 5px;font-size:120%;display:inline-block;">${x}</span>`
              )
              .join('<span> > </span>'),
          tableData = [],
          possibleProcess = _.uniq(context.suitProcess)
        // console.log(possibleProcess)
        tableData.push([
          processString(['RM', 'M', 'H', 'G', 'WE', 'CNC', 'QC']),
        ])
        tableData.push([processString(['RG', 'G', 'WE', 'CNC', 'M', 'QC'])])
        tableData.push([processString(['WE', 'G', 'CNC', 'M', 'QC'])])

        // tableData.push(
        //   [processString(context.generateProcess('RM', possibleProcess))],
        //   [processString(context.generateProcess('RG', possibleProcess))],
        //   [processString(context.generateProcess('WE', possibleProcess))]
        // );

        context.drawTable(context.$tableResult, tableData)
      },
      labelWrapper: function (values, style, type) {
        return values.map(
          (v) =>
            `<span class="label label-${type}" style="${style}">${v}</span>`
        )
      },
      generateProcess: function (first, possible) {
        let processStd = {
            RM: [
              'RM',
              'MCM',
              'CNC',
              'H',
              'GPG',
              'WE',
              'CNC',
              'MCM',
              'ES',
              'QC',
            ],
            RG: ['RG', 'GPG', 'WE', 'CNC', 'MCM', 'ES', 'QC'],
            WE: ['WE', 'GPG', 'CNC', 'MCM', 'ES', 'QC'],
          },
          result = [],
          context = this
        if (possible.includes('DM')) {
          result = processStd['RM']
          result[0] = 'DM'
        } else {
          result = processStd[first]
        }

        return result.filter((s) => {
          if (s === 'MCM') return possible.includes(context.size.mOrMc)
          else if (s === 'GPG') return possible.includes(context.size.gOrGp)
          else return possible.includes(s)
        })
      },
      drawTable: function ($table, data) {
        let rowString = (tds) => `<tr>${tds}</tr>`,
          tdString = (dataArr) =>
            dataArr.map((data) => `<td>${data}</td>`).join(''),
          tbodyString = data
            .map((rowData) => rowString(tdString(rowData)))
            .join('')

        $table.find('tbody').html(tbodyString)
      },
      readFile: function (file) {
        let context = this
        var reader = new FileReader()
        $('#file-name').text(file.name)
        reader.onload = function (event) {
          let str = event.target.result
          $('.click-bar').trigger('click')
          context.parseDXF(str)
          context.renderTable(context.entities)
        }
        reader.readAsText(file)
      },
      parseDXF: function (str) {
        let parser = new window.DxfParser(),
          context = this,
          dxf = parser.parseSync(str),
          keepEntities = ['TEXT', 'ATTRIB', 'ATTDEF', 'MTEXT'],
          filterEntities = dxf.entities.filter((e) =>
            keepEntities.includes(e.type)
          ),
          noteRegexp = /[A-Z]:\d/
        window.dxf = dxf
        context.previewDxf(dxf)

        filterEntities = filterEntities.reduce(
          (a, e) => {
            switch (e.type) {
              case 'ATTRIB':
                if (/(\.X)|(X\.)/.test(e.tag)) {
                  if (!a.tolerance) {
                    a.tolerance = {}
                  }
                  a.tolerance[
                    context.textTranform(e.tag)
                  ] = context.textTranform(e.text)
                } else {
                  if (a[e.tag] !== undefined) {
                    a[e.tag].push(e.text)
                  } else {
                    a[e.tag] = [e.text]
                  }
                }
                break
              case 'ATTDEF':
                if (a[e.tag] !== undefined) {
                  a[e.tag] = [e.text]
                } else {
                  a[e.tag].push(e.text)
                }
                break
              case 'TEXT':
              case 'MTEXT':
                if (noteRegexp.test(e.text)) {
                  let index = e.text.indexOf(':'),
                    key = e.text[index - 1],
                    count = e.text.match(/\d+/)[0],
                    value = e.text.slice(count.length + index + 2)
                  if (a.station[key] !== undefined) {
                    // a.station[key]['description'] += ' ' + value;
                    a.station[key].push(context.parseStation(value, count)[0])
                  } else {
                    // a.station[key] = {
                    //     description: value,
                    //     count: parseInt(count)
                    // }
                    a.station[key] = context.parseStation(value, count)
                  }
                } else {
                  a.textes.push(e.text)
                }
                break
            }
            return a
          },
          {
            station: {},
            textes: [],
          }
        )
        context.entities = filterEntities
      },
      previewDxf: function (dxf) {
        var font,
          cadCanvas,
          context = this
        var loader = new window.THREE.FontLoader()
        $('#viewer').empty()
        loader.load(
          '/ServCloud/js/plugin/three/helvetiker_regular.typeface.json',
          function (response) {
            font = response
            context.$progressBar.width('1%').parent().removeClass('hide')
            cadCanvas = new window.ThreeDxf.Viewer(
              dxf,
              document.getElementById('viewer'),
              1200,
              400,
              font,
              context.$progressBar
            )
          }
        )
      },
      parseStation: function (str, count) {
        /**
         * [
         *  {
         *    type: 'THR', // 工位類型
         *    spec: {
         *      count: 1, // 數量
         *      diameter: 0, // 直徑
         *      spacing: +0.01, // 間隙
         *      depth: 0.01, // 深度
         *      screwModel: 8, // 螺絲型號(大小)
         *    },
         *    other: {
         *      botOrTop: 'BOT', // 上切/下切
         *      isCB: true, // 沉頭
         *      isCA: true, // 清角
         *    }
         *  },
         *  {
         *    同工位另一個註解
         *  }
         * ]
         */
        let result = [],
          otherStation = str.match(/\([^)]+\)/),
          parse = function (subS, obj) {
            subS
              .trim()
              .split(' ')
              .forEach((s, i) => {
                // type
                if (/DEP|THR/.test(s)) {
                  obj.type = s.match(/DEP|THR/)[0]
                }
                // diameter
                else if (/%%c\d*(\.\d+)?/.test(s)) {
                  obj.spec.diameter = s.replace(/.*%%c/, '')
                }
                // screwModel
                else if (/M\d+/.test(s)) {
                  obj.spec.screwModel = s.replace(/.*M/, '')
                }
                // spacing
                else if (/C[+-]\d+(\.\d+)?|.+\/.+/.test(s)) {
                  obj.spec.spacing = s.replace(/.*C/, '')
                }
                // botOrTop
                else if (/BOT|TOP/.test(s)) {
                  obj.other.botOrTop = s.match(/BOT|TOP/)[0]
                }
                // isCB
                else if (/CB/.test(s)) {
                  obj.other.isCB = true
                }
                // isCA
                else if (/CA/.test(s)) {
                  obj.other.isCA = true
                }
                // depth
                else {
                  obj.spec.depth = s
                }
              })
            return obj
          }

        result.push(
          parse(str.replace(/\([^)]+\)/, ''), {
            spec: {
              count: count,
              diameter: 'N/A',
              spacing: 'N/A',
              depth: 'N/A',
              screwModel: 'N/A',
            },
            other: {
              isCA: false,
              isCB: false,
              botOrTop: 'N/A',
            },
          })
        )

        if (otherStation) {
          result.push(
            parse(otherStation[0].slice(1, -1), {
              spec: {
                count: count,
                diameter: 'N/A',
                spacing: 'N/A',
                depth: 'N/A',
                screwModel: 'N/A',
              },
              other: {
                isCA: false,
                isCB: false,
                botOrTop: 'N/A',
              },
            })
          )
        }

        return result
      },
      textTranform: function (s) {
        let patternMap = {
          '%%D': '&#176;',
          '%%P': '&#177;',
        }
        return s.replace(/%%D|%%P/g, function (matched) {
          return patternMap[matched]
        })
      },
    },
    dependencies: [
      [
        '/js/plugin/dxf-parser/dist/dxf-parser.cust.js',
        '/js/plugin/three/three.min.js',
        '/js/plugin/three/OrbitControls.js',
        '/js/plugin/three-dxf/three-dxf.cust.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })

  //# sourceURL=DWGDecoder_10_dwg_decoder.js
}
