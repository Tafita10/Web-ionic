import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import FirebaseService from './services/firebase.service';
import { FIREBASE_CONFIG } from './config/constants';
FirebaseService.initialize(FIREBASE_CONFIG);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router);
router.isReady().then(() => {
  app.mount('#app');
});