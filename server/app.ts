import * as build from 'virtual:react-router/server-build';
import {createRequestHandler} from 'react-router';
import {storefrontRedirect} from '@shopify/hydrogen';
import type {AppLoadContext} from 'react-router';

import {createHydrogenRouterContext} from '../app/lib/context';

const handleRequest = createRequestHandler(build, process.env.NODE_ENV);

export default async function app(request: Request): Promise<Response> {
  try {
    const hydrogenContext = await createHydrogenRouterContext(
      request,
      process.env as unknown as Env,
    );

    const response = await handleRequest(
      request,
      hydrogenContext as unknown as AppLoadContext,
    );

    if (hydrogenContext.session.isPending) {
      response.headers.set(
        'Set-Cookie',
        await hydrogenContext.session.commit(),
      );
    }

    if (response.status === 404) {
      return storefrontRedirect({
        request,
        response,
        storefront: hydrogenContext.storefront,
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return new Response('An unexpected error occurred', {status: 500});
  }
}
