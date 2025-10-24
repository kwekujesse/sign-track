
'use client';

import { useZxing } from 'react-zxing';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: any) => void;
}

export const BarcodeScanner = ({ onScan, onError }: BarcodeScannerProps) => {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText());
    },
    onError,
  });

  return <video ref={ref} className="w-full" />;
};
