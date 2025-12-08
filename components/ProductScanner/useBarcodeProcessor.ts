import { useFrameProcessor } from 'react-native-vision-camera';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { Worklets } from 'react-native-worklets-core';

export const useBarcodeProcessor = (onBarcode: (value: string) => void) =>
  useFrameProcessor((frame) => {
    'worklet';
    const barcodes = scanBarcodes(frame, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.QR_CODE,
    ]);

    if (barcodes.length > 0) {
      const value = barcodes[0]?.displayValue ?? barcodes[0]?.rawValue ?? '';
      if (value) {
        // pass a zero-arg function; capture value in the closure
        Worklets.runOnJS(() => onBarcode(value));
      }
    }
  }, []);
