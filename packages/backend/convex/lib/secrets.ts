import vault from 'node-vault';

export async function createSecretsManagerClient() {
  const vaultClient = vault({
    endpoint: process.env.HASHICORP_ADDRESS,
  });

  // Authenticate using AppRole
  const login = await vaultClient.approleLogin({
    role_id: process.env.HASHICORP_ROLE_ID,
    secret_id: process.env.HASHICORP_SECRET_ACCESS_KEY,
  });

  // Set token for authenticated operations
  vaultClient.token = login.auth.client_token;

  console.log('✅ Authenticated to Vault as AppRole:', login.auth.policies);
  return vaultClient;
}

export async function getSecretValue<T = Record<string, any>>(secretPath: string): Promise<T> {
  try {
    const vaultClient = await createSecretsManagerClient();

    // Read secret (KV v2 engine)
    const secret = await vaultClient.read(`secret/data/${secretPath}`);

    const data = secret.data?.data as T;
    console.log(`🔑 Secret fetched from ${secretPath}:`, data);

    return data;
  } catch (error: any) {
    console.error(`❌ Error reading secret at ${secretPath}:`, error.message);
    throw error;
  }
}

// export async function upsertSecret(secretPath: string, secretData: Record<string, unknown>): Promise<void> {
//   try {
//     const vaultClient = await createSecretsManagerClient();

//     // Write secret (KV v2 engine)
//     await vaultClient.write(`secret/data/${secretPath}`, { data: JSON.stringify(secretData) });

//     console.log(`✅ Secret saved to ${secretPath}`);
//   } catch (error: any) {
//     if (error instanceof ResourceExistsException) {
//         await vaultClient.write(`secret/data/${secretPath}`, { data: JSON.stringify(secretData) });
//     }
//     console.error(`❌ Error saving secret at ${secretPath}:`, error.message);
//     throw error;
//   }
// }]


export async function upsertSecret(secretPath: string, secretData: Record<string, any>): Promise<void> {
  const vaultClient = await createSecretsManagerClient();

  try {
    // Try writing the secret (KV v2 engine)
    // await vaultClient.write(`secret/data/${secretPath}`, { data: secretData });
    await vaultClient.write(`secret/data/${secretPath}`, { data: JSON.stringify(secretData) });
    console.log(`✅ Secret created or updated at ${secretPath}`);
  } catch (error: any) {
    // Handle "already exists" or similar conflict errors
    if (
      error.response?.statusCode === 400 ||
      error.response?.statusCode === 409 ||
      /already exists/i.test(error.message)
    ) {
      console.warn(`⚠️ Secret already exists at ${secretPath}, attempting update...`);

      try {
        // Fetch the existing secret
        const existing = await vaultClient.read(`secret/data/${secretPath}`);
        const existingData = existing.data?.data || {};

        // Merge old + new fields (preserving existing keys)
        const updatedData = { ...existingData, ...secretData };

        // Write merged data back
        // await vaultClient.write(`secret/data/${secretPath}`, { data: updatedData });
        await vaultClient.write(`secret/data/${secretPath}`, { data: JSON.stringify(updatedData) });
        console.log(`✅ Secret updated successfully at ${secretPath}`);
      } catch (updateErr: any) {
        console.error(`❌ Failed to update secret at ${secretPath}:`, updateErr.message);
        throw updateErr;
      }
    } else {
      console.error(`❌ Error saving secret at ${secretPath}:`, error.message);
      throw error;
    }
  }
}

export function parseSecretString<T = Record<string, unknown>>(
    secret: any
): T | null {
    if (!secret.SecretString) {
        return null;
    }

    try {
        return JSON.parse(secret.SecretString) as T;
    } catch (error) {
        console.error(`❌ Error parsing secret string:`, error);
        return null;
    }
}

