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
import WindowIcon from "@mui/icons-material/Window";
import { Link, useNavigate } from "react-router-dom";
import { amber, grey } from "@mui/material/colors";
import config from "../config";
import { useAuth } from "../context/AuthContext";

const CourseList = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]); // Store API data
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [deleteId, setDeleteId] = useState(null); // Student ID to delete
  const [openDialog, setOpenDialog] = useState(false); // Delete confirmation dialog
  const [openSuccess, setOpenSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/courses`) // Example API
      .then((response) => {
        // console.log(response.data);
        const formattedData = response.data.map((course, index) => ({
          id: course.Course_ID,
          coursecode: course.Course_Major.toUpperCase()
            ? course.Course_Code.toUpperCase() +
              " - " +
              course.Course_Major.toUpperCase()
            : course.Course_Code.toUpperCase(), // Required by DataGrid
          coursedescription: course.Course_Description.toUpperCase(), // Required by DataGrid
        }));
        setCourses(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Filter courses based on search query
  const filteredCourses = courses.filter(
    (course) =>
      course.coursecode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.coursedescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define table columns
  const columns = [
    // {
    //   field: "id",
    //   headerName: "ID",
    //   minWidth: 120,
    //   maxWidth: 120,
    //   flex: 1,
    //   resizable: false,
    // },
    {
      field: "coursecode",
      headerName: "Code",
      minWidth: 200,
      flex: 1,
      resizable: false,
    },
    {
      field: "coursedescription",
      headerName: "Description",
      minWidth: 500,
      flex: 1,
      resizable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      resizable: false,
      renderCell: (params) => (
        <>
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
  const handleViewWindow = (id) => {
    alert(`View Course ID: ${id}`);
    // navigate("/windowlist/" + id);
  };

  // Handle Edit Button
  const handleEdit = (id) => {
    // alert(`Edit Course ID: ${id}`);
    navigate("/courseprofile/" + id);
  };

  // Open delete confirmation dialog
  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    axios
      .delete(`${config.API_BASE_URL}/api/delete/course/` + deleteId) // Example API
      .then(() => {
        setCourses(courses.filter((course) => course.id !== deleteId));
      })
      .catch((error) => {
        console.error("Error deleting office:", error);
        alert("Failed to delete office. Please try again.");
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
            to="/coursepost"
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
        rows={filteredCourses}
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
            Are you sure you want to delete this course? This action cannot be
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

export default CourseList;
