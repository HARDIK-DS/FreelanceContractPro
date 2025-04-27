import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Contract, Milestone, User, EscrowPayment } from '@shared/schema';
import { storage } from '../storage';

// Interface for API key storage
interface ApiKey {
  id: string;
  userId: number;
  apiKey: string;
  secretKey: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  rateLimit: {
    requests: number;
    period: number; // in seconds
  };
}

// In-memory store for API keys (in production, this would be in a database)
const apiKeys = new Map<string, ApiKey>();

/**
 * Generate a new API key pair for a user
 * @param userId User ID to generate API key for
 * @param permissions Array of permissions for this API key
 * @returns API key information
 */
export function generateApiKey(
  userId: number,
  permissions: string[] = ['read:contracts', 'read:milestones']
): { apiKey: string; secretKey: string } {
  // Generate random keys
  const apiKey = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
  const secretKey = crypto.randomBytes(32).toString('hex');
  
  // Hash the secret key for storage
  const hashedSecret = crypto
    .createHash('sha256')
    .update(secretKey)
    .digest('hex');
  
  // Store the API key in our map
  apiKeys.set(apiKey, {
    id: crypto.randomBytes(8).toString('hex'),
    userId,
    apiKey,
    secretKey: hashedSecret,
    permissions,
    createdAt: new Date(),
    rateLimit: {
      requests: 100,
      period: 60 // 100 requests per minute
    }
  });
  
  // Return the keys to the client
  // Note: In a real application, the secretKey would never be returned again
  return {
    apiKey,
    secretKey
  };
}

/**
 * Revoke an API key
 * @param apiKey API key to revoke
 * @returns Success status
 */
export function revokeApiKey(apiKey: string): boolean {
  return apiKeys.delete(apiKey);
}

/**
 * List all API keys for a user
 * @param userId User ID to list API keys for
 * @returns Array of API keys (without secret keys)
 */
export function listApiKeys(userId: number): Omit<ApiKey, 'secretKey'>[] {
  return Array.from(apiKeys.values())
    .filter(key => key.userId === userId)
    .map(({ secretKey, ...rest }) => rest);
}

/**
 * Middleware to authenticate API requests
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export function authenticateApiRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'] as string;
  const signature = req.headers['x-signature'] as string;
  
  if (!apiKey || !signature) {
    res.status(401).json({ error: 'Missing API key or signature' });
    return;
  }
  
  const keyInfo = apiKeys.get(apiKey);
  
  if (!keyInfo) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }
  
  // Check if the API key has the required permission
  const endpoint = req.path;
  const method = req.method.toLowerCase();
  
  const requiredPermission = getRequiredPermission(endpoint, method);
  
  if (requiredPermission && !keyInfo.permissions.includes(requiredPermission)) {
    res.status(403).json({ error: 'Insufficient permissions' });
    return;
  }
  
  // Verify the request signature
  const requestBody = JSON.stringify(req.body);
  const timestamp = req.headers['x-timestamp'] as string;
  
  if (!timestamp) {
    res.status(401).json({ error: 'Missing timestamp' });
    return;
  }
  
  // Prevent replay attacks by checking if the timestamp is within 5 minutes
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  
  if (Math.abs(currentTime - requestTime) > 300) {
    res.status(401).json({ error: 'Request expired' });
    return;
  }
  
  // Construct the string to sign: HTTP method + path + timestamp + request body
  const stringToSign = `${method}${endpoint}${timestamp}${requestBody}`;
  
  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac('sha256', keyInfo.secretKey)
    .update(stringToSign)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }
  
  // Update last used timestamp
  keyInfo.lastUsed = new Date();
  
  // Attach user ID to the request for later use
  req.userId = keyInfo.userId;
  
  next();
}

/**
 * Get the required permission for a given endpoint and method
 * @param endpoint API endpoint
 * @param method HTTP method
 * @returns Required permission string or null if public
 */
function getRequiredPermission(endpoint: string, method: string): string | null {
  // Map endpoints to required permissions
  const permissionMap: Record<string, Record<string, string>> = {
    '/api/contracts': {
      get: 'read:contracts',
      post: 'write:contracts',
      patch: 'write:contracts',
      delete: 'delete:contracts'
    },
    '/api/milestones': {
      get: 'read:milestones',
      post: 'write:milestones',
      patch: 'write:milestones',
      delete: 'delete:milestones'
    },
    '/api/payments': {
      get: 'read:payments',
      post: 'write:payments'
    },
    '/api/invoices': {
      get: 'read:invoices',
      post: 'write:invoices'
    }
  };
  
  // Check for exact match
  if (permissionMap[endpoint] && permissionMap[endpoint][method]) {
    return permissionMap[endpoint][method];
  }
  
  // Check for path pattern match
  for (const [pattern, methodMap] of Object.entries(permissionMap)) {
    if (endpoint.startsWith(pattern) && methodMap[method]) {
      return methodMap[method];
    }
  }
  
  // Default to null (public endpoint)
  return null;
}

/**
 * Generate API documentation for the external API
 * @returns API documentation object
 */
export function generateApiDocs(): {
  openapi: string;
  info: any;
  paths: Record<string, any>;
  components: any;
} {
  return {
    openapi: '3.0.0',
    info: {
      title: 'SmartFlow API',
      version: '1.0.0',
      description: 'API for SmartFlow - A secure freelancer-client contract management platform'
    },
    paths: {
      '/api/contracts': {
        get: {
          summary: 'List contracts',
          description: 'Get a list of contracts for the authenticated user',
          parameters: [
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter contracts by status'
            }
          ],
          responses: {
            '200': {
              description: 'List of contracts',
              content: {
                'application/json': {
                  schema: { 
                    type: 'array',
                    items: { $ref: '#/components/schemas/Contract' }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a contract',
          description: 'Create a new contract',
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateContractRequest' }
              }
            }
          },
          responses: {
            '201': {
              description: 'Contract created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Contract' }
                }
              }
            }
          }
        }
      },
      '/api/contracts/{id}': {
        get: {
          summary: 'Get contract',
          description: 'Get a specific contract by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'Contract details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Contract' }
                }
              }
            }
          }
        },
        patch: {
          summary: 'Update contract',
          description: 'Update a specific contract by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateContractRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Updated contract',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Contract' }
                }
              }
            }
          }
        }
      },
      // Additional endpoints would be defined here...
    },
    components: {
      schemas: {
        Contract: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            clientId: { type: 'integer' },
            freelancerId: { type: 'integer' },
            status: { type: 'string' },
            totalAmount: { type: 'number' },
            contractType: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            termsAndConditions: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateContractRequest: {
          type: 'object',
          required: ['title', 'description', 'freelancerId', 'totalAmount', 'contractType', 'startDate', 'endDate', 'termsAndConditions'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            freelancerId: { type: 'integer' },
            totalAmount: { type: 'number' },
            contractType: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            termsAndConditions: { type: 'string' }
          }
        },
        UpdateContractRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            endDate: { type: 'string', format: 'date-time' }
          }
        }
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        },
        SignatureAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Signature'
        }
      }
    }
  };
}