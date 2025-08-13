@ECHO OFF
start cmd /k "npm install ."
start cmd /k "npm run build"
MD bin;
set DISTPATH=CALL :NORMALIZEPATH "./dist"
echo node %DISTPATH%\main.js %%*> "./bin/vibesc.cmd"
echo node %DISTPATH%\main.js %%*>> "./bin/vibesc.cmd"

REM chmod +x ./bin/vibesc

:NORMALIZEPATH
  SET RETVAL=%~f1
  EXIT /B
