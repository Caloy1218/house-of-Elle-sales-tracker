import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { DataGrid } from '@mui/x-data-grid';
import { Container, Paper, Typography, IconButton, TextField, Grid, Box } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const TotalSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalSelectedDateSales, setTotalSelectedDateSales] = useState(0);
  const [totalSelectedMonthSales, setTotalSelectedMonthSales] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf('day'));

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'totalSales'));
      const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setSalesData(data);
      calculateTotalSales(data);
      filterSalesDataByDate(data, selectedDate);
      calculateTotalSelectedMonthSales(data, selectedDate);
    };

    fetchData();
  }, [selectedDate]);

  const calculateTotalSales = (data) => {
    const total = data.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
    setTotalSales(total);
  };

  const filterSalesDataByDate = (data, date) => {
    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();
    const filteredData = data.filter(item => {
      const itemDate = item.date ? dayjs(item.date.toDate()) : null;
      return itemDate && itemDate.isBetween(startOfDay, endOfDay, null, '[]');
    });
    setFilteredSalesData(filteredData);
    calculateTotalSelectedDateSales(filteredData);
  };

  const calculateTotalSelectedDateSales = (data) => {
    const total = data.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
    setTotalSelectedDateSales(total);
  };

  const calculateTotalSelectedMonthSales = (data, date) => {
    const startOfMonth = dayjs(date).startOf('month').toDate();
    const endOfMonth = dayjs(date).endOf('month').toDate();
    const totalMonthSales = data
      .filter(item => {
        const itemDate = item.date ? dayjs(item.date.toDate()) : null;
        return itemDate && itemDate.isBetween(startOfMonth, endOfMonth, null, '[]');
      })
      .reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
    setTotalSelectedMonthSales(totalMonthSales);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'totalSales', id));
    const updatedSalesData = salesData.filter((row) => row.id !== id);
    setSalesData(updatedSalesData);
    filterSalesDataByDate(updatedSalesData, selectedDate);
    calculateTotalSales(updatedSalesData);
    calculateTotalSelectedMonthSales(updatedSalesData, selectedDate);
  };

  const columns = [
    { field: 'code', headerName: 'CODE', width: 150 },
    { field: 'minerName', headerName: 'Name of Miner', width: 200 },
    { field: 'price', headerName: 'Price', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
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
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                views={['year', 'month', 'day']}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Box mt={2}>
          <Typography variant="h6">Total Sales for Selected Date: ₱{totalSelectedDateSales.toFixed(2)}</Typography>
          <Typography variant="h6">Total Sales for Selected Month: ₱{totalSelectedMonthSales.toFixed(2)}</Typography>
          <Typography variant="h6">Total Sales Overall: ₱{totalSales.toFixed(2)}</Typography>
        </Box>
        <div style={{ height: 400, width: '100%', marginTop: 16 }}>
          <DataGrid rows={filteredSalesData} columns={columns} pageSize={5} />
        </div>
      </Paper>
    </Container>
  );
};

export default TotalSales;
