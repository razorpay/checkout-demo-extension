import * as Nach from 'checkoutframe/nach';

const MAX_ALLOWED_BYTES = Nach.ALLOWED_MAX_SIZE_IN_MB * 1024 * 1024;

test('Module: checkoutframe/nach', (t) => {
  test('Nach.getValidityError', (t) => {
    const invalid_exts = ['.svg', '.pdf', '.doc', '.rzp'].filter(
      (ext) => Nach.ALLOWED_EXTS.indexOf(ext) < 0
    );
    const filename = 'myfile';

    test('File with valid extension and valid size', (t) => {
      const file = {
        name: `${filename}${Nach.ALLOWED_EXTS[0]}`,
        size: MAX_ALLOWED_BYTES - 100,
      };

      const validity = Nach.getValidityError(file);

      t.notOk(validity, 'No validity error');

      t.end();
    });

    test('File with valid extension and invalid size', (t) => {
      const file = {
        name: `${filename}${Nach.ALLOWED_EXTS[0]}`,
        size: MAX_ALLOWED_BYTES + 100,
      };

      const validity = Nach.getValidityError(file);

      t.ok(
        validity.description.startsWith('Please upload a smaller file.'),
        'Returns file size error'
      );

      t.end();
    });

    test('File with invalid extension and valid size', (t) => {
      const file = {
        name: `${filename}${invalid_exts[0]}`,
        size: MAX_ALLOWED_BYTES - 100,
      };

      const validity = Nach.getValidityError(file);

      t.ok(
        validity.description.startsWith(
          'The uploaded file type is not supported.'
        ),
        'Returns file type error'
      );

      t.end();
    });

    test('File with invalid extension and invalid size', (t) => {
      const file = {
        name: `${filename}${invalid_exts[0]}`,
        size: MAX_ALLOWED_BYTES + 100,
      };

      const validity = Nach.getValidityError(file);

      t.ok(
        validity.description.startsWith(
          'The uploaded file type is not supported.'
        ),
        'Returns file type error'
      );

      t.end();
    });

    t.end();
  });

  test('Nach.generateError', (t) => {
    test('If success=false, find from not_matching with 3 fields', (t) => {
      const apiResponse = {
        success: false,
        errors: {
          not_matching: [
            'bank_account.account_number',
            'merchant.name',
            'utility_code',
          ],
        },
        enhanced_image:
          'https://s3.ap-south-1.amazonaws.com/rzp-nonprod-merchant-assets/paper-mandate/enhanced/ppm_DGrijW74UiQCV2_DGrkwPS6BEqBoQ',
        extracted_data: [
          {
            key: 'bank_account.account_number',
            expected_value: '1111111111111',
            extracted_value: '111111111111155H5',
          },
        ],
      };

      const generatedError = Nach.generateError(apiResponse);
      const expectedDescription =
        'The following details on NACH form do not match our records: Bank Account Number, Merchant Name, Utility Code. Please upload an image with better quality.';

      t.is(
        generatedError.description,
        expectedDescription,
        'Error description matches'
      );

      t.end();
    });

    test('If success=false, find from not_matching with 3+ fields', (t) => {
      const apiResponse = {
        success: false,
        errors: {
          not_matching: [
            'bank_account.account_number',
            'merchant.name',
            'utility_code',
            'umrn',
          ],
        },
        enhanced_image:
          'https://s3.ap-south-1.amazonaws.com/rzp-nonprod-merchant-assets/paper-mandate/enhanced/ppm_DGrijW74UiQCV2_DGrkwPS6BEqBoQ',
        extracted_data: [
          {
            key: 'bank_account.account_number',
            expected_value: '1111111111111',
            extracted_value: '111111111111155H5',
          },
        ],
      };

      const generatedError = Nach.generateError(apiResponse);
      const expectedDescription =
        'The following details on NACH form do not match our records: Bank Account Number, Merchant Name, Utility Code, and 1 more. Please upload an image with better quality.';

      t.is(
        generatedError.description,
        expectedDescription,
        'Error description matches'
      );

      t.end();
    });

    test('If success=false, find from not_visible with 3 fields', (t) => {
      const apiResponse = {
        success: false,
        errors: {
          not_visible: [
            'bank_account.account_number',
            'merchant.name',
            'utility_code',
          ],
        },
        enhanced_image:
          'https://s3.ap-south-1.amazonaws.com/rzp-nonprod-merchant-assets/paper-mandate/enhanced/ppm_DGrijW74UiQCV2_DGrkwPS6BEqBoQ',
        extracted_data: [
          {
            key: 'bank_account.account_number',
            expected_value: '1111111111111',
            extracted_value: '111111111111155H5',
          },
        ],
      };

      const generatedError = Nach.generateError(apiResponse);
      const expectedDescription =
        'We could not read the following details on the NACH form: Bank Account Number, Merchant Name, Utility Code. Please upload an image with better quality.';
      t.is(
        generatedError.description,
        expectedDescription,
        'Error description matches'
      );

      t.end();
    });

    test('If success=false, prefer not_visible over not_matching', (t) => {
      const apiResponse = {
        success: false,
        errors: {
          not_visible: [
            'bank_account.account_number',
            'merchant.name',
            'utility_code',
            'umrn',
          ],
          not_matching: [
            'bank_account.account_number',
            'merchant.name',
            'utility_code',
            'umrn',
          ],
        },
        enhanced_image:
          'https://s3.ap-south-1.amazonaws.com/rzp-nonprod-merchant-assets/paper-mandate/enhanced/ppm_DGrijW74UiQCV2_DGrkwPS6BEqBoQ',
        extracted_data: [
          {
            key: 'bank_account.account_number',
            expected_value: '1111111111111',
            extracted_value: '111111111111155H5',
          },
        ],
      };

      const generatedError = Nach.generateError(apiResponse);
      const expectedDescription =
        'We could not read the following details on the NACH form: Bank Account Number, Merchant Name, Utility Code, and 1 more. Please upload an image with better quality.';
      t.is(
        generatedError.description,
        expectedDescription,
        'Error description matches'
      );

      t.end();
    });

    test('If success=false, find from not_matching with 3+ fields', (t) => {
      const apiResponse = {
        success: false,
        errors: {
          not_matching: [
            'bank_account.account_number',
            'merchant.name',
            'utility_code',
            'umrn',
          ],
        },
        enhanced_image:
          'https://s3.ap-south-1.amazonaws.com/rzp-nonprod-merchant-assets/paper-mandate/enhanced/ppm_DGrijW74UiQCV2_DGrkwPS6BEqBoQ',
        extracted_data: [
          {
            key: 'bank_account.account_number',
            expected_value: '1111111111111',
            extracted_value: '111111111111155H5',
          },
        ],
      };

      const generatedError = Nach.generateError(apiResponse);
      const expectedDescription =
        'The following details on NACH form do not match our records: Bank Account Number, Merchant Name, Utility Code, and 1 more. Please upload an image with better quality.';

      t.is(
        generatedError.description,
        expectedDescription,
        'Error description matches'
      );

      t.end();
    });

    test('If API has an error object in response, returns it', (t) => {
      const apiResponse = {
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'File upload has failed for some reason',
        },
      };

      const generatedError = Nach.generateError(apiResponse);

      t.is(generatedError, apiResponse.error, 'Error from API is returned');

      t.end();
    });

    test('If API has an error object with a field in response, returns an updated description with field name', (t) => {
      const apiResponse = {
        error: {
          code: 'BAD_REQUEST_ERROR',
          description: 'image is not clear',
          field: 'bank_account.account_number',
        },
      };

      const generatedError = Nach.generateError(apiResponse);

      t.is(
        generatedError,
        apiResponse.error,
        'image is not clear. Field: Bank Account Number'
      );

      t.end();
    });

    test("If API doesn't have an error and success is not false, returns a generic error", (t) => {
      const apiResponse = {
        customResponse: {
          foo: 'bar',
        },
      };

      const generatedError = Nach.generateError(apiResponse);

      t.is(
        generatedError.description,
        "We couldn't process your file. Please upload an image with better quality.",
        'Generic description is thrown'
      );

      t.end();
    });

    t.end();
  });

  t.end();
});
