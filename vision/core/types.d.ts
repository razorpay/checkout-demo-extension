import type { Request, Route } from '@playwright/test';
import { API_ROUTES_MAPPING } from './handler';

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
    response: Record<string, any>;
    status_code?: number;
    content_type?: string;
  };
  options: { partialMatch?: boolean; id?: string };
};

export type handlerType = CustomRoute['handler'];
