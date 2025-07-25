# Inventory Manager Documentation

## Overview
Inventory Manager is a professional React web application for managing inventory items. It features:
- Add, edit, delete, and search items
- AI-powered status suggestion
- Role-based access control (RBAC)
- Responsive Material UI design

---

## Features

### 1. Add/Edit/Delete Items
- Add new items with name, quantity, category, description, and status.
- Edit existing items in a modal dialog.
- Delete items from the table.

### 2. Search
- Search items by name, category, or status using the search bar.


### 3. AI Status Suggestion
- Status is auto-suggested based on item name and quantity:
  - If quantity is 0: `DISCONTINUED`
  - If name contains "order": `ORDERED`
  - If quantity ≤ 5: `LOW_STOCK`
  - If quantity ≥ 20: `IN_STOCK`
  - Otherwise: `IN_STOCK`

### 4. Smart AI Description Generator
- When you type a name or category (and description is empty), a meaningful description is auto-filled:
  - Template: "This is a high-quality [name] item categorized under [category]. Perfect for modern inventory needs."
- Works for both add and edit forms
- Does not overwrite if you type your own description
- Shows a "💡 Auto-filled by AI" hint when active

### 5. Role-Based Access Control (RBAC)
- Two roles: `admin` and `viewer`
- Role is stored in localStorage and can be switched via dropdown
- `admin`: full access (add, edit, delete)
- `viewer`: can only view/search items; all form inputs and action buttons are disabled
- Role is exposed via React Context and shown as a badge at the top

### 6. Input Validation
- Name field: only letters and spaces allowed
- Quantity field: only numbers allowed
- Error messages shown for invalid input

---

## Technologies Used
- React (functional components, hooks)
- Material UI (form controls, table, modal, icons)
- Axios (API calls)
- React Context (RBAC)

---

## File Structure
```
public/
  favicon.ico
  index.html
  robots.txt
src/
  App.js           # Main application logic and UI
  App.css          # Custom styles
  index.js         # React entry point
  index.css        # Global styles
package.json       # Project dependencies and scripts
README.md          # Quick start and basic info
```

---

## How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. The app runs at `http://localhost:3000`

---

## API Endpoints
- Base URL: `http://localhost:8080/api/items`
- `GET /api/items` - fetch all items
- `POST /api/items` - add item
- `PUT /api/items/:id` - update item
- `DELETE /api/items/:id` - delete item
- `GET /api/items/search?keyword=...` - search items

---

## Customization & Extensibility
- Easily add new fields or validation in `App.js`
- Modular RBAC logic via React Context
- UI can be themed or extended using Material UI

---

## Best Practices
- All logic and UI are separated for maintainability
- Input validation prevents bad data
- RBAC ensures secure access
- Responsive and accessible design

---

## Authors & Credits
- Developed by Hassan Hammoud
- Powered by React, Material UI, and Axios

---

## License
MIT License

---

## Support
For issues or feature requests, please contact the repository owner or open an issue on GitHub.
