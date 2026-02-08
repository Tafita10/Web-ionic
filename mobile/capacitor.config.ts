import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mg.itu.signalement.route',
  appName: 'Signalement Route',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3880ff',
      showSpinner: false
    },
    Camera: {
      quality: 90,
      allowEditing: true,
      resultType: 'base64'
    },
    Geolocation: {
      requestPermissions: true
    }
  }
};

export default config;
