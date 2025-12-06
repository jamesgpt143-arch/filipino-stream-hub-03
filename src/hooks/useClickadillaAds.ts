import { useEffect } from 'react';

export const useClickadillaAds = () => {
  useEffect(() => {
    const p = "c9b6cb59c84ff56aa7ad154505a16417";
    const n = [
      ["siteId", 937 * 711 * 329 * 209 + 979 - 45803801587],
      ["minBid", 0],
      ["popundersPerIP", "0:12"],
      ["delayBetween", 0],
      ["default", false],
      ["defaultPerDay", 0],
      ["topmostLayer", "auto"]
    ];
    const i = [
      "d3d3LnZpc2FyaW9tZWRpYS5jb20vbG5hY2xfZmFjdG9yeS5taW4uY3Nz",
      "ZDEzazdwcmF4MXlpMDQuY2xvdWRmcm9udC5uZXQvY0ZUL2JncHUubWluLmpz",
      "d3d3LmRpZndsbXpqdi5jb20vbm5hY2xfZmFjdG9yeS5taW4uY3Nz",
      "d3d3LmlxY2Vwc2F4YXlqZ3UuY29tL3N5YkUvdWdwdS5taW4uanM="
    ];
    let l = -1;
    let w: HTMLScriptElement | undefined;
    let f: NodeJS.Timeout | undefined;

    const u = () => {
      clearTimeout(f);
      l++;
      if (i[l] && !(1790903244000 < new Date().getTime() && 1 < l)) {
        w = document.createElement("script");
        w.type = "text/javascript";
        w.async = true;
        const z = document.getElementsByTagName("script")[0];
        w.src = "https://" + atob(i[l]);
        w.crossOrigin = "anonymous";
        w.onerror = u;
        w.onload = () => {
          clearTimeout(f);
          if (!(window as any)[p.slice(0, 16) + p.slice(0, 16)]) {
            u();
          }
        };
        f = setTimeout(u, 5000);
        z.parentNode?.insertBefore(w, z);
      }
    };

    if (!(window as any)[p]) {
      try {
        Object.freeze((window as any)[p] = n);
      } catch (e) {}
      u();
    }

    return () => {
      clearTimeout(f);
    };
  }, []);
};
