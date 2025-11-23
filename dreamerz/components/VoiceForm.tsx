'use client';

import { useState } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import dynamic from 'next/dynamic';
const LiveAudioVisualizer = dynamic(
  () => import('react-audio-visualize').then((mod) => mod.LiveAudioVisualizer),
  { ssr: false }
);
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { AudioLines, Mic } from 'lucide-react';

export default function VoiceForm() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startRecording = async () => {
    try {
      const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(audio);

      const recorder = new MediaRecorder(audio);
      setMediaRecorder(recorder);

      recorder.start();
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    } catch (error: unknown) {
      console.error('Error accessing microphone: ', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    SpeechRecognition.stopListening();

    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
    setMediaRecorder(null);
    resetTranscript();
    console.log('Final Transcript:', transcript);
  };

  const handleToggleRecord = () => {
    if (listening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            aria-label="voice-record"
            variant="outline"
            className="rounded-full">
            <AudioLines />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Dream Audio</DialogTitle>
            <DialogDescription>
              Record your dream via audio. Click the microphone when you are
              ready to start recording.
            </DialogDescription>
          </DialogHeader>
          {!browserSupportsSpeechRecognition ? (
            <Invalid />
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                {mediaRecorder && listening && (
                  <LiveAudioVisualizer
                    mediaRecorder={mediaRecorder}
                    width={200}
                    height={75}
                  />
                )}
                <Button
                  type="button"
                  variant={listening ? 'destructive' : 'default'}
                  className="rounded-full size-12"
                  onClick={handleToggleRecord}
                  disabled={!browserSupportsSpeechRecognition}>
                  <Mic
                    className={`size-5 ${listening ? 'animate-pulse' : ''}`}
                  />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Status: {listening ? 'Listenig...' : 'Idle'}
                </span>
                <p className="text-center p-2 text-sm border rounded-md  w-full">
                  {transcript || 'Start speaking to see the transcription.'}
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit">Save Recording</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </form>
    </Dialog>
  );
}

function Invalid() {
  return (
    <div className="flex items-center justify-center">
      <p>Unfortunately, your browser does not support speech recognition</p>
    </div>
  );
}
