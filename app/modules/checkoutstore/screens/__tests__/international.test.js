import { get } from 'svelte/store';
import {
  selectedInternationalProvider,
  NVSFormData,
  NVSEntities,
  isNVSFormHomeScreenView,
  updateSelectedProvider,
  setNVSFormData,
  updateNVSEntities,
  setIsNVSFormHomeScreenView,
  resetNVSEntities,
  resetNVSFormData,
} from '../international';

describe('Test International stores', () => {
  test('should return blank string for selectedInternationalProvider', () => {
    expect(get(selectedInternationalProvider)).toStrictEqual('');
  });
  test('should return null for NVSFormData', () => {
    expect(get(NVSFormData)).toStrictEqual(null);
  });
  test('should return null for NVSEntities', () => {
    expect(get(NVSEntities)).toStrictEqual(null);
  });
  test('should return false for isNVSFormHomeScreenView', () => {
    expect(get(isNVSFormHomeScreenView)).toStrictEqual(false);
  });
  test('should update selected Provider', () => {
    updateSelectedProvider('a');
    expect(get(selectedInternationalProvider)).toStrictEqual('a');
  });
  test('should set NVSFormData', () => {
    setNVSFormData({ a: 1, b: 2 });
    expect(get(NVSFormData)).toStrictEqual({ a: 1, b: 2 });
  });
  test('should update NVSEntities', () => {
    updateNVSEntities('abc');
    expect(get(NVSEntities)).toStrictEqual({ abc: true });
  });
  test('should set isNVSFromHomeScreenView', () => {
    setIsNVSFormHomeScreenView(true);
    expect(get(isNVSFormHomeScreenView)).toStrictEqual(true);
  });
  test('should reset NVSEntities', () => {
    resetNVSEntities();
    expect(get(NVSEntities)).toStrictEqual(null);
  });
  test('should reset NVSFormData', () => {
    resetNVSFormData();
    expect(get(NVSFormData)).toStrictEqual(null);
  });
});
