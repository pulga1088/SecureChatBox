export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OTP: { phoneNumber: string; sessionInfo: string };
  Home: undefined;
  Chat: { chatId: string; name: string; recipientId: string };
  NewChat: undefined;
  Profile: { userId?: string; name?: string } | undefined;
  Settings: undefined;
};
