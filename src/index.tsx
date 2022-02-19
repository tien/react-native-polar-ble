import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

export type PolarDeviceInfo = {
  deviceId: string;
  address: string;
  rssi: number;
  name: string;
  isConnectable: boolean;
};

export type HeartRate = {
  hr: number;
  rrs: number[];
  rrsMs: number[];
  rrAvailable: number[];
};

export type PolarDevice = PolarDeviceInfo & {
  state: 'connecting' | 'connected' | 'disconnected';
  batteryLevel?: number;
  hrFeatureReady?: boolean;
  ftpFeatureReady?: boolean;
  streamingFeatures?: number[];
  heartRate?: HeartRate;
  dis?: {
    uuid: string;
    value: string;
  };
};

const LINKING_ERROR =
  `The package 'react-native-polar-ble' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const PolarBle = NativeModules.PolarBle
  ? NativeModules.PolarBle
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const {
  DEVICE_CONNECTING,
  DEVICE_CONNECTED,
  DEVICE_DISCONNECTED,
  BATTERY_LEVEL_RECEIVED,
  DIS_INFORMATION_RECEIVED,
  BLE_POWER_ON,
  BLE_POWER_OFF,
  HR_FEATURE_READY,
  FTP_FEATURE_READY,
  STREAMING_FEATURES_READY,
  HR_VALUE_RECEIVED,
} = PolarBle.getConstants();

export const PolarBleEventEmitter = new NativeEventEmitter(PolarBle);

export const usePolarBle = () => {
  const [devices, setDevices] = useState<Record<string, PolarDevice>>({});
  const [blePoweredOn, setBlePoweredOn] = useState<boolean | undefined>();

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(
        DEVICE_CONNECTING,
        (deviceInfo: PolarDeviceInfo) =>
          setDevices((x) => ({
            ...x,
            [deviceInfo.deviceId]: { ...deviceInfo, state: 'connecting' },
          }))
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(
        DEVICE_CONNECTED,
        (deviceInfo: PolarDeviceInfo) =>
          setDevices((x) => ({
            ...x,
            [deviceInfo.deviceId]: { ...deviceInfo, state: 'connected' },
          }))
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(
        DEVICE_DISCONNECTED,
        (deviceInfo: PolarDeviceInfo) =>
          setDevices((x) => ({
            ...x,
            [deviceInfo.deviceId]: { ...deviceInfo, state: 'disconnected' },
          }))
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(
        BATTERY_LEVEL_RECEIVED,
        (data: { identifier: string; level: number }) =>
          setDevices((x) => ({
            ...x,
            [data.identifier]: {
              ...x[data.identifier],
              batteryLevel: data.level,
            },
          }))
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(
        DIS_INFORMATION_RECEIVED,
        (data: { identifier: string; uuid: string; value: string }) =>
          setDevices((x) => ({
            ...x,
            [data.identifier]: {
              ...x[data.identifier],
              dis: { uuid: data.uuid, value: data.value },
            },
          }))
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(BLE_POWER_ON, () =>
        setBlePoweredOn(true)
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(BLE_POWER_OFF, () =>
        setBlePoweredOn(false)
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(HR_FEATURE_READY, (identifier: string) =>
        setDevices((x) => ({
          ...x,
          [identifier]: {
            ...x[identifier],
            hrFeatureReady: true,
          },
        }))
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(
        FTP_FEATURE_READY,
        (identifier: string) =>
          setDevices((x) => ({
            ...x,
            [identifier]: {
              ...x[identifier],
              ftpFeatureReady: true,
            },
          }))
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(
        STREAMING_FEATURES_READY,
        (data: { identifier: string; features: number[] }) =>
          setDevices((x) => ({
            ...x,
            [data.identifier]: {
              ...x[data.identifier],
              streamingFeatures: data.features,
            },
          }))
      ).remove,
    []
  );

  useEffect(
    () =>
      PolarBleEventEmitter.addListener(
        HR_VALUE_RECEIVED,
        (data: { identifier: string; data: HeartRate }) =>
          setDevices((x) => ({
            ...x,
            [data.identifier]: {
              ...x[data.identifier],
              heartRate: data.data,
            },
          }))
      ).remove,
    []
  );

  return { devices, blePoweredOn };
};
