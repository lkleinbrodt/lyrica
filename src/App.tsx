import { useState } from "react";
import LyricResult from "./components/LyricResult"; // Import the LyricResult component
import "./App.css";
import axiosInstance from "./utils/axiosInstance";

function App() {
  const [query, setQuery] = useState<string>("");
  const [artistName, setArtistName] = useState<string>("");
  const [artistID, setArtistID] = useState<string>("");
  const [lyrics, setLyrics] = useState<
    {
      lyric: {
        text: string;
        song_name: string;
        song_url: string;
      };
      distance: number;
      lyric_id: string;
      song_name: string;
      song_url: string;
    }[]
  >([]);
  const [nSongs, setNSongs] = useState<number>(0);
  const [working, setWorking] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSearch = async () => {
    if (!query) {
      setError("Please enter an artist");
      return;
    }
    console.log("Searching for artist:", query);
    const id = await searchArtist();
    console.log("Artist ID:", id);
    if (!id) return;
    await getLyrics(id);
  };

  const searchArtist = async () => {
    console.log("Searching for:", query);
    setWorking(true);
    setLyrics([]);
    setNSongs(0);
    setArtistID("");
    setArtistName("");

    let id = "";

    try {
      const response = await axiosInstance
        .get(`search-artist/${query}`)
        .then((response) => {
          console.log("response:", response);
          return response;
        });

      if (!response.data) return;

      setArtistID(response.data.id);
      setArtistName(response.data.name);
      setError("");
      id = response.data.id;
      console.log("got artist id:", id);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Couldn't find artist");
    } finally {
      setWorking(false);
      return id;
    }
  };

  const getLyrics = async (id: string) => {
    console.log("Getting lyrics for:", artistID);
    setWorking(true);
    setLyrics([]);
    setNSongs(0);

    try {
      const response = await fetch(
        "http://127.0.0.1:5002/lyrica/get-top-lyrics",
        {
          method: "POST",
          body: JSON.stringify({ artist_id: id }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let decoder = new TextDecoderStream();
      console.log(response.body);
      if (!response.body) return;
      if (!response.ok) {
        setError("Failed to fetch data");
        return;
      }

      //check for 500 error
      if (response.status === 500) {
        setError("Internal server error");
        return;
      }

      const reader = response.body.pipeThrough(decoder).getReader();

      while (true) {
        var { value, done } = await reader.read();
        if (done) break;
        if (value === undefined) continue;
        let data;
        try {
          data = JSON.parse(value);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          setError("Failed to parse data");
          setWorking(false);
          return;
        } finally {
          setNSongs(data.n_songs);
          setLyrics(data.top_lyrics);
          setError("");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data");
    } finally {
      console.log("Done fetching data");
      setWorking(false);
    }
  };

  return (
    <div className="app-container">
      <div className="main-container">
        <div className="header-container">
          <h1 className="header">Enter an artist:</h1>
        </div>
        <div className="search-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            id="searchInput"
          />
          <button id="searchButton" onClick={handleSearch}>
            Search
          </button>
        </div>
        {working && (
          <div className="loading-animation">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        )}
        {error && <p className="error">{error}</p>}

        {artistName && <p className="artistHeader">Artist: {artistName}</p>}

        {nSongs !== 0 && <p>Number of songs analyzed: {nSongs}</p>}
        <ul>
          {lyrics.map((lyric, index) => (
            <LyricResult
              key={index}
              lyric={lyric.lyric.text}
              distance={lyric.distance}
              lyric_id={lyric.lyric_id}
              song_name={lyric.lyric.song_name}
              song_url={lyric.lyric.song_url}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
