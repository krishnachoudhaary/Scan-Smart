import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, RefreshCw, AlertCircle, Zap, ZapOff } from 'lucide-react';

interface ScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onError }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const onScanRef = useRef(onScan);

  // Keep the ref updated with the latest onScan callback
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const [cameras, setCameras] = useState<any[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const startScanner = async (cameraId?: string) => {
    if (isInitializing) return;
    setIsInitializing(true);
    setCameraError(null);
    
    try {
      // Cleanup existing instance if any
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current = null;
      }

      // Get cameras if not already fetched
      if (cameras.length === 0) {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
        }
      }

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
      ];

      const html5QrCode = new Html5Qrcode('reader', { verbose: false, formatsToSupport });
      html5QrCodeRef.current = html5QrCode;

      const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdgePercentage = 0.7; // 70%
        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
          width: Math.max(50, qrboxSize),
          height: Math.max(50, Math.floor(qrboxSize * 0.7)) // Rectangular for barcodes, min 50px
        };
      };

      const config = { 
        fps: 20, // Higher FPS for smoother mobile experience
        qrbox: qrboxFunction,
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // Camera only
      };

      const targetCamera = cameraId || (cameras.length > 0 ? cameras[currentCameraIndex].id : { facingMode: "environment" });

      await html5QrCode.start(
        targetCamera,
        config,
        (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          
          setIsScanned(true);
          onScanRef.current(decodedText);
          
          // Reset lock and success state after a short delay
          setTimeout(() => {
            isProcessingRef.current = false;
            setIsScanned(false);
          }, 3000);
        },
        (errorMessage) => {
          // Silently ignore frame errors
        }
      );

      // Check for flash capability
      try {
        const state = html5QrCode.getRunningTrackCapabilities();
        setHasFlash(!!(state as any).torch);
      } catch (e) {
        setHasFlash(false);
      }

      setIsCameraActive(true);
      setCameraError(null);
    } catch (err: any) {
      console.error("Failed to start scanner", err);
      let message = "Camera access denied or not found.";
      if (err.name === 'NotAllowedError') {
        message = "Camera permission was denied. Please allow camera access in your browser settings and try again.";
      } else if (err.name === 'NotFoundError') {
        message = "No camera found on this device.";
      } else if (err.name === 'NotReadableError') {
        message = "Camera is already in use by another application.";
      }
      setCameraError(message);
      setIsCameraActive(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const switchCamera = () => {
    if (cameras.length <= 1) return;
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    startScanner(cameras[nextIndex].id);
  };

  const toggleFlash = async () => {
    if (!html5QrCodeRef.current || !hasFlash) return;
    try {
      const newState = !isFlashOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: newState } as any]
      });
      setIsFlashOn(newState);
    } catch (err) {
      console.error("Failed to toggle flash", err);
    }
  };

  useEffect(() => {
    // Small delay to ensure the DOM element is fully rendered
    const timer = setTimeout(() => {
      startScanner();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, []); // Only run on mount

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl bg-slate-900">
      <div id="reader" className="w-full h-full"></div>
      
      {/* Overlay UI */}
      {!isCameraActive && !cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
          <RefreshCw className="animate-spin text-indigo-400" size={32} />
          <p className="text-xs font-black uppercase tracking-widest">Initializing Optics</p>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-8 text-center space-y-4">
          <AlertCircle className="text-red-500" size={48} />
          <div className="space-y-1">
            <p className="font-black text-lg">Camera Error</p>
            <p className="text-xs text-slate-400 font-medium">{cameraError}</p>
          </div>
          <button 
            onClick={() => startScanner()}
            className="px-6 py-3 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest soft-shadow active:scale-95 transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} className={isInitializing ? 'animate-spin' : ''} />
            {isInitializing ? 'Initializing...' : 'Retry Access'}
          </button>
        </div>
      )}

      {isCameraActive && (
        <>
          {/* Scanning Frame */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute inset-0 border-[40px] border-slate-900/40 transition-colors duration-300 ${isScanned ? 'bg-emerald-500/20 border-emerald-500/40' : ''}`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-[1.4/1] rounded-2xl transition-all duration-300 ${isScanned ? 'scale-110 border-4 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]' : ''}`}>
              {/* Scanning Line Animation */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,1)] animate-scan-line z-10 ${isScanned ? 'hidden' : ''}`}></div>
              
              {/* Corner Accents - Pulsing Brackets */}
              <div className="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl animate-pulse-bracket"></div>
              <div className="absolute -top-2 -right-2 w-10 h-10 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl animate-pulse-bracket"></div>
              <div className="absolute -bottom-2 -left-2 w-10 h-10 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl animate-pulse-bracket"></div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl animate-pulse-bracket"></div>
              
              {/* Mobile Instruction */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full text-center">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Hold steady for focus</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Optics Active</span>
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
              {hasFlash && (
                <button 
                  onClick={toggleFlash}
                  className={`p-2 rounded-xl transition-all active:scale-95 ${isFlashOn ? 'bg-amber-400 text-slate-900' : 'bg-white/20 text-white'}`}
                  title="Toggle Flash"
                >
                  {isFlashOn ? <Zap size={14} fill="currentColor" /> : <ZapOff size={14} />}
                </button>
              )}
              {cameras.length > 1 && (
                <button 
                  onClick={switchCamera}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all active:scale-95"
                  title="Switch Camera"
                >
                  <RefreshCw size={14} className="text-white" />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
