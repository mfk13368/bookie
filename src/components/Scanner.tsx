"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

export default function Scanner({ onScanSuccess, onScanFailure }: ScannerProps) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const scannerId = "reader";
    
    // Create instance
    html5QrCodeRef.current = new Html5Qrcode(scannerId);

    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    const startScanner = async () => {
        if (!html5QrCodeRef.current) return;
        
        try {
            // Check state to prevent "already under transition" error
            // Using numeric values if enums are problematic or mismatched
            // 1 is usually IDLE/UNKNOWN in some versions, but we can also just try-catch the start
            const state = html5QrCodeRef.current.getState();
            if (state !== 1) { // 1 = Html5QrcodeScannerState.IDLE
                // If not idle, it might be scanning or transitioning
                return;
            }

            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0 && isMounted.current) {
                const cameraId = devices.length > 1 ? devices[devices.length - 1].id : devices[0].id;
                
                await html5QrCodeRef.current.start(
                    cameraId,
                    config,
                    (decodedText) => {
                        if (isMounted.current && html5QrCodeRef.current?.isScanning) {
                            html5QrCodeRef.current.stop().then(() => {
                                onScanSuccess(decodedText);
                            }).catch(() => {
                                onScanSuccess(decodedText);
                            });
                        }
                    },
                    onScanFailure
                );
            }
        } catch (err) {
            // Log but don't crash, often just a race condition
            console.warn("Scanner start attempt:", err);
        }
    };

    // Small delay to ensure previous instance is fully cleaned up
    const timeoutId = setTimeout(startScanner, 200);

    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
      if (html5QrCodeRef.current) {
          if (html5QrCodeRef.current.isScanning) {
              html5QrCodeRef.current.stop().catch(() => {});
          }
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="reader" className="overflow-hidden rounded-lg shadow-lg bg-black min-h-[250px] relative"></div>
      <style jsx global>{`
        #reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
        #reader {
            border: none !important;
        }
      `}</style>
    </div>
  );
}
