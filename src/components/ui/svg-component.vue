<template>
  <svg v-if="svgType === 'minimize'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path v-if="customColor" :fill="customColor" d="M3 11h18v2H3z"/>
    <path v-else class="default-path-fill" d="M3 11h18v2H3z"/>
  </svg>
  <svg v-if="svgType === 'maximize'" @click="$emit('clicked')" @mouseenter="$emit('onMouseenter')"
       @mouseleave="$emit('onMouseleave')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path v-if="customColor" :fill="customColor"
          d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z"/>
    <path v-else class="default-path-fill"
          d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z"/>
  </svg>
  <svg v-if="svgType === 'close'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <path v-if="customColor" :fill="customColor"
          d="m3.219 2.154l6.778 6.773l6.706-6.705c.457-.407.93-.164 1.119.04a.777.777 0 0 1-.044 1.035l-6.707 6.704l6.707 6.702c.298.25.298.74.059 1.014c-.24.273-.68.431-1.095.107l-6.745-6.749l-6.753 6.752c-.296.265-.784.211-1.025-.052c-.242-.264-.334-.72-.025-1.042l6.729-6.732l-6.701-6.704c-.245-.27-.33-.764 0-1.075c.33-.311.822-.268.997-.068Z"/>
    <path v-else class="default-path-fill"
          d="m3.219 2.154l6.778 6.773l6.706-6.705c.457-.407.93-.164 1.119.04a.777.777 0 0 1-.044 1.035l-6.707 6.704l6.707 6.702c.298.25.298.74.059 1.014c-.24.273-.68.431-1.095.107l-6.745-6.749l-6.753 6.752c-.296.265-.784.211-1.025-.052c-.242-.264-.334-.72-.025-1.042l6.729-6.732l-6.701-6.704c-.245-.27-.33-.764 0-1.075c.33-.311.822-.268.997-.068Z"/>
  </svg>
  <svg v-if="svgType === 'arrowUp'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g id="evaArrowUpFill0">
      <g id="evaArrowUpFill1">
        <path v-if="customColor" :fill="customColor"
              d="M16.21 16H7.79a1.76 1.76 0 0 1-1.59-1a2.1 2.1 0 0 1 .26-2.21l4.21-5.1a1.76 1.76 0 0 1 2.66 0l4.21 5.1A2.1 2.1 0 0 1 17.8 15a1.76 1.76 0 0 1-1.59 1Z"/>
        <path v-else class="default-path-fill"
              d="M16.21 16H7.79a1.76 1.76 0 0 1-1.59-1a2.1 2.1 0 0 1 .26-2.21l4.21-5.1a1.76 1.76 0 0 1 2.66 0l4.21 5.1A2.1 2.1 0 0 1 17.8 15a1.76 1.76 0 0 1-1.59 1Z"/>
      </g>
    </g>
  </svg>
  <svg v-if="svgType === 'wifi'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
    <path v-if="customColor" :fill="customColor"
          d="M54.2 202.9C123.2 136.7 216.8 96 320 96s196.8 40.7 265.8 106.9c12.8 12.2 33 11.8 45.2-.9s11.8-33-.9-45.2C549.7 79.5 440.4 32 320 32S90.3 79.5 9.8 156.7C-2.9 169-3.3 189.2 8.9 202s32.5 13.2 45.2.9zM320 256c56.8 0 108.6 21.1 148.2 56c13.3 11.7 33.5 10.4 45.2-2.8s10.4-33.5-2.8-45.2C459.8 219.2 393 192 320 192s-139.8 27.2-190.5 72c-13.3 11.7-14.5 31.9-2.8 45.2s31.9 14.5 45.2 2.8c39.5-34.9 91.3-56 148.2-56zm64 160a64 64 0 1 0-128 0a64 64 0 1 0 128 0z"/>
    <path v-else class="default-path-fill"
          d="M54.2 202.9C123.2 136.7 216.8 96 320 96s196.8 40.7 265.8 106.9c12.8 12.2 33 11.8 45.2-.9s11.8-33-.9-45.2C549.7 79.5 440.4 32 320 32S90.3 79.5 9.8 156.7C-2.9 169-3.3 189.2 8.9 202s32.5 13.2 45.2.9zM320 256c56.8 0 108.6 21.1 148.2 56c13.3 11.7 33.5 10.4 45.2-2.8s10.4-33.5-2.8-45.2C459.8 219.2 393 192 320 192s-139.8 27.2-190.5 72c-13.3 11.7-14.5 31.9-2.8 45.2s31.9 14.5 45.2 2.8c39.5-34.9 91.3-56 148.2-56zm64 160a64 64 0 1 0-128 0a64 64 0 1 0 128 0z"/>
  </svg>
  <svg v-if="svgType === 'volume'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <g>
      <path v-if="customColor" :fill="customColor"
            d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
      <path v-else class="default-path-fill"
            d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>

      <path v-if="customColor" :fill="customColor"
            d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
      <path v-else class="default-path-fill"
            d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>

      <path v-if="customColor" :fill="customColor"
            d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12V4zM4.312 6.39L6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11z"/>
      <path v-else class="default-path-fill"
            d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12V4zM4.312 6.39L6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11z"/>
    </g>
  </svg>
  <svg v-if="svgType === 'battery'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2304 1280">
    <path v-if="customColor" :fill="customColor"
          d="M1920 256v768H256V256h1664zm128 576h128V448h-128V160q0-14-9-23t-23-9H160q-14 0-23 9t-9 23v960q0 14 9 23t23 9h1856q14 0 23-9t9-23V832zm256-384v384q0 53-37.5 90.5T2176 960v160q0 66-47 113t-113 47H160q-66 0-113-47T0 1120V160Q0 94 47 47T160 0h1856q66 0 113 47t47 113v160q53 0 90.5 37.5T2304 448z"/>
    <path v-else class="default-path-fill"
          d="M1920 256v768H256V256h1664zm128 576h128V448h-128V160q0-14-9-23t-23-9H160q-14 0-23 9t-9 23v960q0 14 9 23t23 9h1856q14 0 23-9t9-23V832zm256-384v384q0 53-37.5 90.5T2176 960v160q0 66-47 113t-113 47H160q-66 0-113-47T0 1120V160Q0 94 47 47T160 0h1856q66 0 113 47t47 113v160q53 0 90.5 37.5T2304 448z"/>
  </svg>

  <svg v-if="svgType === 'notification'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="-3 -2 24 24">
    <path v-if="customColor" :fill="customColor"
          d="M18 17H0a8.978 8.978 0 0 1 3-6.708V6a6 6 0 1 1 12 0v4.292A8.978 8.978 0 0 1 18 17zM6.17 18h5.66a3.001 3.001 0 0 1-5.66 0z"/>
    <path v-else class="default-path-fill"
          d="M18 17H0a8.978 8.978 0 0 1 3-6.708V6a6 6 0 1 1 12 0v4.292A8.978 8.978 0 0 1 18 17zM6.17 18h5.66a3.001 3.001 0 0 1-5.66 0z"/>
  </svg>

  <svg v-if="svgType === 'copy'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path v-if="customColor" :fill="customColor"
          d="M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Z"/>
    <path v-else class="default-path-fill"
          d="M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Z"/>
  </svg>

  <svg v-if="svgType === 'paste'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path v-if="customColor" :fill="customColor"
          d="M5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h4.175q.275-.875 1.075-1.438T12 1q1 0 1.788.563T14.85 3H19q.825 0 1.413.588T21 5v14q0 .825-.588 1.413T19 21H5Zm0-2h14V5h-2v2q0 .425-.288.713T16 8H8q-.425 0-.713-.288T7 7V5H5v14Zm7-14q.425 0 .713-.288T13 4q0-.425-.288-.713T12 3q-.425 0-.713.288T11 4q0 .425.288.713T12 5Z"/>
    <path v-else class="default-path-fill"
          d="M5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h4.175q.275-.875 1.075-1.438T12 1q1 0 1.788.563T14.85 3H19q.825 0 1.413.588T21 5v14q0 .825-.588 1.413T19 21H5Zm0-2h14V5h-2v2q0 .425-.288.713T16 8H8q-.425 0-.713-.288T7 7V5H5v14Zm7-14q.425 0 .713-.288T13 4q0-.425-.288-.713T12 3q-.425 0-.713.288T11 4q0 .425.288.713T12 5Z"/>
  </svg>
  <svg v-if="svgType === 'delete'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path v-if="customColor" :fill="customColor"
          d="M7 21q-.825 0-1.413-.588T5 19V6q-.425 0-.713-.288T4 5q0-.425.288-.713T5 4h4q0-.425.288-.713T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5q0 .425-.288.713T19 6v13q0 .825-.588 1.413T17 21H7Zm2-4h2V8H9v9Zm4 0h2V8h-2v9Z"/>
    <path v-else class="default-path-fill"
          d="M7 21q-.825 0-1.413-.588T5 19V6q-.425 0-.713-.288T4 5q0-.425.288-.713T5 4h4q0-.425.288-.713T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5q0 .425-.288.713T19 6v13q0 .825-.588 1.413T17 21H7Zm2-4h2V8H9v9Zm4 0h2V8h-2v9Z"/>
  </svg>
  <svg v-if="svgType === 'moveWindowToTopCorner'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path v-if="customColor" :fill="customColor"
          d="M8 2h5a1 1 0 0 1 1 1v5H9a1 1 0 0 1-1-1zM3 1h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
    <path v-else class="default-path-fill"
          d="M8 2h5a1 1 0 0 1 1 1v5H9a1 1 0 0 1-1-1zM3 1h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/>
  </svg>
  <svg v-if="svgType === 'backspace'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path v-if="customColor" fill="none" :stroke="customColor" stroke-linecap="round" stroke-linejoin="round"
          d="M8.328 15.5H15.5a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H8.328a2 2 0 0 0-1.414.586L3.207 9.793a1 1 0 0 0 0 1.414l3.707 3.707a2 2 0 0 0 1.414.586zm1.172-3l4-4m-4 0l4 4"/>
    <path v-else class="default-path-stroke" fill="none" stroke-linecap="round" stroke-linejoin="round"
          d="M8.328 15.5H15.5a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H8.328a2 2 0 0 0-1.414.586L3.207 9.793a1 1 0 0 0 0 1.414l3.707 3.707a2 2 0 0 0 1.414.586zm1.172-3l4-4m-4 0l4 4"/>
  </svg>
  <svg v-if="svgType === 'search'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1664 1664">
    <path v-if="customColor" :fill="customColor"
          d="M1152 704q0-185-131.5-316.5T704 256T387.5 387.5T256 704t131.5 316.5T704 1152t316.5-131.5T1152 704zm512 832q0 52-38 90t-90 38q-54 0-90-38l-343-342q-179 124-399 124q-143 0-273.5-55.5t-225-150t-150-225T0 704t55.5-273.5t150-225t225-150T704 0t273.5 55.5t225 150t150 225T1408 704q0 220-124 399l343 343q37 37 37 90z"/>
    <path v-else class="default-path-fill"
          d="M1152 704q0-185-131.5-316.5T704 256T387.5 387.5T256 704t131.5 316.5T704 1152t316.5-131.5T1152 704zm512 832q0 52-38 90t-90 38q-54 0-90-38l-343-342q-179 124-399 124q-143 0-273.5-55.5t-225-150t-150-225T0 704t55.5-273.5t150-225t225-150T704 0t273.5 55.5t225 150t150 225T1408 704q0 220-124 399l343 343q37 37 37 90z"/>
  </svg>
  <svg v-if="svgType === 'background color'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path v-if="customColor" :fill="customColor"
          d="M13 11c1.334 1.393 2 2.435 2 3.125C15 15.161 14.105 16 13 16c-1.104 0-2-.84-2-1.875c0-.69.667-1.732 2-3.125M5.857.15l6.34 6.45l.016.02l.324.321a1.5 1.5 0 0 1 .11 2.006l-.103.114l-4.474 4.513a1.5 1.5 0 0 1-2.123.008L1.464 9.06a1.5 1.5 0 0 1 .007-2.12l4.472-4.45c.145-.146.313-.254.492-.327L5.144.85a.5.5 0 0 1 .713-.7m1.496 3.049a.5.5 0 0 0-.705 0L2.177 7.65a.498.498 0 0 0-.148.35h9.95a.498.498 0 0 0-.148-.35L7.353 3.2z"/>
    <path v-else class="default-path-fill"
          d="M13 11c1.334 1.393 2 2.435 2 3.125C15 15.161 14.105 16 13 16c-1.104 0-2-.84-2-1.875c0-.69.667-1.732 2-3.125M5.857.15l6.34 6.45l.016.02l.324.321a1.5 1.5 0 0 1 .11 2.006l-.103.114l-4.474 4.513a1.5 1.5 0 0 1-2.123.008L1.464 9.06a1.5 1.5 0 0 1 .007-2.12l4.472-4.45c.145-.146.313-.254.492-.327L5.144.85a.5.5 0 0 1 .713-.7m1.496 3.049a.5.5 0 0 0-.705 0L2.177 7.65a.498.498 0 0 0-.148.35h9.95a.498.498 0 0 0-.148-.35L7.353 3.2z"/>
  </svg>
  <svg v-if="svgType === 'wallpaper'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path v-if="customColor" :fill="customColor"
          d="M17 8q-.425 0-.713-.288T16 7q0-.425.288-.713T17 6q.425 0 .713.288T18 7q0 .425-.288.713T17 8Zm-8 6l2.7-3.5l1.55 2l2.3-3L19 14H9Zm-7 8V6h2v14h14v2H2ZM6 9.375V2h7v2H8v5.375H6ZM6 18v-6.625h2V16h5v2H6Zm9 0v-2h5v-4.625h2V18h-7Zm5-8.625V4h-5V2h7v7.375h-2Z"/>
    <path v-else class="default-path-fill"
          d="M17 8q-.425 0-.713-.288T16 7q0-.425.288-.713T17 6q.425 0 .713.288T18 7q0 .425-.288.713T17 8Zm-8 6l2.7-3.5l1.55 2l2.3-3L19 14H9Zm-7 8V6h2v14h14v2H2ZM6 9.375V2h7v2H8v5.375H6ZM6 18v-6.625h2V16h5v2H6Zm9 0v-2h5v-4.625h2V18h-7Zm5-8.625V4h-5V2h7v7.375h-2Z"/>
  </svg>
  <svg v-if="svgType === 'theme'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path v-if="customColor" :fill="customColor"
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10Zm0-2V4a8 8 0 1 1 0 16Z"/>
    <path v-else class="default-path-fill"
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10Zm0-2V4a8 8 0 1 1 0 16Z"/>
  </svg>
  <svg v-if="svgType === 'home'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path v-if="customColor" :fill="customColor"
          d="M11.336 2.253a1 1 0 0 1 1.328 0l9 8a1 1 0 0 1-1.328 1.494L20 11.45V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7.55l-.336.297a1 1 0 0 1-1.328-1.494l9-8zM6 9.67V19h3v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5h3V9.671l-6-5.333l-6 5.333zM13 19v-4h-2v4h2z"/>
    <path v-else class="default-path-fill"
          d="M11.336 2.253a1 1 0 0 1 1.328 0l9 8a1 1 0 0 1-1.328 1.494L20 11.45V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7.55l-.336.297a1 1 0 0 1-1.328-1.494l9-8zM6 9.67V19h3v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5h3V9.671l-6-5.333l-6 5.333zM13 19v-4h-2v4h2z"/>
  </svg>
  <svg v-if="svgType === 'play'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <path v-if="customColor" :fill="customColor"
          d="M15.544 9.59a1 1 0 0 1-.053 1.728L6.476 16.2A1 1 0 0 1 5 15.321V4.804a1 1 0 0 1 1.53-.848l9.014 5.634Z"/>
    <path v-else class="default-path-fill"
          d="M15.544 9.59a1 1 0 0 1-.053 1.728L6.476 16.2A1 1 0 0 1 5 15.321V4.804a1 1 0 0 1 1.53-.848l9.014 5.634Z"/>
  </svg>
  <svg v-if="svgType === 'pause'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 24">
    <path v-if="customColor" :fill="customColor"
          d="M4.801 23.999h-3.6a1.202 1.202 0 0 1-1.2-1.2v-21.6c0-.663.537-1.2 1.2-1.201h3.6a1.202 1.202 0 0 1 1.2 1.2v21.6c0 .663-.537 1.2-1.2 1.201zm11.999 0h-3.6a1.2 1.2 0 0 1-1.2-1.2V1.198a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2v21.6a1.2 1.2 0 0 1-1.2 1.2z"/>
    <path v-else class="default-path-fill"
          d="M4.801 23.999h-3.6a1.202 1.202 0 0 1-1.2-1.2v-21.6c0-.663.537-1.2 1.2-1.201h3.6a1.202 1.202 0 0 1 1.2 1.2v21.6c0 .663-.537 1.2-1.2 1.201zm11.999 0h-3.6a1.2 1.2 0 0 1-1.2-1.2V1.198a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2v21.6a1.2 1.2 0 0 1-1.2 1.2z"/>
  </svg>
  <svg v-if="svgType === 'in picture'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path v-if="customColor" :fill="customColor"
          d="M5.25 3A3.25 3.25 0 0 0 2 6.25v9.5A3.25 3.25 0 0 0 5.25 19H11v-4a3 3 0 0 1 3-3h7c.35 0 .687.06 1 .17V6.25A3.25 3.25 0 0 0 18.75 3H5.25ZM22 13.268A1.99 1.99 0 0 0 21 13h-7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-5a2 2 0 0 0-1-1.732Z"/>
    <path v-else class="default-path-fill"
          d="M5.25 3A3.25 3.25 0 0 0 2 6.25v9.5A3.25 3.25 0 0 0 5.25 19H11v-4a3 3 0 0 1 3-3h7c.35 0 .687.06 1 .17V6.25A3.25 3.25 0 0 0 18.75 3H5.25ZM22 13.268A1.99 1.99 0 0 0 21 13h-7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-5a2 2 0 0 0-1-1.732Z"/>
  </svg>
  <svg v-if="svgType === 'fullscreen'" @click="$emit('clicked')" :width="width" :height="height"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <path v-if="customColor" :fill="customColor"
          d="M3 5.25A2.25 2.25 0 0 1 5.25 3h1.865a.75.75 0 1 1 0 1.5H5.25a.75.75 0 0 0-.75.75v1.865a.75.75 0 1 1-1.5 0V5.25Zm9.135-1.5a.75.75 0 0 1 .75-.75h1.865A2.25 2.25 0 0 1 17 5.25v1.865a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 0-.75-.75h-1.865a.75.75 0 0 1-.75-.75ZM3.75 12.135a.75.75 0 0 1 .75.75v1.865c0 .414.336.75.75.75h1.865a.75.75 0 0 1 0 1.5H5.25A2.25 2.25 0 0 1 3 14.75v-1.865a.75.75 0 0 1 .75-.75Zm12.5 0a.75.75 0 0 1 .75.75v1.865A2.25 2.25 0 0 1 14.75 17h-1.865a.75.75 0 0 1 0-1.5h1.865a.75.75 0 0 0 .75-.75v-1.865a.75.75 0 0 1 .75-.75Z"/>
    <path v-else class="default-path-fill"
          d="M3 5.25A2.25 2.25 0 0 1 5.25 3h1.865a.75.75 0 1 1 0 1.5H5.25a.75.75 0 0 0-.75.75v1.865a.75.75 0 1 1-1.5 0V5.25Zm9.135-1.5a.75.75 0 0 1 .75-.75h1.865A2.25 2.25 0 0 1 17 5.25v1.865a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 0-.75-.75h-1.865a.75.75 0 0 1-.75-.75ZM3.75 12.135a.75.75 0 0 1 .75.75v1.865c0 .414.336.75.75.75h1.865a.75.75 0 0 1 0 1.5H5.25A2.25 2.25 0 0 1 3 14.75v-1.865a.75.75 0 0 1 .75-.75Zm12.5 0a.75.75 0 0 1 .75.75v1.865A2.25 2.25 0 0 1 14.75 17h-1.865a.75.75 0 0 1 0-1.5h1.865a.75.75 0 0 0 .75-.75v-1.865a.75.75 0 0 1 .75-.75Z"/>
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
      required: false,
    }
  },
  emits: ['clicked', 'onMouseenter', 'onMouseleave'],
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
.default-path-fill {
  fill: var(--font-color);
}

.default-path-stroke {
  stroke: var(--font-color);
}
</style>