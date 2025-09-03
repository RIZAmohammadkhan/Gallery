export interface CloudProvider {
  id: string;
  name: string;
  icon: string;
  configFields: ConfigField[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface CloudConfig {
  provider: string;
  credentials: Record<string, string>;
  enabled: boolean;
}

export interface AppSettings {
  geminiApiKey: string;
  cloudStorage: CloudConfig;
  autoSync: boolean;
  syncInterval: number; // minutes
}

export const CLOUD_PROVIDERS: CloudProvider[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: '🗂️',
    configFields: [
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'text',
        placeholder: 'Your Google Drive Client ID',
        required: true
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Your Google Drive Client Secret',
        required: true
      }
    ]
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📦',
    configFields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Your Dropbox Access Token',
        required: true
      }
    ]
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: '☁️',
    configFields: [
      {
        key: 'clientId',
        label: 'Application ID',
        type: 'text',
        placeholder: 'Your OneDrive Application ID',
        required: true
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Your OneDrive Client Secret',
        required: true
      }
    ]
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  cloudStorage: {
    provider: '',
    credentials: {},
    enabled: false
  },
  autoSync: false,
  syncInterval: 30
};
