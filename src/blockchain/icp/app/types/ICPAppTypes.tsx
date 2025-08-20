import { IDL as IDLNS } from "@dfinity/candid";
import {
  ICPAppId,
  ICPAppStatus,
  ICPAppTags,
  ICPCategory,
  ICPDeveloperId,
  ICPTimestamp,
  ICPUserId,
} from "../../utils/ICPTypesCore";
type CandidIDL = typeof IDLNS;

export const ICPAppTypes = (IDL: CandidIDL) => {
  const AppRating = IDL.Record({
    userPrincipalId: ICPUserId,
    rating: IDL.Nat,
    comment: IDL.Text,
    createdAt: ICPTimestamp,
  });

  const Manifest = IDL.Record({
    version: IDL.Text, // ex: "1.0.3"
    size: IDL.Float64, // MB/GB
    bucket: IDL.Text, // Storage
    basePath: IDL.Text, // folder/path
    checksum: IDL.Text, // integrity (ex: sha256)
    content: IDL.Text, // payload/listing file
    createdAt: ICPTimestamp,
  });

  const OS = IDL.Variant({
    windows: IDL.Null,
    macos: IDL.Null,
    linux: IDL.Null,
  });

  const NativeBuild = IDL.Record({
    os: OS, // #windows | #macos | #linux
    manifests: IDL.Vec(Manifest),
    processor: IDL.Text,
    memory: IDL.Nat, // in MB/GB
    storage: IDL.Nat, // in MB/GB
    graphics: IDL.Text,
    additionalNotes: IDL.Opt(IDL.Text),
  });

  const WebBuild = IDL.Record({
    url: IDL.Text, // ex: https://game.example/play
  });

  const Distribution = IDL.Variant({
    web: WebBuild,
    native: NativeBuild,
  });

  const Media = IDL.Variant({
    image: IDL.Null,
    video: IDL.Null,
  });

  const Preview = IDL.Record({
    kind: Media,
    url: IDL.Text,
  });

  // =========================
  // App
  // =========================
  const App = IDL.Record({
    appId: ICPAppId,
    developerId: ICPDeveloperId,
    title: IDL.Text,
    description: IDL.Text,
    coverImage: IDL.Opt(IDL.Text),
    bannerImage: IDL.Opt(IDL.Text),
    previews: IDL.Opt(IDL.Vec(Preview)),
    price: IDL.Opt(IDL.Nat),
    requiredAge: IDL.Opt(IDL.Nat),
    releaseDate: IDL.Opt(ICPTimestamp),
    status: ICPAppStatus,
    createdAt: ICPTimestamp,
    category: IDL.Opt(IDL.Vec(ICPCategory)),
    appTags: IDL.Opt(IDL.Vec(ICPAppTags)),
    distributions: IDL.Opt(IDL.Vec(Distribution)),
    appRatings: IDL.Opt(IDL.Vec(AppRating)),
  });

  // =========================
  // DTO
  // =========================
  const CreateApp = IDL.Record({
    title: IDL.Text,
    description: IDL.Text,
  });

  const UpdateApp = IDL.Record({
    title: IDL.Text,
    description: IDL.Text,
    bannerImage: IDL.Opt(IDL.Text),
    coverImage: IDL.Opt(IDL.Text),
    previews: IDL.Opt(IDL.Vec(Preview)),
    price: IDL.Opt(IDL.Nat),
    requiredAge: IDL.Opt(IDL.Nat),
    releaseDate: IDL.Opt(ICPTimestamp),
    status: ICPAppStatus,
    category: IDL.Opt(IDL.Vec(ICPCategory)),
    appTags: IDL.Opt(IDL.Vec(ICPAppTags)),
    distributions: IDL.Opt(IDL.Vec(Distribution)),
  });

  return {
    App,
    CreateApp,
    UpdateApp,
  };
};
