import { bufferGraphQL } from './client.js';

const CREATE_POST_MUTATION = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      __typename
      ... on PostActionSuccess {
        post {
          id
          text
          dueAt
          status
          channelId
        }
      }
      ... on NotFoundError { message }
      ... on UnauthorizedError { message }
      ... on UnexpectedError { message }
      ... on RestProxyError { message }
      ... on LimitReachedError { message }
      ... on InvalidInputError { message }
    }
  }
`;

function toAsset(media) {
  if (media.type === 'image') {
    return {
      image: {
        url: media.url,
        ...(media.alt ? { metadata: { altText: media.alt } } : {}),
      },
    };
  }

  return { video: { url: media.url } };
}

export async function createBufferPost(apiKey, channelId, message) {
  const input = {
    text: message.text,
    channelId,
    schedulingType: 'automatic',
    mode: 'addToQueue',
    ...(message.media.length > 0 ? { assets: message.media.map(toAsset) } : {}),
  };

  const data = await bufferGraphQL(apiKey, CREATE_POST_MUTATION, { input });
  const result = data?.createPost;

  if (result?.__typename === 'PostActionSuccess') {
    return result.post;
  }

  throw new Error(result?.message ?? `Buffer createPost failed with ${result?.__typename ?? 'unknown response'}.`);
}
