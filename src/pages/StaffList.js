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
import { Link, useNavigate } from "react-router-dom";
import { amber, grey } from "@mui/material/colors";
import config from "../config";
import { useAuth } from "../context/AuthContext";

const StaffList = () => {
  const { user } = useAuth();

  const [loggedInUser, setLoggedInUser] = useState([]); // Store API data

  const [staffs, setStaffs] = useState([]); // Store API data
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [deleteId, setDeleteId] = useState(null); // Student ID to delete
  const [openDialog, setOpenDialog] = useState(false); // Delete confirmation dialog
  const [openSuccess, setOpenSuccess] = useState(false);

  const navigate = useNavigate();

  let url;

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/user/` + user.User_ID + `/` + user.Role)
      .then(function (response) {
        // console.log(response.data[0]);
        setLoggedInUser(response.data[0]);
      });
  }, []);

  useEffect(() => {
    if (loggedInUser?.Staff_Position === "head") {
      url = `${config.API_BASE_URL}/api/staffs/${loggedInUser.Counter_ID}/${loggedInUser.Staff_ID}`;
    }
    if (user.Role === "administrator") {
      url = `${config.API_BASE_URL}/api/staffs`;
    }

    axios
      .get(url) // Example API
      .then((response) => {
        // console.log(response.data);
        const formattedData = response.data.map((staff, index) => ({
          id: staff.Staff_ID, // Required by DataGrid
          name:
            staff.Staff_Last_Name.toUpperCase() +
            ", " +
            staff.Staff_First_Name.toUpperCase() +
            " " +
            staff.Staff_Middle_Name.toUpperCase(),
          email: staff.Staff_Email_Address,
          position: staff.Staff_Position.toUpperCase(),
          assignedcounter: staff.Office.toUpperCase(),
          queuelimit: staff.Queue_Limit,
          windownumber: staff.Window_Number,
        }));
        setStaffs(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [loggedInUser]);

  // Filter staffs based on search query
  const filteredStudents = staffs.filter(
    (staff) =>
      (staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.assignedcounter
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        staff.position.toLowerCase().includes(searchQuery.toLowerCase())) &&
      staff.assignedcounter.toLowerCase() !== "administrator"
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
      field: "name",
      headerName: "Name",
      minWidth: 200,
      flex: 1,
      resizable: false,
    },
    {
      field: "email",
      headerName: "Email Address",
      minWidth: 200,
      flex: 1,
      resizable: false,
    },
    {
      field: "position",
      headerName: "Position",
      minWidth: 200,
      maxWidth: 200,
      flex: 1,
      resizable: false,
    },
    {
      field: "assignedcounter",
      headerName: "Office",
      minWidth: 300,
      maxWidth: 300,
      flex: 1,
      resizable: false,
    },
    {
      field: "windownumber",
      headerName: "Window No.",
      minWidth: 120,
      maxWidth: 120,
      flex: 1,
      resizable: false,
    },
    {
      field: "queuelimit",
      headerName: "Queue Limit",
      minWidth: 120,
      maxWidth: 120,
      flex: 1,
      resizable: false,
      renderCell: (params) => {
        return params.value === 0 ? null : params.value;
      },
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
    alert(`Add Staff ID: ${id}`);
    // navigate("/queuepost/" + id);
  };

  // Handle Edit Button
  const handleEdit = (id) => {
    // alert(`Edit Staff ID: ${id}`);
    navigate("/staffprofile/" + id);
  };

  // Open delete confirmation dialog
  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    axios
      .delete(`${config.API_BASE_URL}/api/delete/staff/` + deleteId) // Example API
      .then(() => {
        setStaffs(staffs.filter((staff) => staff.id !== deleteId));
      })
      .catch((error) => {
        console.error("Error deleting staff:", error);
        alert("Failed to delete staff. Please try again.");
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
            to="/staffpost"
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
            Are you sure you want to delete this staff? This action cannot be
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

export default StaffList;
