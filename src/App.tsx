import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useScheduledAudio } from './hooks/useScheduledAudio';

const MEDITATION_AUDIOS = [
  'https://discourses.dhamma.org/oml/recordings/uuid/5432df67-d6c3-4c65-aa30-099f8226f043.mp3',
  'https://discourses.dhamma.org/oml/recordings/uuid/7abf8f8d-8ae7-4e1f-936c-9490af6e57d2.mp3',
  'https://discourses.dhamma.org/oml/recordings/uuid/0bea4e82-197c-43de-87fe-8e423a7d54e5.mp3'
];

function App() {
  const [activeListeners, setActiveListeners] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioUrl = MEDITATION_AUDIOS[Math.floor(Math.random() * MEDITATION_AUDIOS.length)];
  const scheduledTimes = ['07:00:00', '19:00:00'];
  const { nextPlayTime } = useScheduledAudio(isPlaying ? audioUrl : '', scheduledTimes);
  const audio = React.useRef(new Audio(audioUrl));

  const handleStartSit = () => {
    setIsPlaying(true);
    audio.current.play();
    setActiveListeners(prev => prev + 1);
  };

  useEffect(() => {
    const audioElement = audio.current;

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    const handleTimeUpdate = () => {
      setProgress((audioElement.currentTime / audioElement.duration) * 100);
    };

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.pause();
      audioElement.currentTime = 0;
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center gap-4 mb-6">
          <img 
            src="https://discourses.dhamma.org/assets/aniwheel-c4a3ac694dc08425d4d6f412a4c635e6d20c9688357e0ecf79e209f48bf1a94b.gif" 
            alt="Dhamma Wheel" 
            className="w-16 h-16"
          />
          <h1 className="text-2xl font-bold text-gray-800 text-center">Group Sitting</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="font-semibold text-gray-700 mb-2">
              Audio will automatically start playing daily at:
            </h2>
            <ul className="space-y-2">
              <li className="text-gray-600">• 7:00 AM</li>
              <li className="text-gray-600">• 7:00 PM</li>
            </ul>
          </div>

          {isPlaying && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatTime(duration * (progress / 100))}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleStartSit}
              disabled={isPlaying}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white 
                ${isPlaying 
                  ? 'bg-green-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isPlaying ? 'Sitting in Progress' : 'Start Sit'}
            </button>

            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span>{activeListeners} active meditators</span>
            </div>
          </div>

          {nextPlayTime && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
              <p className="font-medium">Next scheduled sit:</p>
              <p>{nextPlayTime.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;