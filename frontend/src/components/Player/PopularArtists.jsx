import React from "react";
import { useDataFetching } from "../../hooks/useDataFetching";
import api from "../../services/api";
import { useCallback } from "react";

const transformJamendoArtist = (artist) => ({
  id: artist.id,
  name: artist.name,
  image:
    artist.image && artist.image.trim() !== ""
      ? artist.image
      : `https://usercontent.jamendo.com?type=artist&id=${artist.id}&width=300`,
  followerCount: artist.sharecount || 0,
});

const PopularArtists = ({ cardsPerSet = 5 }) => {
  const [visibleArtists, setVisibleArtists] = useState(0);

  // Use the custom hook for data fetching with caching and retry
  const handleArtistClick = useCallback((artist) => {
    window.scrollTo(0, 0);
    navigate(`/artist/${artist.id}`);
  }, []);

  const {
    data: artists,
    loading: loadingArtists,
    error: artistsError,
    retry: retryArtists,
  } = useDataFetching(() => api.getTopArtists({ limit: 20 }), "top-artists");

  const artistsData = artists ? artists.map(transformJamendoArtist) : [];

  return artistsData.length ? (
    <div className="flex flex-col mb-10 w-full">
      <div className="flex flex-row w-full mb-4 items-center">
        <p className="text-3xl font-extrabold">Popular Artists</p>
        <div className="ml-auto flex gap-2 items-center">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate("/artists");
            }}
            className="bg-transparent hover:bg-[#212121] py-2 px-4 rounded-full border border-neutral-800 text-sm"
          >
            More
          </button>
          <button
            onClick={() => handlePrevious(setVisibleArtists, visibleArtists)}
            className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() =>
              handleNext(setVisibleArtists, visibleArtists, artistsData.length)
            }
            className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
      <div className="flex flex-row bg-transparent h-[16rem] w-full gap-4">
        {artistsData
          .slice(visibleArtists, visibleArtists + cardsPerSet)
          .map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={handleArtistClick}
              truncateTitle={truncateTitle}
            />
          ))}
      </div>
    </div>
  ) : (
    <div>
      <p>error</p>
    </div>
  );
};

export default PopularArtists;
