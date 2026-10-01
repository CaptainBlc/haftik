/**
 * Kartın gerçek görsel bileşeni (spec "Tasarım ilkeleri": "Kart, tek bir
 * sabit boyutlu (mantıksal 360x640, çıktı 1080x1920) bileşendir"). Ölçüler
 * `docs/ux/kart-yerlesimi.md`in "Bölüm bölüm ölçüler" tablosuyla birebir
 * (`src/card/layout.ts`'ten okunur).
 *
 * **KRİTİK mimari kısıt (görev talimatı, spec "Veri modeli > weekly_card"
 * "Neden dondurulur"):** bu bileşen yalnızca `CardSnapshot`'ın ZATEN
 * DONDURULMUŞ metin alanlarından (`title.text`, `lines[*].text`,
 * `summary.text`) render eder; `src/domain/content/tr.ts`'teki kimlikli
 * metin havuzunu TEKRAR ÇÖZÜMLEMEZ ve o dosyayı import ETMEZ. Bu,
 * "içerik havuzu güncellense de eski kart değişmesin" garantisinin
 * temelidir. Kategori emoji'si için `LineResult.id`nin biçimini
 * (`line.<kategori>.<seviye>.<n>`) ayrıştıran `line-level.ts` kullanılır —
 * bu da içerik havuzuna dokunmaz, yalnızca zaten dondurulmuş kimlik
 * string'ini okur (bkz. o dosyanın başlığı).
 * (`__tests__/card/CardView.test.tsx` bu dosyanın kaynağında bir
 * `content/tr` import/require deseni OLMADIĞINI statik olarak denetler —
 * `locked-card-placeholder.tsx`teki aynı desen.)
 *
 * **Renk kodlaması yok** (spec: "sıralı yoğunluk, iyi/kötü değil";
 * `kart-yerlesimi.md` "Renk ve görsel dil kararları"): tüm satırlar aynı
 * nötr renk paletinde, kategori başına farklı arka plan yok.
 *
 * **Gizli satır (`???`) render'ı (S7b, `plan.md` "satır gizleme + zorunlu
 * önizleme"):** isteğe bağlı `hiddenCategories` prop'u verilirse, o kümedeki
 * kategoriler için gerçek satır metni (`snapshot.lines[category].text`)
 * HİÇ JSX ağacına yazılmaz — yerine sabit `"???"` string'i render edilir.
 * Bu, yalnızca görsel bir CSS gizlemesi değildir: gerçek metin string'i
 * render çıktısında (`toJSON()`) hiç yer almaz (bkz.
 * `__tests__/card/CardView.test.tsx` "gizli satırın gerçek metni render
 * ağacında yok" testi) — spec güvenlik gereksinimi 3: "gizlenen metin
 * dosyada bulunmaz". Aynı kural, kategori seviyesini de ifşa etmemesi için
 * satırın EMOJİ'sine de uygulanır (`categoryEmoji` seviyeye göre değişir;
 * gizliyken sabit, seviyeden bağımsız bir yer tutucu emoji kullanılır).
 * Unvan da aynı şekilde gizlenir: `title.basedOnCategories`teki
 * kategorilerden biri gizliyse unvan da `"???"` olur (karar + gerekçe:
 * `src/card/title-visibility.ts`). `hiddenCategories` verilmezse (ör.
 * Ekran 4'ün reveal akışı, `capture.test.ts`teki eski çağrılar) davranış
 * S7a ile birebir aynıdır — hiçbir satır gizlenmez, geriye dönük uyumludur.
 *
 * **Yazı tipi ölçeği (QA BLG-08):** kart sabit 360x640 mantıksal tasarımdır ve
 * PNG'ye dondurulur; bu yüzden TÜM kart metinleri `allowFontScaling={false}`
 * ile kullanıcının sistem yazı tipi ölçeğinden bağımsızdır (aksi halde 2.0
 * ölçekte satırlar kesilir, paylaşılan PNG'nin görünümü cihaz ayarına bağlı olurdu).
 *
 * **Saf sunum bileşeni:** `CardSnapshot`'ı prop olarak alır, veri/SQLite/
 * router'a dokunmaz. `sectionOpacity` yalnızca S7a'nın reveal animasyonu
 * (`docs/ux/ekran-akisi.md` "wow anı") için görsel bir katmandır — hangi
 * metnin render edildiğini asla etkilemez, yalnızca bölümlerin opaklığını;
 * verilmezse (PNG yakalama sırasında olduğu gibi) tüm bölümler tam opaktır.
 */
import { forwardRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';

import { CARD_STAMP_TEXT } from '@/config/constants';
import { CATEGORY_EMOJI } from '@/constants/emoji';
import { CATEGORIES } from '@/domain/types';
import type { Category, CardSnapshot } from '@/domain/types';

import { CARD_FONT_FAMILY } from './fonts';
import { CARD_LOGICAL_HEIGHT, CARD_LOGICAL_WIDTH, CardLayout, SummaryTextLayout } from './layout';
import { LEVEL_TO_VALUE, levelFromLineId } from './line-level';
import { shouldHideTitle } from './title-visibility';

/** Gizli bir satırda kategori/seviye ifşa etmeyen, sabit yer tutucu emoji. */
const HIDDEN_LINE_EMOJI = '❔';
/** Gizli satır/unvan metni yerine çizilen sabit yer tutucu (spec: "???"). */
const HIDDEN_TEXT = '???';
/** `hiddenCategories` verilmediğinde kullanılan sabit boş küme (yeni obje üretmeyi önler). */
const EMPTY_HIDDEN_SET: ReadonlySet<Category> = new Set();

type OpacityValue = Animated.AnimatedInterpolation<number> | number;

export interface CardViewSectionOpacity {
  title?: OpacityValue;
  movement?: OpacityValue;
  sleep?: OpacityValue;
  spending?: OpacityValue;
  social?: OpacityValue;
  summary?: OpacityValue;
}

export interface CardViewProps {
  snapshot: CardSnapshot;
  /** Reveal animasyonu için bölüm bazlı opaklık (bkz. dosya başlığı). */
  sectionOpacity?: CardViewSectionOpacity;
  /**
   * Gizli kategori kümesi (S7b, bkz. dosya başlığı). Verilmezse hiçbir
   * satır/unvan gizlenmez (S7a ile geriye dönük uyumlu varsayılan).
   */
  hiddenCategories?: ReadonlySet<Category>;
}

function categoryEmoji(category: Category, lineId: string): string {
  const level = levelFromLineId(lineId);
  return CATEGORY_EMOJI[category][LEVEL_TO_VALUE[level]];
}

export const CardView = forwardRef<ViewShotRef, CardViewProps>(function CardView(
  { snapshot, sectionOpacity, hiddenCategories },
  ref
) {
  const titleHidden = shouldHideTitle(snapshot.title.basedOnCategories, hiddenCategories ?? EMPTY_HIDDEN_SET);

  return (
    <ViewShot ref={ref} options={{ format: 'png' }}>
      <View style={styles.card}>
        <View style={{ height: CardLayout.topSpacer }} />

        <Animated.Text
          testID="card-title"
          style={[styles.title, { opacity: sectionOpacity?.title ?? 1 }]}
          numberOfLines={2}
          allowFontScaling={false}>
          {titleHidden ? HIDDEN_TEXT : snapshot.title.text}
        </Animated.Text>

        <View style={{ height: CardLayout.gapAfterTitle }} />

        <View style={styles.linesBlock}>
          {CATEGORIES.map((category) => {
            const hidden = hiddenCategories?.has(category) ?? false;
            const line = snapshot.lines[category];
            return (
              <Animated.View
                key={category}
                testID={`card-line-${category}`}
                style={[styles.lineRow, { opacity: sectionOpacity?.[category] ?? 1 }]}>
                <Text style={styles.emoji} allowFontScaling={false}>
                  {hidden ? HIDDEN_LINE_EMOJI : categoryEmoji(category, line.id)}
                </Text>
                <Text style={styles.lineText} numberOfLines={2} allowFontScaling={false}>
                  {hidden ? HIDDEN_TEXT : line.text}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        <View style={{ height: CardLayout.gapAfterLines }} />

        <Animated.View
          testID="card-summary"
          style={[styles.summaryWrapper, { opacity: sectionOpacity?.summary ?? 1 }]}>
          <View style={styles.summaryPill}>
            <Text
              style={styles.summaryText}
              numberOfLines={SummaryTextLayout.maxLines}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              allowFontScaling={false}>
              {snapshot.summary.text}
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: CardLayout.gapAfterSummary }} />

        <View style={styles.stampWrapper}>
          <Text testID="card-stamp" style={styles.stampText} allowFontScaling={false}>
            {CARD_STAMP_TEXT}
          </Text>
        </View>

        <View style={{ height: CardLayout.bottomSpacer }} />
      </View>
    </ViewShot>
  );
});

const TEXT_COLOR = '#1C1C1E';
const DIVIDER_COLOR = 'rgba(0,0,0,0.12)';
const PILL_BACKGROUND = 'rgba(0,0,0,0.08)';

const styles = StyleSheet.create({
  card: {
    width: CARD_LOGICAL_WIDTH,
    height: CARD_LOGICAL_HEIGHT,
    backgroundColor: '#FFFFFF',
  },
  title: {
    height: CardLayout.titleHeight,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: CARD_FONT_FAMILY.bold,
    color: TEXT_COLOR,
    textAlign: 'center',
    paddingHorizontal: CardLayout.horizontalPadding,
  },
  linesBlock: {
    borderTopWidth: 1,
    borderTopColor: DIVIDER_COLOR,
  },
  lineRow: {
    height: CardLayout.lineRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CardLayout.horizontalPadding,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER_COLOR,
  },
  // Bilerek `fontFamily` YOK: emoji sistem emoji fontuyla çizilir
  // (görev talimatı: "yalnızca metin fontu paketlenir").
  emoji: {
    fontSize: 26,
  },
  lineText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: CARD_FONT_FAMILY.regular,
    color: TEXT_COLOR,
  },
  summaryWrapper: {
    height: CardLayout.summaryHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: CardLayout.horizontalPadding,
  },
  summaryPill: {
    borderRadius: 12,
    backgroundColor: PILL_BACKGROUND,
    paddingHorizontal: SummaryTextLayout.pillPaddingHorizontal,
    paddingVertical: SummaryTextLayout.pillPaddingVertical,
    maxWidth: '100%',
  },
  summaryText: {
    fontSize: SummaryTextLayout.fontSize,
    lineHeight: SummaryTextLayout.lineHeight,
    fontStyle: 'italic',
    fontFamily: CARD_FONT_FAMILY.italic,
    color: TEXT_COLOR,
    textAlign: 'center',
  },
  stampWrapper: {
    height: CardLayout.stampHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampText: {
    fontSize: 11,
    opacity: 0.65,
    fontFamily: CARD_FONT_FAMILY.regular,
    color: TEXT_COLOR,
    textAlign: 'center',
  },
});
