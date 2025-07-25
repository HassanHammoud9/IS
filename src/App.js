import React, { useEffect, useState, createContext, useContext } from "react";
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
import { Add, Delete, Search, Edit } from "@mui/icons-material";

//  AI logic: guess status based on name + quantity
const getAISuggestedStatus = (name, quantity) => {
  if (!name && !quantity) return "IN_STOCK";
  const lowerName = name.toLowerCase();

  if (quantity === 0) return "DISCONTINUED";
  if (lowerName.includes("order")) return "ORDERED";
  if (quantity <= 5) return "LOW_STOCK";
  if (quantity >= 20) return "IN_STOCK";

  return "IN_STOCK";
};

// Smart AI Description Generator using OpenAI API (gpt-4)
async function fetchAIDescription(name, category) {
  const prompt = `Write a short, smart, modern description for an inventory item named '${name}' in the '${category}' category. Keep it under 20 words.`;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 60,
      }),
    });
    const data = await response.json();
    // Remove leading/trailing quotes if present
    let desc = data.choices?.[0]?.message?.content || '';
    if (desc.startsWith('"') && desc.endsWith('"')) {
      desc = desc.slice(1, -1);
    }
    if (desc.startsWith("'") && desc.endsWith("'")) {
      desc = desc.slice(1, -1);
    }
    return desc;
  } catch (err) {
    console.error("OpenAI fetch error:", err);
    return `Smart description for ${name} in ${category}`; // fallback
  }
}

// Role Context for RBAC
const RoleContext = createContext();

function useRole() {
  return useContext(RoleContext);
}

