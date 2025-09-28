export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  response?: {
    data?: {
      success: boolean;
      message: string;
    };
    status?: number;
  };
  message: string;
}