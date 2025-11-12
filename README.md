# closedcustoms-api
export default async function handler(req, res) {
  const { title, summaryText, priceCents } = req.body;

  const query = `
    mutation($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          variants(first: 1) {
            edges { node { id } }
          }
        }
        userErrors { message }
      }
    }
  `;

  const input = {
    title,
    status: "ACTIVE",
    published: false,
    variants: [{ price: (priceCents / 100).toFixed(2) }]
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

  if (data.errors) {
    console.error(data.errors);
    return res.status(500).json({ error: "Shopify error" });
  }

  const variantId =
    data.data.productCreate.product.variants.edges[0].node.id;

  res.json({ variantId });
}
