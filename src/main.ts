import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import { useAuthStore } from './stores/auth';
import './style.css';
import App from './App.vue';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import i18n from './plugins/i18n';

async function initializeApp() {
    const app = createApp(App);
    const pinia = createPinia();

    // Подключение плагинов
    app.use(pinia);
    app.use(router);
    app.use(i18n);
    app.use(Toast);
    app.use(VueSweetalert2);

    const authStore = useAuthStore();
    try {
        await authStore.initialize();
    } catch (error) {
        console.error("Failed to initialize auth store:", error);
    }

    app.mount('#app');
}

initializeApp();
