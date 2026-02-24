import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import './styles.scss';
// 主题放在 EP 和 styles 之后，保证覆盖 EP 的 100% 宽度等默认样式
import '../src/theme-element-plus.scss';

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');
