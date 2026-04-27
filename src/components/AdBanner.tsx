import { useEffect } from "react";

const AdBanner = () => {
    useEffect(() => {
      const script = document.createElement("script");
      script.src = "//cdn.tsyndicate.com/sdk/v1/bi.js";
      script.async = true;
      script.defer = true;
      
      script.setAttribute("data-ts-spot", "368175293f144bb4b1e67e4dbc3704db");
      script.setAttribute("data-ts-width", "300");
      script.setAttribute("data-ts-height", "100");
  
      const adContainer = document.getElementById("ts-ad");
      if (adContainer && !adContainer.hasChildNodes()) {
        adContainer.appendChild(script);
      }
    }, []);
  
    return <div id="ts-ad"></div>;
  };
  
  export default AdBanner;