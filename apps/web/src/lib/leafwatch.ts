import { HEY_API_URL } from '@hey/data/constants';

import getAuthApiHeaders from './getAuthApiHeaders';
import getCurrentSession from './getCurrentSession';

let worker: Worker;

if (typeof Worker !== 'undefined') {
  worker = new Worker(new URL('./leafwatchWorker', import.meta.url));
}

/**
 * Leafwatch analytics
 */
export const Leafwatch = {
  track: (
    name: string,
    properties?: Record<string, unknown>,
    scoreAddress?: string
  ) => {
    const { evmAddress: wallet, id: sessionProfileId } = getCurrentSession();
    const { referrer } = document;
    const referrerDomain = referrer ? new URL(referrer).hostname : null;

    worker.postMessage({
      accessToken: getAuthApiHeaders()['X-Access-Token'],
      actor: sessionProfileId,
      name,
      network: getAuthApiHeaders()['X-Lens-Network'],
      platform: 'web',
      properties,
      referrer: referrerDomain,
      scoreAddress,
      url: window.location.href,
      wallet
    });

    worker.onmessage = (event: MessageEvent) => {
      const response = event.data;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${HEY_API_URL}/leafwatch/events`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-access-token', response.accessToken);
      xhr.setRequestHeader('x-lens-network', response.network);
      xhr.send(JSON.stringify(response));
    };
  }
};
