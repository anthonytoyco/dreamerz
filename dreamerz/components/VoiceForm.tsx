'use client';

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
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

export default function VoiceForm() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const toggleRecord = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
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
                <Button
                  type="button"
                  variant={listening ? 'destructive' : 'default'}
                  className="rounded-full size-12"
                  onClick={toggleRecord}>
                  <Mic
                    className={`size-5 ${listening ? 'animate-pulse' : ''}`}
                  />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Status: {listening ? 'Listening...' : 'Idle'}
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
