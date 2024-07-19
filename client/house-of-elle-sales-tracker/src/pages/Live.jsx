import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Paper, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Edit, Delete, ShoppingCart, Clear } from '@mui/icons-material';
import { db, writeBatch } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';

const Live = () => {
  const [form, setForm] = useState({ code: '', minerName: '', price: '' });
  const [rows, setRows] = useState([]);
  const [totalCheckedOut, setTotalCheckedOut] = useState(0);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'liveData'));
      const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setRows(data);
      calculateTotalCheckedOut(data);
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleEnter = async () => {
    if (form.code && form.minerName && form.price) {
      const newRow = { ...form, price: parseFloat(form.price), checkedOut: false };
      await addDoc(collection(db, 'liveData'), newRow);
      setForm({ code: '', minerName: '', price: '' });
      const querySnapshot = await getDocs(collection(db, 'liveData'));
      const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setRows(data);
    }
  };

  const handleEdit = (id) => {
    const rowToEdit = rows.find((row) => row.id === id);
    setForm({ code: rowToEdit.code, minerName: rowToEdit.minerName, price: rowToEdit.price });
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'liveData', id));
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleCheckout = async (id) => {
    const row = rows.find((row) => row.id === id);
    if (row) {
      const updatedRow = { ...row, checkedOut: true };
      await updateDoc(doc(db, 'liveData', id), updatedRow);
      setRows((prevRows) => prevRows.map((r) => (r.id === id ? updatedRow : r)));
      setTotalCheckedOut((prevTotal) => prevTotal + row.price);

      // Add to totalSales collection
      await addDoc(collection(db, 'totalSales'), {
        code: row.code,
        minerName: row.minerName,
        price: row.price,
        date: new Date(),
      });

      // Ensure the totalSales summary document exists or create it
      const summaryDocRef = doc(db, 'totalSales', 'summary');
      const summaryDoc = await getDoc(summaryDocRef);

      if (summaryDoc.exists()) {
        await updateDoc(summaryDocRef, { totalSales: summaryDoc.data().totalSales + row.price });
      } else {
        await setDoc(summaryDocRef, { totalSales: row.price });
      }
    }
  };

  const handleClearAll = async () => {
    const querySnapshot = await getDocs(collection(db, 'liveData'));
    const batch = writeBatch(db); // Create a batch instance
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref); // Queue delete operations
    });
    await batch.commit(); // Commit the batch
    setRows([]);
    setTotalCheckedOut(0); // Reset the totalCheckedOut
    setClearDialogOpen(false);
  };

  const calculateTotalCheckedOut = (data) => {
    const total = data.filter((item) => item.checkedOut).reduce((acc, item) => acc + item.price, 0);
    setTotalCheckedOut(total);
  };

  const columns = [
    { field: 'code', headerName: 'CODE', width: 150 },
    { field: 'minerName', headerName: 'Name of Miner', width: 200 },
    { field: 'price', headerName: 'Price', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem 
          icon={<Edit style={{ color: '#28a745' }} />} 
          label="Edit" 
          onClick={() => handleEdit(params.id)} 
        />,
        <GridActionsCellItem 
          icon={<Delete style={{ color: '#dc3545' }} />} 
          label="Delete" 
          onClick={() => handleDelete(params.id)} 
        />,
        <GridActionsCellItem 
          icon={<ShoppingCart style={{ color: params.row.checkedOut ? '#6c757d' : '#007bff' }} />} 
          label="Checkout" 
          onClick={() => handleCheckout(params.id)} 
          disabled={params.row.checkedOut} 
        />,
      ],
    },
  ];

  const subtotal = rows.reduce((acc, row) => acc + row.price, 0);

  return (
    <Container>
      <Paper style={{ padding: 16, marginTop: 16 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="CODE"
              name="code"
              value={form.code}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Name of Miner"
              name="minerName"
              value={form.minerName}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEnter}
              fullWidth
              style={{ height: '100%' }}
              sx={{backgroundColor: '#ed297b'}}
            >
              Enter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <div style={{ height: 400, width: '100%', marginTop: 16 }}>
        <DataGrid rows={rows} columns={columns} pageSize={5} />
      </div>

      <Grid container spacing={2} justifyContent="flex-end" style={{ marginTop: 16 }}>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setClearDialogOpen(true)}
            style={{ backgroundColor: '#dc3545', color: '#ffffff' }}
            startIcon={<Clear />}
          >
            Clear All
          </Button>
        </Grid>
      </Grid>

      <Paper style={{ padding: 16, marginTop: 16 }}>
        <Grid container justifyContent="space-between">
          <Grid item>
            <strong>Subtotal:</strong>
          </Grid>
          <Grid item>
            <strong>${subtotal.toFixed(2)}</strong>
          </Grid>
        </Grid>
        {rows.length > 0 && (
          <Grid container justifyContent="space-between">
            <Grid item>
              <strong>Total:</strong>
            </Grid>
            <Grid item>
              <strong>${totalCheckedOut.toFixed(2)}</strong>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Confirm Clear All</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all the data? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClearAll} color="secondary">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Live;
