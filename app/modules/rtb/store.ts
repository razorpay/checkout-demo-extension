import type { RTB } from 'rtb/types/rtb';
import { writable } from 'svelte/store';
import type { EmptyObject } from 'types';

export const RTBExperiment = writable<RTB.RTBExperiment | EmptyObject>({});
