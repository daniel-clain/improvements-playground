type EvtLst<K extends keyof HTMLElementEventMap> = {
  element:HTMLElement;
  method:K;
  callback:(e:HTMLElementEventMap[K])=>any;
};

type EventManager = ReturnType<typeof eventManagerCreate>;

export const eventManagerCreate = () => {
  const events:EvtLst<any>[] = [];
  return {
    events
  };
}

export const eventAdd = <K extends keyof HTMLElementEventMap>(manager:EventManager, e:EvtLst<K>) => {
  manager.events.push(e);
  e.element.addEventListener(e.method, e.callback);
};

export const eventRemove = <K extends keyof HTMLElementEventMap>(manager:EventManager, e:EvtLst<K>) => {
  e.element.removeEventListener(e.method, e.callback);
  const i = manager.events.indexOf(e);
  if(i !== -1) manager.events.splice(i, 1);
};

export const eventManagerDispose = (manager:EventManager) => {
  while(manager.events.length) {
    eventRemove(manager, manager.events[0]);
  }
}