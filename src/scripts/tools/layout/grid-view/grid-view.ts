import './grid-view.scss';
const CLS_VISIBLE = 'is-visible';

let element:HTMLDivElement;
export const gridViewEnable = () => {
  console.log('Grid View On');
  if(!element) {
    element = document.createElement('div');
    element.classList.add('c-grid-view');
    
    const inner = document.createElement('div');
    inner.classList.add('c-grid-view__inner');
    element.appendChild(inner);
    
    for(let i = 0; i < 12; i++) {
      const col = document.createElement('div');
      col.classList.add('c-grid-view__column');
      element.appendChild(col);
    }
    document.body.appendChild(element);
  }

  element.classList.add(CLS_VISIBLE);
}

export const gridViewDisable = () => {
  if(!element) return;
  console.log('Grid View Off');
  element.classList.remove(CLS_VISIBLE);
}

export const isGridViewEnabled = () => element && element.classList.contains(CLS_VISIBLE);

export const gridViewTest = () => {
  let ctrlModifier = false;

  document.addEventListener('keydown', e => {
    switch(e.key) {
      case 'Control':
        ctrlModifier = true;
        break;
      case 'g':
        if(!ctrlModifier) return;
        isGridViewEnabled() ? gridViewDisable() : gridViewEnable();
        e.preventDefault();
        break;
    }
  })

  document.addEventListener('keyup', e => {
    switch(e.key) {
      case 'Control':
        ctrlModifier = false;
        break;
    }
  });
  
  window.onblur = () => ctrlModifier = false;
};

gridViewTest();