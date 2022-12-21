import path from 'path';
import { readFile } from 'fs/promises';
import type { Page, Request, Route } from '@playwright/test';
import {
  appPath,
  cdnBuildPath,
  cdnImagePath,
  fontPath,
  googleChartAPI,
  localCDNPath,
  mockAssetsPath,
} from '../constant';
import { attachHandlers } from './handler';
import { match } from 'path-to-regexp';
import type { CustomRoute, Context } from './types';

function delay(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const routes: CustomRoute[] = [];

function requestHandler(context: Context) {
  return function (route: Route, request: Request) {
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
        const cdnPath = url.slice(cdnImagePath.length);
        return serveFile(
          route,
          path.join(appPath, 'images', cdnPath),
          [
            path.join(localCDNPath, cdnPath),
            path.join(mockAssetsPath, cdnPath.split('/').slice(-1)[0]), // extract filename
            path.join(appPath, 'images', 'bank/ICIC.gif'),
          ] // TODO need better fallback images
        );
      } else if (url.startsWith(googleChartAPI)) {
        return serveFile(route, path.join(mockAssetsPath, 'upiqr.png'));
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
        const { pathname } = new URL(url);
        const matched = match(r.url)(pathname);

        if (matched) {
          return true;
        }
      }
    });

    if (matchedRoute) {
      let apiOverrides =
        context?.apiOverrides?.[matchedRoute?.options?.id || ''] || {};

      const {
        response,
        status_code = 200,
        content_type = 'application/json',
      } = matchedRoute.handler({
        route,
        request,
        context,
        name: context?.name || 'default',
        overrides:
          context?.apiOverrides?.[matchedRoute?.options?.id || ''] || {},
      }) || {};

      let updatedResponse = response;
      // override only if json [may need to update accordingly]
      if (typeof updatedResponse !== 'string') {
        if (typeof apiOverrides === 'function') {
          updatedResponse = apiOverrides(response);
        } else if (apiOverrides && typeof apiOverrides === 'object') {
          updatedResponse = { ...response, ...apiOverrides };
        }
      }
      if (!response) {
        return route.fulfill({
          status: 204,
        });
      }

      return route.fulfill({
        body:
          typeof updatedResponse === 'string'
            ? updatedResponse
            : JSON.stringify(updatedResponse),
        status: status_code,
        contentType: content_type,
      });
    }

    console.warn(`Unhandled request with url ${url}`);
    route.fulfill({
      status: 204,
    });
  };
}

export async function createRouter(page: Page, context: Context) {
  await page.route(Boolean, requestHandler(context));

  const router = {
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
    async setContext(ctx) {
      await page.route(Boolean, requestHandler(ctx));
    },
  };
  attachHandlers(router);

  return router;
}

async function serveFile(
  route: Route,
  path: string,
  fallbackFilePath?: string[]
) {
  try {
    const body = await readFile(path);
    await delay(1000);
    route.fulfill({
      status: 200,
      body,
      contentType: path.endsWith('.svg') ? 'image/svg+xml' : undefined,
    });
  } catch (e) {
    if (fallbackFilePath && fallbackFilePath.length > 0) {
      serveFile(route, fallbackFilePath[0], fallbackFilePath.slice(1));
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
    handler: CustomRoute['handler'],
    options: {
      partialMatch?: boolean;
      id?: string;
    } = {}
  ) {
    options.partialMatch = options.partialMatch || true;

    const self: CustomRoute = {
      url,
      method,
      options,
      handler,
    };
    routes.push(self);
    return self;
  };
}
