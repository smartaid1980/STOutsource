import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.commons.plantArea(
        {
          msg: {
            load: {
              incomplete: '該產區尚未設定完成!請先完成設定!',
            },
          },
          utilization: context.preCon.getUtilizationRate,
          sectionMap: context.sectionMap,
          deviceValuesName: context.valuesName,
        },
        'sort'
      )
      $('#changeStyle').on('click', function () {
        var monitorHomePage = window.location.href
        if (monitorHomePage.search('index_dark') >= 0) {
          monitorHomePage = monitorHomePage.replace('index_dark', 'index')
        } else {
          monitorHomePage = monitorHomePage.replace('index', 'index_dark')
        }
        window.location.href = monitorHomePage
      })
      $('#leave-btn').on('click', function () {
        var lang = servkit.getCookie('lang')
        var page = '02_all_plant_area.html'
        if (servkit.getURLParameter('pageby')) {
          page = '02_all_plant_area_v1.html'
        }
        window.location.href = '#app/EquipMonitor/function/' + lang + '/' + page
      })
    },
    util: {
      sectionMap: {
        wireEDM: {
          // 水加工線切割
          top: '54%',
          left: '80%',
          max: 50,
          min: 40,
          title: `${i18n('Wire_EDM')}`,
        },
        machiningCenter: {
          // 加工中心
          top: '-9%',
          left: '85%',
          max: 70,
          min: 60,
          title: `${i18n('Machining_Center')}`,
        },
        EDM: {
          // 放電加工
          top: '-18%',
          left: '35%',
          max: 50,
          min: 40,
          title: `${i18n('EDM')}`,
        },
        manualLathe: {
          // 傳統铣床
          top: '-4%',
          left: '21%',
          max: 24,
          min: 16,
          title: `${i18n('Manual_Lathe')}`,
        },
        grindingMachine: {
          // 平面磨床
          top: '3%',
          left: '8%',
          max: 60,
          min: 50,
          title: `${i18n('Grinding_Machine')}`,
        },
      },
      valuesName: {
        utilizationRate: `${i18n('Utilization_Rate')}`,
        outputPower: `${i18n('Output_Power')}`,
        mainProgramNumber: `${i18n('Main_Program_Number')}`,
      },
    },
    preCondition: {
      getUtilizationRate: function (done) {
        this.commons.getUtilizationRate(done)
      },
    },
    delayCondition: ['machineList', 'machineLightList'],
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/d3/d3.v4.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.valuelabels.js',
      ],
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
    ],
  })
}
