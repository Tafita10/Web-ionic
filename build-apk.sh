#!/bin/bash
# Script de Construction Complète et Signature d'APK
# Pour: Signalement Route Madagascar

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$PROJECT_ROOT/mobile"
ANDROID_DIR="$MOBILE_DIR/android"
BUILD_OUTPUT="$ANDROID_DIR/app/build/outputs/apk/release"
APK_UNSIGNED="$BUILD_OUTPUT/app-release-unsigned.apk"
APK_SIGNED="$BUILD_OUTPUT/app-release-signed.apk"
KEYSTORE="$HOME/.android/debug.keystore"

# Couleurs pour affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  Construction APK - Signalement Route${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo

# Vérifier les dépendances
check_dependencies() {
    echo -e "${YELLOW}[1/5] Vérification des dépendances...${NC}"
    
    if ! command -v java &> /dev/null; then
        echo -e "${RED}ERREUR: Java n'est pas installé${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ Java trouvé: $(java -version 2>&1 | head -1)${NC}"
    
    if ! command -v gradle &> /dev/null && [ ! -f "$ANDROID_DIR/gradlew" ]; then
        echo -e "${RED}ERREUR: Gradle n'est pas trouvé${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ Gradle trouvé${NC}"
    
    if [ ! -f "$KEYSTORE" ]; then
        echo -e "${YELLOW}  ⚠ Keystore debug non trouvé. Un nouveau sera créé.${NC}"
    fi
    echo
}

# Construire le web
build_web() {
    echo -e "${YELLOW}[2/5] Construction Web (Vite)...${NC}"
    cd "$MOBILE_DIR"
    
    if [ -d "dist" ]; then
        echo -e "${GREEN}  ✓ dist/ existe (réutilisation)${NC}"
    else
        npm run build
        echo -e "${GREEN}  ✓ Build web terminé${NC}"
    fi
    echo
}

# Synchroniser avec Capacitor
sync_capacitor() {
    echo -e "${YELLOW}[3/5] Synchronisation Capacitor...${NC}"
    cd "$MOBILE_DIR"
    npx cap sync
    echo -e "${GREEN}  ✓ Synchronisation terminée${NC}"
    echo
}

# Construire l'APK
build_apk() {
    echo -e "${YELLOW}[4/5] Construction APK avec Gradle...${NC}"
    cd "$ANDROID_DIR"
    
    if command -v gradle &> /dev/null; then
        gradle assembleRelease
    else
        ./gradlew assembleRelease
    fi
    
    if [ -f "$APK_UNSIGNED" ]; then
        SIZE=$(du -h "$APK_UNSIGNED" | cut -f1)
        echo -e "${GREEN}  ✓ APK généré: $SIZE${NC}"
    else
        echo -e "${RED}ERREUR: APK non généré${NC}"
        exit 1
    fi
    echo
}

# Signer l'APK
sign_apk() {
    echo -e "${YELLOW}[5/5] Signature de l'APK...${NC}"
    
    # Vérifier le keystore
    if [ ! -f "$KEYSTORE" ]; then
        echo -e "${YELLOW}  Création du keystore debug...${NC}"
        keytool -genkey -v -keystore "$KEYSTORE" -keyalg RSA -keysize 2048 -validity 10000 \
            -alias androiddebugkey -dname "CN=Debug, O=Debug, L=Debug, ST=Debug, C=US" \
            -storepass android -keypass android
    fi
    
    # Signer
    jarsigner -verbose -sigalg SHA-256withRSA -digestalg SHA-256 \
        -keystore "$KEYSTORE" -storepass android -keypass android \
        "$APK_UNSIGNED" androiddebugkey
    
    # Zipalign (si zipalign existe)
    if command -v zipalign &> /dev/null; then
        zipalign -v 4 "$APK_UNSIGNED" "$APK_SIGNED"
        FINAL_APK="$APK_SIGNED"
        echo -e "${GREEN}  ✓ Zipalign effectué${NC}"
    else
        FINAL_APK="$APK_UNSIGNED"
        echo -e "${YELLOW}  ⚠ Zipalign non trouvé, APK non optimisé${NC}"
    fi
    
    echo -e "${GREEN}  ✓ APK signé: $(du -h "$FINAL_APK" | cut -f1)${NC}"
    echo
}

# Afficher les résultats
show_results() {
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ APK Générée avec Succès!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo
    echo -e "${BLUE}Fichier APK:${NC}"
    echo "  Chemin: $FINAL_APK"
    echo "  Taille: $(du -h "$FINAL_APK" | cut -f1)"
    echo
    echo -e "${BLUE}Prochaines étapes:${NC}"
    echo "  1. Installer sur appareil:"
    echo "     adb install -r \"$FINAL_APK\""
    echo
    echo "  2. Lancer l'app:"
    echo "     adb shell am start -n com.example.signalementerute/.MainActivity"
    echo
    echo "  3. Consulter les logs:"
    echo "     adb logcat | grep -i signalement"
    echo
}

# Menu interactif
show_menu() {
    echo -e "${BLUE}Sélectionner une option:${NC}"
    echo "  1. Construction complète (web + APK + signature)"
    echo "  2. Construction APK uniquement (assume web déjà construit)"
    echo "  3. Signer APK existant"
    echo "  4. Afficher les logs de l'appareil"
    echo "  5. Quitter"
    echo
}

# Main
case "${1:-0}" in
    1)
        check_dependencies
        build_web
        sync_capacitor
        build_apk
        sign_apk
        show_results
        ;;
    2)
        check_dependencies
        build_apk
        sign_apk
        show_results
        ;;
    3)
        sign_apk
        ;;
    4)
        adb logcat
        ;;
    *)
        show_menu
        read -p "Choix: " choice
        "$0" "$choice"
        ;;
esac
