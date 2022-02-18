require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-polar-ble"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/tien/react-native-polar-ble.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.exclude_files = "ios/Pods", "ios/PolarBle.xcworkspace", "ios/Podfile", "ios/Podfile.lock"

  s.dependency "React-Core"
  s.dependency "PolarBleSdk", "~> 3.2"
end
