import Product from "../models/Product.js";

const getProducts = async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    const filter = {};
    if (query) {
      if (query === "true" || query === "false") {
        filter.available = query === "true";
      } else {
        filter.category = query;
      }
    }    

    const options = {
      limit,
      page,
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
    };

    const products = await Product.paginate(filter, options);

    res.json({
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage
        ? `/products?page=${products.prevPage}&limit=${limit}`
        : null,
      nextLink: products.hasNextPage
        ? `/products?page=${products.nextPage}&limit=${limit}`
        : null,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export { getProducts };
