/**
 *  Home Collection options
 *    Shows different images on hover of collection links.
 *    Collections can be in groups created from the theme customiser.
 * 
 */
export {};
const SELECTOR_CONTAINER = '[data-home-collection-options]';
const SELECTOR_GROUP = '[data-collection-group]';
const SELECTOR_GROUP_BUTTON = '[data-group-button]';
const SELECTOR_COLLECTION_BUTTON = '[data-collection-button]';
const SELECTOR_COLLECTION_IMAGE = '[data-collection-image]';

const ATTR_GROUP_HANDLE = 'data-group-handle';
const ATTR_COLLECTION_ID = 'data-collection-id';

const CLASS_ACTIVE = 'is-active';
const CLASS_COLLECTION_ACTIVE = 'is-collection-active';

document.querySelectorAll<HTMLElement>(SELECTOR_CONTAINER).forEach(containerElement => {
  const collectionGroups = containerElement.querySelectorAll<HTMLDivElement>(SELECTOR_GROUP);
  const groupButtons = containerElement.querySelectorAll<HTMLButtonElement>(SELECTOR_GROUP_BUTTON);
  const collectionButtons = containerElement.querySelectorAll<HTMLButtonElement>(SELECTOR_COLLECTION_BUTTON);
  const collectionImages = containerElement.querySelectorAll<HTMLDivElement>(SELECTOR_COLLECTION_IMAGE);

  // Updating the active group on click of a group button
  groupButtons.forEach(button => {
    button.addEventListener('click', () => {
      const handle = button.dataset.groupHandle;
      if(!handle) return;
      const newGroup = containerElement.querySelector<HTMLElement>(
        `${SELECTOR_GROUP}[${ATTR_GROUP_HANDLE}="${handle}"]`
      );
      if(!newGroup) return;

      //Update Classes
      groupButtons.forEach(group => group.classList.remove(CLASS_ACTIVE));
      collectionGroups.forEach(group => group.classList.remove(CLASS_ACTIVE));
      newGroup.classList.add(CLASS_ACTIVE);
      button.classList.add(CLASS_ACTIVE);

      //Find first video in the new group and set video from this.
      const firstButton = newGroup.querySelectorAll<HTMLButtonElement>(SELECTOR_COLLECTION_BUTTON)[0];
      if(!firstButton) return;

      setImage(firstButton);
    });
  });


  //Hover listner for the new button
  collectionButtons.forEach(button => button.addEventListener('mouseover', () => setImage(button)));

  //Sets the active image on hover
  const setImage = (button?:HTMLElement) => {
    if(!button) return;

    const collectionId = button.dataset.collectionId;
    if(!collectionId) return;

    const collectionImage = containerElement.querySelector<HTMLDivElement>(
      `${SELECTOR_COLLECTION_IMAGE}[${ATTR_COLLECTION_ID}="${collectionId}"]`
    );
    if(!collectionImage) return;

    //Update image states
    collectionImages.forEach(image => image.classList.remove(CLASS_COLLECTION_ACTIVE));
    collectionImage.classList.add(CLASS_COLLECTION_ACTIVE);

    //Update button states
    collectionButtons.forEach(button => button.classList.remove(CLASS_COLLECTION_ACTIVE));
    button.classList.add(CLASS_COLLECTION_ACTIVE);
  };
});