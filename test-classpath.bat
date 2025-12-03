@echo off
setlocal enabledelayedexpansion

echo === Testing Classpath ===

set "CREO_HOME=C:\Program Files\PTC\Creo 12.4.0.0"
set "JLINK_LIB=%CREO_HOME%\Common Files\text\java\otk.jar;%CREO_HOME%\Common Files\text\java\pfcasync.jar"

echo CREO_HOME=%CREO_HOME%
echo JLINK_LIB=%JLINK_LIB%
echo.

echo Testing if JAR files exist:
if exist "%CREO_HOME%\Common Files\text\java\otk.jar" (
    echo [OK] otk.jar exists
) else (
    echo [FAIL] otk.jar NOT found
)

if exist "%CREO_HOME%\Common Files\text\java\pfcasync.jar" (
    echo [OK] pfcasync.jar exists
) else (
    echo [FAIL] pfcasync.jar NOT found
)

echo.
echo Testing javac with classpath:
echo Command: javac -cp "%JLINK_LIB%" -version

javac -cp "%JLINK_LIB%" -version

echo.
echo Testing actual compilation:
if not exist "target\classes" mkdir target\classes

javac -encoding UTF-8 -cp "%JLINK_LIB%" -d target\classes src\main\java\com\creo\metadata\core\SessionManager.java

if errorlevel 1 (
    echo [FAIL] Compilation failed
) else (
    echo [OK] Compilation successful
)

pause
