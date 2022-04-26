declare type SvelteComponent = import('svelte').SvelteComponent;
declare type Writable = import('svelte/store').Writable;

declare namespace NavStack {
  export type StackElement = {
    component: any;
    props?: { [x: string]: any };
    overlay?: boolean = false;
  };

  export type ElementRef = SvelteComponent & {
    preventBack?: () => boolean;
    getPayload?: () => any;
  };
}
