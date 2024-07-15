import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Add updateDoc and deleteDoc imports
import { DataGrid } from '@mui/x-data-grid';
import { Container, Paper, Typography, IconButton, TextField, Grid, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const TotalSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalMonthlySales, setTotalMonthlySales] = useState(0);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ CODE: '', minerName: '', price: '' });
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf('month')); // Default to start of current month

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'totalSales'));
      const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setSalesData(data);
      calculateTotalSales(data);
      calculateTotalMonthlySales(data, selectedDate);
    };

    fetchData();
  }, [selectedDate]);

  const calculateTotalSales = (data) => {
    const total = data.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
    setTotalSales(total);
  };

  const calculateTotalMonthlySales = (data, date) => {
    const startOfMonth = dayjs(date).startOf('month').toDate();
    const endOfMonth = dayjs(date).endOf('month').toDate();
    const monthlyTotal = data
      .filter(item => {
        // Check if date field exists and is valid
        const itemDate = item.date ? dayjs(item.date.toDate()) : null;
        return itemDate && itemDate.isBetween(startOfMonth, endOfMonth, null, '[]');
      })
      .reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
    setTotalMonthlySales(monthlyTotal);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleEdit = (id) => {
    const rowToEdit = salesData.find((row) => row.id === id);
    setEditData(rowToEdit);
    setEditId(id);
  };

  const handleUpdate = async () => {
    if (editId) {
      await updateDoc(doc(db, 'totalSales', editId), editData);
      setEditId(null);
      setEditData({ CODE: '', minerName: '', price: '' });
      const querySnapshot = await getDocs(collection(db, 'totalSales'));
      const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setSalesData(data);
      calculateTotalSales(data);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'totalSales', id));
    setSalesData((prevSalesData) => prevSalesData.filter((row) => row.id !== id));
    calculateTotalSales(salesData.filter((row) => row.id !== id));
  };

  const columns = [
    { field: 'CODE', headerName: 'CODE', width: 150 },
    { field: 'minerName', headerName: 'Name of Miner', width: 200 },
    { field: 'price', headerName: 'Price', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params) => [
        <IconButton onClick={() => handleEdit(params.id)}>
          <EditIcon />
        </IconButton>,
        <IconButton onClick={() => handleDelete(params.id)}>
          <DeleteIcon />
        </IconButton>,
      ],
    },
  ];

  return (
    <Container>
      <Paper style={{ padding: 16, marginTop: 16 }}>
        <Typography variant="h6" gutterBottom>
          Total Sales
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Month"
                value={selectedDate}
                onChange={handleDateChange}
                views={['month']}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Box mt={2}>
          <Typography variant="h6">Total Sales for Selected Month: ${totalMonthlySales.toFixed(2)}</Typography>
          <Typography variant="h6">Total Sales Overall: ${totalSales.toFixed(2)}</Typography>
        </Box>
        <div style={{ height: 400, width: '100%', marginTop: 16 }}>
          <DataGrid rows={salesData} columns={columns} pageSize={5} />
        </div>
      </Paper>
    </Container>
  );
};

export default TotalSales;
