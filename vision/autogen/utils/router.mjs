import { match } from 'path-to-regexp';

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

  get = add('get', this.#routes);
  post = add('post', this.#routes);
  put = add('put', this.#routes);
  patch = add('patch', this.#routes);
  delete = add('delete', this.#routes);
  head = add('head', this.#routes);
  options = add('options', this.#routes);
  all = add('all', this.#routes);

  match(request) {
    const { pathname } = new URL(request.url());
    const method = request.method().toLowerCase();
    for (let route of this.#routes) {
      if (method === route.method || route.method === 'all') {
        const match = route.matcher(pathname);
        if (match) {
          if (!route.handler) {
            debugger
          }
          return (state) => route.handler({
            params: match.params,
            state,
            request,
          });
        }
      }
    }
  }
}

export function createRouter() {
  return new Router();
}

function add(method, routes) {
  return function (url, handler) {
    routes.push({
      method,
      matcher: match(url),
      handler,
    });
  };
}
