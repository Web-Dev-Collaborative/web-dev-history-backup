// Copyright 2020 Google LLC
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.




/*! THIS FILE IS AUTO-GENERATED */

import {AuthPlus, getAPI, GoogleConfigurable} from 'googleapis-common';
import {adsensehost_v4_1} from './v4.1';

export const VERSIONS = {
  'v4.1': adsensehost_v4_1.Adsensehost,
};

export function adsensehost(version: 'v4.1'): adsensehost_v4_1.Adsensehost;
export function adsensehost(
  options: adsensehost_v4_1.Options
): adsensehost_v4_1.Adsensehost;
export function adsensehost<T = adsensehost_v4_1.Adsensehost>(
  this: GoogleConfigurable,
  versionOrOptions: 'v4.1' | adsensehost_v4_1.Options
) {
  return getAPI<T>('adsensehost', versionOrOptions, VERSIONS, this);
}

const auth = new AuthPlus();
export {auth};
export {adsensehost_v4_1};
export {
  AuthPlus,
  GlobalOptions,
  APIRequestContext,
  GoogleConfigurable,
  StreamMethodOptions,
  GaxiosPromise,
  MethodOptions,
  BodyResponseCallback,
} from 'googleapis-common';
