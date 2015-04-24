// Copyright 2015-present 650 Industries. All rights reserved.

#import "NTURLHandler.h"

@implementation NTURLHandler

RCT_EXPORT_MODULE()

static NSString * const NTURLHandlerOpenURLNotification = @"NTURLHandlerOpenURL";

@synthesize bridge = _bridge;

- (instancetype)init
{
    if (self = [super init]) {
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(_dispatchOpenURLEvent:)
                                                     name:NTURLHandlerOpenURLNotification
                                                   object:nil];
    }
    return self;
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

/**
 * Opens the given URL, which must be an internal URL.
 *
 * Do not call this from application code to navigate to a given URL. Call -[UIApplication openURL:] instead. This
 * method is to be called from the UIApplicationDelegate when it needs to open a URL.
 */
+ (BOOL)openInternalURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
    NSMutableDictionary *userInfo = [NSMutableDictionary dictionaryWithDictionary:@{@"url": url}];
    if (sourceApplication) {
        userInfo[@"sourceApplication"] = sourceApplication;
    }
    if (annotation) {
        userInfo[@"annotation"] = annotation;
    }
    [[NSNotificationCenter defaultCenter] postNotificationName:NTURLHandlerOpenURLNotification object:self userInfo:userInfo];
    return YES;
}

- (void)_dispatchOpenURLEvent:(NSNotification *)notification
{
    [self.bridge.eventDispatcher sendDeviceEventWithName:@"NTURLHandler.openURL" body:notification.userInfo];
}

#pragma mark - JavaScript

- (NSDictionary *)constantsToExport
{
    NSDictionary *launchOptions = self.bridge.launchOptions;
    NSMutableDictionary *constants = [NSMutableDictionary dictionaryWithDictionary:@{
        @"initialURL": [launchOptions[UIApplicationLaunchOptionsURLKey] absoluteString] ?: [NSNull null],
        @"settingsURL": UIApplicationOpenSettingsURLString ?: [NSNull null],
    }];
    if (launchOptions[UIApplicationLaunchOptionsSourceApplicationKey]) {
        constants[@"initialReferrer"] = @{
            @"sourceApplication": launchOptions[UIApplicationLaunchOptionsSourceApplicationKey],
            @"annotation": launchOptions[UIApplicationLaunchOptionsAnnotationKey],
        };
    }
    return constants;
}

RCT_REMAP_METHOD(openURL,
                 openURLString:(NSString *)urlString
               successCallback:(RCTResponseSenderBlock)successCallback
                 errorCallback:(RCTResponseSenderBlock)errorCallback)
{
    NSURL *url = [NSURL URLWithString:urlString];
    if (!url) {
        NSString *message = [NSString stringWithFormat:@"Could not create a URL from \"%@\"", urlString];
        errorCallback(@[message]);
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        BOOL opened = [[UIApplication sharedApplication] openURL:url];
        successCallback(@[@(opened)]);
    });
}

@end
