chcp 65001
setlocal
REM -------------------------------- CREATE DB SCHEMA  ------------------------------------
for %%x in (00_truncateCSUTables.sql 05_insertAgvRfidSensorType.sql 06_insertDefaultValues.sql 08_insertAlertType.sql) do (
    ..\..\..\..\..\mysql-5.5.43-win32\bin\mysql.exe ^
    --host=localhost ^
    --port=53306 ^
    --user=root ^
    --password=servtechpwd ^
    --database=servcloud ^
    --verbose ^
    < .\criticalData\ChengShiu\%%x ^
    2>.\log\reset_err_%%x.log
    type .\log\reset_err_%%x.log >> reset_err.log
)
echo over>>reset_over
exit
