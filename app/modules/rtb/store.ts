import { writable } from 'svelte/store';
import type { RTBExperiment as RTBExperimentType } from 'rtb/types/rtb';
import type { EmptyObject } from 'types';

export const RTBExperiment = writable<RTBExperimentType | EmptyObject>({});
