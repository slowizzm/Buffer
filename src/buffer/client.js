const BUFFER_API_URL = 'https://api.buffer.com';

export async function bufferGraphQL(apiKey, query, variables = {}) {
  const response = await fetch(BUFFER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Buffer returned non-JSON HTTP ${response.status}.`);
  }

  if (!response.ok) {
    throw new Error(`Buffer HTTP ${response.status}: ${payload?.message ?? response.statusText}`);
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const message = payload.errors.map((error) => error.message).join('; ');
    throw new Error(`Buffer GraphQL error: ${message}`);
  }

  return payload.data;
}
