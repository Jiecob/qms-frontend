import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Grid2,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Add, Delete, Edit } from "@mui/icons-material";
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
import AccessibleIcon from "@mui/icons-material/Accessible";
import ElderlyIcon from "@mui/icons-material/Elderly";
import PregnantWomanIcon from "@mui/icons-material/PregnantWoman";
import { Link, useNavigate } from "react-router-dom";
import { amber, grey } from "@mui/material/colors";
import config from "../config";
import { useAuth } from "../context/AuthContext";

const StudentList = () => {
  const { user } = useAuth();

  const [students, setStudents] = useState([]); // Store API data
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [deleteId, setDeleteId] = useState(null); // Student ID to delete
  const [openDialog, setOpenDialog] = useState(false); // Delete confirmation dialog
  const [openSuccess, setOpenSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/students/`) // Example API
      .then((response) => {
        // console.log(response.data);
        const formattedData = response.data.map((student, index) => ({
          id: student.Student_ID, // Required by DataGrid
          name:
            student.Last_Name.toUpperCase() +
            ", " +
            student.First_Name.toUpperCase() +
            " " +
            student.Middle_Name.toUpperCase(),
          phonenumber: student.Phone_Number,
          email: student.Email_Address,
          email: student.Email_Address,
          course:
            student.Course_Major === ""
              ? student.Course_Code.toUpperCase()
              : student.Course_Code.toUpperCase() +
                " - " +
                student.Course_Major.toUpperCase(),
          personcategory: student.Person_Category,
        }));
        setStudents(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student) =>
      student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phonenumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.personcategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define table columns
  const columns = [
    {
      field: "id",
      headerName: "ID",
      minWidth: 120,
      maxWidth: 120,
      flex: 1,
      resizable: false,
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 200,
      flex: 1,
      resizable: false,
      renderCell: (params) => (
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {params.value}
          {/* Conditionally render icons based on Person Category */}
          {params.row.personcategory === "Person With Disability" && (
            <AccessibleIcon sx={{ color: "blue", fontSize: "20px" }} />
          )}
          {params.row.personcategory === "Pregnant" && (
            <PregnantWomanIcon sx={{ color: "pink", fontSize: "20px" }} />
          )}
        </span>
      ),
    },
    {
      field: "course",
      headerName: "Course",
      minWidth: 200,
      maxWidth: 200,
      flex: 1,
      resizable: false,
    },
    {
      field: "phonenumber",
      headerName: "Phone Number",
      minWidth: 120,
      maxWidth: 120,
      flex: 1,
      resizable: false,
    },
    {
      field: "email",
      headerName: "Email Address",
      minWidth: 150,
      flex: 1,
      resizable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      resizable: false,
      renderCell: (params) => (
        <>
          {user.Role === "admnistrator" && (
            <IconButton
              color="primary"
              onClick={() => handleAdd(params.row.id)}
            >
              <AddToQueueIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <IconButton color="warning" onClick={() => handleEdit(params.row.id)}>
            <Edit sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <Delete sx={{ fontSize: 20 }} />
          </IconButton>
        </>
      ),
    },
  ];

  // Handle Add Button
  const handleAdd = (id) => {
    // alert(`Add Student ID: ${id}`);
    navigate("/queuepost/" + id);
  };

  // Handle Edit Button
  const handleEdit = (id) => {
    // alert(`Edit Student ID: ${id}`);
    navigate("/studentprofile/" + id);
  };

  // Open delete confirmation dialog
  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    axios
      .delete(`${config.API_BASE_URL}/api/delete/student/` + deleteId) // Example API
      .then(() => {
        setStudents(students.filter((student) => student.id !== deleteId));
      })
      .catch((error) => {
        console.error("Error deleting student:", error);
        alert("Failed to delete student. Please try again.");
      })
      .finally(() => {
        setOpenDialog(false);
        setDeleteId(null);
        setOpenSuccess(true);
      });
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  return (
    <Container maxWidth="none" sx={{ mt: 5 }}>
      {/* Search Box */}

      <Grid2 container spacing={2} columns={16}>
        <Grid2 size={8}>
          <TextField
            label="Search"
            variant="outlined"
            sx={{ mb: 2 }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Grid2>
        <Grid2 size={8} container justifyContent="right" alignItems="center">
          <Link
            to="/studentpost"
            style={{ textDecoration: "none", color: "black" }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: amber[500],
                color: grey[800],
              }}
            >
              <Add />
            </Button>
          </Link>
        </Grid2>
      </Grid2>

      {/* DataGrid Table */}
      <DataGrid
        density="compact"
        sx={{
          "& .MuiDataGrid-cell:focus": { outline: "none" }, // Removes focus outline
          "& .MuiDataGrid-cell:focus-within": { outline: "none" }, // Ensures no focus border
        }}
        rows={filteredStudents}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
      />

      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={() => setOpenSuccess(false)}
      >
        <Alert severity="success" onClose={() => setOpenSuccess(false)}>
          Deleted Successfully
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this student? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentList;