function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'admin');
  useEffect(() => { localStorage.setItem('role', role); }, [role]);
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    quantity: 0,
    category: "",
    description: "",
    status: "IN_STOCK",
  });
  const [errors, setErrors] = useState({ name: '', quantity: '' });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { role, setRole } = useRole();

  const baseUrl = "http://localhost:8080/api/items";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await axios.get(baseUrl);
    setItems(res.data);
  };

  // Only update status and validation on change; AI description is handled on submit
  const handleChange = (e) => {
    const { name, value } = e.target;
    let valid = true;
    let errorMsg = '';
    if (name === 'name') {
      if (!/^[a-zA-Z ]*$/.test(value)) {
        valid = false;
        errorMsg = 'Only letters and spaces allowed.';
      }
    }
    if (name === 'quantity') {
      if (!/^\d*$/.test(value)) { // eslint-disable-line no-useless-escape
        valid = false;
        errorMsg = 'Only numbers allowed.';
      }
    }
    setErrors((prev) => ({ ...prev, [name]: valid ? '' : errorMsg }));
    if (!valid) return;
    let updatedForm = { ...form, [name]: name === 'quantity' ? value.replace(/\D/g, '') : value };
    // AI status suggestion
    if (name === "name" || name === "quantity") {
      const aiStatus = getAISuggestedStatus(
        name === "name" ? value : updatedForm.name,
        name === "quantity" ? parseInt(value) : updatedForm.quantity
      );
      updatedForm.status = aiStatus;
    }
    setForm(updatedForm);
  };

  // Handle form submit for adding new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate before submit
    if (!form.name || !form.category || errors.name || errors.quantity) return;
    let submitForm = { ...form };
    // If description is empty, fill it with AI
    if (!submitForm.description) {
      submitForm.description = await fetchAIDescription(submitForm.name, submitForm.category);
    }
    await axios.post(baseUrl, {
      ...submitForm,
      quantity: parseInt(submitForm.quantity, 10)
    });
    fetchItems();
    setForm({ name: "", quantity: 0, category: "", description: "", status: "IN_STOCK" });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${baseUrl}/${id}`);
    fetchItems();
  };

  const handleEditOpen = (item) => {
    setEditItem(item);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditItem(null);
  };

// Handle field changes in edit dialog (edit mode)
const handleEditChange = (e) => {
  const { name, value } = e.target;
  let updatedEdit = { ...editItem, [name]: value };
  setEditItem(updatedEdit);
};


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    let submitEdit = { ...editItem };
    // If description is empty, fill it with AI
    if (!submitEdit.description) {
      submitEdit.description = await fetchAIDescription(submitEdit.name, submitEdit.category);
    }
    await axios.put(`${baseUrl}/${editItem.id}`, submitEdit);
    fetchItems();
    handleEditClose();
  };

  const handleSearch = async () => {
    const res = await axios.get(`${baseUrl}/search?keyword=${searchKeyword}`);
    setItems(res.data);
  };

  return (
    <Container maxWidth="md" sx={{ paddingTop: 4 }}>
      {/* RBAC: Role dropdown and badge at top */}
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Grid item>
          <Typography variant="h4" gutterBottom align="left">
            📦 <strong>Inventory Manager</strong>
          </Typography>
        </Grid>
        <Grid item>
          <Select
            value={role}
            onChange={e => setRole(e.target.value)}
            size="small"
            sx={{ mr: 2, minWidth: 100 }}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </Select>
          <span style={{
            display: 'inline-block',
            background: role === 'admin' ? '#1976d2' : '#888',
            color: '#fff',
            borderRadius: 12,
            padding: '2px 12px',
            fontSize: 13,
            fontWeight: 500,
            verticalAlign: 'middle',
            marginLeft: 4
          }}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </Grid>
      </Grid>

      <form onSubmit={role === 'admin' ? handleSubmit : e => e.preventDefault()} style={{ marginBottom: "30px" }}>
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
              disabled={role !== 'admin'}
              error={!!errors.name}
              helperText={errors.name}
              inputProps={{ pattern: '[a-zA-Z ]*' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              variant="standard"
              name="quantity"
              label="Quantity"
              type="text"
              value={form.quantity}
              onChange={handleChange}
              required
              disabled={role !== 'admin'}
              error={!!errors.quantity}
              helperText={errors.quantity}
              inputProps={{ inputMode: 'numeric', pattern: '\\d*' }}
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
              disabled={role !== 'admin'}
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
              disabled={role !== 'admin'}
            />
            {/* AI autofill hint */}
            {!form.description && (form.name || form.category) && (
              <Typography variant="caption" sx={{ color: 'gray', fontStyle: 'italic', ml: 1 }}>
                💡 Auto-filled by AI
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FormControl fullWidth size="small" variant="standard">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={role !== 'admin'}
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
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<Add fontSize="small" />}
                sx={{ minWidth: 80, minHeight: 28, fontSize: 13, padding: '2px 8px', boxShadow: 1, marginBottom: '0px' }}
                disabled={role !== 'admin'}
              >
                Add
              </Button>
            </div>
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
                  color="primary"
                  size="small"
                  onClick={() => handleEditOpen(item)}
                  sx={{ mr: 1 }}
                  disabled={role !== 'admin'}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDelete(item.id)}
                  disabled={role !== 'admin'}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      {editOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <form
            onSubmit={role === 'admin' ? handleEditSubmit : e => e.preventDefault()}
            style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}
          >
            <Typography variant="h6" gutterBottom>Edit Item</Typography>
            <TextField
              fullWidth
              margin="dense"
              name="name"
              label="Name"
              value={editItem.name}
              onChange={handleEditChange}
              required
              disabled={role !== 'admin'}
            />
            <TextField
              fullWidth
              margin="dense"
              name="quantity"
              label="Quantity"
              type="number"
              value={editItem.quantity}
              onChange={handleEditChange}
              required
              disabled={role !== 'admin'}
            />
            <TextField
              fullWidth
              margin="dense"
              name="category"
              label="Category"
              value={editItem.category}
              onChange={handleEditChange}
              required
              disabled={role !== 'admin'}
            />
            <TextField
              fullWidth
              margin="dense"
              name="description"
              label="Description"
              value={editItem.description}
              onChange={handleEditChange}
              disabled={role !== 'admin'}
            />
            {/* AI autofill hint for edit */}
            {!editItem.description && (editItem.name || editItem.category) && (
              <Typography variant="caption" sx={{ color: 'gray', fontStyle: 'italic', ml: 1 }}>
                💡 Auto-filled by AI
              </Typography>
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={editItem.status}
                label="Status"
                onChange={handleEditChange}
                MenuProps={{ disablePortal: true }}
                disabled={role !== 'admin'}
              >
                <MenuItem value="IN_STOCK">In Stock</MenuItem>
                <MenuItem value="LOW_STOCK">Low Stock</MenuItem>
                <MenuItem value="ORDERED">Ordered</MenuItem>
                <MenuItem value="DISCONTINUED">Discontinued</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Button variant="contained" color="primary" type="submit" fullWidth disabled={role !== 'admin'}>Save</Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="outlined" color="secondary" onClick={handleEditClose} fullWidth>Cancel</Button>
              </Grid>
            </Grid>
          </form>
        </div>
      )}
    </Container>
  );
}

export default function AppWithRoleProvider() {
  return (
    <RoleProvider>
      <App />
    </RoleProvider>
  );
}
