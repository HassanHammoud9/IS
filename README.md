## 📦 Inventory Manager Frontend

Welcome to the Inventory Manager! This is a modern React web application for managing inventory items with a clean, professional UI and smart AI-powered status suggestions.

---

### Features
- Add, search, and delete inventory items
- Responsive Material UI design
- AI-powered status prediction based on item name and quantity
- Easily override predicted status

---

### Getting Started

#### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

#### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/inventory-frontend.git
   cd inventory-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

#### Running the App
1. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```
2. Open your browser and go to [http://localhost:3000](http://localhost:3000)

---

### AI Logic

The app includes an AI-powered status suggestion:
- When you type an item's **name** or **quantity**, the app predicts the appropriate inventory status:
  - `Quantity = 0` → Status: `DISCONTINUED`
  - `Quantity ≤ 5` → Status: `LOW_STOCK`
  - If name contains "order" → Status: `ORDERED`
- The prediction is applied automatically, but you can override it before submitting.

---

### Customization & Future Improvements
- Upgrade AI logic to use ChatGPT or other APIs
- Add authentication and user roles
- Export/import inventory data

---

### License
MIT
