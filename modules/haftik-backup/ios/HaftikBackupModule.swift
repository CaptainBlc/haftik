import ExpoModulesCore

/// Bir klasoru (yoksa olusturup) iCloud/iTunes yedeginden haric tutar.
/// Klasore konan `isExcludedFromBackup` icindeki tum dosyalari kapsar.
public final class HaftikBackupModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HaftikBackup")

    Function("excludeDirectoryFromBackup") { (path: String) -> Bool in
      var url = URL(fileURLWithPath: path, isDirectory: true)
      do {
        try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        try url.setResourceValues(values)
        return true
      } catch {
        return false
      }
    }
  }
}
