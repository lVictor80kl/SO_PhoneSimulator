'use client';

import React, { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Camera, Home, X, Maximize2, Minimize2, Video, StopCircle, HardDrive, Cpu, Power, Wifi, FileText, Calculator, Clock, ShoppingBag, Phone } from 'lucide-react';
import { Camera as CameraPro } from "react-camera-pro";

export default function SimpleOS() {
  const [activeApp, setActiveApp] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [capturedVideos, setCapturedVideos] = useState([]);
  const [stream, setStream] = useState(null);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactNumber, setNewContactNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [calling, setCalling] = useState(false);
  const [date, setDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemInfo, setSystemInfo] = useState({
    userAgent: '',
    platform: '',
    language: '',
    cores: 0,
    memory: {
      total: 0,
      used: 0,
    },
    storage: {
      total: 0,
      used: 0,
    },
    connection: {
      type: '',
      downlink: 0,
    },
    battery: {
      level: 0,
      charging: false,
    },
  });


  const [inCall, setInCall] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [timerTime, setTimerTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const cameraRef = useRef(null);
  const timerRef = useRef(null);

  const handleCapture = () => {
    if (cameraRef.current) {
      try {
        const photo = cameraRef.current.takePhoto();
        setCapturedImages(prev => [...prev, photo]);
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  };

  
  const handleToggleRecording = () => {
    if (!stream) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedVideos(prev => [...prev, videoUrl]);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (isRecording) {
      handleToggleRecording();
    }
  };

  const handleShutdown = () => {
    setIsShuttingDown(true);
    stopCamera();
    setTimeout(() => {
      window.close();
      alert('Por favor, cierra esta ventana manualmente');
    }, 1000);
  };

  const openApp = (appId) => {
    setActiveApp(appId);
  };

  const openChrome = () => { window.open('https://www.google.com/chrome/', '_blank'); };

  const closeApp = () => {
    setActiveApp(null);
    setIsMaximized(false);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    const updateSystemInfo = async () => {
      const nav = navigator;
      let memoryInfo = { jsHeapSizeLimit: 0, totalJSHeapSize: 0, usedJSHeapSize: 0 };
      if (performance.memory) {
        memoryInfo = performance.memory;
      }
      
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection || { type: 'unknown', downlink: 0 };
      
      let batteryInfo = { level: 0, charging: false };
      if ('getBattery' in nav) {
        const battery = await nav.getBattery();
        batteryInfo = {
          level: battery.level,
          charging: battery.charging,
        };
      }

      let storageInfo = { quota: 0, usage: 0 };
      if ('storage' in nav && 'estimate' in nav.storage) {
        storageInfo = await nav.storage.estimate();
      }

      setSystemInfo({
        userAgent: nav.userAgent,
        platform: nav.platform,
        language: nav.language,
        cores: nav.hardwareConcurrency || 'N/A',
        memory: {
          total: memoryInfo.jsHeapSizeLimit,
          used: memoryInfo.usedJSHeapSize,
        },
        storage: {
          total: storageInfo.quota,
          used: storageInfo.usage
        },
        connection: {
          type: connection.type,
          downlink: connection.downlink,
        },
        battery: batteryInfo,
      });
    };

    const interval = setInterval(updateSystemInfo, 1000);
    updateSystemInfo();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeApp === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeApp]);

  const handleCalcInput = (value) => {
    if (value === 'C') {
      setCalcDisplay('0');
    } else if (value === '=') {
      try {
        setCalcDisplay(eval(calcDisplay).toString());
      } catch (error) {
        setCalcDisplay('Error');
      }
    } else {
      setCalcDisplay(prev => prev === '0' ? value : prev + value);
    }
  };

  const startTimer = () => {
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimerTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    clearInterval(timerRef.current);
  };

  const resetTimer = () => {
    stopTimer();
    setTimerTime(0);
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);
  
  const apps = {
    camera: {
      name: 'Cámara',
      icon: <Camera className="w-6 h-6" />,
      content: (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-4">
          <div className="relative w-full max-w-2xl">
            <CameraPro
              ref={cameraRef}
              aspectRatio={16 / 9}
              errorMessages={{
                noCameraAccessible: 'No se puede acceder a la cámara',
                permissionDenied: 'Permiso denegado',
                switchCamera: 'No es posible cambiar de cámara, solo hay una cámara disponible',
                canvas: 'Canvas no soportado',
              }}
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button 
                onClick={handleCapture}
                className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 flex items-center"
              >
                <Camera className="w-4 h-4 mr-2" />
                Tomar foto
              </button>
              
              <button 
                onClick={handleToggleRecording}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRecording ? (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    Detener
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Grabar
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-8 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">Galería</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {capturedImages.map((img, index) => (
                <div key={`img-${index}`} className="relative group">
                  <img 
                    src={img} 
                    alt={`Captura ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <a 
                    href={img}
                    download={`captura-${index + 1}.jpg`}
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-lg transition-opacity"
                  >
                    Descargar
                  </a>
                </div>
              ))}
              
              {capturedVideos.map((video, index) => (
                <div key={`video-${index}`} className="relative group">
                  <video 
                    src={video} 
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                  <a 
                    href={video}
                    download={`video-${index + 1}.webm`}
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-lg transition-opacity"
                  >
                    Descargar
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    system: {
      name: 'Monitor del Sistema',
      icon: <HardDrive className="w-6 h-6" />,
      content: (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Monitor del Sistema</h2>
          
          <div className="grid gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Cpu className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-medium">Información del Sistema</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Plataforma:</span>
                  <span>{systemInfo.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span>Navegador:</span>
                  <span>{systemInfo.userAgent}</span>
                </div>
                <div className="flex justify-between">
                  <span>Idioma:</span>
                  <span>{systemInfo.language}</span>
                </div>
                <div className="flex justify-between">
                  <span>Núcleos CPU:</span>
                  <span>{systemInfo.cores}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <HardDrive className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-medium">Memoria</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total disponible</span>
                  <span>{formatBytes(systemInfo.memory.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>En uso:</span>
                  <span>{formatBytes(systemInfo.memory.used)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(systemInfo.memory.used / systemInfo.memory.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <HardDrive className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-medium">Almacenamiento</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total estimado:</span>
                  <span>{formatBytes(systemInfo.storage.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>En uso estimado:</span>
                  <span>{formatBytes(systemInfo.storage.used)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${(systemInfo.storage.used / systemInfo.storage.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Wifi className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-medium">Conexión</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span>{systemInfo.connection.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Velocidad:</span>
                  <span>{systemInfo.connection.downlink} Mbps</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Power className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-medium">Batería</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Nivel:</span>
                  <span>{(systemInfo.battery.level * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span>{systemInfo.battery.charging ? 'Cargando' : 'Descargando'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${systemInfo.battery.charging ? 'bg-yellow-400' : 'bg-green-600'}`}
                    style={{ width: `${systemInfo.battery.level * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    notes: {
      name: 'Notas',
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Notas</h2>
          <textarea
            className="w-full h-64 p-2 border rounded"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Escribe tus notas aquí..."
          />
        </div>
      )
    },
    phone: {
  name: 'Teléfono',
  icon: <Phone className="w-6 h-6" />,
  content: calling ? (
    <div className="flex flex-col items-center justify-center h-full">
      <Phone className="w-12 h-12 mb-4 animate-pulse text-green-500" />
      <h2 className="text-xl font-bold mb-4">Llamando...</h2>
      <p className="mb-4">Número: {phoneNumber}</p>
      <div className="flex space-x-4">
        <button
          onClick={() => setCalling(false)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Finalizar Llamada
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col p-4">
      <h2 className="text-xl font-bold mb-4">Añadir Contacto</h2>
      <input 
        type="text" 
        placeholder="Nombre" 
        value={newContactName}
        onChange={(e) => setNewContactName(e.target.value)}
        className="p-2 border rounded-lg mb-2 w-full"
      />
      <input 
        type="tel" 
        placeholder="Número" 
        value={newContactNumber}
        onChange={(e) => setNewContactNumber(e.target.value)}
        className="p-2 border rounded-lg mb-2 w-full"
      />
      <button 
        onClick={() => {
          setContacts([...contacts, { name: newContactName, number: newContactNumber }]);
          setNewContactName('');
          setNewContactNumber('');
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
      >
        Añadir Contacto
      </button>
      <input 
        type="tel" 
        placeholder="Ingrese número..." 
        className="p-2 border rounded-lg mb-4"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(num => (
          <button key={num} className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200">
            {num}
          </button>
        ))}
      </div>
      <button 
        onClick={() => setCalling(true)}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Llamar
      </button>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Contactos</h2>
        {contacts.map((contact, index) => (
          <div key={index} className="flex justify-between items-center mb-2 p-2 border rounded-lg">
            <span>{contact.name} - {contact.number}</span>
            <button 
              onClick={() => {
                setPhoneNumber(contact.number);
                setCalling(true);
              }}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Llamar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
},

    shopping: {
      name: 'Tienda',
      icon: <ShoppingBag className="w-6 h-6" />,
      content: (
        <div className="flex flex-col items-center justify-center h-full">
          <ShoppingBag size={48} />
          <h2 className="text-xl mt-4">Tienda Online</h2>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <a href="https://amazon.com" target="_blank" className="p-4 bg-yellow-100 rounded-lg text-center">
              Amazon
            </a>
            <a href="https://ebay.com" target="_blank" className="p-4 bg-blue-100 rounded-lg text-center">
              eBay
            </a>
          </div>
        </div>
      )
    },
    calendar: {
      name: 'Calendario',
      icon: <Clock className="w-6 h-6" />,
      content: (
        <div className="flex flex-col justify-center items-center h-full p-4">
          <Calendar
            onChange={setDate}
            value={date}
            className="shadow-lg rounded-lg"
          />
          <div className="mt-4 text-center text-2xl font-bold text-gray-800 bg-white p-2 rounded-lg shadow">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    
    
    calculator: {
      name: 'Calculadora',
      icon: <Calculator className="w-6 h-6" />,
      content: (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Calculadora</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="bg-white p-2 text-right text-2xl mb-4 rounded">{calcDisplay}</div>
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcInput(btn)}
                  className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    timer: {
      name: 'Temporizador',
      icon: <Clock className="w-6 h-6" />,
      content: (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Temporizador</h2>
          <div className="text-center">
            <div className="text-6xl font-bold mb-6">{formatTime(timerTime)}</div>
            <div className="space-x-4">
              {!timerRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Detener
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )
    }
  };
  <div className="p-4">
  <h2 className="text-xl font-bold mb-4">Añadir Contacto</h2>
  <input 
    type="text" 
    placeholder="Nombre" 
    value={newContactName}
    onChange={(e) => setNewContactName(e.target.value)}
    className="p-2 border rounded-lg mb-2 w-full"
  />
  <input 
    type="tel" 
    placeholder="Número" 
    value={newContactNumber}
    onChange={(e) => setNewContactNumber(e.target.value)}
    className="p-2 border rounded-lg mb-2 w-full"
  />
  <button 
    onClick={() => {
      setContacts([...contacts, { name: newContactName, number: newContactNumber }]);
      setNewContactName('');
      setNewContactNumber('');
    }}
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    Añadir Contacto
  </button>
</div>

  if (isShuttingDown) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <Power className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl">Apagando el sistema...</h2>
        </div>
      </div>
    );
  }

  
  return (
    <div className="bg-custom-image bg-cover bg-center min-h-screen flex items-center justify-center">
      {isShuttingDown ? (
        <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
          <div className="text-center">
            <Power className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl">Apagando el sistema...</h2>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-black p-4 rounded-2xl shadow-lg w-80 h-[800px] flex flex-col items-center">
            <div className="bg-gray-700 h-4 w-16 rounded-t-2xl mt-2"></div>
            <div className="bg-white rounded-b-2xl overflow-hidden flex flex-col justify-between flex-grow w-full mt-2">
              <div className="text-center text-black text-3xl font-bold bg-gray-800 bg-opacity-50 p-2 rounded-lg m-2">
                myso VictorMarcano
              </div>
              <div className="flex flex-col items-center space-y-4 p-4">
                {Object.entries(apps).map(([id, app]) => (
                  <button
                    key={id}
                    onClick={() => openApp(id)}
                    className={`flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg ${
                      activeApp === id ? 'bg-gray-700' : 'bg-gray-800'
                    } text-white w-full`}
                  >
                    {app.icon}
                    <span>{app.name}</span>
                  </button>
                ))}
                <button
                  onClick={() => window.open('https://www.google.com', '_blank')}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg bg-gray-800 text-white w-full"
                >
                  <svg 
                    className="w-6 h-6"
                    fill="#FFFFFF"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8c0 4.41-3.59 8-8 8zM12 4C8.69 4 6 6.69 6 10c0 .93.16 1.82.46 2.65L10.5 11V6.11C11.34 5.66 12.5 5.8 13.16 6.46C13.82 7.12 13.96 8.28 13.5 9.11L8.39 14.39C9.21 16.23 10.99 17.5 13 17.91V13h-1v-2h6v2h-1v5.5c-2.38-.34-4.48-2.43-5-5H12z" />
                  </svg>
                  <span>Navegador</span>
                </button>
              </div>
              <div className="bg-gray-800 text-white p-2 flex justify-center">
                <button
                  onClick={handleShutdown}
                  className="p-2 hover:bg-red-600 rounded-lg"
                  title="Apagar sistema"
                >
                  <Power className="w-6 h-6" />
                </button>
              </div>
      
              {activeApp && (
                <div className={`fixed inset-0 bg-white rounded-lg shadow-xl overflow-hidden m-4`}>
                  <div className="bg-gray-200 p-2 flex justify-between items-center">
                    <span className="font-medium">{apps[activeApp].name}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={toggleMaximize}
                        className="p-1 hover:bg-gray-300 rounded"
                      >
                        {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={closeApp}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-full overflow-auto p-4">
                    {apps[activeApp].content}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
  
  
}  