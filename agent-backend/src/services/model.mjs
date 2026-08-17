import { config, modelConfig } from '../config.mjs';

export async function invokeModel(payload) {
  const providerConfig = modelConfig[config.modelProvider];
  if (!providerConfig) {
    throw new Error(`Unsupported MODEL_PROVIDER: ${config.modelProvider}`);
  }
  if (!providerConfig.token) {
    throw new Error(`Missing model token for provider: ${config.modelProvider}`);
  }

  const response = await fetch(providerConfig.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${providerConfig.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...payload,
      model: providerConfig.model
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    const detail = errorBody ? `: ${errorBody.slice(0, 1000)}` : '';
    throw new Error(`Model request failed with status ${response.status}${detail}`);
  }

  return response.json();
}
