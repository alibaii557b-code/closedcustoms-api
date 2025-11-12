import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "Closed Customs API running" }));

app.post("/build", async (req, res) => {
  try {
    const { title, summaryText, priceCents } = req.body;

    const query = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            variants(first: 1) {
              edges { node { id } }
            }
          }
          userErrors { message field }
        }
      }`;

    const input = {
      title,
      status: "ACTIVE",
      published: false,
      variants: [{ price: (priceCents / 100).toFixed(2) }],
      bodyHtml: `<p>${summaryText}</p>`,
      vendor: "Closed Customs",
      productType: "Custom PC Build"
    };

    const response = await fetch(
      "https://closedcustoms.myshopify.com/admin/api/2024-10/graphql.json",
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, variables: { input } })
      }
    );

    const data = await response.json();

    // Log to see any user errors
    console.log("Shopify response:", JSON.stringify(data, null, 2));

    if (data.errors || data.data?.productCreate?.userErrors?.length) {
      const errors = data.errors || data.data.productCreate.userErrors;
      return res.status(500).json({ error: "Shopify error", details: errors });
    }

    const variantId =
      data.data.productCreate.product.variants.edges[0].node.id;

    res.json({ variantId });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
export default app;
