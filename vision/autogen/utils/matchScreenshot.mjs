import { compare } from 'odiff-bin';

async function matchScreenshot(
  firstImagePath,
  secondImagePath,
  options = { thresholdPercentage: 100 }
) {
  try {
    const diff = await compare(firstImagePath, secondImagePath, null, {
      threshold: 0, // keeping 0 for exact match
    });

    return (
      diff.match ||
      ('diffPercentage' in diff &&
        diff.diffPercentage <= 100 - options.thresholdPercentage)
    );
  } catch (error) {
    return false;
  }
}

export default matchScreenshot;
