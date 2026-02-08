@echo off
REM Script de Construction Complète et Signature d'APK (Windows)
REM Pour: Signalement Route Madagascar

setlocal enabledelayedexpansion

REM Définir les chemins
set PROJECT_ROOT=%~dp0
set MOBILE_DIR=%PROJECT_ROOT%mobile
set ANDROID_DIR=%MOBILE_DIR%\android
set BUILD_OUTPUT=%ANDROID_DIR%\app\build\outputs\apk\release
set APK_UNSIGNED=%BUILD_OUTPUT%\app-release-unsigned.apk
set APK_SIGNED=%BUILD_OUTPUT%\app-release-signed.apk
set KEYSTORE=%USERPROFILE%\.android\debug.keystore

echo.
echo =========================================
echo   Construction APK - Signalement Route
echo =========================================
echo.

if "%1%"=="help" goto :help
if "%1%"=="1" goto :full_build
if "%1%"=="2" goto :apk_only
if "%1%"=="3" goto :sign_only
if "%1%"=="4" goto :logs
if "%1%"=="" goto :menu

:menu
echo Options disponibles:
echo   1. Construction complète (web + APK + signature)
echo   2. Construction APK uniquement
echo   3. Signer APK existant
echo   4. Afficher les logs de l'appareil
echo   5. Aide
echo.
set /p choice="Choix (1-5): "
call :menu%choice%
exit /b

:menu1
call :full_build
exit /b

:menu2
call :apk_only
exit /b

:menu3
call :sign_only
exit /b

:menu4
call :logs
exit /b

:menu5
goto :help

:full_build
echo [1/5] Vérification des dépendances...
if not exist "%JAVA_HOME%\bin\java.exe" (
    if not exist "C:\Program Files\Java\jdk-17\bin\java.exe" (
        echo ERREUR: Java n'est pas trouvé
        exit /b 1
    )
    set JAVA_HOME=C:\Program Files\Java\jdk-17
)
echo   OK - Java trouvé

if not exist "%ANDROID_DIR%\gradlew.bat" (
    echo ERREUR: Gradle n'est pas trouvé
    exit /b 1
)
echo   OK - Gradle trouvé
echo.

echo [2/5] Construction Web (Vite)...
cd /d "%MOBILE_DIR%"
if exist dist\ (
    echo   OK - dist/ existe (réutilisation)
) else (
    call npm run build
    if errorlevel 1 (
        echo ERREUR lors du build web
        exit /b 1
    )
    echo   OK - Build web terminé
)
echo.

echo [3/5] Synchronisation Capacitor...
call npx cap sync
echo   OK - Synchronisation terminée
echo.

echo [4/5] Construction APK avec Gradle...
cd /d "%ANDROID_DIR%"
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo ERREUR lors de la construction APK
    exit /b 1
)
if not exist "%APK_UNSIGNED%" (
    echo ERREUR: APK non généré
    exit /b 1
)
echo   OK - APK générée
echo.

echo [5/5] Signature de l'APK...
call :sign_apk_internal
echo.

echo =========================================
echo   APK Générée avec Succès!
echo =========================================
echo.
echo Fichier APK:
echo   Chemin: %APK_SIGNED%
echo   
for %%A in ("%APK_SIGNED%") do echo   Taille: %%~zA bytes
echo.
echo Prochaines étapes:
echo   1. Installer sur appareil:
echo      adb install -r "%APK_SIGNED%"
echo.
echo   2. Lancer l'app:
echo      adb shell am start -n com.example.signalementerute/.MainActivity
echo.
echo   3. Consulter les logs:
echo      adb logcat
echo.
pause
exit /b

:apk_only
echo [1/2] Construction APK avec Gradle...
cd /d "%ANDROID_DIR%"
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo ERREUR lors de la construction APK
    exit /b 1
)
if not exist "%APK_UNSIGNED%" (
    echo ERREUR: APK non générée
    exit /b 1
)
echo   OK - APK générée
echo.

echo [2/2] Signature de l'APK...
call :sign_apk_internal
pause
exit /b

:sign_only
echo Signature de l'APK existant...
if not exist "%APK_UNSIGNED%" (
    echo ERREUR: %APK_UNSIGNED% n'existe pas
    exit /b 1
)
call :sign_apk_internal
pause
exit /b

:sign_apk_internal
if not exist "%KEYSTORE%" (
    echo   Création du keystore debug...
    if not exist "%USERPROFILE%\.android\" mkdir "%USERPROFILE%\.android"
    keytool -genkey -v -keystore "%KEYSTORE%" -keyalg RSA -keysize 2048 -validity 10000 ^
        -alias androiddebugkey -dname "CN=Debug, O=Debug, L=Debug, ST=Debug, C=US" ^
        -storepass android -keypass android
    if errorlevel 1 (
        echo ERREUR lors de la création du keystore
        exit /b 1
    )
)

echo   Signature avec jarsigner...
jarsigner -verbose -sigalg SHA-256withRSA -digestalg SHA-256 ^
    -keystore "%KEYSTORE%" -storepass android -keypass android ^
    "%APK_UNSIGNED%" androiddebugkey
if errorlevel 1 (
    echo ERREUR lors de la signature
    exit /b 1
)

echo   Zipalign (optimisation)...
for /f "tokens=*" %%i in ('where zipalign 2^>nul') do (
    set ZIPALIGN_PATH=%%i
)

if defined ZIPALIGN_PATH (
    call "%ZIPALIGN_PATH%" -v 4 "%APK_UNSIGNED%" "%APK_SIGNED%"
    echo   OK - Zipalign effectué
    set FINAL_APK=%APK_SIGNED%
) else (
    echo   Note: Zipalign non trouvé (APK non optimisée)
    set FINAL_APK=%APK_UNSIGNED%
)

echo   OK - APK signée
exit /b

:logs
echo Affichage des logs en direct (Ctrl+C pour quitter)...
adb logcat
exit /b

:help
echo.
echo  AIDE - Construction APK Signalement Route
echo.
echo  Usage: build-apk.bat [option]
echo.
echo  Options:
echo    1   - Construction complète (web + APK + signature)
echo    2   - Construction APK uniquement (assume web déjà construit)
echo    3   - Signer APK existant
echo    4   - Afficher les logs de l'appareil
echo    help - Afficher cette aide
echo.
echo  Exemples:
echo    build-apk.bat           - Menu interactif
echo    build-apk.bat 1         - Construction complète
echo    build-apk.bat 4         - Voir les logs en direct
echo.
echo  Configuration Requise:
echo    - Java 11+ ou supérieur
echo    - Node.js et npm
echo    - Android SDK (pour Gradle)
echo    - Optionnel: ADB (pour installation directe)
echo.
echo  Commandes Manuelles Utiles:
echo    adb devices             - Lister les appareils connectés
echo    adb install -r app.apk  - Installer l'APK
echo    adb uninstall {pkg}     - Désinstaller l'app
echo    adb logcat              - Voir les logs
echo.
pause
exit /b
