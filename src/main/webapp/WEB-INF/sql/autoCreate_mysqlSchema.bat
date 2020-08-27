setlocal

REM -------------------------------- CONFIG ---------------------------------

REM set sql file path
set depoly_schema_dir="./schema"

REM set source db name
set mysql_dump_db=servcloud

REM -------------------------------- SETTING MySQL LINK ---------------------------------

set mysql_username=root
set mysql_password=servtechpwd
set mysql_service=MySQL55
set mysql_command="..\..\..\..\..\mysql-5.5.43-win32\bin\mysql.exe"
set mysql_dump="..\..\..\..\..\mysql-5.5.43-win32\bin\mysqldump.exe"

REM --------------------------------  SETTING TIME FORMAT ------------------------------------

for /f "tokens=1,2,3 delims=/ " %%a in ('DATE /T') do set date=%%a-%%b-%%c
For /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set time=%%a%%b) 

REM --------------------------------  SETTING TIME FORMAT ------------------------------------

set schemaFileName=%mysql_dump_db%_schema_%date%_%time%

REM --------------------------------  CREATE DB SCHEMA ------------------------------------

%mysql_dump% --user %mysql_username% --password=%mysql_password% %mysql_dump_db% --no-data --opt > "%depoly_schema_dir%\%schemaFileName%.sql"

PAUSE
