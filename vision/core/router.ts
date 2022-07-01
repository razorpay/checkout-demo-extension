import path from 'path';
import { readFile } from 'fs/promises';
import type { Page, Request, Route } from '@playwright/test';
import { appPath, cdnBuildPath, cdnImagePath, fontPath } from '../constant';

type CustomRoute = {
  url: string;
  method: string;
  setBody(body: any): void;
  setResponse(response: any): void;
  setHandler: (fn: (route: Route, request: Request) => void) => void;
  handler: (route: Route, request: Request) => void;
  options: { partialMatch?: boolean };
};

const routes: CustomRoute[] = [];

function requestHandler(route: Route, request: Request) {
  const url = request.url();
  const method = request.method().toLowerCase();
  if (method === 'get') {
    if (
      url.endsWith('favicon.ico') ||
      url.endsWith('livereload.js?snipver=1')
    ) {
      return route.fulfill({
        status: 204,
      });
    } else if (url.startsWith(fontPath)) {
      return serveFile(
        route,
        path.join(appPath, 'fonts', url.slice(fontPath.length))
      );
    } else if (url.startsWith(cdnBuildPath)) {
      return serveFile(
        route,
        path.join(appPath, 'dist/v1', url.slice(cdnBuildPath.length))
      );
    } else if (url.startsWith(cdnImagePath)) {
      return serveFile(
        route,
        path.join(appPath, 'images', url.slice(cdnImagePath.length)),
        path.join(appPath, 'images', 'bank/ICIC.gif') // TODO need better fallback images
      );
    } else if (url.startsWith('data:')) {
      return route.continue();
    }
  } else if (method === 'post') {
    if (url.startsWith('https://lumberjack.razorpay.com/')) {
      return route.fulfill({
        status: 204,
      });
    }
  }
  const matchedRoute = routes.find((r) => {
    if (r.method === 'all' || r.method === method) {
      if (r?.options?.partialMatch) {
        return url.includes(r.url);
      } else {
        return r.url === url;
      }
    }
  });

  if (matchedRoute) {
    return matchedRoute.handler(route, request);
  }

  console.warn(`Unhandled request with url ${url}`);
  route.fulfill({
    status: 204,
  });
}

export async function createRouter(page: Page) {
  await page.route(Boolean, requestHandler);

  return {
    get: add('get'),
    post: add('post'),
    put: add('put'),
    patch: add('patch'),
    delete: add('delete'),
    head: add('head'),
    options: add('options'),
    all: add('all'),
    clear() {
      routes.length = 0;
    },
  };
}

async function serveFile(
  route: Route,
  path: string,
  fallbackFilePath?: string
) {
  try {
    const body = await readFile(path);
    route.fulfill({
      status: 200,
      body,
    });
  } catch (e) {
    if (fallbackFilePath) {
      serveFile(route, fallbackFilePath);
      return;
    }
    route.fulfill({
      status: 404,
    });
  }
}

function add(method) {
  return function (
    url: string,
    body: any,
    options: {
      partialMatch?: boolean;
    } = {}
  ) {
    const self: CustomRoute = {
      url,
      method,
      options,
      setBody(body) {
        if (typeof body !== 'string') {
          body = JSON.stringify(body);
        }
        self.setResponse({
          status: 200,
          body,
        });
      },

      setResponse(response) {
        self.setHandler((route) => {
          route.fulfill(response);
        });
      },

      setHandler: (fn) => {
        self.handler = fn;
      },
      handler: (route) => {
        route.fulfill({
          status: 204,
        });
      },
    };

    if (typeof body !== 'undefined') {
      self.setBody(body);
    }
    routes.push(self);
    return self;
  };
}
