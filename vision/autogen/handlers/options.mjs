const BASE_OPTIONS = {
  key: 'rzp_test_1DP5mmOlF5G5ag11',
  amount: 100,
};

function* makeOptions() {
  yield {
    label: 'key',
    data: {
      key: 'rzp_test_1DP5mmOlF5G5ag11',
    },
  };
  return;

  yield {
    label: 'order',
    data: {
      order_id: 'order_EAbtuXPh24LrEc11',
    },
  };
}

export default makeOptions;
