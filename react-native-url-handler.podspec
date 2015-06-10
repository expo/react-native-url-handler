Pod::Spec.new do |s|
  s.name         = 'react-native-url-handler'
  s.version      = '0.2.0'
  s.summary      = 'Navigate to external URLs, handle in-app URLs, and access system URLs'
  s.license      = 'MIT'
  s.platform     = :ios, '7.0'
  s.requires_arc = true
  s.authors      = { 'James Ide' => 'ide@exp.host', 'Charlie Cheever' => 'ccheever@exp.host' }
  s.homepage     = 'https://github.com/exponentjs/react-native-url-handler'
  s.source_files = 'ios/**/*.{h,m}'
end
