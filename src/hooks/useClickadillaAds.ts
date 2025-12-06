import { useEffect } from 'react';

export const useClickadillaAds = () => {
  useEffect(() => {
    const e = "c9b6cb59c84ff56aa7ad154505a16417";
    const l = [
      ["siteId", 664 * 771 * 798 - 685 - 403271708],
      ["minBid", 0],
      ["popundersPerIP", "0"],
      ["delayBetween", 0],
      ["default", false],
      ["defaultPerDay", 0],
      ["topmostLayer", "auto"]
    ];
    const j = [
      "d3d3LnZpc2FyaW9tZWRpYS5jb20vcm5hY2xfZmFjdG9yeS5taW4uY3Nz",
      "ZDEzazdwcmF4MXlpMDQuY2xvdWRmcm9udC5uZXQvRUQvamdwdS5taW4uanM=",
      "d3d3LmNmdHVib2J2ZS5jb20vd25hY2xfZmFjdG9yeS5taW4uY3Nz",
      "d3d3LnNtbnB5Zmt3ai5jb20vbXUvc2dwdS5taW4uanM="
    ];
    let k = -1;
    let o: HTMLScriptElement | undefined;
    let c: NodeJS.Timeout | undefined;

    const a = () => {
      clearTimeout(c);
      k++;
      if (j[k] && !(1790936803000 < new Date().getTime() && 1 < k)) {
        o = document.createElement("script");
        o.type = "text/javascript";
        o.async = true;
        const m = document.getElementsByTagName("script")[0];
        o.src = "https://" + atob(j[k]);
        o.crossOrigin = "anonymous";
        o.onerror = a;
        o.onload = () => {
          clearTimeout(c);
          if (!(window as any)[e.slice(0, 16) + e.slice(0, 16)]) {
            a();
          }
        };
        c = setTimeout(a, 5000);
        m.parentNode?.insertBefore(o, m);
      }
    };

    if (!(window as any)[e]) {
      try {
        Object.freeze((window as any)[e] = l);
      } catch (err) {}
      a();
    }

    return () => {
      clearTimeout(c);
    };
  }, []);
};
