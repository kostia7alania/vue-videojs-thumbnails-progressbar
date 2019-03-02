<template>
  <div class="app">
    <div class="desc">
      The thumbnails plugin displays a series of images over the player
      progress bar when the viewer hovers over it or drags the playhead
      around to seek. Give it a shot:
    </div>
    <video-player
      class="video-player-box"
      ref="videoPlayer"
      :options="playerOptions"
      :playsinline="true" 
      customEventName="customstatechangedeventname"
      @ready="playerReadied($event)"
    />
  </div>
</template>

<script> 
export default {
  name: "app",
  data() {
    return {
      playerOptions: {
        muted: true,
        language: "en",
        playbackRates: [0.5, 1.0, 1.5, 2.0, 8, 16],
        sources: [
          {
            type: "video/mp4",
            src: "http://vjs.zencdn.net/v/oceans.mp4"
          }
        ],
        poster: "./img/example-thumbnail.png",
        width: 400
      },
      thumbnails: {
        0: {
          src: "./img/thumbnails.png",
          style: {
            left: "-60px", //местоположение всплывающей превьюшки
            width: "600px", //ширина всплывающей превьюшки
            height: "68px", //высота всплывающей превьюшки
            clip: "rect(0, 120px, 68px, 0)" //положение текущего шага относительно превьюшки
          }
        },
        10: {
          style: {
            left: "-180px",
            clip: "rect(0, 240px, 68px, 120px)"
          }
        },
        20: {
          style: {
            left: "-300px",
            clip: "rect(0, 360px, 68px, 240px)"
          }
        },
        30: {
          style: {
            left: "-420px",
            clip: "rect(0, 480px, 68px, 360px)"
          }
        },
        40: {
          style: {
            left: "-540px",
            clip: "rect(0, 600px, 68px, 480px)"
          }
        }
      }
    };
  },
  methods: {
    playerReadied(player) {
      player.thumbnails(this.thumbnails);
    }
  } 
};
</script>
<style>
.desc {
  padding:10px;
  margin:10px;  
} 
.app {
    display: flex;
    flex-direction: column;
    align-items: center;
}


.desc {
  background: linear-gradient(crimson, gold, yellowgreen, teal, crimson);
  background-position: 0 0;
  border-radius: 30px;
  border: 10px solid white;
  animation: background 2s infinite alternate;
}

@keyframes background {
  100% {
    background-position: 0 200px;
  }
}

/* Helpers */
BODY {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #EEE;
  font-size: 16px;
}
</style>
