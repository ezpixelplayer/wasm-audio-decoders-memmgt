import { DecodeError } from "@wasm-audio-decoders/common";

export interface MPEGDecodedAudio {
  channelData: Float32Array[];
  samplesDecoded: number;
  sampleRate: number;
  errors: DecodeError[];
}

import type { MPEGDecodedAudio } from "./types"; // adjust path to your actual type location

export type MPEGDecoderOptions = {
  enableGapless?: boolean;
};

export type ReserveOptions = {
  /**
   * Input buffer capacity in bytes (compressed MPEG frame/stream bytes).
   * If larger than current, the wasm-side buffers may be grown (grow-only).
   */
  inputSize?: number;

  /**
   * Output buffer capacity in Float32 samples *per channel* (or total,
   * depending on your implementation; see notes below).
   *
   * In your JS you allocate a Float32Array and pass .len to wasm read.
   * Your code then interprets the first half as L and second half as R,
   * so outputSize is currently "total floats", i.e. 2 * maxSamplesPerRead.
   */
  outputSize?: number;
};

export type ReserveResult = {
  inputSize: number;
  outputSize: number;
};

export type DecodeIntoOptions = {
  /**
   * If true, return partial output instead of throwing when output buffers are too small.
   */
  allowPartial?: boolean;

  /**
   * If false, do not collect structured errors (still may console.error).
   */
  collectErrors?: boolean;

  /**
   * If true, throw immediately on decoder error instead of collecting errors.
   */
  throwOnError?: boolean;

  /**
   * If true, reset decoder state before decoding (only if supported).
   */
  resetDecoder?: boolean;
};

export type DecodeIntoResult = {
  samplesDecoded: number;
  sampleRate: number;
  errors: MPEGDecodedAudio["errors"];
  truncated: boolean;
};

export class MPEGDecoder {
  constructor(options?: { enableGapless?: boolean });
  ready: Promise<void>;
  reset: () => Promise<void>;
  free: () => void;
  decode: (mpegData: Uint8Array) => MPEGDecodedAudio;
  decodeFrame: (mpegFrame: Uint8Array) => MPEGDecodedAudio;
  decodeFrames: (mpegFrames: Uint8Array[]) => MPEGDecodedAudio;

  /**
   * Grow-only buffer reservation to minimize realloc/memory growth churn.
   * Safe to call multiple times; buffers only grow when needed.
   */
  reserve(sizes?: ReserveOptions): ReserveResult;

  /**
   * Low-allocation API: decode into caller-provided planar Float32 buffers (L/R).
   * Returns how many samples were written to each channel.
   *
   * outL.length and outR.length define the maximum samples that can be written.
   */
  decodeInto(
    mpegData: Uint8Array,
    outL: Float32Array,
    outR: Float32Array,
    opts?: DecodeIntoOptions
  ): DecodeIntoResult;
}

export class MPEGDecoderWebWorker {
  constructor(options?: { enableGapless?: boolean });
  ready: Promise<void>;
  reset: () => Promise<void>;
  free: () => Promise<void>;
  decode: (mpegData: Uint8Array) => Promise<MPEGDecodedAudio>;
  decodeFrame: (mpegFrame: Uint8Array) => Promise<MPEGDecodedAudio>;
  decodeFrames: (mpegFrames: Uint8Array[]) => Promise<MPEGDecodedAudio>;
}

export { DecodeError };
