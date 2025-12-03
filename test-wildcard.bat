@echo off
echo Testing wildcard classpath...

set "JLINK_LIB=C:\Program Files\PTC\Creo 12.4.0.0\Common Files\text\java\*"

echo JLINK_LIB=%JLINK_LIB%

if not exist target\classes mkdir target\classes

javac -encoding UTF-8 -cp "%JLINK_LIB%;target\classes" -d target\classes src\main\java\com\creo\metadata\logger\MetadataLogger.java
if errorlevel 1 goto :failed

javac -encoding UTF-8 -cp "%JLINK_LIB%;target\classes" -d target\classes src\main\java\com\creo\metadata\core\SessionManager.java
if errorlevel 1 goto :failed

echo SUCCESS!
goto :end

:failed
echo FAILED!

:end
