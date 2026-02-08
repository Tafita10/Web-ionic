@echo off
REM Script automatique d'installation du SDK Android
REM Pour: Signalement Route Madagascar

setlocal enabledelayedexpansion

set ANDROID_SDK_ROOT=C:\Android\Sdk
set CMDLINE_TOOLS_URL=https://dl.google.com/android/repository/commandlinetools-win-9477386_latest.zip
set CMDLINE_TOOLS_ZIP=C:\Android\cmdline-tools.zip

echo.
echo ========================================
echo   Installation SDK Android Automatique
echo ========================================
echo.

REM Créer le répertoire
if not exist "C:\Android" mkdir C:\Android
if not exist "%ANDROID_SDK_ROOT%" mkdir "%ANDROID_SDK_ROOT%"

echo [1/4] Téléchargement Command-Line Tools...
REM Note: Vous devez télécharger manuellement depuis https://developer.android.com/studio
REM car les URLs directes changent fréquemment
echo.
echo ⚠ Téléchargement manuel requis:
echo   1. Aller à: https://developer.android.com/studio
echo   2. Télécharger: "Command line tools only" pour Windows
echo   3. Extraire dans: C:\Android\cmdline-tools\
echo.
echo   Structure finale doit être:
echo   C:\Android\cmdline-tools\cmdline-tools\bin\
echo                               ↓
echo   Fichiers: sdkmanager.bat, avdmanager.bat, etc.
echo.
pause

echo.
echo [2/4] Vérification du répertoire...
if exist "C:\Android\cmdline-tools\cmdline-tools\bin\sdkmanager.bat" (
    echo   OK - Command-Line Tools trouvés
) else (
    echo   ERREUR: Impossible de trouver les Command-Line Tools
    echo   Assurez-vous d'avoir extrait correctement les fichiers
    exit /b 1
)
echo.

echo [3/4] Installation des SDK Tools...
cd /d C:\Android\cmdline-tools\cmdline-tools\bin

REM Installer Platform Tools
echo   - Installation de Platform Tools...
call sdkmanager --sdk_root=%ANDROID_SDK_ROOT% --licenses "yes" "platform-tools"

REM Installer API 34
echo   - Installation d'Android API 34...
call sdkmanager --sdk_root=%ANDROID_SDK_ROOT% --licenses "yes" "platforms;android-34"

REM Installer Build Tools
echo   - Installation de Build Tools 34.0.0...
call sdkmanager --sdk_root=%ANDROID_SDK_ROOT% --licenses "yes" "build-tools;34.0.0"

REM Installer NDK (optionnel mais utile)
echo   - Installation de NDK 25.2.9519653...
call sdkmanager --sdk_root=%ANDROID_SDK_ROOT% --licenses "yes" "ndk;25.2.9519653"

echo.
echo [4/4] Configuration des variables d'environnement...
echo   ANDROID_HOME=%ANDROID_SDK_ROOT%

REM Créer local.properties
set LOCAL_PROPS_FILE=C:\Users\%USERNAME%\ITU\s5\Rojo_S5\signalement_route\mobile\android\local.properties
if exist "%LOCAL_PROPS_FILE%" (
    echo   - Mise à jour de local.properties...
    (
        echo sdk.dir=%ANDROID_SDK_ROOT:\=\\%
        echo ndk.dir=%ANDROID_SDK_ROOT:\=\\%\ndk\25.2.9519653
    ) > "%LOCAL_PROPS_FILE%"
) else (
    echo   - Création de local.properties...
    if not exist "%~dp0..\..\..\..\..\..\mobile\android" (
        echo   ERREUR: Impossible de trouver le dossier mobile\android
        exit /b 1
    )
    (
        echo sdk.dir=%ANDROID_SDK_ROOT:\=\\%
        echo ndk.dir=%ANDROID_SDK_ROOT:\=\\%\ndk\25.2.9519653
    ) > "%~dp0..\..\..\..\..\..\mobile\android\local.properties"
)

echo.
echo ========================================
echo   Installation Complétée!
echo ========================================
echo.
echo Configuration:
echo   ANDROID_HOME: %ANDROID_SDK_ROOT%
echo   Platform Tools: %ANDROID_SDK_ROOT%\platform-tools
echo   Build Tools: %ANDROID_SDK_ROOT%\build-tools\34.0.0
echo   NDK: %ANDROID_SDK_ROOT%\ndk\25.2.9519653
echo.
echo Prochaines étapes:
echo   1. Ajouter %ANDROID_SDK_ROOT%\platform-tools à PATH
echo   2. Redémarrer les terminaux
echo   3. Vérifier: adb --version
echo   4. Lancer: cd signalement_route && build-apk.bat 1
echo.
pause
