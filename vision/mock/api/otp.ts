export function createOtp(route, request, context) {
  return {
    response: {
      success: true,
    },
  };
}

export function verifyOtp(route, request, context) {
  return {
    response: {
      success: 1,
      addresses: [
        {
          id: 'Km9NrjzxD5eN3d',
          entity_id: 'Di8sLC2iGBXiyd',
          entity_type: 'customer',
          line1: '18, Meera Mansion',
          line2: 'Mallikarjunappa Lane, Ballapurpet, Nagarathpete',
          city: 'Bengaluru',
          zipcode: '560002',
          state: 'Karnataka',
          country: 'in',
          type: 'shipping_address',
          primary: true,
          deleted_at: null,
          created_at: 1669789506,
          updated_at: 1669789506,
          contact: '+919353231953',
          tag: '',
          landmark: '',
          name: 'Goutam',
          source_id: null,
          source_type: null,
        },
      ],
      '1cc_consent_banner_views': 0,
      '1cc_customer_consent': 0,
    },
  };

  return {
    response: {
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Verification failed because of incorrect OTP.',
        source: 'NA',
        step: 'NA',
        reason: 'NA',
        metadata: {},
      },
    },
  };
}

export function verifyOtpOneCC(route, request, context) {
  return {
    response: {
      success: 1,
      addresses: context.addresses,
      '1cc_consent_banner_views': 0,
      '1cc_customer_consent': 0,
    },
  };

  return {
    response: {
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Verification failed because of incorrect OTP.',
        source: 'NA',
        step: 'NA',
        reason: 'NA',
        metadata: {},
      },
    },
  };
}

export function truecallerVerifyCustomer(route, request, context) {
  if (context.behavior?.truecaller_verify_api_success === false) {
    return {
      response: {
        status: 'rejected',
        code: 'user_rejected',
      },
    };
  }

  return {
    response: {
      status: 'resolved',
      contact: '+918888888888',
      email: 'demo@razorpay.com',
      tokens: {
        count: context.tokens?.length || 0,
        entity: 'collection',
        items: context.tokens || [],
      },
      addresses: context.addresses,
    },
  };

  return {
    response: {
      status: 'pending',
    },
  };
}
