import { useEffect } from "react";

export const ShopeeRedirect = () => {
  useEffect(() => {
    const lastOpened = localStorage.getItem("shopee-redirect-date");
    const today = new Date().toDateString();
    
    if (lastOpened !== today) {
      // Wait 1 second for page to load, then open Shopee link
      setTimeout(() => {
        window.open("https://s.shopee.ph/3fvxJ5MXX6", "_blank");
        localStorage.setItem("shopee-redirect-date", today);
      }, 1000);
    }
  }, []);

  return null;
};
