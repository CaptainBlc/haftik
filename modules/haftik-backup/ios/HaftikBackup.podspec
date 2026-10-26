Pod::Spec.new do |s|
  s.name           = 'HaftikBackup'
  s.version        = '1.0.0'
  s.summary        = 'Haftik: klasoru iCloud/iTunes yedeginden haric tutar'
  s.description    = 'Yerel Expo modulu; ag kullanmaz, yalnizca URLResourceValues.isExcludedFromBackup yazar.'
  s.license        = 'UNLICENSED'
  s.author         = 'Haftik'
  s.homepage       = 'https://github.com/CaptainBlc/haftik'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,swift}'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
