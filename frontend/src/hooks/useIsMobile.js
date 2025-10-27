import { useEffect, useState } from "react";

const useIsMedia = (query = 768) => {
  const [isMedia, setisMedia] = useState(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${query - 1}px)`);
    // define change handler
    const onChange = () => {
      setisMedia(mql.matches);
    };
    // attach event listener to window
    mql.addEventListener("change", onChange);

    // match media on first mount
    setisMedia(mql.matches);
    // remove listener
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return isMedia;
};

export { useIsMedia };
