import { IDL } from '@dfinity/candid';

export const ICPAppId = IDL.Nat;
export const ICPAnnouncementId = IDL.Nat;
export const ICPUserId = IDL.Principal;
export const ICPDeveloperId = IDL.Principal;
export const ICPTimestamp = IDL.Int;
export const ICPCategory = IDL.Text;
export const ICPAppTags = IDL.Text;
export const ICPAppStatus = IDL.Variant({
  publish: IDL.Null,
  notPublish: IDL.Null,
});

export const ICPAnnouncementStatus = IDL.Variant({
  draft: IDL.Null,
  published: IDL.Null,
  archived: IDL.Null,
});

// Handlers
export const ICPCoreError = IDL.Variant({
  InvalidInput: IDL.Text,
  NotFound: IDL.Text,
  ValidationError: IDL.Text,
  NotAuthorized: IDL.Text,
  AlreadyExists: IDL.Text,
  StorageError: IDL.Text,
  InternalError: IDL.Text,
});

export const ICPCoreResult = (ok: any) =>
  IDL.Variant({
    ok: ok,
    err: ICPCoreError,
  });
