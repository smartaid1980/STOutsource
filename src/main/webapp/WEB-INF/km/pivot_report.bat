set PROJECT_PATH=%1
set YEAR=%2
set REPORT=%3

rem input
set newRawDataFilePath=%PROJECT_PATH%\newRawData\newRawData.csv
set kmversion=2.10
setlocal enabledelayedexpansion enableextensions

IF EXIST jar.console. (del jar.console.)
IF EXIST jar.log. (del jar.log.)
IF EXIST error.log. (del error.log.)

for %%j in (date week month quarter) do (
	echo "********%REPORT%--%%j********">>jar.log
	set reportFilePath=%PROJECT_PATH%\output\%REPORT%\trend\%YEAR%\%%j.csv
	set reportRuleFilePath=%PROJECT_PATH%\rules\%REPORT%\trend\%%j.csv
	java -jar km-%kmversion%.jar 1 %newRawDataFilePath% !reportFilePath! !reportRuleFilePath! 0 1>>jar.console 2>>jar.log
	if not %errorlevel% == 0 echo %REPORT%--%%j errorlevel :  %errorlevel% >>  error.log
)