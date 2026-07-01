/**
 * Tracks frames-per-second by counting frames between periodic samples,
 * rather than recomputing 1000/delta every frame (which is noisy frame to
 * frame). `tick()` is called once per animation frame with the current
 * timestamp and returns the most recently sampled fps.
 */
export class FpsCounter {
  constructor(sampleIntervalMs = 500) {
    this.sampleIntervalMs = sampleIntervalMs;
    this.frames = 0;
    this.lastSampleTime = null;
    this.fps = 0;
  }

  tick(timestampMs) {
    if (this.lastSampleTime === null) {
      this.lastSampleTime = timestampMs;
    }

    this.frames += 1;
    const elapsed = timestampMs - this.lastSampleTime;

    if (elapsed > 0 && elapsed >= this.sampleIntervalMs) {
      this.fps = Math.round((this.frames * 1000) / elapsed);
      this.frames = 0;
      this.lastSampleTime = timestampMs;
    }

    return this.fps;
  }
}
