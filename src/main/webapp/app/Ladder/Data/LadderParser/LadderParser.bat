@echo off

rem public const int CONST_SUCCESS = 0;
rem public const int CONST_INPUT_FAIL = -1;
rem public const int CONST_CLEAR_PATH_FAIL = -2;
rem public const int CONST_CREATE_PATH_FAIL = -5;
rem public const int CONST_PATH_FAILE = -10;
rem public const int CONST_UNCOMPRESS_FAIL = -20;
rem public const int CONST_CHECK_SYMBOL_FAIL = -30;
rem public const int CONST_CHECK_LADDER_FAIL = -40;
rem public const int CONST_CREATE_RESULT_FAIL = -50;
rem public const int CONST_UNKNOWN_FAIL = -999;

%1 %2 %3 %4 %5 %6
echo %ERRORLEVEL% > %7
