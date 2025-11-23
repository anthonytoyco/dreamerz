import { useState, useEffect } from 'react';

let recognition: SpeechRecognition | null = null;

if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
}

const useSpeechRecognition = () => {
  const [text, setText] = useState<string>('');
  const [listening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('onresult event:', event);
      setText(event.results[0][0].transcript);
      recognition.stop();
      setIsListening(false);
    };
  }, []);

  const startListening = () => {
    setText('');
    setIsListening(true);
    recognition?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognition?.stop();
  };

  return {
    text,
    listening,
    startListening,
    stopListening,
    hasSupport: !!recognition,
  };
};

export default useSpeechRecognition;
