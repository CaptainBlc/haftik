// `import '@/global.css'` (src/constants/theme.ts, yalnızca web hedefi için) yan etki
// import'udur; TS bunu çözemezse TS2882 verir. `expo-env.d.ts` .gitignore'da ve
// `expo start` ile üretilir, taze klonda/CI'da yoktur; bu bildirim ona bağımlılığı kaldırır.
declare module '*.css';
