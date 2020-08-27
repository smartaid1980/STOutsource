<center>Group Name
==================
類別：`com.servtech.servcloud.xxx.ooo.YourController`
## API Title
- Description:
	> 描述
	> 清楚
	> 一點
- URL: **`/api/groupname/pathname`**
- Method: **`GET`**
- ContentType: **`application/json`**
- RequestParam:
  + **param1** - **[string:YYYYMMDD]**
  + **param2** - **[int]**
- URLParam:
- RequestBody:

		{
		  "test": "test",
		  "tset": true
		}
- SuccessResponse:

		{
		  "type": 0,
		  "data": {}
		}
- FailResponse:

		{
		  "type": 1,
		  "data": "fail message"
		}


<br />
<br />

<center>系統參數
===============
類別：`com.servtech.servcloud.core.controller.SystemParamController`

## 取得平台 ID
- Description:
	> 取得此平台 ID，此 ID 代表平台的為一識別身分。
- URL: **`/api/sysparam/platformid`**
- Method: **`GET`**
- SuccessResponse:

		{
		  "type": 0,
		  "data": "The platform id"
		}
- FailResponse:

		{
		  "type": 1,
		  "data": ""
		}



## 更新平台參數
- Description:
	> 如果有手動修改已下檔案內的參數：<br />
	> 　1. DB JNDI 名稱 (system_param.json)<br />
	> 　2. 資料根目錄 (system_param.json)<br />
	> 　3. ServCloud ID (leanConfig.xml)<br />
	> 　4. MQTT ip (leanConfig.xml)<br />
	> 　5. MQTT port (leanConfig.xml)<br />
	> 　6. Raw Data 索引 (rawdata_index.json)<br />
	> 　7. Raw Data 多系統 partcount 欄位 (rawdata_param.json)<br />
	> 可以透過此 api 來讓系統重新讀入，<br />
	> 更新成功後會回傳最新的值。
- URL: **`/api/sysparam/refresh`**
- Method: **`GET`**
- SuccessResponse:

		{
		  "type": 0,
		  "data": {
		    "servcloud.db.jndi.name": "java:comp/env/jdbc/servcloud",
		    "servcloud.id": "YourPlatformId",
		    "servcloud.mqtt.ip": "127.0.0.1",
		    "servcloud.mqtt.port": "1883",
		    "servcloud.data.path": "D:/data",
		    "servcloud.rawdata.indices": "{\"timestamp\":0,\"program_name\":1,\"status\":2,\"part_count\":5,\"curr_command\":6,\"pre_ten_line\":7,\"tool\":9,\"macro\":11,\"power_millisecond\":14,\"cutting_millisecond\":15,\"operate_millisecond\":16,\"main_axis_actual_speed\":17,\"main_axis_load\":18}",
		    "servcloud.rawdata.partcount.which.index": "0"
		  }
		}
- FailResponse:

		{
		  "type": 1,
		  "data": "失敗原因"
		}

<br />
<br />

<center>Cache 資料
==================
類別：`com.servtech.servcloud.core.controller.MqttController`

## 取得平台 Cache 資料
- Description:
	> Cache 中的資料是由 MQTT subscribe 下來的，頻率約為 5 ~ 10 秒更新一次。<br />
	> 結構會依照訊息的 Type 與機台編號來儲存，請求主體中即以需要的 Type 與該 Type 中需要的機台編號來取得資料。
- URL: **`/api/mqttpool/data`**
- Method: **`POST`**
- ContentType: **`application/json`**
- RequestBody:

		{
		  "TYPE1": [
            "Machine01",
            "Machine02",
            ...
          ],
		  "TYPE2": [
            "Machine01",
            "Machine02",
            ...
          ],
          ...
		}
