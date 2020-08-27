set PROJECT_PATH=%1
set YEAR=%2

rem newRawData input
set rawDataFilePath=%PROJECT_PATH%\input\input.csv
rem newRawData output
set newRawDataFilePath=%PROJECT_PATH%\newRawData\newRawData.csv
rem newRawData map file
set mapDirPath=%PROJECT_PATH%\input\map
rem newRawData rules file
set newRawDataRuleFilePath=%PROJECT_PATH%\rules\rules.csv

rem if input is report, has head.
set inputHasHead=true
set mapHasHead=false
set kmversion=2.10
set isDebug=true

setlocal enabledelayedexpansion enableextensions

IF EXIST jar.console. (del jar.console.)
IF EXIST jar.log. (del jar.log.)
rem clear last error messages or api/aheadmaster/routine/executeKM will mistake it as km execution error
IF EXIST error.log. (del error.log.)

echo "********newRawData********">jar.log
java -jar km-%kmversion%.jar 0 %rawDataFilePath% %newRawDataFilePath% %newRawDataRuleFilePath% %inputHasHead% %mapDirPath% %mapHasHead% %isDebug% 1>jar.console 2>>jar.log
if not %errorlevel% == 0 echo newRawData errorlevel :  %errorlevel% >  error.log

rem sleep 2 second, wait for newRawData.bat to complete
@ping 127.0.0.1 -n 2 -w 1000 > nul

for %%i in (yield invalid line production) do (	
	for %%j in (date week month quarter) do (
		echo "********%%i--%%j********">>jar.log
		set reportFilePath=%PROJECT_PATH%\output\%%i\trend\%YEAR%\%%j.csv
		set reportRuleFilePath=%PROJECT_PATH%\rules\%%i\trend\%%j.csv
		java -jar km-%kmversion%.jar 1 %newRawDataFilePath% !reportFilePath! !reportRuleFilePath! 0 1>>jar.console 2>>jar.log
		if not %errorlevel% == 0 echo %%i--%%j errorlevel :  %errorlevel% >>  error.log

		if not %%i==production if not %%i==line (
			set reportFilePath=%PROJECT_PATH%\output\%%i\pareto\%YEAR%\%%j.csv
			set reportRuleFilePath=%PROJECT_PATH%\rules\%%i\pareto\%%j.csv
			java -jar km-%kmversion%.jar 1 %newRawDataFilePath% !reportFilePath! !reportRuleFilePath! 0 1>>jar.console 2>>jar.log
			if not %errorlevel% == 0 echo %%i--%%j errorlevel :  %errorlevel% >>  error.log
		)
	)
)

rem update project latest date
java -jar DataLatestDate.jar %PROJECT_PATH%\output\production\trend\ %PROJECT_PATH%\latestDate.txt 1>>jar.console