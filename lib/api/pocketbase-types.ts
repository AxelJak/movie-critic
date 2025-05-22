/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from "pocketbase";
import type { RecordService } from "pocketbase";

export enum Collections {
  Authorigins = "_authOrigins",
  Externalauths = "_externalAuths",
  Mfas = "_mfas",
  Otps = "_otps",
  Superusers = "_superusers",
  CastMembers = "cast_members",
  Movies = "movies",
  Reviews = "reviews",
  Users = "users",
  WatchlistMovies = "watchlist_movies",
  Watchlists = "watchlists",
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

type ExpandType<T> = unknown extends T
  ? T extends unknown
    ? { expand?: unknown }
    : { expand: T }
  : { expand: T };

// System fields
export type BaseSystemFields<T = unknown> = {
  id: RecordIdString;
  collectionId: string;
  collectionName: Collections;
} & ExpandType<T>;

export type AuthSystemFields<T = unknown> = {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type AuthoriginsRecord = {
  collectionRef: string;
  created?: IsoDateString;
  fingerprint: string;
  id: string;
  recordRef: string;
  updated?: IsoDateString;
};

export type ExternalauthsRecord = {
  collectionRef: string;
  created?: IsoDateString;
  id: string;
  provider: string;
  providerId: string;
  recordRef: string;
  updated?: IsoDateString;
};

export type MfasRecord = {
  collectionRef: string;
  created?: IsoDateString;
  id: string;
  method: string;
  recordRef: string;
  updated?: IsoDateString;
};

export type OtpsRecord = {
  collectionRef: string;
  created?: IsoDateString;
  id: string;
  password: string;
  recordRef: string;
  sentTo?: string;
  updated?: IsoDateString;
};

export type SuperusersRecord = {
  created?: IsoDateString;
  email: string;
  emailVisibility?: boolean;
  id: string;
  password: string;
  tokenKey: string;
  updated?: IsoDateString;
  verified?: boolean;
};

export type CastMembersRecord = {
  character?: string;
  created?: IsoDateString;
  id: string;
  movie?: RecordIdString;
  name?: string;
  order?: number;
  profile_path?: string;
  tmdb_id?: number;
  updated?: IsoDateString;
};

export type MoviesRecord<Tgenres = unknown> = {
  backdrop_path?: string;
  created?: IsoDateString;
  director?: string;
  genres?: null | Tgenres;
  id: string;
  last_synced?: IsoDateString;
  original_title?: string;
  overview?: string;
  poster_path?: string;
  release_date?: IsoDateString;
  runtime?: number;
  title: string;
  tmdb_id: number;
  tmdb_rating?: number;
  updated?: IsoDateString;
};

export type MovieGenresRecord = {
  id: string;
  name: string;
};

export type ReviewsRecord = {
  contains_spoilers?: boolean;
  content?: string;
  created?: IsoDateString;
  id: string;
  movie?: RecordIdString;
  rating?: number;
  title?: string;
  updated?: IsoDateString;
  user?: RecordIdString;
};

export type UsersRecord = {
  avatar?: string;
  created?: IsoDateString;
  email: string;
  emailVisibility?: boolean;
  id: string;
  name?: string;
  password: string;
  tokenKey: string;
  updated?: IsoDateString;
  verified?: boolean;
};

export type WatchlistMoviesRecord = {
  created?: IsoDateString;
  id: string;
  movie?: RecordIdString;
  notes?: string;
  updated?: IsoDateString;
  watchlist?: RecordIdString;
};

export type WatchlistsRecord = {
  created?: IsoDateString;
  description?: string;
  id: string;
  is_public?: boolean;
  name?: string;
  updated?: IsoDateString;
  user?: RecordIdString;
};

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> =
  Required<AuthoriginsRecord> & BaseSystemFields<Texpand>;
export type ExternalauthsResponse<Texpand = unknown> =
  Required<ExternalauthsRecord> & BaseSystemFields<Texpand>;
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> &
  BaseSystemFields<Texpand>;
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> &
  BaseSystemFields<Texpand>;
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> &
  AuthSystemFields<Texpand>;
export type CastMembersResponse<Texpand = unknown> =
  Required<CastMembersRecord> & BaseSystemFields<Texpand>;
export type MoviesResponse<Tgenres = unknown, Texpand = unknown> = Required<
  MoviesRecord<Tgenres>
> &
  BaseSystemFields<Texpand>;
export type ReviewsResponse<Texpand = unknown> = Required<ReviewsRecord> &
  BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> &
  AuthSystemFields<Texpand>;
export type WatchlistMoviesResponse<Texpand = unknown> =
  Required<WatchlistMoviesRecord> & BaseSystemFields<Texpand>;
export type WatchlistsResponse<Texpand = unknown> = Required<WatchlistsRecord> &
  BaseSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  _authOrigins: AuthoriginsRecord;
  _externalAuths: ExternalauthsRecord;
  _mfas: MfasRecord;
  _otps: OtpsRecord;
  _superusers: SuperusersRecord;
  cast_members: CastMembersRecord;
  movies: MoviesRecord;
  reviews: ReviewsRecord;
  users: UsersRecord;
  watchlist_movies: WatchlistMoviesRecord;
  watchlists: WatchlistsRecord;
};

export type CollectionResponses = {
  _authOrigins: AuthoriginsResponse;
  _externalAuths: ExternalauthsResponse;
  _mfas: MfasResponse;
  _otps: OtpsResponse;
  _superusers: SuperusersResponse;
  cast_members: CastMembersResponse;
  movies: MoviesResponse;
  reviews: ReviewsResponse;
  users: UsersResponse;
  watchlist_movies: WatchlistMoviesResponse;
  watchlists: WatchlistsResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: "_authOrigins"): RecordService<AuthoriginsResponse>;
  collection(idOrName: "_externalAuths"): RecordService<ExternalauthsResponse>;
  collection(idOrName: "_mfas"): RecordService<MfasResponse>;
  collection(idOrName: "_otps"): RecordService<OtpsResponse>;
  collection(idOrName: "_superusers"): RecordService<SuperusersResponse>;
  collection(idOrName: "cast_members"): RecordService<CastMembersResponse>;
  collection(idOrName: "movies"): RecordService<MoviesResponse>;
  collection(idOrName: "reviews"): RecordService<ReviewsResponse>;
  collection(idOrName: "users"): RecordService<UsersResponse>;
  collection(
    idOrName: "watchlist_movies",
  ): RecordService<WatchlistMoviesResponse>;
  collection(idOrName: "watchlists"): RecordService<WatchlistsResponse>;
};
