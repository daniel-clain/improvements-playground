/**
 *  Home Collection Videos
 *    Shows different videos on click of collection buttons.
 *    Collections can be in groups created from the theme customiser.
 * 
 */
export {};
const SELECTOR_CONTAINER = '[data-home-collection-videos]';
const SELECTOR_VIDEO_CONTAINER = '[data-video-container]';
const SELECTOR_GROUP = '[data-collection-group]';
const SELECTOR_GROUP_BUTTON = '[data-group-button]';
const SELECTOR_COLLECTION_BUTTON = '[data-collection-button]';

const ATTR_VIDEO_SOURCE = 'data-video-source';
const ATTR_GROUP_HANDLE = 'data-group-handle';

const CLASS_ACTIVE = 'is-active';
const CLASS_COLLECTION_ACTIVE = 'is-collection-active';

document.querySelectorAll<HTMLElement>(SELECTOR_CONTAINER).forEach(containerElement => {
  const videoContainer = containerElement.querySelector<HTMLDivElement>(SELECTOR_VIDEO_CONTAINER);
  if(!videoContainer) return;
  const videoGroups = containerElement.querySelectorAll<HTMLDivElement>(SELECTOR_GROUP);
  const groupButtons = containerElement.querySelectorAll<HTMLButtonElement>(SELECTOR_GROUP_BUTTON);
  const videoButtons = containerElement.querySelectorAll<HTMLButtonElement>(SELECTOR_COLLECTION_BUTTON);

  // Updating the active group on click of a group button
  groupButtons.forEach(button => {
    button.addEventListener('click', () => {
      const handle = button.dataset.groupHandle;
      if(!handle) return;
      const newGroup = containerElement.querySelector<HTMLElement>(`${SELECTOR_GROUP}[${ATTR_GROUP_HANDLE}="${handle}"]`);
      if(!newGroup) return;

      //Update Classes
      groupButtons.forEach(group => group.classList.remove(CLASS_ACTIVE));
      videoGroups.forEach(group => group.classList.remove(CLASS_ACTIVE));
      newGroup.classList.add(CLASS_ACTIVE);
      button.classList.add(CLASS_ACTIVE);

      //Find first video in the new group and set video from this.
      const firstButton = newGroup.querySelectorAll<HTMLButtonElement>(SELECTOR_COLLECTION_BUTTON)[0];
      if(!firstButton) return;

      setVideo(firstButton);
    });
  });

  //Click listner for the new button
  videoButtons.forEach(button => button.addEventListener('click', () => setVideo(button)));

  //Function to set the video element from the new source on click
  const setVideo = (button?:HTMLElement) => {
    if(!button) return;

    const videoSource = button.dataset.videoSource;
    if(!videoSource) return;

    //Update video container content
    videoContainer.innerHTML = /*html*/`
      <div class="o-html5-video c-collection-videos__video">
        <video class="o-html5-video__video" autoplay muted loop playsinline>
          <source src="${videoSource}" type="video/mp4">
          <p>
            Your browser doesn't support HTML5 video.
            Here is a link to the video instead:https://cdn.shopify.com/s/files/1/0559/2855/3670/files/example-mp4-1.mp4?v=1618286830.
          </p>
        </video>
      </div>
    `;

    //Update button states
    videoButtons.forEach(button => button.classList.remove(CLASS_COLLECTION_ACTIVE));
    button.classList.add(CLASS_COLLECTION_ACTIVE);
  };
});