/**
 * Utilitas untuk mengakses kamera dengan menangani berbagai kasus error
 * @param {Object} constraints - Constraint untuk getUserMedia
 * @returns {Promise} Stream kamera jika berhasil
 */
const getCameraStream = async (constraints = { video: true, audio: false }) => {
    // Periksa apakah browser mendukung getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser Anda tidak mendukung akses kamera. Silakan gunakan browser modern seperti Chrome, Firefox, atau Edge terbaru.');
    }
  
    try {
      // Coba dapatkan akses kamera dengan constraint default
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      // Tangani berbagai jenis error
      switch (error.name) {
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          throw new Error('Tidak dapat menemukan kamera. Pastikan perangkat Anda memiliki kamera yang terhubung.');
          
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          throw new Error('Akses kamera ditolak. Silakan berikan izin untuk menggunakan kamera di pengaturan browser Anda.');
          
        case 'NotReadableError':
        case 'TrackStartError':
          throw new Error('Kamera tidak dapat diakses. Ini mungkin karena kamera sedang digunakan oleh aplikasi lain atau mengalami masalah hardware.');
          
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          // Coba lagi dengan constraint yang lebih sederhana
          console.log('Mencoba dengan constraint kamera yang lebih sederhana');
          return await navigator.mediaDevices.getUserMedia({ 
            video: {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
            }, 
            audio: false 
          });
          
        default:
          throw new Error(`Terjadi kesalahan saat mengakses kamera: ${error.message}`);
      }
    }
  };
  
  /**
   * Utilitas untuk memeriksa dukungan kamera pada browser
   * @returns {Object} Info dukungan kamera
   */
  const checkCameraSupport = () => {
    const result = {
      getUserMediaSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      videoElementSupported: !!document.createElement('video').canPlayType,
      enumerateDevicesSupported: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)
    };
    
    return result;
  };
  
  // Export fungsi jika modul mendukung export
  export { getCameraStream, checkCameraSupport };