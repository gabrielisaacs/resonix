import { useDataFetching } from "../../hooks/useDataFetching";
import api from "../../services/api";

const transformJamendoPlaylist = (playlist) => {
  return {
    id: playlist.id,
    title: helpers.capitalize(playlist.title) || "",
    artist: helpers.capitalize(playlist.artist) || "",
    thumbnail: `https://usercontent.jamendo.com?type=playlist&id=${playlist.id}&width=300`,
    creationDate: playlist.creationDate,
    shareUrl: playlist.shareUrl,
    shortUrl: playlist.shortUrl,
    userId: playlist.userId,
  };
};

const Playlists = ({ cardsPerSet = 5 }) => {
  const [visiblePlaylists, setVisiblePlaylists] = useState(0);

  const handlePlaylistClick = useCallback((playlist) => {
    window.scrollTo(0, 0);
    console.log("CLICKED ON: ", playlist.id);
    navigate(`/playlist/${playlist.id}`);
  }, []);

  const {
    data: playlists,
    loading: loadingPlaylists,
    error: playlistsError,
    retry: retryPlaylists,
  } = useDataFetching(() => api.getPlaylists({ limit: 20 }), "playlists");

  const playlistData = playlists ? playlists.map(transformJamendoPlaylist) : [];
  return playlistData.length ? (
    <div className="flex flex-col mb-[10rem]">
      <div className="flex flex-row w-full mb-4 items-center">
        <p className="text-3xl font-extrabold">Featured playlists</p>
        <div className="ml-auto flex gap-2 items-center">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate("/playlists");
            }}
            className="bg-transparent hover:bg-[#212121] py-2 px-4 rounded-full border border-neutral-800 text-sm"
          >
            More
          </button>
          <button
            onClick={() =>
              handlePrevious(setVisiblePlaylists, visiblePlaylists)
            }
            className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() =>
              handleNext(
                setVisiblePlaylists,
                visiblePlaylists,
                playlistData.length
              )
            }
            className="bg-transparent hover:bg-[#212121] p-2 rounded-full border border-neutral-800"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
      <div className="flex flex-row bg-transparent h-[16rem] w-full gap-4 mt-4">
        {playlistData
          .slice(visiblePlaylists, visiblePlaylists + cardsPerSet)
          .map((playlist) => {
            {
              console.log("PLAYLIST MAPPED:", playlist);
            }
            return (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={handlePlaylistClick}
                truncateTitle={truncateTitle}
              />
            );
          })}
      </div>
    </div>
  ) : (
    <div>
      <p>error</p>
    </div>
  );
};

export default Playlists;
