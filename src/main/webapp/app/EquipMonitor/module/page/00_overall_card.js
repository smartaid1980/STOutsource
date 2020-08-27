import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      // var monitor;
      // var $plantAreaForm = $('#plantAreaForm');

      // // 主要區域
      // var plant = function () {
      //   // 取得並初始化
      //   getDbData("m_plant", ["plant_id"], allPlantIdCallback);
      //   // 建立卡片
      //   buildCard();
      // };

      // // 建立監控Card
      // function buildCard() {
      //   monitor = context.commons.monitor({
      //     currentAppId: context.appId,
      //     currentPage: context.funId,
      //     titles: {
      //       'pieLeftName': `${i18n('Speed')}`,
      //       'pieRightName': `${i18n('Feed')}`,
      //       'txtFirstName': `${i18n('Program')}`,
      //       'txtLastName': `${i18n('Quantity')}`
      //     }
      //   });
      //   // 隱藏全部
      //   monitor.hideAll();
      // }

      // // 取db資料
      // function getDbData(tableName, columnArr, callback) {
      //   servkit.ajax({
      //     url: 'api/getdata/db',
      //     type: 'POST',
      //     contentType: 'application/json',
      //     data: JSON.stringify({
      //       table: tableName,
      //       columns: columnArr
      //     })
      //   }, {
      //     success: function (data) {
      //       callback(data);
      //     }
      //   });
      // }

      // // 建立廠域清單
      // function allPlantIdCallback(data) {
      //   // 建立場區選單
      //   $plantAreaForm.append(_.map(data, function (row) {
      //     return "<option style='padding:3px 0 3px 3px;' value='" + row["plant_id"] + "'>" + row["plant_id"] + "</option>";
      //   }));
      //   // 綁定並觸發換廠域事件
      //   $plantAreaForm
      //     .off('change')
      //     .on('change', function () {
      //       buildPlantArea($plantAreaForm.val(), plantAreaCallback);
      //     })
      //     .trigger('change');
      // }

      // // 建立廠域
      // function buildPlantArea(plantId, callback) {
      //   // 取廠域matrix
      //   servkit.ajax({
      //     url: 'api/plantarea/readAreaById',
      //     type: 'GET',
      //     contentType: 'application/json',
      //     data: {
      //       id: plantId
      //     }
      //   }, {
      //     success: function (data) {
      //       callback(data);
      //     }
      //   });
      // }

      // function plantAreaCallback(data) {
      //   // 取得機台id列表 ["_ECS-PCD01M01", "_ECS-PCD01M01" ...]
      //   var machines = _.map(data.machines, function (o) {
      //     return o.device_id;
      //   });
      //   // 過濾顯示Card
      //   monitor.filter(machines);
      // }

      // // 初始化廠區資訊
      // plant();

      //畫全部的卡片
      context.monitor = context.commons.monitor({
        currentAppId: context.appId,
        currentPage: context.funId,
        titles: {
          pieLeftName: `${i18n('Speed')}`,
          pieRightName: `${i18n('Feed')}`,
          txtFirstName: `${i18n('Program')}`,
          txtLastName: `${i18n('Quantity')}`,
        },
      })
      // 隱藏全部
      context.monitor.hideAll()
      context.getPlantMachineByGroupAndPlantList()
      context.allPlantIdCallback()
    },
    util: {
      monitor: undefined,
      $plantAreaForm: $('#plantAreaForm'),
      plantMachinesByGroup: undefined, //{plant_id:[{}, {}, ...]}
      plantList: undefined,
      getPlantMachineByGroupAndPlantList: function () {
        var context = this
        context.plantMachinesByGroup = _.groupBy(
          _.filter(context.preCon.getMachinePlantArea, function (machineObj) {
            return context.preCon.getMachineByGroup[machineObj.device_id]
          }),
          'plant_id'
        )
        context.plantList = _.keys(context.plantMachinesByGroup)
      },
      // 建立廠域清單
      allPlantIdCallback: function () {
        var context = this
        // 建立場區選單
        context.$plantAreaForm.append(
          _.map(context.plantList, function (plant_id) {
            return (
              "<option style='padding:3px 0 3px 3px;' value='" +
              plant_id +
              "'>" +
              servkit.getPlantAreaName(plant_id) +
              '</option>'
            )
          })
        )
        // 綁定並觸發換廠域事件
        context.$plantAreaForm
          .off('change')
          .on('change', function () {
            context.monitor.filter(
              _.pluck(context.plantMachinesByGroup[this.value], 'device_id')
            )
          })
          .trigger('change')
      },
    },
    preCondition: {
      getMachineByGroup: function (done) {
        this.commons.getMachineByGroup(done)
      },
      getMachinePlantArea: function (done) {
        servkit.ajax(
          {
            url: 'api/plantarea/getMachinePlantArea',
            type: 'GET',
          },
          {
            success: function (data) {
              console.log(data)
              done(data.machines)
            },
          }
        )
      },
    },
    delayCondition: ['machineList'],
  })
}
