import { SignalKind } from '../../types';

// Context passed to every detector.
export interface DetectorContext {
  prompt: string;
  output: string;
  paragraphs: string[];
}

// A raw detection produced by a single detector before signal mapping.
// `matches` are the human-readable phrases that triggered the detection;
// they are merged when multiple rules in the same detector hit the same
// paragraph, and used by the AnnotationMapper to compose the detail string.
export interface Detection {
  kind: SignalKind;
  paragraphIndex: number;
  matches: string[];
}
