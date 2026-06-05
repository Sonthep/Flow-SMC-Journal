"use client"

import React, { useEffect, useRef, memo } from 'react';

let tvScriptLoadingPromise: Promise<void> | null = null;

function TradingViewWidget() {
  const onLoadScriptRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => {
      if (onLoadScriptRef.current) {
        onLoadScriptRef.current();
      }
    });

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById('tradingview_widget') && 'TradingView' in window) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: "OANDA:EURUSD",
          interval: "15",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          enable_publishing: false,
          backgroundColor: "rgba(255, 255, 255, 1)",
          gridColor: "rgba(241, 245, 249, 1)",
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: "tradingview_widget",
        });
      }
    }
  }, []);

  return (
    <div className='tradingview-widget-container h-full w-full'>
      <div id='tradingview_widget' className="h-full w-full" />
    </div>
  );
}

export default memo(TradingViewWidget);
