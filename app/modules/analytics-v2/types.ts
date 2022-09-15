import type { ContextProperties } from './constants';

type ContextKeys = keyof typeof ContextProperties;
export type ContextValues = typeof ContextProperties[ContextKeys];
