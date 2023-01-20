import type { Request, Route } from '@playwright/test';
import type { Page } from '@playwright/test';
import { API_ROUTES_MAPPING } from './handler';
import { OptionObject } from '../../app/modules/razorpay/types/Options';
import { createRouter } from './router';
import makeUtil from './base';

type ReturnTypeOfPromise<T> = T extends Promise<infer I> ? I : T;
export type RouterType = ReturnTypeOfPromise<ReturnType<typeof createRouter>>;

export type UtilType = ReturnType<typeof makeUtil> & {
  matchScreenshot: (name: string) => Promise<void>;
  router: RouterType;
  updateContext: (data: Context) => void;
  setContext: (data: Context) => void;
  getContext: () => Context;
  getPopup: (triggerPopup: () => Promise<void>) => Promise<{
    popup: Page;
    router: RouterType;
    handleResponse: (options?: {
      success?: boolean;
      response?: Record<string, any>;
    }) => void;
  }>;
};

export type NestedPartial<T> = {
  [P in keyof T]?: NestedPartial<T[P]>;
};

type overrideFunctionType = (data: Record<string, any>) => any;

export interface Context {
  /**
   * name of flow or context which is used to identify to pick api response or other actions
   */
  name?: string;
  /**
   * apiOverrides we can pass the mapping of api identity{API_ROUTES_MAPPING} which we used to override existing response
   * For e.g.
   * ```ts
   * setContext({name: 'saved-card', apiOverrides: {preferences: { customer: {...customerData} } } })
   * ```
   */
  apiOverrides?: Partial<
    Record<
      keyof typeof API_ROUTES_MAPPING,
      overrideFunctionType | Record<string, any>
    >
  >;
  /**
   * apiResponse store latest response with respect to api key
   */
  apiResponse?: Partial<
    Record<keyof typeof API_ROUTES_MAPPING, Record<string, any>>
  >;
  options?: NestedPartial<OptionObject>;
}

export type CustomRoute = {
  url: string;
  method: string;
  handler: ({
    route,
    request,
    context,
    name,
    overrides,
  }: {
    route: Route;
    request: Request;
    context: Context;
    name: string;
    overrides: Record<string, any>;
  }) => {
    response: Record<string, any> | string;
    status_code?: number;
    content_type?: string;
  };
  options: { partialMatch?: boolean; id?: string };
};

export type handlerType = CustomRoute['handler'];

export type UtilFunction<T = unknown> = (utilInput: {
  context: Context;
  inputData: T;
  router: RouterType;
  page: Page;
}) => any;
