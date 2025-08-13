@ECHO OFF
cmd /c "npm install ."
cmd /c "npm run build"
MD ./bin 2> NUL
CALL :NORMALIZEPATH ".\dist"
set DISTPATH=%RETVAL%
echo node %DISTPATH%\main.js %%*> ".\bin\vibesc.cmd"
EXIT /B

:NORMALIZEPATH
  SET RETVAL=%~f1
  EXIT /B
