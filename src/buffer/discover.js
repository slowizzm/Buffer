import { bufferGraphQL } from './client.js';

const ORGANIZATIONS_QUERY = `
  query GetOrganizations {
    account {
      organizations {
        id
        name
      }
    }
  }
`;

const CHANNELS_QUERY = `
  query GetChannels($organizationId: OrganizationId!) {
    channels(input: { organizationId: $organizationId }) {
      id
      name
      service
      isDisconnected
      isLocked
      metadata {
        __typename
        ... on MastodonMetadata {
          maxCharacters
        }
      }
    }
  }
`;

export async function discoverBufferChannels(apiKey) {
  const orgData = await bufferGraphQL(apiKey, ORGANIZATIONS_QUERY);
  const organizations = orgData?.account?.organizations ?? [];

  if (organizations.length === 0) {
    throw new Error('Buffer account has no organizations.');
  }

  const groups = await Promise.all(
    organizations.map(async (organization) => {
      const data = await bufferGraphQL(apiKey, CHANNELS_QUERY, {
        organizationId: organization.id,
      });

      return (data?.channels ?? []).map((channel) => ({
        ...channel,
        organizationId: organization.id,
        organizationName: organization.name,
      }));
    }),
  );

  return groups
    .flat()
    .filter((channel) => !channel.isDisconnected && !channel.isLocked);
}
