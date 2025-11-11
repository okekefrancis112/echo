/**
 * HashiCorp Vault client with namespace support for HCP
 */

interface VaultAuthResponse {
  auth: {
    client_token: string;
    policies: string[];
    lease_duration: number;
  };
}

interface VaultSecretResponse {
  data: {
    data: Record<string, any>;
    metadata: {
      created_time: string;
      version: number;
    };
  };
}

/**
 * Cache for Vault token
 */
let cachedToken: string | null = null;
let tokenExpiry = 0;

/**
 * Get environment configuration safely
 */
const vaultEndpoint = process.env.HASHICORP_ADDRESS;
const roleId = process.env.HASHICORP_ROLE_ID;
const secretId = process.env.HASHICORP_ACCESS_KEY_ID;
const kvMountPath = process.env.HASHICORP_KV_MOUNT || "tenant";
const vaultNamespace = process.env.HASHICORP_NAMESPACE || "admin"; // 👈 Namespace support

if (!vaultEndpoint || !roleId || !secretId) {
  throw new Error("❌ Missing required Vault environment variables");
}

/**
 * Authenticate with Vault using AppRole
 */
async function authenticateVault(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (5-min buffer)
  if (cachedToken && tokenExpiry - now > 5 * 60 * 1000) {
    return cachedToken;
  }

  const response = await fetch(`${vaultEndpoint}/v1/auth/approle/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Vault-Namespace": vaultNamespace // 👈 Namespace header
    },
    body: JSON.stringify({
      role_id: roleId,
      secret_id: secretId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vault authentication failed: ${response.status} ${errorText}`);
  }

  const data: VaultAuthResponse = await response.json();
  cachedToken = data.auth.client_token;
  tokenExpiry = now + data.auth.lease_duration * 1000;

  console.log("✅ Authenticated to Vault as AppRole:", data.auth.policies);
  return cachedToken;
}

/**
 * Fetch a secret from HashiCorp Vault (KV v2)
 */
export async function getSecretValue<T = Record<string, any>>(secretPath: string): Promise<T> {
  const token = await authenticateVault();

  const response = await fetch(`${vaultEndpoint}/v1/${kvMountPath}/data/${secretPath}`, {
    method: "GET",
    headers: {
      "X-Vault-Token": token,
      "X-Vault-Namespace": vaultNamespace // 👈 Namespace header
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to read secret at ${secretPath}: ${response.status} ${errorText}`);
  }

  const data: VaultSecretResponse = await response.json();
  console.log(`🔑 Secret fetched from ${kvMountPath}/${secretPath}`);
  return data.data.data as T;
}

/**
 * Write or update a secret (overwrites existing data)
 */
export async function upsertSecret(secretPath: string, secretData: Record<string, any>): Promise<void> {
  const token = await authenticateVault();

  const response = await fetch(`${vaultEndpoint}/v1/${kvMountPath}/data/${secretPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Vault-Token": token,
      "X-Vault-Namespace": vaultNamespace // 👈 Namespace header
    },
    body: JSON.stringify({ data: secretData }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to write secret at ${secretPath}: ${response.status} ${errorText}`);
  }

  console.log(`✅ Secret written successfully at ${kvMountPath}/${secretPath}`);
}

/**
 * Delete a secret from Vault KV v2
 */
export async function deleteSecret(secretPath: string): Promise<void> {
  const token = await authenticateVault();

  const response = await fetch(`${vaultEndpoint}/v1/${kvMountPath}/data/${secretPath}`, {
    method: "DELETE",
    headers: {
      "X-Vault-Token": token,
      "X-Vault-Namespace": vaultNamespace // 👈 Namespace header
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete secret at ${secretPath}: ${response.status} ${errorText}`);
  }

  console.log(`🗑️ Secret deleted at ${kvMountPath}/${secretPath}`);
}

/**
 * List secrets at a given path (discover keys)
 */
export async function listSecrets(path: string): Promise<string[]> {
  const token = await authenticateVault();

  const response = await fetch(`${vaultEndpoint}/v1/${kvMountPath}/metadata/${path}?list=true`, {
    method: "GET",
    headers: {
      "X-Vault-Token": token,
      "X-Vault-Namespace": vaultNamespace // 👈 Namespace header
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list secrets at ${path}: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.data.keys || [];
}

/**
 * Parse AWS-style SecretString into JSON (optional helper)
 */
export function parseSecretString<T = Record<string, unknown>>(secret: any): T | null {
  if (!secret?.SecretString) return null;

  try {
    return JSON.parse(secret.SecretString) as T;
  } catch (error) {
    console.error("❌ Error parsing secret string:", error);
    return null;
  }
}