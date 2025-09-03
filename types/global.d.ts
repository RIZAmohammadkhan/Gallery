// Global type declarations for missing dependencies

declare module 'aws-lambda' {
  export interface Context {
    [key: string]: any;
  }
  export interface APIGatewayEvent {
    [key: string]: any;
  }
}

declare module 'bunyan' {
  export interface Logger {
    [key: string]: any;
  }
}

declare module 'caseless' {
  export interface Caseless {
    [key: string]: any;
  }
}

declare module 'connect' {
  export interface Connect {
    [key: string]: any;
  }
}

declare module 'memcached' {
  export interface Memcached {
    [key: string]: any;
  }
}

declare module 'mysql' {
  export interface Connection {
    [key: string]: any;
  }
}

declare module 'pg' {
  export interface Client {
    [key: string]: any;
  }
}

declare module 'pg-pool' {
  export interface Pool {
    [key: string]: any;
  }
}

declare module 'request' {
  export interface Request {
    [key: string]: any;
  }
}

declare module 'tedious' {
  export interface Connection {
    [key: string]: any;
  }
}

declare module 'tough-cookie' {
  export interface Cookie {
    [key: string]: any;
  }
}

// Additional global types for the application
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      GEMINI_API_KEY: string;
      MAX_FILE_SIZE?: string;
      APP_NAME?: string;
      APP_URL?: string;
    }
  }

  var _mongoClientPromise: Promise<import('mongodb').MongoClient> | undefined;
}

export {};
