import React from "react";
import "./LyricResult.css"; // Styling for the LyricResult component

interface LyricResultProps {
  lyric: string;
  distance: number;
  lyric_id: string;
  song_name: string;
  song_url: string;
}

const LyricResult: React.FC<LyricResultProps> = ({
  lyric,
  distance,
  song_name,
  song_url,
}) => {
  // score is 1-distance * 100 rounded to 2 decimal places
  //   const score = ((1 - distance) * 100).toFixed(2);
  return (
    <div className="lyric-result">
      <a href={song_url} target="_blank" rel="noreferrer">
        <div className="name">{song_name}</div>
      </a>
      <p className="lyric">{lyric}</p>
      <div className="score">Distance: {distance}</div>
    </div>
  );
};

export default LyricResult;
