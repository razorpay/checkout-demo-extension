import { Page, expect } from '@playwright/test';
import type { Config } from '@playwright/test';
import type { UtilFunction } from '../core/types';

/**
 * helper must have UtilFunction type
 */

/**
 *
 * Redesign Footer CTA click
 */
export const clickCTA: UtilFunction = async ({ page }) => {
  await page.click('#redesign-v15-cta');
};

/**
 * Function needed to be call from L0 screen to nativate to particular method screen L1
 */
export const openMethodFromL0: UtilFunction<string> = async ({
  page,
  inputData,
}) => {
  if (inputData) {
    await page.click(`button[method="${inputData}"]`);
    await page.waitForTimeout(1000);
  }
};

/**
 * Match Screenshot
 */
export const matchScreenshot: UtilFunction<{
  screenshotArgument?: Parameters<Page['screenshot']>[0];
  matchScreenShortArgument?: Pick<
    NonNullable<Config['expect']>,
    'toMatchSnapshot'
  >['toMatchSnapshot'];
}> = async ({ page, inputData }) => {
  await page.waitForTimeout(1000);
  expect(await page.screenshot(inputData?.screenshotArgument)).toMatchSnapshot(
    inputData?.matchScreenShortArgument
  );
};

export const handleFeeBearerDialog: UtilFunction = async (utilData) => {
  // fee-bearer
  const { page } = utilData;
  await matchScreenshot(utilData as Parameters<typeof matchScreenshot>[0]);
  await page.click('.fee-bearer .btn');
};