- SuccessResponse:

		{
		  "type": 0,
		  "data": {
			  "TYPE1": {
		         "Machine01": {
		           // 每種 Type 會有自定格式
		         },
		         "Machine02": {
		           // 每種 Type 會有自定格式
		         },
                 ...
		      },
			  "TYPE2": {
		         "Machine01": {
		           // 每種 Type 會有自定格式
		         },
		         "Machine02": {
		           // 每種 Type 會有自定格式
		         },
                 ...
		      }
			}
		}

## MQTT 重新連線
- Description:
	> 平台與Queue 進行重新連線，為了預防持續連線過久而造成連線失效，總是回傳成功。
- URL: **`/api/mqttpool/reconnect`**
- Method: **`GET`**
- SuccessResponse:

		{
		  "type": 0
		}


<br />
<br />

<center>後端多國語言
===============
類別：`com.servtech.servcloud.core.controller.LanguageController`

## 驗證
- Description:
	> 查看語言包狀況
- URL: **`/api/language/check`**
- Method: **`GET`**
- SuccessResponse:

		{
		  "type": 0,
		  "data": "驗證訊息"
		}



## 更新語言包
- Description:
	> 若 language.csv 有更新，可透過此 API 讓平台重新讀入語言檔
- URL: **`/api/language/refresh`**
- Method: **`GET`**
- SuccessResponse:

		{
		  "type": 0
		}


<br />
<br />

<center>日誌
===============
類別：`com.servtech.servcloud.core.controller.LogController`


## 更新日誌參數
- Description:
	> 若 log4j.properties 有更新，可透過此 API 讓平台重新載入設定檔
- URL: **`/api/log/refresh`**
- Method: **`GET`**
- SuccessResponse:

		{
		  "type": 0,
		  "data": "成功"
		}


<br />
<br />

<center>平台計算資訊
===================
類別：`com.servtech.servcloud.module.controller.InfoController`

## 取得平台計算所需的參數
- Description:
	> 提供計算程式取得平台目前的相關訊息供計算用，其中包含：<br />
	> 　1. 平台 ID<br />
	> 　2. 機台編號與名稱<br />
	> 　3. 指定日期範圍內的班次表<br />
	> 　4. 當下時間的邏輯日<br />
	> 　5. 當下時間的班次<br />
	> 　6. 當下時間的班次表<br />
	> 　7. 資料根目錄<br />
	> 　8. Raw Data 欄位索引<br />
	> 　9. 多系統 Partcount 欄位<br />
- URL: **`/api/info/calcInfo`**
- Method: **`GET`**
- RequestParam:
  + **startDate** - **[string:YYYYMMDD]**
  + **endDate** - **[string:YYYYMMDD]**
- SuccessResponse:

		{
		  "platformId": "YourPlatformId",
		  "machines": [
		    {
		      "id": "Machine01",
		      "name": "設備1"
		    },
            ...
		  ],
		  "shiftTimes": {
		    "20150801": [
		      {
		        "start": "2015/08/01 08:00:00",
		        "sequence": 1,
		        "name": "A",
		        "end": "2015/08/01 19:59:59"
		      },
		      {
		        "start": "2015/08/01 20:00:00",
		        "sequence": 2,
		        "name": "B",
		        "end": "2015/08/02 07:59:59"
		      }
		    ],
		    "20150802": [
		      {
		        "start": "2015/08/02 08:00:00",
		        "sequence": 1,
		        "name": "A",
		        "end": "2015/08/02 19:59:59"
		      },
		      {
		        "start": "2015/08/02 20:00:00",
		        "sequence": 2,
		        "name": "B",
		        "end": "2015/08/03 07:59:59"
		      }
		    ]
		  },
		  "nowLogicallyDate": "20150918",
		  "nowShiftTime": {
		    "start": "2015/09/18 08:00:00",
		    "sequence": 1,
		    "name": "A",
		    "end": "2015/09/18 19:59:59"
		  },
		  "nowShiftTimes": [
		    {
		      "start": "2015/09/18 08:00:00",
		      "sequence": 1,
		      "name": "A",
		      "end": "2015/09/18 19:59:59"
		    },
		    {
		      "start": "2015/09/18 20:00:00",
		      "sequence": 2,
		      "name": "B",
		      "end": "2015/09/19 07:59:59"
		    }
		  ],
		  "dataRoot": "D:/data",
		  "rawdataIndex": {
		    "timestamp": 0,
		    "program_name": 1,
		    "status": 2,
		    "part_count": 5,
		    "curr_command": 6,
		    "pre_ten_line": 7,
		    "tool": 9,
		    "macro": 11,
		    "power_millisecond": 14,
		    "cutting_millisecond": 15,
		    "operate_millisecond": 16,
		    "main_axis_actual_speed": 17,
		    "main_axis_load": 18
		  },
		  "partcountColumn": 0
		}

