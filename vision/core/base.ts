import path from 'path';
import { readFile } from 'fs/promises';
import { Page } from '@playwright/test';
import { checkoutPublic } from '../constant';

type Object<T = any> = { [x: string]: T };

export default function makeUtil(page: Page) {
  return {
    async openCheckout({ options = {} }: { options: Object }) {
      const body = await getHostIndex();
      await page.route(
        checkoutPublic,
        (route) => {
          route.fulfill({
            status: 200,
            body,
          });
        },
        {
          times: 1,
        }
      );

      await page.goto(checkoutPublic);

      passMessage(page, { options });
    },
  };
}

function getHostIndex() {
  return readFile(path.join(__dirname, '../mock/index.html'));
}

async function passMessage(page, message) {
  await page.evaluate(
    (message) => (window as any).handleMessage(message),
    message
  );
}
