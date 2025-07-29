// src/components/ShopifyBuyButton.jsx

import React, { useEffect } from "react";

// Bu bileşen, hangi Shopify ürününün satın alınacağını 'productId' prop'u ile alır.
const ShopifyBuyButton = ({ productId, onRequestUpdate }) => {
  const shopifyDomain = "hkrmqm-1h.myshopify.com";
  const storefrontAccessToken = "9931feebddf1900f9348d9912cf5c340";

  useEffect(() => {
    const componentId = `product-component-${productId}-${Math.random()}`;

    const loadScript = () => {
      const scriptURL =
        "https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js";
      const script = document.createElement("script");
      script.async = true;
      script.src = scriptURL;
      (
        document.getElementsByTagName("head")[0] ||
        document.getElementsByTagName("body")[0]
      ).appendChild(script);
      script.onload = ShopifyBuyInit;
    };

    const ShopifyBuyInit = () => {
      if (!window.ShopifyBuy || !window.ShopifyBuy.buildClient) {
        console.error("Shopify Buy SDK not loaded correctly.");
        return;
      }

      const client = window.ShopifyBuy.buildClient({
        domain: shopifyDomain,
        storefrontAccessToken: storefrontAccessToken,
      });

      window.ShopifyBuy.UI.onReady(client).then(function (ui) {
        const node = document.getElementById(componentId);
        if (!node) return;

        node.innerHTML = ""; // Önceki butonu temizle

        ui.createComponent("product", {
          id: productId,
          node: node,
          moneyFormat: "%C2%A3%7B%7Bamount%7D%7D", // Sterlin
          options: {
            product: {
              styles: {
                product: { display: "none" }, // Sadece butonu göster
                button: {
                  // Butonun stilini buradan özelleştirebilirsiniz
                  "border-radius": "8px",
                  width: "100%",
                },
              },
              buttonDestination: "checkout",
              text: { button: "Pay Now" },
            },
            cart: {
              // Ödeme sonrası sepetin otomatik kapanmasını sağlar
              // ve kullanıcıyı belirttiğimiz sayfaya yönlendirir.
              // ANCAK BU, ÖDEMENİN BAŞARILI OLDUĞUNU GARANTİ ETMEZ.
              events: {
                afterTransaction: (cart) => {
                  console.log("Transaction completed, redirecting...");
                  // Bu yönlendirme, ödeme başarılı olsa da olmasa da tetiklenebilir.
                  // Kullanıcıyı bir "teşekkür" sayfasına yönlendirebiliriz.
                  // window.location.href = '/thank-you';
                },
              },
            },
          },
        });
      });
    };

    if (window.ShopifyBuy && window.ShopifyBuy.UI) {
      ShopifyBuyInit();
    } else {
      loadScript();
    }

    return () => {
      // Cleanup
      const node = document.getElementById(componentId);
      if (node) node.innerHTML = "";
    };
  }, [productId]);

  return <div id={`product-component-${productId}-${Math.random()}`} />;
};

export default ShopifyBuyButton;
