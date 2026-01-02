// Kakao JavaScript SDK 타입 정의
export {};

declare global {
  interface Window {
    Kakao: {
      init: (appKey: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (settings: {
          objectType: 'feed' | 'list' | 'location' | 'commerce' | 'text';
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          };
          buttons?: Array<{
            title: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          }>;
        }) => void;
        sendCustom: (settings: {
          templateId: number;
          templateArgs?: Record<string, string>;
        }) => void;
      };
    };
  }
}
