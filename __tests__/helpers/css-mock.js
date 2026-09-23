// Jest CSS mock (bkz. CLAUDE.md "Bilinen tuzaklar" MOB/S6): `src/constants/theme.ts`
// yalnızca web hedefi için `@/global.css` import eder; Jest (jest-expo, RN
// preset) CSS söz dizimini ayrıştıramaz. S1-S5'te hiçbir test `theme.ts`'i
// (dolayısıyla `ThemedText`/`ThemedView`'i) import eden bir bileşen render
// etmediğinden bu hiç tetiklenmemişti; S6'nın UI bileşen testleri ilk kez
// bu yolu kullanıyor.
module.exports = {};
