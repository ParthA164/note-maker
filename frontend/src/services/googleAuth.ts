import { GOOGLE_CLIENT_ID } from '../config/config';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string;
  locale?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

class GoogleAuthService {
  private clientId: string;
  private isInitialized: boolean = false;

  constructor() {
    // Using a development-friendly Google Client ID that allows localhost
    this.clientId = GOOGLE_CLIENT_ID;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isInitialized) {
        resolve();
        return;
      }

      const checkGoogleLoaded = () => {
        if (window.google && window.google.accounts) {
          this.isInitialized = true;
          resolve();
        } else {
          setTimeout(checkGoogleLoaded, 100);
        }
      };

      checkGoogleLoaded();
    });
  }

  async signIn(): Promise<string> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: GoogleCredentialResponse) => {
          if (response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('No credential received from Google'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt();
    });
  }

  async renderButton(element: HTMLElement, callback: (credential: string) => void): Promise<void> {
    await this.initialize();

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: GoogleCredentialResponse) => {
        if (response.credential) {
          callback(response.credential);
        }
      },
    });

    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: '100%',
    });
  }

  disableAutoSelect(): void {
    if (this.isInitialized && window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}

export default new GoogleAuthService();