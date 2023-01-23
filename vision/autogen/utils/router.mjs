import { match } from 'path-to-regexp';
import { File } from '#vision/autogen/handlers/static.mjs';

const noop = () => [];

class Router {
  #origins = new Map();

  origin(originName) {
    if (this.#origins.has(originName)) {
      throw `can not override existing origin ${originName}`;
    }
    const originRouter = new OriginRouter();
    this.#origins.set(originName, originRouter);
    return originRouter;
  }

  match(request) {
    const { origin, pathname, search } = new URL(request.url());

    if (this.#origins.has(origin)) {
      const originRouter = this.#origins.get(origin);
      return originRouter.match(request);
    }
  }
}

class OriginRouter {
  #routes = [];
  #cache = new Map();
  #disabled = false;

  get = this.add('get');
  post = this.add('post');
  put = this.add('put');
  patch = this.add('patch');
  delete = this.add('delete');
  head = this.add('head');
  options = this.add('options');
  all = this.add('all');

  add(method) {
    const router = this;
    const routes = this.#routes;
    method = method.toUpperCase();
    return function (url, handler) {
      routes.push({
        method,
        handler,
        name: handler.name || `${method} ${url}`,
        matcher: match(url),
      });
      return router;
    };
  }

  ignore() {
    this.#disabled = true;
  }

  match(request) {
    if (this.#disabled) {
      return noop;
    }
    const { pathname } = new URL(request.url());
    const method = request.method();
    const url = request.url();
    if (this.#cache.has(url)) {
      return this.#cache.get(url);
    }
    for (let route of this.#routes) {
      if (method === route.method || route.method === 'ALL') {
        const match = route.matcher(pathname);
        if (match) {
          return (pageState) => {
            const values = route.handler({
              response: responder({ request }),
              params: match.params,
              request,
              state: pageState.state,
              selectResponse: pageState.selectResponse,
              options: pageState.options,
            });

            const set = new Set();
            const reqObjs = [];

            for (let value of values) {
              const reqObj = {
                type: 'request',
                url,
                method,
              };

              if (value instanceof File) {
                reqObj.response = {
                  body: value.body,
                };
                if (value.contentType) {
                  reqObj.response.contentType = value.contentType;
                }
              } else if (value instanceof HandlerResponse) {
                reqObj.response = value.data;
                reqObj.value = value.value;
                reqObj.name = route.name;
                reqObj.id = value.id;
                reqObj.label = value.label;
              } else {
                if (reqObjs.length) {
                  // TODO improve debugging
                  throw new Error(
                    'Request handler should return File or HandlerResponse'
                  );
                }
                reqObj.response = {
                  contentType: 'application/json',
                  body: JSON.stringify(value),
                };
              }
              reqObjs.push(reqObj);
            }

            return reqObjs;
          };
        }
      }
    }
  }
}

export function createRouter() {
  return new Router();
}

class HandlerResponse {
  constructor(response) {
    this.id = response.id;
    this.label = response.label;
    this.data = response.data;
    this.value = response.value;
  }
}

const responder = function ({ request }) {
  const IDs = new Set();

  function raw(response) {
    if (IDs.has(response.id)) {
      // TODO improve debugging
      throw new Error('duplicate ID');
    }
    IDs.add(response.id);
    return new HandlerResponse(response);
  }
  return {
    raw,

    json(response) {
      return raw({
        id: response.id,
        label: response.label,
        value: response.data,
        data: {
          contentType: 'application/json',
          body: JSON.stringify(response.data),
        },
      });
    },

    jsonp(response) {
      const cbName = new URLSearchParams(request.url()).get('callback');

      return raw({
        id: response.id,
        label: response.label,
        value: response.data,
        data: {
          contentType: 'text/javascript',
          body: `/**/${cbName}(${JSON.stringify(response.data)});`,
        },
      });
    },

    html(response) {
      return raw({
        id: response.id,
        label: response.label,
        value: response.data,
        data: {
          contentType: 'text/html',
          body: response.data,
        },
      });
    },
  };
};
