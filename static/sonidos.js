// Sonidos personalizables para la aplicación
window.AppSonidos = {
    // Sonido de éxito para mover tareas
    tareaMovida: () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Melodía de éxito ascendente
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('🔇 Audio no disponible');
        }
    },

    // Sonido de tarea completada
    tareaCompletada: () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Melodía de completado
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime); // E
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.1); // G
            oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.2); // C alto
            oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.3); // C alto
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('🔇 Audio no disponible');
        }
    },

    // Sonido de error
    error: () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Sonido de error descendente
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('🔇 Audio no disponible');
        }
    },

    // Deshabilitar todos los sonidos
    silenciar: () => {
        window.AppSonidos.habilitado = false;
        console.log('🔇 Sonidos deshabilitados');
    },

    // Habilitar sonidos
    habilitar: () => {
        window.AppSonidos.habilitado = true;
        console.log('🔊 Sonidos habilitados');
    },

    habilitado: true
}; 