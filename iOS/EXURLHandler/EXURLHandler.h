@import Foundation;

#import "RCTBridgeModule.h"

@interface EXURLHandler : NSObject <RCTBridgeModule>

+ (BOOL)openInternalURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation;

@end