<br />
<br />

<center>平台資料
==================
類別：`com.servtech.servcloud.module.controller.DataController`

## 檔案資料
- Description:
	> 取得儲存於檔案中的資料，請求主體的內容包含：<br />
	> 　1. type: 資料位於的資料夾名稱
	> 　2. pathPattern: 資料路徑的規則，除了{YYYY}，{MM}，{DD} 被用在 startDate 與 endDate 之外，其餘可以自訂
	> 　3. pathParam: pathPattern 中出現的變數值集合
	> 　4. startDate: 若 pathPattern 中有出現 {YYYY}，{MM}，{DD} 就必須指派
	> 　5. endDate: 若伴隨 startDate 一起出現則會以日期區間的方式取資料
	> <br />
	> 取得的資料將會是一個二維陣列
- URL: **`/api/getdata/file`**
- Method: **`POST`**
- ContentType: **`application/json`**
- RequestBody:

		{
		  "type": "utilization_daily_report", // 資料夾名稱
		  "pathPattern": "{machine}/{YYYY}/{MM}/{YYYY}{MM}{DD}.csv",
          "pathParam": {
          	"machine": ["M00001", "M00002"]
          },
          "startDate": "YYYY/MM/DD", // optional
          "endDate": "YYYY/MM/DD",   // optional
		}
- SuccessResponse:

		{
		  "type": 0,
		  "data": [
            ["cell1", "cell2", ...],
            ...
          ]
		}
- FailResponse:

		{
		  "type": 1,
		  "data": "fail message"
		}

<br />
<br />

## DB 資料
- Description:
	> 取得儲存於 DB 中的資料，請求主體的內容包含：<br />
	> 　1. table: 資料庫表格的名稱
	> 　2. columns: 欲取得之欄位
	> 　3. whereClause: SQL 的 where 子句
	> 　4. whereParams: where 子句的參數
- URL: **`/api/getdata/db`**
- Method: **`POST`**
- ContentType: **`application/json`**
- RequestBody:

		{
		  "table": "m_device", // table 名稱
		  "columns": ["col1", "col2", ...],
          "whereClause": "col1 = ? AND col2 = ?", // optional
          "whereParams": ["test", 5]   // optional
		}
- SuccessResponse:

		{
		  "type": 0,
		  "data": [
            {
              "col1": value,
              "col2": value,
              ...
            },
            ...
          ]
		}

<br />
<br />

## 檔案資料根目錄
- Description:
	> 取得檔案資料根目錄位置
- URL: **`/api/getdata/path`**
- Method: **`GET`**
- SuccessResponse:

		"D:/data"

<br />
<br />

<center>Excel
==================
類別：`com.servtech.servcloud.module.controller.ExcelController`

## 標題與單矩陣資料下載
- Description:
	> 傳給後端標題與內容矩陣後取得 Excel
	> 每個 column 可以由「文字」、「數字」、「浮點數」、「百分比」四種格式中挑一種，並在參數 format 當中設定
	> 由於前端下載檔案需由 iframe 搭配 form 的機制，因此參數必須塞在 RequestParam 而非 RequestBody
- URL: **`/api/excel/download`**
- Method: **`POST`**
- RequestParam:
  + **data** - **RequestBody stringify 的字串內容**
