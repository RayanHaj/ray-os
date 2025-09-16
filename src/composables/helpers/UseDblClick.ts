let clickCount = 0;
let clickTimer: number | undefined = undefined;

// WHY DO I USE THIS INSTEAD OF THE BUILD IN EVENT LISTENER?
// The build in event listener does not allow spamming dblclick in Chromium browsers and
// this helper function makes it consistent on all browsers
export const useDblClick = (callback: () => void) => {
  clickCount++;

  if (clickCount === 1) {
    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 400);
  } else if (clickCount === 2) {
    clearTimeout(clickTimer);
    clickCount = 0;
    callback();
  }
};
