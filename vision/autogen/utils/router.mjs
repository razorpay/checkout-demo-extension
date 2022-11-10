import { match } from 'path-to-regexp';
import { isSerializable, md5 } from './index.mjs';
import { File } from '../handlers/static.mjs';

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

  get = add('get', this.#routes);
  post = add('post', this.#routes);
  put = add('put', this.#routes);
  patch = add('patch', this.#routes);
  delete = add('delete', this.#routes);
  head = add('head', this.#routes);
  options = add('options', this.#routes);
  all = add('all', this.#routes);

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
          return state => {

            const values = route.handler({
              params: match.params,
              request,
              ...state,
            });

            const set = new Set();
            const reqObjs = [];

            for (let value of values) {
              const reqObj = {
                type: 'request',
                url,
                method,
                name: route.name,
                response: {},
              };

              if (value instanceof File) {
                reqObj.response.path = value.path;
                if (values.length === 1) {
                  this.#cache.set(url, [ reqObj ]);
                }
              } else if (isSerializable(value)) {
                reqObj.hash = md5(JSON.stringify([
                  method,
                  url,
                  value,
                ]));
                reqObj.value = value;
                if (typeof value === 'string') {
                  reqObj.response.contentType = 'text/html';
                } else {
                  reqObj.response.contentType = 'application/json';
                  value = JSON.stringify(value);
                }
                reqObj.response.body = value;
                if (!set.has(reqObj.hash)) {
                  set.add(reqObj.hash);
                } else {
                  // TODO duplicate value returned
                }
              } else {
                // TODO non-serializable value returned
              }
              reqObjs.push(reqObj);
            }

            return reqObjs;
          }
        }
      }
    }
  }
}

export function createRouter() {
  return new Router();
}

function add(method, routes) {
  method = method.toUpperCase();
  return function (url, handler) {
    routes.push({
      method,
      handler,
      name: url,
      matcher: match(url),
    });
  };
}
