import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  InputLabel,
  FormControl,
  IconButton,
  Grid,
  Typography,
} from "@mui/material";
import { Add, Delete, Search } from "@mui/icons-material";

// ✅ AI logic: guess status based on name + quantity
const getAISuggestedStatus = (name, quantity) => {
  if (!name && !quantity) return "IN_STOCK";
  const lowerName = name.toLowerCase();

  if (quantity === 0) return "DISCONTINUED";
  if (lowerName.includes("order")) return "ORDERED";
  if (quantity <= 5) return "LOW_STOCK";
  if (quantity >= 20) return "IN_STOCK";

  return "IN_STOCK";
};

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    quantity: 0,
    category: "",
    description: "",
    status: "IN_STOCK",
  });
  const [searchKeyword, setSearchKeyword] = useState("");

  const baseUrl = "http://localhost:8080/api/items";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await axios.get(baseUrl);
    setItems(res.data);
  };

  // ✅ Whenever name or quantity changes, auto-update status using AI
  const handleChange = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };

    if (e.target.name === "name" || e.target.name === "quantity") {
      const aiStatus = getAISuggestedStatus(
        e.target.name === "name" ? e.target.value : updatedForm.name,
        e.target.name === "quantity" ? parseInt(e.target.value) : updatedForm.quantity
      );
      updatedForm.status = aiStatus;
    }

    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(baseUrl, form);
    fetchItems();
    setForm({ name: "", quantity: 0, category: "", description: "", status: "IN_STOCK" });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${baseUrl}/${id}`);
    fetchItems();
  };

  const handleSearch = async () => {
    const res = await axios.get(`${baseUrl}/search?keyword=${searchKeyword}`);
    setItems(res.data);
  };

  return (
    <Container maxWidth="md" sx={{ paddingTop: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        📦 <strong>Inventory Manager</strong>
      </Typography>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              variant="standard"
              name="name"
              label="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              variant="standard"
              name="quantity"
              label="Quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              variant="standard"
              name="category"
              label="Category"
              value={form.category}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              size="small"
              variant="standard"
              name="description"
              label="Description"
              value={form.description}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small" variant="standard">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <MenuItem value="IN_STOCK">In Stock</MenuItem>
                <MenuItem value="LOW_STOCK">Low Stock</MenuItem>
                <MenuItem value="ORDERED">Ordered</MenuItem>
                <MenuItem value="DISCONTINUED">Discontinued</MenuItem>
              </Select>
              {/* AI Hint */}
              <Typography
                variant="caption"
                sx={{ color: "gray", marginTop: "4px", fontStyle: "italic" }}
              >
                💡 AI-Suggested based on name & quantity
              </Typography>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={<Add fontSize="small" />}
              fullWidth
            >
              Add Item
            </Button>
          </Grid>
        </Grid>
      </form>

      <Grid container spacing={2} alignItems="center" style={{ marginBottom: "20px" }}>
        <Grid item xs={9}>
          <TextField
            fullWidth
            size="small"
            variant="standard"
            label="Search by name/category/status"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleSearch}
            startIcon={<Search />}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDelete(item.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default App;