- RequestBody:
        {
            "fileName": "檔名不可以是中文，不同瀏覽器無法處理",
            "matrix": [
                        ["1", "二十", "0.3", "1.2"],
                        ["4", "五十", "0.6", "1.4"],
                        ["7", "八十", "0.9", "1.6"],
                        ...
            ],
            "format": ["0", "text", "0.00%", "0.0"],
            "header": ["header1", "header2", "header3]
        }


<br />
<br />

## 基於樣板的多矩陣資料下載
- Description:
	> 傳給後端多組內容矩陣與 excel 樣版名稱後取得 Excel
	> format 參數與 `/api/excel/download` 相同
    > 由於前端下載檔案需由 iframe 搭配 form 的機制，因此參數必須塞在 RequestParam 而非 RequestBody
- URL: **`/api/excel/fromTemplate`**
- Method: **`POST`**
- RequestParam:
  + **data** - **RequestBody stringify 的字串內容**
- RequestBody:
        {
            "templateName": "excel 樣板放在 WEB_INF/excel",
            "fileName": "檔名不可以是中文，不同瀏覽器無法處理",
            "matrices": [
                {
                    "x": 5,
                    "y": 0,
                    "data": [
                        ["1", "2", "3"],
                        ["4", "5", "6"],
                        ["7", "8", "9"]
                    ],
                    "format": ["0", "0", "0"]
                },
                {
                    "x": 1,
                    "y": 3,
                    "data": [
                        ["0.87421"]
                    ],
                    "format": ["0.00%"]
                },
                {
                    "x": 1,
                    "y": 5,
                    "data": [
                        ["Hubert"]
                    ],
                    "format": ["text"]
                },
                {
                    "x": 1,
                    "y": 7,
                    "data": [
                        ["5"]
                    ],
                    "format": ["0"]
                },
                ...
            ]
        }


<br />
<br />

<center>檔案 Map 增刪改查
==================
類別：`com.servtech.servcloud.app.controller.aheadmaster.FileMapController`

## 新增一筆資料至指定 Map
- Description:
	> 新增一筆資料至 **路徑參數 name** 指定的 map
	> name 可用 dash(-) 分隔代表路徑
- URL: **`/api/aheadmaster/filemap/{name}/create`**
- Method: **`POST`**
- PathParam:
  + **name** - **map 名稱**
- ContentType: **`application/json`**
- RequestBody:

		{
            "id": "",
            "name": ""
        }


<br />
<br />

## 修改指定 Map 的一筆資料
- Description:
	> 修改 **路徑參數 name** 指定的 map 的一筆指定資料
	> name 可用 dash(-) 分隔代表路徑
- URL: **`/api/aheadmaster/filemap/{name}/update`**
- Method: **`PUT`**
- PathParam:
  + **name** - **map 名稱**
- ContentType: **`application/json`**
- RequestBody:

		{
            "id": "",
            "name": ""
        }


<br />
<br />

## 刪除指定 Map 指定 id 集合的資料
- Description:
	> 刪除 **路徑參數 name** 指定的 map 資料，
	> name 可用 dash(-) 分隔代表路徑
- URL: **`/api/aheadmaster/filemap/{name}/delete`**
- Method: **`DELETE`**
- PathParam:
  + **name** - **map 名稱**
- ContentType: **`application/json`**
- RequestBody:

		[
            "id1", "id2", ...
        ]


<br />
<br />

## 讀取指定 Map 的所有資料
- Description:
	> 讀取 **路徑參數 name** 指定的 map 的所有資料
	> name 可用 dash(-) 分隔代表路徑
- URL: **`/api/aheadmaster/filemap/{name}/read`**
- Method: **`GET`**
- PathParam:
  + **name** - **map 名稱**
- SuccessResponse:

		{
		  "type": 0,
		  "data": [
            {
              "id": "",
              "name": ""
            },
            ...
          ]
		}


<br />
<br />