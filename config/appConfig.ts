class AppConfig {
    private static instance: AppConfig;
    private _expoUrl: string | null = null;
  
    private constructor() {}
  
    static getInstance(): AppConfig {
      if (!AppConfig.instance) {
        AppConfig.instance = new AppConfig();
      }
      return AppConfig.instance;
    }
  
    get expoUrl(): string {
      return this._expoUrl || '';
    }
  
    set expoUrl(url: string) {
      this._expoUrl = url;
    }
  }
  
  export const appConfig = AppConfig.getInstance();