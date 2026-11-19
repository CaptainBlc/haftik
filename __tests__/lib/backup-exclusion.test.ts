const mockRequireOptional = jest.fn();
jest.mock('expo-modules-core', () => ({
  ...jest.requireActual('expo-modules-core'),
  requireOptionalNativeModule: (name: string) => mockRequireOptional(name),
}));
jest.mock('expo-sqlite', () => ({ defaultDatabaseDirectory: '/var/mobile/Documents/SQLite' }));

let excludeDatabaseDirFromBackup: typeof import('@/lib/backup-exclusion').excludeDatabaseDirFromBackup;

describe('excludeDatabaseDirFromBackup', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      excludeDatabaseDirFromBackup = require('@/lib/backup-exclusion').excludeDatabaseDirFromBackup;
    });
    mockRequireOptional.mockReset();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  it('native modül yoksa (Android/Jest) no-op: false, uyarı yok', () => {
    mockRequireOptional.mockReturnValue(null);
    expect(excludeDatabaseDirFromBackup()).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('DB klasörünü native modüle verir ve true döner', () => {
    const exclude = jest.fn().mockReturnValue(true);
    mockRequireOptional.mockReturnValue({ excludeDirectoryFromBackup: exclude });
    expect(excludeDatabaseDirFromBackup()).toBe(true);
    expect(mockRequireOptional).toHaveBeenCalledWith('HaftikBackup');
    expect(exclude).toHaveBeenCalledWith('/var/mobile/Documents/SQLite');
    expect(warn).not.toHaveBeenCalled();
  });

  it('native false dönerse false ve sabit metinli uyarı', () => {
    mockRequireOptional.mockReturnValue({ excludeDirectoryFromBackup: () => false });
    expect(excludeDatabaseDirFromBackup()).toBe(false);
    expect(warn).toHaveBeenCalledWith('Yedek hariç tutma işareti konamadı');
  });

  it('native fırlatırsa yutar: false ve sabit metinli uyarı (hata nesnesi loglanmaz)', () => {
    mockRequireOptional.mockReturnValue({
      excludeDirectoryFromBackup: () => {
        throw new Error('gizli ayrıntı');
      },
    });
    expect(excludeDatabaseDirFromBackup()).toBe(false);
    expect(warn).toHaveBeenCalledWith('Yedek hariç tutma çağrısı başarısız');
  });

  it('ikinci çağrıda tekrar denemez (idempotent)', () => {
    const exclude = jest.fn().mockReturnValue(true);
    mockRequireOptional.mockReturnValue({ excludeDirectoryFromBackup: exclude });
    expect(excludeDatabaseDirFromBackup()).toBe(true);
    expect(excludeDatabaseDirFromBackup()).toBe(false);
    expect(exclude).toHaveBeenCalledTimes(1);
  });
});
