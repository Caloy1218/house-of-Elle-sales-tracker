import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Paper, Grid } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Edit, Delete, ShoppingCart } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
 // Add deleteDoc import


const Live = () => {
  const [form, setForm] = useState({ code: '', minerName: '', price: '' });
  const [rows, setRows] = useState([]);
  const [totalCheckedOut, setTotalCheckedOut] = useState(0);

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
  
      // Ensure the totalSales document exists or create it
      const summaryDocRef = doc(db, 'totalSales', 'summary');
      const summaryDoc = await getDoc(summaryDocRef);
  
      if (summaryDoc.exists()) {
        await updateDoc(summaryDocRef, { totalSales: totalCheckedOut + row.price });
      } else {
        await setDoc(summaryDocRef, { totalSales: totalCheckedOut + row.price });
      }
    }
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
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => handleEdit(params.id)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => handleDelete(params.id)} />,
        <GridActionsCellItem icon={<ShoppingCart />} label="Checkout" onClick={() => handleCheckout(params.id)} disabled={params.row.checkedOut} />,
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
            >
              Enter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <div style={{ height: 400, width: '100%', marginTop: 16 }}>
        <DataGrid rows={rows} columns={columns} pageSize={5} />
      </div>

      <Paper style={{ padding: 16, marginTop: 16 }}>
        <Grid container justifyContent="space-between">
          <Grid item>
            <strong>Subtotal:</strong>
          </Grid>
          <Grid item>
            <strong>${subtotal.toFixed(2)}</strong>
          </Grid>
        </Grid>
        <Grid container justifyContent="space-between">
          <Grid item>
            <strong>Total:</strong>
          </Grid>
          <Grid item>
            <strong>${totalCheckedOut.toFixed(2)}</strong>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Live;
