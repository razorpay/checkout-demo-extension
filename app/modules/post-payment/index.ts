import { pushStack } from 'navstack';
import PostPaymentScreen from './components/PostPaymentScreen';
import type { PostPaymentScreenProps } from './components/PostPaymentScreen/types';

export function showPostPaymentMessage(data: PostPaymentScreenProps['data']) {
  return new Promise<void>((resolve) => {
    pushStack({
      component: PostPaymentScreen,
      props: {
        data,
        onComplete: () => {
          resolve();
        },
      },
    });
  });
}
