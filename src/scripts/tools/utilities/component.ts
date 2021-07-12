import haunted, { component as hauntedComponent } from 'haunted';
import { t } from '@process-creative/slate-theme-tools';
import { TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
//@ts-ignore
import $ from 'jquery';

export * from 'lit-html';
export * from 'lit-html/directives/unsafe-html';
export * from 'haunted';

//A fully rendered component
export type RenderedComponent = (
  TemplateResult | Element | null | HTMLElement | string | ((p?:any)=>void) |
  number
) | RenderedComponent[];

//Properties for Components
type ComponentProps<P> = { [K in keyof P]?:string|null };

//Component itself
export type Component<P> = Element & ComponentProps<P>;
export type Render<P> = (element:Component<P>) => RenderedComponent;
export type CreateComponentParams<N extends string,P> = {
  name:N;
  class?:string|string[];
  render:Render<P>;
  attributes?:(keyof P)[]
}

//Short hand methods
export const unsafeTranslate = (key:string, variables?:{[key:string]:string})=> {
  return unsafeHTML(t(key, variables))
};

//Event Listener using jQuery events (Deprecated)
/**
 * @deprecated 
 */
export const componentAddEventListener = (s:string, cb:(...p:any[])=>any) => {
  let callback:(...p:any[])=>any;
  callback = (...p) => {
    $(document).off(s, callback);
    cb(...p);
  }
  return $(document).on(s, callback);
}

/**
 * Component Wrapper, used to help manage components easier as the spec is still
 * being fleshed out
 */
type ManagedComponent<N extends string,P> = CreateComponentParams<N,P> & {
  create:(props?:ComponentProps<P>)=>Component<P>
};
export const component = <N extends string,P>(
  params:CreateComponentParams<N,P>, hauntedParams?:any
):ManagedComponent<N,P> => {
  type PKeys = keyof P;

  //In order to stop a double definition of components, we're going to manage
  //created components here. It seems that lit can't do this for us.
  //@ts-ignore
  let ec = (window.pcComponents=window.pcComponents||{});
  //@ts-ignore
  window.pcComponents = ec;
  let existingComponents = ec as {[key:string]:ManagedComponent<N,P>};
  if(existingComponents[params.name]) {
    return existingComponents[params.name];
  }

  //Component doesn't exist, let's create it
  const compHaunted = hauntedComponent(params.render as any, {
    useShadowDOM: false,
    observedAttributes: (params.attributes||[] as any),
    ...(hauntedParams||{})
  });

  //@ts-ignore
  customElements.define(params.name, compHaunted);

  const comp:ManagedComponent<N,P> = {
    ...params,
    create: (props?:ComponentProps<P>) => {
      const element = new compHaunted(props);

      if(props) {
        (Object.keys(props) as PKeys[]).forEach(k => {
          const v = props[k];
          if(!v) return;
          element.setAttribute(k as string, v as string);
        });
      }

      //Custom inner HTML
      let innerHTML:string = '';
      Object.defineProperty(element, 'innerHTML', {
        get() { return innerHTML; },
        set(value:string) { innerHTML = value; }
      });

      const clz = params.class;
      if(clz) (Array.isArray(clz) ? clz : [ clz ]).forEach(c => (
        element.classList.add(c)
      ));

      return element as Component<P>;
    }
  }

  //Store the component so it's not created twice in future.
  existingComponents[params.name] = comp;
  return comp;
}