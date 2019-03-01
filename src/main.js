import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'

import { videojs, videoPlayer } from "vue-video-player";
import thumbnails from "./plugins/videojs.thumbnails";
const Plugin = videojs.getPlugin("plugin");
videojs.registerPlugin("thumbnails", thumbnails);
Vue.component('video-player', videoPlayer)

import './plugins/vjs-styles.scss' 
import 'video.js/dist/video-js.css'

Vue.config.productionTip = false 

new Vue({
  render: h => h(App),
}).$mount('#app')
