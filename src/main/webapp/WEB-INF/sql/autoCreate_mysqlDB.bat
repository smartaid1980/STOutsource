setlocal

REM -------------------------------- CONFIG ---------------------------------

REM set sql file path
set depoly_sql_dir="."

set project="{{PROJECT}}"

REM set db name
set mysql_db_name=servcloud

REM set db schema file name
REM set schemaFileName="servcloud.sql"

REM -------------------------------- SETTING MySQL LINK ---------------------------------

set mysql_username=root
set mysql_password=servtechpwd
set mysql_service=MySQL55
set mysql_command="..\..\..\..\..\mysql-5.5.43-win32\bin\mysql.exe"
set mysql_dump="..\..\..\..\..\mysql-5.5.43-win32\bin\mysqldump.exe"
set mysql_host=localhost
set mysql_port=53306

REM --------------------------------  DROP & CREATE DB ------------------------------------

REM drop database
REM %mysql_command% --user=%mysql_username% --password=%mysql_password% -e "DROP DATABASE IF EXISTS %mysql_db_name%"

REM create database
%mysql_command% --host=%mysql_host% --port=%mysql_port% --user=%mysql_username% --password=%mysql_password% ^
-e "CREATE DATABASE IF NOT EXISTS %mysql_db_name%" 

IF NOT EXIST %depoly_sql_dir%\log md %depoly_sql_dir%\log


REM -------------------------------- CREATE DB SCHEMA  ------------------------------------
REM iterate SCHEMA directory
for /f %%x in ('dir /b/d %depoly_sql_dir%\schema') do (
    REM echo ==message==%%x start>>create_err.log
    REM MySql execute %%x
    %mysql_command% ^
    --host=%mysql_host% ^
    --port=%mysql_port% ^
    --user=%mysql_username% ^
    --password=%mysql_password% ^
    --database=%mysql_db_name% ^
    --verbose ^
    < %depoly_sql_dir%\schema\%%x 2>>%depoly_sql_dir%\log\create_err_%%x.log
    type %depoly_sql_dir%\log\create_err_%%x.log >> create_err.log

    REM echo ==message==%%x end>>critical_err_%%x.log
    
)

REM DB vmc_arp_date.sql -> create vmc_arp_ table
REM %mysql_command% --host=%mysql_host% --port=%mysql_port% --user=%mysql_username% --password=%mysql_password% --database=%mysql_db_name% < %depoly_sql_dir%\schema\%schemaFileName% 2>>create_err.log

echo over>>create_over

REM -------------------------------- INSERT GENERAL CRITICAL DATA  ------------------------------------

REM iterate criticalData directory
for /f %%x in ('dir /b/d %depoly_sql_dir%\criticalData\GENERAL') do (
    REM echo ==message==%%x start>>critical_err.log
    REM MySql execute %%x
    %mysql_command% ^
    --host=%mysql_host% ^
    --port=%mysql_port% ^
    --user=%mysql_username% ^
    --password=%mysql_password% ^
    --verbose ^
    --default_character_set utf8 %mysql_db_name% < %depoly_sql_dir%\criticalData\GENERAL\%%x 2>>%depoly_sql_dir%\log\critical_err_%%x.log
    type %depoly_sql_dir%\log\critical_err_%%x.log >> critical_err.log

    REM echo ==message==%%x end>>critical_err_%%x.log
    
)

REM -------------------------------- INSERT PROJECT CRITICAL DATA  ------------------------------------

REM iterate criticalData directory
IF EXIST %depoly_sql_dir%\criticalData\%project%  (
    for /f %%x in ('dir /b/d %depoly_sql_dir%\criticalData\%project%') do (
        REM echo ==message==%%x start>>critical_err.log
        REM MySql execute %%x
        %mysql_command% ^
        --host=%mysql_host% ^
        --port=%mysql_port% ^
        --user=%mysql_username% ^
        --password=%mysql_password% ^
        --verbose ^
        --default_character_set utf8 %mysql_db_name% < %depoly_sql_dir%\criticalData\%project%\%%x 2>>%depoly_sql_dir%\log\critical_err_%%x.log
        type %depoly_sql_dir%\log\critical_err_%%x.log >> critical_err.log

        REM echo ==message==%%x end>>critical_err_%%x.log
        
    )
)
echo over>>critical_over

exit
