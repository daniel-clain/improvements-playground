import { documentDisableScroll, documentEnableScroll } from "../tools/layout/document";
type ModalContentName = 'backInStock' | 'sizeChart' | 'regionSelector' | 'shippingInfo';
type ModalObj = {name: ModalContentName, modalElem: HTMLElement, visible: boolean};

const SELECTOR_CLOSE = '[data-modal-close]';
const CLASS_VISIBLE = 'is-visible';
const VAL_ZINDEX = 50;


const modalsArray: ModalObj[] = [];
const modalContainer = document.querySelector('[data-modal-container]');
type OpenModalProps = {
  modalContentName : ModalContentName,
  maxWidth?: number
}

const openModalCallbacks: {modalContentName: ModalContentName, callback: () => void}[] = []

export const onModalOpen = (modalContentName: ModalContentName, callback: () => void) => openModalCallbacks.push({modalContentName, callback})

export const openModal = ({modalContentName, maxWidth}: OpenModalProps) => {
  if(modalIsAlreadyOpen()) return;
  if(modalAlreadyExists()) showExistingModal();
  else createAndShowModal();


  // implementation

  function createAndShowModal(){

    const modalContent = document.querySelector<HTMLElement>(`[data-modal-content=${modalContentName}]`)!;
    if(!modalContent) return;
    const modal = createModalInstance();
    modalsArray.push({
      name: modalContentName, 
      modalElem: modal,
      visible: false
    });
    modalContainer?.appendChild(modal);
    setTimeout(showExistingModal, 50);
  
    
    // implementation

    function createModalInstance(){
      const modal = document.createElement('div');
      modal.classList.add('c-modal');
      modal.setAttribute('data-modal', modalContentName);

      modalContent.classList.add('c-modal__content');
      if(maxWidth){
        modalContent.style.maxWidth = `${maxWidth}px`
      }
      modal.appendChild(modalContent);

      //Create overlay & append after the content
      const overlay = document.createElement('div');
      overlay.classList.add('c-modal__overlay');
      overlay.setAttribute('data-modal-overlay', '');
      modal.appendChild(overlay);

      //Close elements and events
      const modalClose = modalContent.querySelectorAll(SELECTOR_CLOSE);
      modalClose.forEach(close => close.addEventListener('click', () => closeModal(modalContentName)));

      const modalOverlay = modal.querySelector('[data-modal-overlay]')!;
      modalOverlay.addEventListener('click', () => closeModal(modalContentName));

      return modal;
    }
  }

  function modalAlreadyExists(){
    return modalsArray.some(m => m.name == modalContentName);
  }

  function showExistingModal(){
    const modal = getModal(modalContentName);
    fireOpenModalCallbacks()
    modal.visible = true;
    modal.modalElem.classList.add(CLASS_VISIBLE);
    modal.modalElem.style.zIndex = VAL_ZINDEX + modalsArray.filter(m => m.visible).length.toString();
    documentDisableScroll()
  }

  function fireOpenModalCallbacks(){
    openModalCallbacks.forEach(callback => {
      if(callback.modalContentName == modalContentName){
        callback.callback()
      }
    })
  }


  function modalIsAlreadyOpen(){
    return modalsArray.some(m => m.name == modalContentName && m.visible);
  }
}

export const closeModal = (modalContentName: ModalContentName) => {
  const modal: ModalObj = getModal(modalContentName);
  modal.visible = false;
  modal.modalElem.classList.remove(CLASS_VISIBLE);

  if(modalsArray.every(m => !m.visible)){
    documentEnableScroll()
  }
}


// utility

const getModal = (modalContentName: string): ModalObj => {
  return modalsArray.find(m => m.name == modalContentName)!;
}



