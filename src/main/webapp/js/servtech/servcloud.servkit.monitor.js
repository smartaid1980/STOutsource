;(function (global, $, _) {
  global.servkit = global.servkit || {}
  //是否使用DEMO資料
  var _IS_USE_DEMO = true

  //監控demo假資料，換資料的頻率
  var _DEMO_DATA_LOOP_FREQ = 500

  var _DEMO_DATA = {
    //01 主要資訊(單)
    cnc_Information: [
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474835968]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504460000]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14442432]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 142.8]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 142.8]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 147.6]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, 862.4]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N14G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0014']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474837984]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504462208]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14444448]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 454.8]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 459.6]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 474]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, 531.2]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N14G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0014']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474840128]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504463776]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14446464]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 758.4]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 758.4]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 758.4]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, 248]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N14G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0014']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474842048]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504465824]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14448512]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 960.4]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 960.4]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 960.4]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, -955.6]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N15G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0015']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474844064]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504467840]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14450528]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 658]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 658]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 658]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, -653.2]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N15G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0015']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474846080]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504469856]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14452544]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 354.4]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 354.4]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 354.4]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, -350.8]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N15G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0015']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474848096]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504471872]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14454560]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 53.2]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 53.2]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 53.2]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, -53.2]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N15G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0015']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474849088]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504473856]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14456544]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|0',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N17G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0017']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474849088]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504475872]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14458560]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|0',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N17G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0017']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474824880]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504443616]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14426304]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 504]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 504]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 508.8]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, 501.2]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N10G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0010']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474826896]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504445632]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14428320]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 806.4]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 806.4]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 806.4]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, 198.8]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N10G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0010']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474828912]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504447648]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14430336]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 911.2]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 911.2]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 911.2]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, -906.4]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N11G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0011']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474830928]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504449664]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14432352]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 608.8]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 608.8]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 608.8]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, -604]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N11G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0011']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474832944]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504451680]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14434368]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 305.2]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 305.2]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 305.2]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, -305.2]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N11G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0011']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474834960]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504453696]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14436384]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 2.8]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 2.8]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 2.8]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0, -2.8]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N12G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0012']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474834960]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504455712]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14438400]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[3, 0]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N12G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0012']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[1]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474834960]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504457728]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14440416]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_POSM()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSR()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSA()': {
          type: 'DOUBLE',
          values: [[0, 0]],
        },
        'G_POSD()': {
          type: 'DOUBLE',
          values: [[0.984, 0]],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_EXEP()': {
          type: 'STRING',
          values: [['N12G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0012']],
        },
        'G_SRNE()': {
          type: 'STRING',
          values: [['X', 'Z']],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
    ],
    //01 主要資訊(多)
    cnc_Information_multiSystem: [
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474835968]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504460000]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14442432]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 142.8],
            [0, 142.8],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 142.8],
            [0, 142.8],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 147.6],
            [0, 147.6],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, 862.4],
            [0, 862.4],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N14G1W1010.F9000'], ['N14G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0014']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474837984]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504462208]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14444448]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 454.8],
            [0, 454.8],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 459.6],
            [0, 459.6],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 474],
            [0, 474],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, 531.2],
            [0, 531.2],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N14G1W1010.F9000'], ['N14G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0014']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474840128]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504463776]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14446464]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 758.4],
            [0, 758.4],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 758.4],
            [0, 758.4],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 758.4],
            [0, 758.4],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, 248],
            [0, 248],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N14G1W1010.F9000'], ['N14G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0014']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474842048]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504465824]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14448512]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 960.4],
            [0, 960.4],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 960.4],
            [0, 960.4],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 960.4],
            [0, 960.4],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, -955.6],
            [0, -955.6],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N15G1W-1010.F9000'], ['N15G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0015']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474844064]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504467840]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14450528]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 658],
            [0, 658],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 658],
            [0, 658],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 658],
            [0, 658],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, -653.2],
            [0, -653.2],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N15G1W-1010.F9000'], ['N15G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0015']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474846080]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504469856]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14452544]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 354.4],
            [0, 354.4],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 354.4],
            [0, 354.4],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 354.4],
            [0, 354.4],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, -350.8],
            [0, -350.8],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N15G1W-1010.F9000'], ['N15G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0015']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474848096]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504471872]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14454560]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 53.2],
            [0, 53.2],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 53.2],
            [0, 53.2],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 53.2],
            [0, 53.2],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, -53.2],
            [0, -53.2],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|1',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N15G1W-1010.F9000'], ['N15G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0015']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474849088]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504473856]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14456544]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|0',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N17G4X5.'], ['N17G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0017']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944920000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474849088]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504475872]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14458560]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|0',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N17G4X5.'], ['N17G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0017']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474824880]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504443616]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14426304]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 504],
            [0, 504],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 504],
            [0, 504],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 508.8],
            [0, 508.8],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, 501.2],
            [0, 501.2],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N10G1W1010.F9000'], ['N10G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0010']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474826896]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504445632]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14428320]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 806.4],
            [0, 806.4],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 806.4],
            [0, 806.4],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 806.4],
            [0, 806.4],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, 198.8],
            [0, 198.8],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N10G1W1010.F9000'], ['N10G1W1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0010']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474828912]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504447648]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14430336]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 911.2],
            [0, 911.2],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 911.2],
            [0, 911.2],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 911.2],
            [0, 911.2],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, -906.4],
            [0, -906.4],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N11G1W-1010.F9000'], ['N11G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0011']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474830928]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504449664]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14432352]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 608.8],
            [0, 608.8],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 608.8],
            [0, 608.8],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 608.8],
            [0, 608.8],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, -604],
            [0, -604],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N11G1W-1010.F9000'], ['N11G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0011']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474832944]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504451680]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14434368]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[9000]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 305.2],
            [0, 305.2],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 305.2],
            [0, 305.2],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 305.2],
            [0, 305.2],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, -305.2],
            [0, -305.2],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N11G1W-1010.F9000'], ['N11G1W-1010.F9000']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0011']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474834960]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504453696]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14436384]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 2.8],
            [0, 2.8],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 2.8],
            [0, 2.8],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 2.8],
            [0, 2.8],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0, -2.8],
            [0, -2.8],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N12G4X5.'], ['N12G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0012']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474834960]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504455712]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14438400]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [3, 0],
            [3, 0],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N12G4X5.'], ['N12G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0012']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
      {
        'G_SYSC()': {
          type: 'LONG',
          values: [[2]],
        },
        'G_ELCT()': {
          type: 'LONG',
          values: [[29944860000]],
        },
        'G_CUTT()': {
          type: 'LONG',
          values: [[15474834960]],
        },
        'G_OPRT()': {
          type: 'LONG',
          values: [[20504457728]],
        },
        'G_CYCT()': {
          type: 'LONG',
          values: [[14440416]],
        },
        'G_PSCP()': {
          type: 'LONG',
          values: [[82]],
        },
        'G_TOCP()': {
          type: 'LONG',
          values: [[932]],
        },
        'G_USCP()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPMS()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_SPSO()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_ACTF()': {
          type: 'LONG',
          values: [[0]],
        },
        'G_FERP()': {
          type: 'LONG',
          values: [[100]],
        },
        'G_MPOSM()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSR()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSA()': {
          type: 'DOUBLE',
          values: [
            [0, 0],
            [0, 0],
          ],
        },
        'G_MPOSD()': {
          type: 'DOUBLE',
          values: [
            [0.984, 0],
            [0.984, 0],
          ],
        },
        'G_ACTS()': {
          type: 'DOUBLE',
          values: [[0]],
        },
        'G_MODA()': {
          type: 'STRING',
          values: [
            [
              'H|0',
              'D|0',
              'T|3',
              'M|70',
              'F|9000',
              'S|0',
              'G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]"',
            ],
          ],
        },
        'G_MEXEP()': {
          type: 'STRING',
          values: [['N12G4X5.'], ['N12G4X5.']],
        },
        'G_STAT()': {
          type: 'STRING',
          values: [
            ['MODE|HND', 'STATUS|N/A', 'EMG|N/A', 'ALM|N/A', 'MOTION|N/A'],
          ],
        },
        'G_PRGR()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_PRGM()': {
          type: 'STRING',
          values: [['O6012']],
        },
        'G_SEQN()': {
          type: 'STRING',
          values: [['N0012']],
        },
        'G_MSRNE()': {
          type: 'STRING',
          values: [
            ['X', 'Z'],
            ['X', 'Z'],
          ],
        },
        'G_PSUT()': {
          type: 'STRING',
          values: [['mm']],
        },
        'G_FRUT()': {
          type: 'STRING',
          values: [['RPM']],
        },
        'G_SRMC()': {
          type: 'STRING',
          values: [['0']],
        },
        'G_SPMC()': {
          type: 'STRING',
          values: [['0']],
        },
      },
    ],
    //02 alarm履歷
    cnc_AlarmHistory: {
      'G_AAMH()': {
        type: 'STRING',
        values: [
          [
            '2012-04-05 15:01:03|1112',
            '2012-04-06 16:02:55|1110',
            '2012-04-06 16:03:25|1110',
            '2012-04-06 16:04:11|1111',
          ],
        ],
      },
    },
    //03 操作履歷
    cnc_OPHistory: {
      'G_OPMG()': {
        type: 'STRING',
        values: [
          [
            '89|2015/09/24   12:10:08    Event Type:Power off',
            '90|2015/09/24   12:10:17    Event Type:Power on',
            '91|2015/09/24   14:22:39    Event Type:Power off',
            '92|2015/09/24   14:26:33    Event Type:Power on',
            '93|2015/09/25   00:00:00    Event Type:Change date',
            '94|2015/09/26   00:00:00    Event Type:Change date',
            '95|2015/09/27   00:00:00    Event Type:Change date',
            '96|2015/09/28   00:00:00    Event Type:Change date',
            '97|2015/09/29   00:00:00    Event Type:Change date',
            '98|2015/09/30   00:00:00    Event Type:Change date',
            '99|2015/09/30   14:44:08    Event Type:Power off',
            '100|2015/09/30   14:45:23    Event Type:Power on',
            '101|2015/10/01   00:00:00    Event Type:Change date',
            '102|2015/10/02   00:00:00    Event Type:Change date',
            '103|2015/10/03   00:00:00    Event Type:Change date',
            '104|2015/10/04   00:00:00    Event Type:Change date',
            '105|2015/10/05   00:00:00    Event Type:Change date',
            '106|2015/10/06   00:00:00    Event Type:Change date',
            '107|2015/10/07   00:00:00    Event Type:Change date',
            '108|2015/10/08   00:00:00    Event Type:Change date',
          ],
        ],
      },
    },
    //04 PLC訊息
    pmc_rdpmcrng: {
      'G_PMCY(X,1,100)': {
        type: 'STRING',
        values: [
          [
            'X0001|0',
            'X0002|0',
            'X0003|0',
            'X0004|0',
            'X0005|77',
            'X0006|42',
            'X0007|59',
            'X0008|183',
            'X0009|19',
            'X0010|135',
            'X0011|0',
            'X0012|0',
            'X0013|0',
            'X0014|0',
            'X0015|0',
            'X0016|0',
            'X0017|0',
            'X0018|0',
            'X0019|0',
            'X0020|0',
            'X0021|0',
            'X0022|0',
            'X0023|0',
            'X0024|0',
            'X0025|0',
            'X0026|0',
            'X0027|0',
            'X0028|0',
            'X0029|0',
            'X0030|0',
            'X0031|0',
            'X0032|0',
            'X0033|0',
            'X0034|0',
            'X0035|0',
            'X0036|0',
            'X0037|0',
            'X0038|0',
            'X0039|0',
            'X0040|0',
            'X0041|0',
            'X0042|0',
            'X0043|0',
            'X0044|0',
            'X0045|0',
            'X0046|0',
            'X0047|198',
            'X0048|118',
            'X0049|0',
            'X0050|0',
            'X0051|0',
            'X0052|0',
            'X0053|0',
            'X0054|0',
            'X0055|15',
            'X0056|0',
            'X0057|0',
            'X0058|0',
            'X0059|152',
            'X0060|0',
            'X0061|0',
            'X0062|0',
            'X0063|0',
            'X0064|0',
            'X0065|0',
            'X0066|0',
            'X0067|0',
            'X0068|0',
            'X0069|0',
            'X0070|0',
            'X0071|0',
            'X0072|0',
            'X0073|0',
            'X0074|0',
            'X0075|0',
            'X0076|0',
            'X0077|0',
            'X0078|0',
            'X0079|0',
            'X0080|0',
            'X0081|0',
            'X0082|0',
            'X0083|0',
            'X0084|0',
            'X0085|0',
            'X0086|0',
            'X0087|0',
            'X0088|0',
            'X0089|0',
            'X0090|0',
            'X0091|0',
            'X0092|0',
            'X0093|0',
            'X0094|0',
            'X0095|0',
            'X0096|0',
            'X0097|0',
            'X0098|0',
            'X0099|0',
            'X0100|0',
          ],
        ],
      },
    },
    //05 alarm訊息
    cnc_Alarm: {
      'G_ALAM()': {
        type: 'LONG',
        values: [[110, 1100, 1101]],
      },
    },
    //06 CNC記憶體下載 (列表)(單)
    cnc_NCList: {
      'G_PGIF()': {
        type: 'STRING',
        values: [
          [
            '1.DAT',
            '9102',
            '9105',
            '9110',
            '9111',
            '9112',
            '9113',
            '9120',
            '9121',
            '9122',
            '9123',
            '9130',
            '9140',
            '9141',
            '9142',
            '9145',
            '9146',
            '9147',
            '9148',
            '9149',
            '9150',
            '9151',
            '9152',
            '9153',
            '9154',
            '9155',
            '9156',
            '9157',
            '9158',
            '9190',
            '201607201908.DAT',
            'O6012',
            'O6013',
            'O6015',
            '~02191540136',
            '~02191544121',
            '~07201236091',
          ],
        ],
      },
    },
    //06 CNC記憶體下載 (列表)(多)
    cnc_NCList_multiSystem: {
      'G_MPGIF()': {
        type: 'STRING',
        values: [
          ['O0001|500|(test1)', 'O0002|500|(test2)', 'O0003|500|(test3)'],
          ['O0004|500|(test4)', 'O0005|500|(test5)', 'O0006|500|(test6)'],
        ],
      },
    },
    //06 CNC記憶體下載 (下載假加工程式)(單)
    cnc_NCDownload: {
      'G_DNCP(SERVCLOUD_DEMO)': {
        type: 'STRING',
        values: [
          [
            '%\r\nO6011(SimReal TEST 6011)\r\nN01G98\r\nN02T02\r\nN03G1W1010.F9000\r\nN04G1W-1010.F9000\r\nN05T04\r\nN06G1W1010.F9000\r\nN07G1W-1010.F9000\r\nN08G4X5.\r\nN09T03\r\nN10G1W1010.F9000\r\nN11G1W-1010.F9000\r\nN12G4X5.\r\nN13T01\r\nN14G1W1010.F9000\r\nN15G1W-1010.F9000\r\nN16T00\r\nN17G4X5.\r\nN18M70\r\nN19M99\r\n%',
          ],
        ],
      },
    },
    //06 CNC記憶體下載 (下載假加工程式)(多)
    cnc_NCDownload_multiSystem: {
      'G_DNCP(SERVCLOUD_DEMO)': {
        type: 'STRING',
        values: [
          [
            '%\r\nO6011(SimReal TEST 6011)\r\nN01G98\r\nN02T02\r\nN03G1W1010.F9000\r\nN04G1W-1010.F9000\r\nN05T04\r\nN06G1W1010.F9000\r\nN07G1W-1010.F9000\r\nN08G4X5.\r\nN09T03\r\nN10G1W1010.F9000\r\nN11G1W-1010.F9000\r\nN12G4X5.\r\nN13T01\r\nN14G1W1010.F9000\r\nN15G1W-1010.F9000\r\nN16T00\r\nN17G4X5.\r\nN18M70\r\nN19M99\r\n%',
          ],
        ],
      },
    },
    //07 CNC記憶體上傳
    //08 控制器資訊
    //"cnc_Version":{"G_SYSM()":{"type":"STRING","values":[["System Software","CNC basic software|----|----","CNC option software A2|----|----","BOOT Software|60W1|0001","PMC system software 1|40A0|03.0","PPMC ladder 1 (first ladder)|    |    ","1st spindle software|    |    ","Graphic software 1|60V8|03.0","Graphic software 4(font dat)|60VE|0001","Network management|656F|0002","Embedded Ethernet|656E|0003","System Hardware","|"]]}},
    cnc_Version: {
      'G_SYSM()': {
        type: 'STRING',
        values: [
          [
            '["System Software","CNC basic software|G401|14.0","CNC option software A1|G401|14.0","CNC option software A2|G401|14.0","CNC option software A3|G401|14.0","CNC language display ROM English (Basic)|G401|14.0","CNC language display ROM Japanese|G401|14.0","CNC language display ROM German|G401|14.0","CNC language display ROM French|G401|14.0","CNC language display ROM Traditional Chinese|G401|14.0","BOOT Software|60W4|0005","PMC system software 1|40A5|04.0","PPMC ladder 1 (first ladder)|BS01|  H ","Servo software 1 |90G0|11.0","1st spindle software|9DA0|0012","2nd spindle software|9DAA|0005","3rd spindle software|0000|0000","4th spindle software |0000|0000","Graphic software 1|60VN|03.0","C language executor library|P164|000G","C language executor application|P164|000G","Network management|GZ0I|05.5","Profibus 1|F164|100C","Device-net 1|F164|300C","System Hardware","|"]',
          ],
        ],
      },
    },
    //09 Message履歷
    cnc_MsgHistory: {
      'G_MSGH()': {
        type: 'STRING',
        values: [
          [
            '2013-06-06 14:31:00|1501',
            '2013-06-06 14:31:03|1503',
            '2013-06-06 14:31:05|1505',
            '2013-06-10 10:17:34|1503',
            '2013-06-10 10:17:34|1500',
            '2013-06-10 10:17:35|1501',
            '2013-06-26 10:44:16|1500',
            '2013-06-26 10:44:17|1501',
          ],
        ],
      },
    },
    //10 Message訊息
    cnc_MsgCurrent: {
      'G_AMSG()': {
        type: 'LONG',
        values: [[1500, 1501, 1503, 1505]],
      },
    },
    //11 離開(不需要)
    //系統個數
    cnc_SystemCount: {
      'G_SYSC()': {
        type: 'LONG',
        values: [[2]],
      },
    },
    //假的上傳加工程式成功
    cnc_NCUpload: {
      'S_UNCP()': {
        type: 'STRING',
        values: [['']],
      },
    },
  }

  //box cmd 版本
  var _COMMAND_VERSION = {
    'v1.0': {
      version: 'v1.0',
      from: 'platformId',
      to: 'boxId',
      type: 'Fetch',
      replies: [
        {
          type: 'Storage',
          reply: 'platformId',
        },
      ],
      machine: 'machineId',
      command: {
        name: 'cnc_Information',
        cycleType: 'count',
        cycleValue: 0,
        timeout: 0,
        items: [
          {
            signal: {
              id: 'G_POSM',
            },
            collect: {
              waitMs: 0,
              count: 1,
            },
          },
        ],
      },
    },
  }

  var _MONITOR_FUNCTION_MAP = {
    info: {
      fa: 'fa fa-list-alt fa-3x',
      i18nKey: 'i18n_ServCloud_Dashboard',
    },
    info_anko: {
      fa: 'fa fa-list-alt fa-3x',
      i18nKey: 'i18n_ServCloud_Dashboard',
    },
    info_dashboard: {
      fa: 'fa fa-list-alt fa-3x',
      i18nKey: 'i18n_ServCloud_Dashboard_Overall',
    },
    alarm_history: {
      fa: 'fa fa-bell fa-3x',
      i18nKey: 'i18n_ServCloud_Alarm_History',
    },
    operation_history: {
      fa: 'fa fa-pencil fa-3x',
      i18nKey: 'i18n_ServCloud_Operation',
    },
    pmc_msg: {
      fa: 'fa fa-list-ul fa-3x',
      i18nKey: 'i18n_ServCloud_PMC_Message',
    },
    alarm_msg: {
      fa: 'fa fa-exclamation-circle fa-3x',
      i18nKey: 'i18n_ServCloud_Alarm_Message',
    },
    cnc_download: {
      fa: 'fa fa-cloud-download fa-3x',
      i18nKey: 'i18n_ServCloud_Prog_Download',
    },
    cnc_upload: {
      fa: 'fa fa-cloud-upload fa-3x',
      i18nKey: 'i18n_ServCloud_Prog_Upload',
    },
    controller_info: {
      fa: 'fa fa-retweet fa-3x',
      i18nKey: 'i18n_ServCloud_Controller',
    },
    msg_resume: {
      fa: 'fa fa-inbox fa-3x',
      i18nKey: 'i18n_ServCloud_Message_History',
    },
    msg_msg: {
      fa: 'fa fa-info-circle fa-3x',
      i18nKey: 'i18n_ServCloud_Message',
    },
    leave: {
      fa: 'fa fa-sign-out fa-3x',
      i18nKey: 'i18n_ServCloud_Leave',
    },
  }

  var _HEAD_I18N = {
    en: {
      i18n_ServCloud_Dashboard: 'Dashboard',
      i18n_ServCloud_Dashboard_Overall: 'Overall',
      i18n_ServCloud_Alarm_History: 'Alarm History',
      i18n_ServCloud_Operation: 'Operation',
      i18n_ServCloud_PMC_Message: 'PMC Message',
      i18n_ServCloud_Alarm_Message: 'Alarm',
      i18n_ServCloud_Prog_Download: 'Prog Download',
      i18n_ServCloud_Prog_Upload: 'Prog Upload',
      i18n_ServCloud_Controller: 'Controller',
      i18n_ServCloud_Message_History: 'Message History',
      i18n_ServCloud_Message: 'Message',
      i18n_ServCloud_Leave: 'Leave',
    },
    zh: {
      i18n_ServCloud_Dashboard: '主要资讯',
      i18n_ServCloud_Dashboard_Overall: '综合资讯',
      i18n_ServCloud_Alarm_History: 'Alarm 履历',
      i18n_ServCloud_Operation: '操作履历',
      i18n_ServCloud_PMC_Message: 'PMC 讯息',
      i18n_ServCloud_Alarm_Message: 'Alarm 讯息',
      i18n_ServCloud_Prog_Download: 'CNC 记忆体下载',
      i18n_ServCloud_Prog_Upload: 'CNC 记忆体上传',
      i18n_ServCloud_Controller: '控制器资讯',
      i18n_ServCloud_Message_History: 'Message 履历',
      i18n_ServCloud_Message: 'Message 讯息',
      i18n_ServCloud_Leave: '离开',
    },
    zh_tw: {
      i18n_ServCloud_Dashboard: '主要資訊',
      i18n_ServCloud_Dashboard_Overall: '綜合資訊',
      i18n_ServCloud_Alarm_History: 'Alarm 履歷',
      i18n_ServCloud_Operation: '操作履歷',
      i18n_ServCloud_PMC_Message: 'PMC 訊息',
      i18n_ServCloud_Alarm_Message: 'Alarm 訊息',
      i18n_ServCloud_Prog_Download: 'CNC 記憶體下載',
      i18n_ServCloud_Prog_Upload: 'CNC 記憶體上傳',
      i18n_ServCloud_Controller: '控制器資訊',
      i18n_ServCloud_Message_History: 'Message 履歷',
      i18n_ServCloud_Message: 'Message 訊息',
      i18n_ServCloud_Leave: '離開',
    },
  }

  function getCookie(key) {
    var cookieMap = _.reduce(
      global.document.cookie.split(';'),
      function (cookieMap, cookie) {
        var cookieSplitted = cookie.trim().split('=')
        cookieMap[cookieSplitted[0]] = cookieSplitted[1]
        return cookieMap
      },
      {}
    )
    return cookieMap[key]
  }

  function currCtx() {
    var currContext =
      location.hash.match(/^#app\/([^/]+)\/function\/[^/]+\/(.+?).html/) || []
    return {
      app: currContext[1],
      func: currContext[2],
    }
  }

  function buildMonitorHead(
    $monitorHeadId,
    machineId,
    boxId,
    preAppId,
    prePage,
    cncBrand,
    lang,
    isReload,
    callback
  ) {
    var urlParam =
      'machineId=' +
      machineId +
      '&boxId=' +
      boxId +
      '&preAppId=' +
      preAppId +
      '&prePage=' +
      prePage +
      '&cncBrand=' +
      cncBrand
    servkit.ajax(
      {
        url: 'api/cncbrand/readBindMonitorPage',
        type: 'GET',
        contentType: 'application/json',
        data: {
          id: machineId,
        },
      },
      {
        success: function (data) {
          callback(data, $monitorHeadId, urlParam, isReload, lang)
        },
      }
    )
  }

  function compare(a, b) {
    if (a.html_file_name < b.html_file_name) return -1
    if (a.html_file_name > b.html_file_name) return 1
    return 0
  }

  function getURLParameter(name, url) {
    //location.href
    return (
      decodeURIComponent(
        (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [
          null,
          '',
        ])[1].replace(/\+/g, '%20')
      ) || null
    )
  }

  function buildMonitorHeadCallback(
    data,
    $monitorHeadId,
    urlParam,
    isReload,
    lang
  ) {
    $monitorHeadId.html('')
    var tabs = $("<ul id='headTabs' class='nav nav-tabs bordered'></ul>")
    var appId = currCtx().app
    //console.log(data[0]);
    var sortMonitorPages = data[0].monitor_pages.sort(compare)
    _.each(sortMonitorPages, function (ele) {
      var url = '#app/' + appId + '/function/' + lang + '/' + ele.html_file_name
      if (urlParam != undefined) {
        url = url + '?' + urlParam
      } else {
        //應該不會發生...因為是自己組的...
        console.warn('servkit.monitor not set urlParam')
      }
      var pageInfo = _MONITOR_FUNCTION_MAP[ele.page_id]
      var li = $(
        "<li class=''><a id='" +
          ele.page_id +
          "' href='" +
          url +
          "' align='center'><span class='" +
          pageInfo.fa +
          "'></span><br><span>" +
          _HEAD_I18N[lang][pageInfo.i18nKey] +
          '</span></a></li>'
      )
      tabs.append(li)
    })
    $monitorHeadId.html(tabs)
    if (isReload) {
      var newLink = location.href
        .replace('/zh_tw/', '/' + lang + '/')
        .replace('/zh/', '/' + lang + '/')
        .replace('/en/', '/' + lang + '/')
      window.location.replace(newLink)
    }
  }

  //判斷監控是否是使用Demo資料
  servkit.isDemoMonitor = function () {
    return _IS_USE_DEMO
  }

  servkit.monitor = function (configObj) {
    //console.log("********************");
    //console.log(location.href);
    var theHref = location.href
    var preAppId = getURLParameter('preAppId', theHref)
    var prePage = getURLParameter('prePage', theHref)
    var cncBrand = getURLParameter('cncBrand', theHref)

    var MONITOR_TYPE = configObj.type,
      boxId = configObj.boxId,
      machineId = configObj.machineId
    var cookieLang = getCookie('lang'),
      $lang = $('#lang'),
      langMap = {
        en: 'flag-us',
        zh_tw: 'flag-tw',
        zh: 'flag-cn',
      }
    //因為不是子功能頁面，所以不會根據i18n改變而切換語言
    $lang.find('.dropdown-menu').on('click', function (e) {
      var liEle = e.target
      var $liEle = $(liEle)
      var changedLang = _.invert(langMap)[
        $liEle.find('img').attr('class').split(' ')[1]
      ]
      servkit
        .politeCheck('Cookie')
        .until(function () {
          return getCookie('lang') === changedLang
        })
        .thenDo(function () {
          cookieLang = getCookie('lang')
          if (MONITOR_TYPE == 'HEAD') {
            var $monitorHeadId = $('#' + configObj.monitorHeadId)
            buildMonitorHead(
              $monitorHeadId,
              machineId,
              boxId,
              preAppId,
              prePage,
              cncBrand,
              cookieLang,
              true,
              buildMonitorHeadCallback
            )
          }
        })
        .tryDuration(0)
        .start()
    })

    //****只監控一次****
    function getOnce(configObj) {
      var templateCmd = _COMMAND_VERSION[configObj.monitorCmdVersion]
      templateCmd.command = configObj.monitorCmd
      //console.log(JSON.stringify(templateCmd));
      var ajaxData = {
        boxId: configObj.boxId,
        machineId: configObj.machineId,
        command: JSON.stringify(templateCmd),
      }

      var blockMsg = '' //block時，是否要多顯示資訊
      if (configObj.blockMsg) {
        blockMsg = configObj.blockMsg + '<br/>'
      }
      //凍住
      $.blockUI({
        message:
          '<i class="fa fa-gear fa-2x fa-spin"></i>&nbsp;&nbsp; Waiting for a response...<br/>' +
          blockMsg +
          '<div class="bar-holder"><div class="progress"><div class="progress-bar bg-color-blue monitor-loading-bar" aria-valuetransitiongoal="0"></div></div></div>',
        css: {
          'border': 'none',
          'padding': '15px',
          'backgroundColor': '#000',
          '-webkit-border-radius': '10px',
          '-moz-border-radius': '10px',
          'opacity': 0.5,
          'color': '#fff',
          'z-index': 9998,
        },
      })

      //送監控命令
      servkit.ajax(
        {
          url: 'api/command/sendByCmd',
          type: 'POST',
          //contentType: 'application/json',
          data: ajaxData,
        },
        {
          success: function (data) {
            //只收一次資料
            if (configObj.timeoutLimit) {
              var isGetDataSuccess = false
              var nowTime = new Date().getTime()
              var timeoutLimit = nowTime + configObj.timeoutLimit
              var loadingBarMax = configObj.timeoutLimit
              console.log('set timeoutLimit: ' + configObj.timeoutLimit)
              ;(function exec() {
                //包起來，不讓參數影響外部
                var ajaxData = {
                  Storage: [configObj.machineId],
                }
                servkit.ajax(
                  {
                    url: 'api/mqttpool/data',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(ajaxData),
                  },
                  {
                    success: function (data) {
                      //console.log(JSON.stringify(data));
                      if (data['Storage'][configObj.machineId]) {
                        var machineData = JSON.parse(
                          data['Storage'][configObj.machineId]
                        )
                        //console.log(machineData);
                        //console.log("..................");
                        var newBoxData = parseBoxData(machineData)
                        //console.log(JSON.stringify(newBoxData));
                        if (configObj.customParamObj) {
                          //*** 增加一個可以傳參數給customCallback
                          isGetDataSuccess = configObj.customCallback(
                            newBoxData,
                            configObj.customParamObj
                          )
                        } else {
                          isGetDataSuccess = configObj.customCallback(
                            newBoxData
                          )
                        }
                      }
                    },
                    always: function () {
                      //如果沒有取得資料或還沒有timeout
                      var now = new Date().getTime()
                      if (!isGetDataSuccess && now < timeoutLimit) {
                        //更新等待回應的loading bar
                        //console.log(timeoutLimit, " - ", now);
                        //console.log((timeoutLimit - now), " / ", loadingBarMax, " = ", (timeoutLimit - now) / loadingBarMax);
                        var currentLoadingBar = parseInt(
                          (1 - (timeoutLimit - now) / loadingBarMax) * 100
                        )
                        $('.monitor-loading-bar').attr(
                          'style',
                          'width: ' + currentLoadingBar + '%'
                        )
                        setTimeout(exec, 1000)
                      } else {
                        if (isGetDataSuccess) {
                          console.info('getData success!')
                        } else {
                          console.warn('timeout!!!!!!!!!!!!!')
                          smallBox({
                            selectColor: 'yellow',
                            title: 'get gCode value timeout...',
                            icon: 'fa fa-warning',
                            timeout: 2000,
                          })
                          if (configObj.timeoutCallback) {
                            console.info('use timeoutCallback()')
                            //configObj.timeoutCallback();
                            if (configObj.customParamObj) {
                              //*** 增加一個可以傳參數給customCallback
                              configObj.timeoutCallback(
                                configObj.customParamObj
                              )
                            } else {
                              configObj.timeoutCallback()
                            }
                          } else {
                            console.info('not use timeoutCallback()')
                          }
                        }
                        $.unblockUI() //解凍
                      }
                    },
                  }
                )
              })()
            } else {
              console.warn('config not set param timeoutLimit!')
            }
          },
          fail: function () {
            $.unblockUI() //解凍
            smallBox({
              selectColor: 'red',
              title: 'send command fail',
              icon: 'fa fa-warning',
              timeout: 2000,
            })
            if (configObj.failCallback) {
              if (configObj.customParamObj) {
                //*** 增加一個可以傳參數給customCallback
                configObj.failCallback(configObj.customParamObj)
              } else {
                configObj.failCallback()
              }
            }
          },
        }
      )
    }

    //*****監控頁面*****

    function monitorPage(configObj) {
      var templateCmd = _COMMAND_VERSION[configObj.monitorCmdVersion]
      templateCmd.command = configObj.monitorCmd
      //console.log(JSON.stringify(templateCmd));
      var ajaxData = {
        boxId: configObj.boxId,
        machineId: configObj.machineId,
        command: JSON.stringify(templateCmd),
      }
      //送監控命令
      servkit.ajax(
        {
          url: 'api/command/sendByCmd',
          type: 'POST',
          //contentType: 'application/json',
          data: ajaxData,
        },
        {
          success: function () {
            //使用subscribe收資料
            servkit.subscribe('Storage', {
              machines: [configObj.machineId],
              handler: function (data) {
                //console.log(JSON.stringify(data));
                //DEMO假資料:固定
                //var boxData = {"version": "v1.0","from": "IntraD01","to": "Demo_IntraD01","type": "Storage","machine": "FANUC01","result": {"longValues": [{"signal": {"id": "G_ELCT()"},"values": [{"array": [8231400000]}]},{"signal": {"id": "G_CUTT()"},"values": [{"array": [2195942488]}]},{"signal": {"id": "G_OPRT()"},"values": [{"array": [1542247504]}]},{"signal": {"id": "G_CYCT()"},"values": [{"array": [105314704]}]},{"signal": {"id": "G_PSCP()"},"values": [{"array": [38282]}]},{"signal": {"id": "G_TOCP()"},"values": [{"array": [39132]}]},{"signal": {"id": "G_USCP()"},"values": [{"array": [0]}]},{"signal": {"id": "G_SPMS()"},"values": [{"array": [0]}]},{"signal": {"id": "G_SPSO()"},"values": [{"array": [0]}]},{"signal": {"id": "G_ACTF()"},"values": [{"array": [0]}]},{"signal": {"id": "G_FERP()"},"values": [{"array": [100]}]},{"signal": {"id": "G_SRMC()"},"values": [{"array": [0,0,0]}]}],"doubleVlaues": [{"signal": {"id": "G_POSM()"},"values": [{"array": [0.0,0.0,0.0]}]},{"signal": {"id": "G_POSR()"},"values": [{"array": [0.0,0.0,0.0]}]},{"signal": {"id": "G_POSA()"},"values": [{"array": [0.0,0.0,0.0]}]},{"signal": {"id": "G_POSD()"},"values": [{"array": [1.824,0.0,0.0]}]},{"signal": {"id": "G_ACTS()"},"values": [{"array": [0.0]}]},{"signal": {"id": "G_SPMC()"},"values": [{"array": [0.0]}]}],"stringValues": [{"signal": {"id": "G_MODA()"},"values": [{"array": ["H|0","D|0","T|4","M|70","F|9000","S|0","G|\"[G01,G17,G91,G22,G94,G21,G40,G49,G80,G98,G50,G67,G97,G54,G64,G69,G15,G40.1,G25,G160,G13.1,G50.1,G54.2,G80.5,G49.9,G54.3,G50.2,G5.5,G54.4,G80.4,G13,G8.9,G5.7]\""]}]},{"signal": {"id": "G_EXEP()"},"values": [{"array": ["N08G4X5."]}]},{"signal": {"id": "G_STAT()"},"values": [{"array": ["MODE|MEM","STATUS|START","EMG|****","ALM|****","MOTION|DWL"]}]},{"signal": {"id": "G_PRGR()"},"values": [{"array": ["O9001"]}]},{"signal": {"id": "G_PRGM()"},"values": [{"array": ["O9001"]}]},{"signal": {"id": "G_SEQN()"},"values": [{"array": ["N0008"]}]},{"signal": {"id": "G_SRNE()"},"values": [{"array": ["X","Y","Z"]}]},{"signal": {"id": "G_PSUT()"},"values": [{"array": ["mm"]}]},{"signal": {"id": "G_FRUT()"},"values": [{"array": ["RPM"]}]}]}};
                //mqtt
                if (data[configObj.machineId]) {
                  var boxData = data[configObj.machineId] //選擇machine
                  var newBoxData = parseBoxData(boxData) //轉換成好處理的格式
                  buildData(
                    newBoxData,
                    configObj.monitorParams,
                    configObj.customCallback
                  ) //用data長頁面
                } else {
                  console.info(
                    configObj.machineId + " 'Storage' data is empty!"
                  )
                }
              },
            })
          },
          fail: function () {
            smallBox({
              selectColor: 'red',
              title: 'send command fail',
              icon: 'fa fa-warning',
              timeout: 2000,
            })
            //使用subscribe收資料
            /*servkit.subscribe('Storage', {
           machines: [configObj.machineId],
           handler: function(data){
           //console.log(JSON.stringify(data));
           //DEMO假資料:固定
           //var boxData = {"version": "v1.0","from": "IntraD01","to": "Demo_IntraD01","type": "Storage","machine": "FANUC01","result": {"longValues": [{"signal": {"id": "G_ELCT()"},"values": [{"array": [8231400000]}]},{"signal": {"id": "G_CUTT()"},"values": [{"array": [2195942488]}]},{"signal": {"id": "G_OPRT()"},"values": [{"array": [1542247504]}]},{"signal": {"id": "G_CYCT()"},"values": [{"array": [105314704]}]},{"signal": {"id": "G_PSCP()"},"values": [{"array": [38282]}]},{"signal": {"id": "G_TOCP()"},"values": [{"array": [39132]}]},{"signal": {"id": "G_USCP()"},"values": [{"array": [0]}]},{"signal": {"id": "G_SPMS()"},"values": [{"array": [0]}]},{"signal": {"id": "G_SPSO()"},"values": [{"array": [0]}]},{"signal": {"id": "G_ACTF()"},"values": [{"array": [0]}]},{"signal": {"id": "G_FERP()"},"values": [{"array": [100]}]},{"signal": {"id": "G_SRMC()"},"values": [{"array": [0,0,0]}]}],"doubleVlaues": [{"signal": {"id": "G_POSM()"},"values": [{"array": [0.0,0.0,0.0]}]},{"signal": {"id": "G_POSR()"},"values": [{"array": [0.0,0.0,0.0]}]},{"signal": {"id": "G_POSA()"},"values": [{"array": [0.0,0.0,0.0]}]},{"signal": {"id": "G_POSD()"},"values": [{"array": [1.824,0.0,0.0]}]},{"signal": {"id": "G_ACTS()"},"values": [{"array": [0.0]}]},{"signal": {"id": "G_SPMC()"},"values": [{"array": [0.0]}]}],"stringValues": [{"signal": {"id": "G_MODA()"},"values": [{"array": ["H|0","D|0","T|4","M|70","F|9000","S|0","G|\"[G01,G17,G91,G22,G94,G21,G40,G49,G80,G98,G50,G67,G97,G54,G64,G69,G15,G40.1,G25,G160,G13.1,G50.1,G54.2,G80.5,G49.9,G54.3,G50.2,G5.5,G54.4,G80.4,G13,G8.9,G5.7]\""]}]},{"signal": {"id": "G_EXEP()"},"values": [{"array": ["N08G4X5."]}]},{"signal": {"id": "G_STAT()"},"values": [{"array": ["MODE|MEM","STATUS|START","EMG|****","ALM|****","MOTION|DWL"]}]},{"signal": {"id": "G_PRGR()"},"values": [{"array": ["O9001"]}]},{"signal": {"id": "G_PRGM()"},"values": [{"array": ["O9001"]}]},{"signal": {"id": "G_SEQN()"},"values": [{"array": ["N0008"]}]},{"signal": {"id": "G_SRNE()"},"values": [{"array": ["X","Y","Z"]}]},{"signal": {"id": "G_PSUT()"},"values": [{"array": ["mm"]}]},{"signal": {"id": "G_FRUT()"},"values": [{"array": ["RPM"]}]}]}};
           //DEMO假資料:雙系統
           var boxData = {"version":"v1.0","from":"IntraD01","to":"Demo_IntraD01","type":"Storage","machine":"FANUC03","result":{"longValues":[{"signal":{"id":"G_SYSC()"},"values":[{"array":[2]}]},{"signal":{"id":"G_ELCT()"},"values":[{"array":[73348800000]}]},{"signal":{"id":"G_CUTT()"},"values":[{"array":[40305238992]}]},{"signal":{"id":"G_OPRT()"},"values":[{"array":[46159953168]}]},{"signal":{"id":"G_CYCT()"},"values":[{"array":[247344]}]},{"signal":{"id":"G_PSCP()"},"values":[{"array":[218611]}]},{"signal":{"id":"G_TOCP()"},"values":[{"array":[218611]}]},{"signal":{"id":"G_USCP()"},"values":[{"array":[0]}]},{"signal":{"id":"G_SPMS()"},"values":[{"array":[500]}]},{"signal":{"id":"G_SPSO()"},"values":[{"array":[100]}]},{"signal":{"id":"G_ACTF()"},"values":[{"array":[0]}]},{"signal":{"id":"G_FERP()"},"values":[{"array":[100]}]}],"doubleVlaues":[{"signal":{"id":"G_MPOSM()"},"values":[{"array":[]},{"array":[0,0,0,0,0.0003]}]},{"signal":{"id":"G_MPOSR()"},"values":[{"array":[-71.1373,-0.0023,0,29.5787,0,614.301,0]},{"array":[-0.0028,-0.0012,0,0,0.0003]}]},{"signal":{"id":"G_MPOSA()"},"values":[{"array":[0,]},{"array":[0,0,0,0,0.0003]}]},{"signal":{"id":"G_MPOSD()"},"values":[{"array":[0,0,0,0,0,0,0]},{"array":[0,0,0,0,0]}]},{"signal":{"id":"G_ACTS()"},"values":[{"array":[0]}]}],"stringValues":[{"signal":{"id":"G_MODA()"},"values":[{"array":["H|0","D|0","T|1","M|70","F|9000","S|0","G|\"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G64,G18,G69.1,G40.1,G50.2,G13.1,G50.1,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]\""]}]},{"signal":{"id":"G_MEXEP()"},"values":[{"array":[""]},{"array":[""]}]},{"signal":{"id":"G_STAT()"},"values":[{"array":["MODE|HND","STATUS|****","EMG|****","ALM|****","MOTION|****"]}]},{"signal":{"id":"G_PRGR()"},"values":[{"array":["O6012"]}]},{"signal":{"id":"G_PRGM()"},"values":[{"array":["O6012"]}]},{"signal":{"id":"G_SEQN()"},"values":[{"array":[""]}]},{"signal":{"id":"G_MSRNE()"},"values":[{"array":["X","Z"]},{"array":["X","Z","C","Y","A"]}]},{"signal":{"id":"G_PSUT()"},"values":[{"array":["mm"]}]},{"signal":{"id":"G_FRUT()"},"values":[{"array":["RPM"]}]},{"signal":{"id":"G_SRMC()"},"values":[{"array":["B"]}]},{"signal":{"id":"G_SPMC()"},"values":[{"array":["B"]}]}]}};
           //mqtt
           //var boxData = JSON.parse(data[configObj.machineId]);//選擇machine
           var newBoxData = parseBoxData(boxData);//轉換成好處理的格式
           buildData(newBoxData, configObj.monitorParams, configObj.customCallback);//用data長頁面
           }
           });*/
          },
        }
      )
    }

    function buildData(newBoxData, monitorParams, customCallback) {
      //customCallback(newBoxData);
      var SYSTEM_COUNT_G_CODE = 'G_SYSC()' //看有幾個系統
      var systemCount = 1
      if (newBoxData[SYSTEM_COUNT_G_CODE]) {
        if (!isNaN(newBoxData[SYSTEM_COUNT_G_CODE].values[0][0])) {
          systemCount = newBoxData[SYSTEM_COUNT_G_CODE].values[0][0]
        }
      }
      _.each(monitorParams, function (monitorParam) {
        /*
         scalar:{id:"xxxx", gCode:"xxx()", callback:xxx()}
         table: {id:"xxxx", gCode:"xxx()", callback:xxx()}
         array: {id:"xxxx", gCode:"xxx()", callback:xxx(), tr:true, rowLimit:4}
         map:   {id:"xxxx", gCode:"xxx()", callback:xxx(), tr:true, gCodeKey:xxx, gCodeValue:xxx}
         */
        switch (monitorParam.type) {
          case 'scalar':
            scalar(monitorParam, systemCount)
            break
          case 'array':
            console.warn('此功能還沒做')
            break
          case 'table':
            console.warn('此功能還沒做')
            break
          case 'map':
            map(monitorParam, systemCount)
            break
          default:
            console.warn('monitor not find this type: ' + monitorParam.type)
        }
      })
      //*** customCallback改為放最後，因為有時候要用假資料覆蓋真資料時，只能在customCallback動手腳，若ustomCallback不在最後，就無法覆蓋
      customCallback(newBoxData)

      function scalar(monitorParam) {
        if (monitorParam.gCode) {
          var gCode = newBoxData[monitorParam.gCode]
          if (!gCode) {
            console.warn(
              'gCode is undefined, this ele id:' + monitorParam.ids[0]
            )
            return
          }
          //有幾個系統就長幾個系統的資料
          _.each(gCode.values, function (ele, index) {
            var $dom = $('#' + monitorParam.ids[index])
            if (!$dom) {
              console.warn('this ele id:' + monitorParam.ids[0] + ' not exist!')
              return
            }
            if (monitorParam.callback) {
              //有callback
              if (monitorParam.callbackParam) {
                //callback有參數
                updateData(
                  $dom,
                  monitorParam.callback(ele[0], monitorParam.callbackParam)
                )
              } else {
                //callback無參數
                updateData($dom, monitorParam.callback(ele[0]))
              }
            } else {
              updateData($dom, ele[0])
            }
          })
          //多系統，gCode不足的部分使用系統1取代
          for (var index = gCode.values.length; index < systemCount; index++) {
            var $dom = $('#' + monitorParam.ids[index])
            if (!$dom) {
              console.warn('this ele id:' + monitorParam.ids[0] + ' not exist!')
              return
            }
            if (monitorParam.callback) {
              //有callback
              if (monitorParam.callbackParam) {
                //callback有參數
                updateData(
                  $dom,
                  monitorParam.callback(
                    gCode.values[0][0],
                    monitorParam.callbackParam
                  )
                )
              } else {
                //callback無參數
                updateData($dom, monitorParam.callback(gCode.values[0][0]))
              }
            } else {
              updateData($dom, gCode.values[0][0])
            }
          }
        }

        function updateData($dom, value) {
          //var thisValue = Math.floor((Math.random() * 100) + 1);
          if ($dom.hasClass('easyPieChart')) {
            //使用 sasy pie chart的css
            $dom.data('easyPieChart').update(value)
          } else {
            //單純的tag
            $dom.html(value)
          }
        }
      }

      function map(monitorParam, systemCount) {
        if (monitorParam.gCode) {
          var gCode = newBoxData[monitorParam.gCode]
          if (!gCode) {
            console.warn(
              'gCode is undefined, this ele id:' + monitorParam.ids[0]
            )
            return
          }
          if (gCode.type !== 'STRING') {
            console.warn(
              "monitor map must is 'STRING', this ele id: " +
                monitorParam.ids[0]
            )
            return
          } else {
            //有幾個系統就長幾個系統的資料
            _.each(gCode.values, function (ele, index) {
              var matrix = str2MapMatrix(gCode.values[index])
              var $dom = $('#' + monitorParam.ids[index])
              if (!$dom) {
                console.warn(
                  'this ele id:' + monitorParam.ids[0] + ' not exist!'
                )
                return
              }
              buildDataByMap($dom, monitorParam, matrix)
            })
            //多系統，gCode不足的部分使用系統1取代
            for (
              var index = gCode.values.length;
              index < systemCount;
              index++
            ) {
              var matrix = str2MapMatrix(gCode.values[0])
              var $dom = $('#' + monitorParam.ids[index])
              if (!$dom) {
                console.warn(
                  'this ele id:' + monitorParam.ids[0] + ' not exist!'
                )
                return
              }
              buildDataByMap($dom, monitorParam, matrix)
            }
          }
        } else if (monitorParam.gCodeKey && monitorParam.gCodeValue) {
          var gCodeKey = newBoxData[monitorParam.gCodeKey]
          var gCodeValue = newBoxData[monitorParam.gCodeValue]
          if (!gCodeKey) {
            console.warn(
              'gCodeKey is undefined, this ele id:' + monitorParam.ids[0]
            )
            return
          }
          if (!gCodeValue) {
            console.warn(
              'gCodeValue is undefined, this ele id:' + monitorParam.ids[0]
            )
            return
          }
          //有幾個系統就長幾個系統的資料
          _.each(gCodeKey.values, function (ele, index) {
            if (
              gCodeKey.values[index] &&
              gCodeValue.values[index] &&
              gCodeKey.values[index].length == gCodeValue.values[index].length
            ) {
              var matrix = mergeArray2MapMatrix(
                gCodeKey.values[index],
                gCodeValue.values[index]
              )

              var $dom = $('#' + monitorParam.ids[index])
              if (!$dom) {
                console.warn(
                  'this ele id:' + monitorParam.ids[0] + ' not exist!'
                )
                return
              }
              buildDataByMap($dom, monitorParam, matrix)
            } else {
              console.warn(
                'gCodeKey.length != gCodeValue.length, this ele id:' +
                  monitorParam.ids[0]
              )
            }
          })
        } else {
          console.warn(
            "monitor map must has 'gCode' or 'gCodeKey, gCodeValue'."
          )
        }

        function buildDataByMap($dom, monitorParam, matrix) {
          if (monitorParam.tr) {
            matrix = matrixTranspose(matrix)
          }
          if (monitorParam.rowLimit) {
            //1.轉制col變row, 2.使用rowLimit調整, 3轉制回來
            matrix = matrixTranspose(
              reviseMatrix(monitorParam.rowLimit, matrixTranspose(matrix))
            )
          }
          if (monitorParam.colLimit) {
            matrix = reviseMatrix(monitorParam.colLimit, matrix)
          }
          //console.log(JSON.stringify(matrix));
          if ($dom[0]) {
            //dom存在才做
            if ($dom[0].tagName === 'TABLE') {
              buildTableTrTd($dom, matrix)
            } else {
              console.warn('此功能還沒做')
            }
          } else {
            console.warn('dom not exist:' + $dom[0])
          }
        }

        function mergeArray2MapMatrix(keyArr, valueArr) {
          var matrix = []
          _.each(keyArr, function (keyEle, index) {
            matrix.push([keyEle, valueArr[index]])
          })
          return matrix
        }

        //string 轉成 matrix:[[key, value],[key, value], ...]
        function str2MapMatrix(array) {
          var matrix = []
          _.each(array, function (ele) {
            var components = ele.split('|')
            matrix.push([components.shift(), components.join('|')])
          })
          return matrix
        }

        //matrix轉置
        function matrixTranspose(matrix) {
          var matrixTranspose = []
          for (var i = 0; i < matrix[0].length; i++) {
            matrixTranspose[i] = []
            for (var j = 0; j < matrix.length; j++) {
              matrixTranspose[i][j] = matrix[j][i]
            }
          }
          return matrixTranspose
        }

        //根據colLimit的大小，對資料做搬移
        function reviseMatrix(colLimit, matrix) {
          var newRowIndex = []
          var newRowIndexFix = []
          var newArr
          var col = 0

          newArr = new Array(matrix.length)
          for (var i = 0; i < matrix.length; i++) {
            newArr[i] = new Array(colLimit)
            newRowIndex[i] = i
            newRowIndexFix[i] = i
          }
          for (var j = 0; j < matrix[0].length; j++) {
            for (var k = 0; k < newRowIndex.length; k++) {
              newArr[newRowIndex[k]][col] = matrix[newRowIndexFix[k]][j]
            }
            col++
            if (colLimit - 1 == j % colLimit) {
              for (var l = 0; l < newRowIndex.length; l++) {
                newRowIndex[l] = newRowIndex[l] + newRowIndex.length
                newArr[newRowIndex[l]] = []
              }
              col = 0
            }
          }
          return newArr
        }
      }

      function buildTableTrTd($table, matrix) {
        var tdClass = $table.attr('tdClass')
        //判斷是否有套用css
        if (typeof tdClass === 'undefined') {
          tdClass = ''
        }
        $table.html('') //清空前一筆
        for (var i = 0; i < matrix.length; i++) {
          var $tr = $('<tr></tr>')
          for (var j = 0; j < matrix[i].length; j++) {
            //undefined欄位就填空字串
            if (typeof matrix[i][j] === 'undefined') {
              matrix[i][j] = ''
            }
            if (tdClass.length > 0) {
              tdClass = "class='" + tdClass + "'"
            }
            var $td = $(
              '<td id=row' +
                i +
                '_col' +
                j +
                ' ' +
                tdClass +
                '>' +
                matrix[i][j] +
                '</td>'
            )
            $tr.append($td)
          }
          $table.append($tr)
        }
      }
    }

    function parseBoxData(boxData) {
      var monitorData = {}
      //var system1 = {};
      if (boxData.result.longValues != undefined) {
        _.each(boxData.result.longValues, function (signalEle) {
          var type = 'LONG'
          var key = signalEle.signal.id
          var values = []
          _.each(signalEle.values, function (valueEle) {
            values.push(valueEle.array)
          })
          monitorData[key] = {
            type: type,
            values: values,
          }
        })
      }
      if (boxData.result.doubleVlaues != undefined) {
        _.each(boxData.result.doubleVlaues, function (signalEle) {
          var type = 'DOUBLE'
          var key = signalEle.signal.id
          var values = []
          _.each(signalEle.values, function (valueEle) {
            values.push(valueEle.array)
          })
          monitorData[key] = {
            type: type,
            values: values,
          }
        })
      }
      if (boxData.result.stringValues != undefined) {
        _.each(boxData.result.stringValues, function (signalEle) {
          var type = 'STRING'
          var key = signalEle.signal.id
          var values = []
          _.each(signalEle.values, function (valueEle) {
            values.push(valueEle.array)
          })
          monitorData[key] = {
            type: type,
            values: values,
          }
        })
      }
      //monitorData.push(monitorData);
      //console.log("/////////////////////");
      //console.log(JSON.stringify(monitorData));
      //console.log("/////////////////////");
      return monitorData
    }

    function smallBox(params) {
      //selectColor, title, icon, timeout
      var colors = {
        green: '#739E73',
        red: '#C46A69',
        yellow: '#C79121',
      }
      $.smallBox({
        sound: false, //不要音效
        title: params.title,
        content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
        color: colors[params.selectColor],
        iconSmall: params.icon,
        timeout: params.timeout,
      })
    }

    //主method
    function doMonitor() {
      if (_IS_USE_DEMO) {
        //判斷機台是否真的是demo
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['is_real_data'],
              whereClause: 'device_id = ?',
              whereParams: [machineId],
            }),
          },
          {
            success: function (data) {
              //console.log("****************");
              //console.log(JSON.stringify(data));
              //console.log(data[0].is_real_data);
              //console.log("****************");
              if (data.length == 0) {
                console.info(
                  'DB not has this machine.... so monitor use demo fake data.'
                )
                demoMonitor() //測試
              } else if (data[0].is_real_data == 0) {
                console.info('monitor use demo fake data.')
                demoMonitor() //測試
              } else {
                console.info('monitor use real data.')
                realMonitor() //真實
              }
            },
            fail: function () {
              console.warn('m_device is_real_data fail.')
            },
          }
        )
      } else {
        realMonitor() //真實
      }
    }

    //測試 (假資料監控)
    function demoMonitor() {
      var data = _DEMO_DATA[configObj.monitorCmd.name]
      if (MONITOR_TYPE == 'HEAD') {
        //監控head
        var $monitorHeadId = $('#' + configObj.monitorHeadId)
        buildMonitorHead(
          $monitorHeadId,
          machineId,
          boxId,
          preAppId,
          prePage,
          cncBrand,
          cookieLang,
          false,
          buildMonitorHeadCallback
        )
      } else if (MONITOR_TYPE == 'MONITOR') {
        //監控頁面
        if (data) {
          //var newBoxData = parseBoxData(data);
          //console.log(JSON.stringify(newBoxData));
          var demoDataIndex = 0
          ;(function loopDemoData() {
            if (demoDataIndex >= 0) {
              //當index為-1則停止
              //console.log(demoDataIndex);
              buildData(
                data[demoDataIndex],
                configObj.monitorParams,
                configObj.customCallback
              )
              demoDataIndex++
              if (demoDataIndex >= data.length) {
                demoDataIndex = 0
              }
              window.onhashchange = function (e) {
                //離開頁面結束demo資料
                demoDataIndex = -1
              }
              setTimeout(loopDemoData, _DEMO_DATA_LOOP_FREQ)
            }
          })()
        } else {
          console.warn(
            '(demo) servkit.monitor not find monitorCmd.name:' +
              configObj.monitorCmd.name
          )
        }
      } else if (MONITOR_TYPE == 'SEND') {
        if (data) {
          //var newBoxData = parseBoxData(data);
          configObj.customCallback(data)
        } else {
          console.warn(
            '(demo) servkit.monitor not find monitorCmd.name:' +
              configObj.monitorCmd.name
          )
        }
      } else {
        console.warn('(demo) servkit.monitor not this type:' + MONITOR_TYPE)
      }
    }

    //真實 (透過mqtt監控)
    function realMonitor() {
      if (MONITOR_TYPE == 'HEAD') {
        //監控head
        var $monitorHeadId = $('#' + configObj.monitorHeadId)
        buildMonitorHead(
          $monitorHeadId,
          machineId,
          boxId,
          preAppId,
          prePage,
          cncBrand,
          cookieLang,
          false,
          buildMonitorHeadCallback
        )
      } else if (MONITOR_TYPE == 'MONITOR') {
        //監控頁面
        leavePageSendStop(MONITOR_TYPE, configObj)
        //監控
        if (configObj.monitorParams && configObj.customCallback) {
          monitorPage(configObj)
        } else {
          console.warn('monitorParams or customCallback not setting')
        }
      } else if (MONITOR_TYPE == 'SEND') {
        leavePageSendStop(MONITOR_TYPE, configObj)
        getOnce(configObj)
      } else {
        console.warn('servkit.monitor not this type:' + MONITOR_TYPE)
      }
    }

    function leavePageSendStop(type, configObj) {
      var localValue = type
      if ('onhashchange' in window) {
        window.onhashchange = function (e) {
          if (localValue === type) {
            //離開此頁面
            //smallBox({selectColor: "green", title: "leave monitor", icon: "fa fa-sign-out", timeout: 2000});
            console.log('leave monitor success')
            localValue = ''
            stopMonitorCmd(configObj)
          }
        }
      } else {
        console.warn('Browser not has onhashchange event...')
      }
    }

    function stopMonitorCmd(configObj) {
      var ajaxData = {
        boxId: configObj.boxId,
        machineId: configObj.machineId,
      }
      servkit.ajax(
        {
          url: 'api/command/stop',
          type: 'POST',
          //contentType: 'application/json',
          data: ajaxData,
        },
        {
          success: function (data) {
            //smallBox({selectColor: "green", title: "stop command success ", icon: "fa fa-check", timeout: 2000});
            console.log('stop command success')
          },
          fail: function () {
            smallBox({
              selectColor: 'red',
              title: 'stop command fail',
              icon: 'fa fa-warning',
              timeout: 2000,
            })
          },
        }
      )
    }

    servkit.requireJs(
      [
        '/js/notification/SmartNotification.min.js',
        '/js/servtech/jquery.blockUI.js',
      ],
      doMonitor
    )
  }

  /* 工具 */
  servkit.monitor.tool = function (configObj) {
    execTool()

    function execTool() {
      switch (configObj.type.toUpperCase()) {
        case 'TABLE':
          growDataTable(configObj.config)
          break
        case 'ALARM_CODE':
          getAlarmCodeDescription(configObj.config)
          break
        default:
          console.warn('monitor not find this type: ' + configObj.type)
      }
    }

    function getAlarmCodeDescription(config) {
      var machineId = config.machineId
      var ids = config.ids
      var param = {}
      param[machineId] = ids
      servkit.ajax(
        {
          url: 'api/alarm/readByMachineId',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(param),
        },
        {
          success: function (data) {
            // var alarmCodeObj = data;
            //console.log("alarmCodeObj: ", data);
            var response = {}
            if (data[machineId] && data[machineId]['codes']) {
              _.each(data[machineId]['codes'], function (value, key) {
                //塞入db拿到的alarm code說明
                response[key] = value
              })
            }
            config.callback(response)
          },
          fail: function () {
            console.warn(
              'servkit.monitor.tool type ALARM_CODE get alaram description fail.'
            )
          },
        }
      )
    }

    function growDataTable(config) {
      var $table = $('#' + config.id)
      var headColumns = config.headColumns
      var options = config.options
      /***************** render table html ******************/
      var html = []
      html.push('<thead><tr>')
      _.each(headColumns, function (elem) {
        var temp = '<th'
        temp = elem.dataHide
          ? temp + " data-hide='" + elem.dataHide + "'"
          : temp
        temp = elem.dataWidth
          ? temp + " style='width:" + elem.dataWidth + "'"
          : temp
        temp = elem.tooltip
          ? temp +
            " data-placement='top' data-original-title='" +
            elem.tooltip +
            "'> <i class='fa fa-question-circle'></i> "
          : temp + '>'
        html.push(temp + elem.name + '</th>')
      })
      html.push('</tr></thead><tbody></tbody>')

      $table.html(html.join(''))
      //setupDataTable();
      /***************** render datatable ******************/
      function setupDataTable() {
        var responsiveHelper,
          breakpointDefinition = {
            tablet: 1024,
            phone: 480,
          }

        $table.dataTable().fnDestroy()
        //*** 因為undefined會造成datatables拋alert()，所以在此將undefined replace成空字串
        for (var row = 0; row < options.data.length; row++) {
          for (var col = 0; col < options.data[0].length; col++) {
            if (_.isUndefined(options.data[row][col])) {
              options.data[row][col] = ''
            }
          }
        }
        var table = $table.DataTable(
          $.extend(
            {},
            {
              sDom:
                options.sDom ||
                't' +
                  "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
              //                autoWidth: false,
              headerCallback: function (thead, data, start, end, display) {
                $(thead).find('th').removeClass('sorting_asc')
              },
              preDrawCallback: function () {
                // Initialize the responsive datatables helper once.
                if (!responsiveHelper) {
                  responsiveHelper = new ResponsiveDatatablesHelper(
                    $table,
                    breakpointDefinition
                  )
                }
              },
              rowCallback: function (nRow) {
                responsiveHelper.createExpandIcon(nRow)
              },
              drawCallback: function (oSettings) {
                responsiveHelper.respond()
                $table.find('th').tooltip({
                  container: 'body',
                })
              },
            },
            options
          )
        )
        //$table.data('datatable', table);
        if (config.customCallback) {
          config.customCallback(options)
        }
      }

      servkit.requireJs(
        [
          '/js/notification/SmartNotification.min.js',
          '/js/plugin/datatables/jquery.dataTables.min.js',
          '/js/plugin/datatables/dataTables.colVis.min.js',
          '/js/plugin/datatables/dataTables.tableTools.min.js',
          '/js/plugin/datatables/dataTables.bootstrap.min.js',
          '/js/plugin/datatable-responsive/datatables.responsive.min.js',
          '/js/plugin/bootstrap-progressbar/bootstrap-progressbar.min.js',
          '/js/servtech/jquery.blockUI.js',
        ],
        setupDataTable
      )
    }
  }
})(this, $, _)
