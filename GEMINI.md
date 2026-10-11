# Git Commit Rules
When writing git commit messages, the entire commit message (including the subject line and description) must be written in lowercase. Do not use any uppercase letters, no matter what.

# API Consumption & Architecture Rules
- NEVER import `apiRequest` or `apiurls` directly in pages, components, or UI views.
- All API, CRUD, and store-related operations must be encapsulated exclusively within modules (`src/modules/<entity>/<entity>.module.jsx` and `<entity>.store.jsx`) using `createCrud`, `createEntityStore`, and `createEntityQueryActions`.
- All modules must be registered in `ApiContext` (`src/core/contexts/api.context.jsx`).
- In pages and components, always access API methods, store data (list, pagination, loading states), and operations strictly through `useApi()` (e.g., `const { products, categories, cart, wishlist } = useApi()`).
- Always use backend data and server-side pagination (`page`, `limit`, `sortBy`, `order`, and backend filters) rather than fetching entire datasets to filter or paginate on the client side.
