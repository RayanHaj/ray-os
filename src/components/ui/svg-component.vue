<template>
  <svg v-if="svgType === 'minimize'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 24 24">
    <g fill="none" fill-rule="evenodd">
      <path
          d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/>
      <path fill="currentColor" d="M2.5 12A1.5 1.5 0 0 1 4 10.5h16a1.5 1.5 0 0 1 0 3H4A1.5 1.5 0 0 1 2.5 12Z"/>
    </g>
  </svg>
  <svg v-if="svgType === 'maximize'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z"/>
  </svg>
  <svg v-if="svgType === 'close'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height" viewBox="0 0 20 20">
    <path fill="currentColor"
          d="m3.219 2.154l6.778 6.773l6.706-6.705c.457-.407.93-.164 1.119.04a.777.777 0 0 1-.044 1.035l-6.707 6.704l6.707 6.702c.298.25.298.74.059 1.014c-.24.273-.68.431-1.095.107l-6.745-6.749l-6.753 6.752c-.296.265-.784.211-1.025-.052c-.242-.264-.334-.72-.025-1.042l6.729-6.732l-6.701-6.704c-.245-.27-.33-.764 0-1.075c.33-.311.822-.268.997-.068Z"/>
  </svg>
  <svg v-if="svgType === 'arrowUp'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 24 24">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="m17 14l-5-5m0 0l-5 5"/>
  </svg>
  <svg v-if="svgType === 'wifi'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 640 512">
    <path fill="currentColor"
          d="M54.2 202.9C123.2 136.7 216.8 96 320 96s196.8 40.7 265.8 106.9c12.8 12.2 33 11.8 45.2-.9s11.8-33-.9-45.2C549.7 79.5 440.4 32 320 32S90.3 79.5 9.8 156.7C-2.9 169-3.3 189.2 8.9 202s32.5 13.2 45.2.9zM320 256c56.8 0 108.6 21.1 148.2 56c13.3 11.7 33.5 10.4 45.2-2.8s10.4-33.5-2.8-45.2C459.8 219.2 393 192 320 192s-139.8 27.2-190.5 72c-13.3 11.7-14.5 31.9-2.8 45.2s31.9 14.5 45.2 2.8c39.5-34.9 91.3-56 148.2-56zm64 160a64 64 0 1 0-128 0a64 64 0 1 0 128 0z"/>
  </svg>
  <svg v-if="svgType === 'volume'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 16 16">
    <g fill="currentColor">
      <path
          d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
      <path
          d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
      <path
          d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12V4zM4.312 6.39L6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11z"/>
    </g>
  </svg>
  <svg v-if="svgType === 'battery'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 2304 1280">
    <path fill="currentColor"
          d="M1920 256v768H256V256h1664zm128 576h128V448h-128V160q0-14-9-23t-23-9H160q-14 0-23 9t-9 23v960q0 14 9 23t23 9h1856q14 0 23-9t9-23V832zm256-384v384q0 53-37.5 90.5T2176 960v160q0 66-47 113t-113 47H160q-66 0-113-47T0 1120V160Q0 94 47 47T160 0h1856q66 0 113 47t47 113v160q53 0 90.5 37.5T2304 448z"/>
  </svg>
  <svg v-if="svgType === 'notification'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="-3 -2 24 24">
    <path fill="currentColor"
          d="M18 17H0a8.978 8.978 0 0 1 3-6.708V6a6 6 0 1 1 12 0v4.292A8.978 8.978 0 0 1 18 17zM6.17 18h5.66a3.001 3.001 0 0 1-5.66 0z"/>
  </svg>
  <svg v-if="svgType === 'settings'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 24 24">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <path
          d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </g>
  </svg>
  <svg v-if="svgType === 'file explorer'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 24 24">
    <path fill="#FFFFFF"
          d="M2 4.75C2 3.784 2.784 3 3.75 3h4.971c.58 0 1.12.286 1.447.765l1.404 2.063a.25.25 0 0 0 .207.11h6.224c.966 0 1.75.783 1.75 1.75v.117H5.408a.848.848 0 0 0 0 1.695h15.484a1 1 0 0 1 .995 1.102L21 19.25c-.106 1.05-.784 1.75-1.75 1.75H3.75A1.75 1.75 0 0 1 2 19.25z"/>
  </svg>
  <svg v-if="svgType === 'microsoft edge'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 20 20">
    <g fill="currentColor">
      <path fill-rule="evenodd"
            d="M1.25 10a8.75 8.75 0 1 0 17.5 0a8.75 8.75 0 0 0-17.5 0Zm16 0a7.25 7.25 0 1 1-14.5 0a7.25 7.25 0 0 1 14.5 0Z"
            clip-rule="evenodd"/>
      <path fill-rule="evenodd"
            d="M6.25 10c0 4.522 1.491 8.25 3.75 8.25s3.75-3.728 3.75-8.25S12.259 1.75 10 1.75S6.25 5.478 6.25 10Zm6 0c0 3.762-1.195 6.75-2.25 6.75S7.75 13.762 7.75 10S8.945 3.25 10 3.25s2.25 2.988 2.25 6.75Z"
            clip-rule="evenodd"/>
      <path
          d="m3.602 5.467l1.006-1.112c.1.09.209.18.325.267c1.271.952 3.3 1.54 5.515 1.54c1.891 0 3.652-.427 4.931-1.158c.308-.176.582-.367.819-.57l.974 1.141a6.73 6.73 0 0 1-1.048.73c-1.516.868-3.534 1.356-5.676 1.356c-2.522 0-4.865-.678-6.415-1.839a6.063 6.063 0 0 1-.431-.355Zm0 9.082l1.006 1.112c.1-.091.209-.18.325-.267c1.271-.952 3.3-1.54 5.515-1.54c1.891 0 3.652.427 4.931 1.158c.308.176.582.367.819.57l.974-1.141a6.841 6.841 0 0 0-1.048-.73c-1.516-.868-3.534-1.356-5.676-1.356c-2.522 0-4.865.678-6.415 1.839a6.06 6.06 0 0 0-.431.355ZM1.75 10.75v-1.5h16.5v1.5H1.75Z"/>
    </g>
  </svg>
  <svg v-if="svgType === 'serene sounds'" @click="$emit('clicked')" xmlns="http://www.w3.org/2000/svg" :width="width"
       :height="height"
       viewBox="0 0 24 24">
    <path fill="currentColor"
          d="m18 9l-.8.7q-.35.325-.825.325t-.825-.275q-.35-.275-.475-.7t.025-.9l.4-1.25l-.85-.5q-.4-.225-.562-.65t-.038-.85q.125-.425.5-.663T15.4 4h1l.3-.95q.15-.475.513-.763T18 2q.425 0 .788.288t.512.762l.3.95h1q.475 0 .838.238t.512.662q.175.45 0 .875t-.55.625l-.9.5l.4 1.25q.15.475.025.913t-.475.687q-.375.275-.837.275T18.8 9.7L18 9Zm0-2q.425 0 .713-.288T19 6q0-.425-.288-.713T18 5q-.425 0-.713.288T17 6q0 .425.288.713T18 7Zm-4.2 10.9q.575 1.5-.375 2.8T10.75 22q-.825 0-1.563-.425T8.1 20.45q-2.075.3-3.438-1.062T3.55 15.9q-.75-.425-1.15-1.163T2 13.05q0-1.525 1.388-2.463T6.1 10.2l1.55.65q.5-.775 1.325-1.262t1.775-.538v-1.3q0-.325.213-.537T11.5 7q.325 0 .537.213t.213.537v1.5q.925.275 1.525.863T14.8 11.75h1.45q.325 0 .537.213T17 12.5q0 .325-.213.537t-.537.213h-1.3q-.05.95-.513 1.775T13.2 16.35l.6 1.55Zm-8.05-3.5q.8 0 1.413-.2t1.587-.8l-3-1.25q-.725-.3-1.238.013T4 13.15q0 .65.425.95t1.325.3Zm5 5.6q.625 0 1.012-.438t.188-.912l-1.35-3.4q-.475.8-.737 1.6T9.6 18.3q0 .825.288 1.263t.862.437Zm1.65-5.55q.25-.25.4-.663t.15-.862q0-.8-.525-1.35t-1.3-.55q-.45 0-.85.15T9.6 11.6l1.95.9l.85 1.95Z"/>
  </svg>
</template>

<script>
export default {
  name: "svg-component",
  props: {
    svgType: {
      type: String,
      required: true
    },
    customHeight: {
      type: Number,
      required: false
    },
    customWidth: {
      type: Number,
      required: false
    },
    customColor: {
      type: String,
      required: false
    }
  },
  emits: ['clicked'],
  beforeMount() {
    if (this.customHeight) {
      this.height = this.customHeight;
    }
    if (this.customWidth) {
      this.width = this.customWidth;
    }
    if (this.customColor) {
      this.color = this.customColor;
    }
  },
  data() {
    return {
      height: 15,
      width: 15,
      color: 'ffffff'
    }
  }
}
</script>

<style scoped>
</style>