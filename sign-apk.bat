@echo off
REM Script de Signature APK - Signalement Route

setlocal enabledelayedexpansion

set ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk
set APK_INPUT=android\app\build\outputs\apk\release\app-release-unsigned.apk
set APK_OUTPUT=android\app\build\outputs\apk\release\app-release-signed.apk
set KEYSTORE_PATH=%USERPROFILE%\.android\debug.keystore
set KEYSTORE_ALIAS=androiddebugkey
set KEYSTORE_PASSWORD=android

echo ======================================
echo Signature APK - Signalement Route
echo ======================================
echo.

REM Vérifier que l'APK existe
if not exist "%APK_INPUT%" (
    echo ERREUR: APK non trouvé à "%APK_INPUT%"
    exit /b 1
)

echo [1] Signature de l'APK...
jarsigner -verbose -sigalg SHA-256withRSA -digestalg SHA-256 ^
  -keystore "%KEYSTORE_PATH%" ^
  -storepass %KEYSTORE_PASSWORD% ^
  -keypass %KEYSTORE_PASSWORD% ^
  "%APK_INPUT%" %KEYSTORE_ALIAS%

if %ERRORLEVEL% neq 0 (
    echo ERREUR lors de la signature
    exit /b 1
)

echo.
echo [2] Zipalign de l'APK...
"%ANDROID_HOME%\build-tools\34.0.0\zipalign" -v 4 "%APK_INPUT%" "%APK_OUTPUT%"

if %ERRORLEVEL% neq 0 (
    echo ERREUR lors du zipalign
    exit /b 1
)

echo.
echo ======================================
echo APK signé avec succès!
echo ======================================
echo Output: %APK_OUTPUT%
echo Taille: 
for %%A in (%APK_OUTPUT%) do echo   %%~zA bytes
echo.
echo Commandes suivantes:
echo   - Installer: adb install -r "%APK_OUTPUT%"
echo   - Vérifier signature: jarsigner -verify -verbose "%APK_OUTPUT%"
echo.

pause
