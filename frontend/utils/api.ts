const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function sanitizeHeaderValue(value: string | null): string | null {
  if (!value) return null;
  let s = value.trim();
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, ''); // zero-width chars
  s = s.replace(/[^\x00-\xFF]/g, ''); // non ISO-8859-1 chars
  return s || null;
}

function getApiKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('api_key');
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = sanitizeHeaderValue(getApiKey());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return {} as T;
}

// Types
export interface CreditsResponse {
  credits: number;
}

export interface Command {
  id: number;
  command_text: string;
  status: string;
  result: string | null;
  created_at: string;
}

export interface CommandResponse {
  id: number;
  command_text: string;
  status: string;
  result: string | null;
  created_at: string;
}

export interface Rule {
  id: number;
  pattern: string;
  action: 'AUTO_ACCEPT' | 'AUTO_REJECT';
  created_by?: number;
}

export interface AuditLog {
  id: number;
  actor_id: number | null;
  action: string;
  details: string | null;
  timestamp: string;
}

export interface UserCreateResponse {
  id: number;
  name: string;
  role: 'admin' | 'member';
  credits: number;
  api_key: string;
}

// API Functions
export async function getCredits(): Promise<CreditsResponse> {
  return apiRequest<CreditsResponse>('/credits');
}

export async function runCommand(text: string): Promise<CommandResponse> {
  return apiRequest<CommandResponse>('/commands', {
    method: 'POST',
    body: JSON.stringify({ command_text: text }),
  });
}

export async function getHistory(): Promise<Command[]> {
  return apiRequest<Command[]>('/commands');
}

export async function createUser(
  name: string,
  role: 'admin' | 'member',
  credits: number
): Promise<UserCreateResponse> {
  return apiRequest<UserCreateResponse>('/users', {
    method: 'POST',
    body: JSON.stringify({ name, role, credits }),
  });
}

export async function getRules(): Promise<Rule[]> {
  return apiRequest<Rule[]>('/rules');
}

export async function addRule(
  pattern: string,
  action: 'AUTO_ACCEPT' | 'AUTO_REJECT'
): Promise<Rule> {
  return apiRequest<Rule>('/rules', {
    method: 'POST',
    body: JSON.stringify({ pattern, action }),
  });
}

export async function getAudit(): Promise<AuditLog[]> {
  return apiRequest<AuditLog[]>('/audit');
}

