/**
 * Sürüm bilgisi (S16b, 26 R-1): arkadaş "hangi sürümdeyim?" sorusuna ve hata
 * bildirimlerine tek satırlık cevap. Ayarlar'ın altında gösterilir.
 *
 * - sürüm adı: `expo-constants` (`app.json` `version`)
 * - build numarası: `expo-application` `nativeBuildVersion` (EAS uzak
 *   sürümlemesi `versionCode`u yapı zamanında verir, `app.json`da görünmez)
 * - kanal: `EXPO_PUBLIC_BUILD_CHANNEL` (`eas.json` profil `env`; yoksa `dev`)
 * - kısa commit: `app.config.js` `extra.commit` (yapı zamanında gömülür)
 * - şema sürümü: yerel veritabanının `user_version`ı
 *
 * Kimlik, cihaz modeli veya benzersiz cihaz kimliği GÖSTERİLMEZ/OKUNMAZ.
 * `expo-application`/`expo-constants` yalnızca yerel okuma yapar (ağ yok).
 */
import * as Application from 'expo-application';
import Constants from 'expo-constants';

import { getDriver } from '@/data/db';

export interface BuildInfo {
  version: string;
  build: string;
  channel: string;
  commit: string;
  schema: string;
}

/** Saf biçimlendirme (test edilir): iki satır, ikincisi ayrıntı. */
export function formatBuildInfo(info: BuildInfo): string {
  return `Sürüm ${info.version} (build ${info.build})\n${info.channel} · ${info.commit} · şema ${info.schema}`;
}

export function getBuildInfo(): BuildInfo {
  const extra = (Constants.expoConfig?.extra ?? {}) as { commit?: string | null };
  let schema = '-';
  try {
    schema = String(getDriver().getUserVersion());
  } catch {
    // veritabanı henüz kurulmadıysa
  }
  return {
    version: Constants.expoConfig?.version ?? '-',
    build: Application.nativeBuildVersion ?? '-',
    channel: process.env.EXPO_PUBLIC_BUILD_CHANNEL ?? 'dev',
    commit: extra.commit ?? '-',
    schema,
  };
}

export function getBuildInfoText(): string {
  return formatBuildInfo(getBuildInfo());
}
