import React from "react";
import { useEffect, useState, useRef } from "react";
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
  Modal,
  Box,
  Typography,
  Card,
  Grid,
  CardContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Delete, Edit } from "@mui/icons-material";
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccessibleIcon from "@mui/icons-material/Accessible";
import ElderlyIcon from "@mui/icons-material/Elderly";
import PregnantWomanIcon from "@mui/icons-material/PregnantWoman";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Link, useNavigate } from "react-router-dom";
import { amber, grey } from "@mui/material/colors";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import config from "../config";
import emailjs from "emailjs-com";
import QRScanner from "./QRScanner";

const QueueList = () => {
  const { user } = useAuth();

  // console.log(user);

  const [loggedInUser, setLoggedInUser] = useState([]); // Store API data

  // console.log(loggedInUser);

  const [queue, setQueue] = useState({
    Remarks: "",
  }); // Store API data
  const [queues, setQueues] = useState([]); // Store API data
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [deleteId, setDeleteId] = useState(null); // Queue ID to delete
  const [openDialog, setOpenDialog] = useState(false); // Delete confirmation dialog
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openStatus, setStatusSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMiniDashboard, setOpenMiniDashboard] = useState(false);
  const [windowNumber, setWindowNumber] = useState("");
  const [assignedCounter, setAssignedCounter] = useState("");
  const [waitingStudent_ID, setWaitingStudent_ID] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [Student_ID, setStudent_ID] = useState("");

  let url;

  const navigate = useNavigate();

  const pollingInterval = 1000; // 5 seconds

  const pollingRef = useRef(null);

  const [queuesWaiting, setQueuesWaiting] = useState([]); // Store API data
  const [queueInProgress, setQueueInProgress] = useState([]); // Store API data

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/user/` + user.User_ID + `/` + user.Role)
      .then(function (response) {
        // console.log(response.data[0]);
        setLoggedInUser(response.data[0]);
      });
  }, []);

  useEffect(() => {
    if (user.Role === "staff" && loggedInUser.Staff_Position === "staff") {
      url = `${config.API_BASE_URL}/api/queuelist/staff/window/${loggedInUser.Window_ID}`;
    }
    if (user.Role === "staff" && loggedInUser.Staff_Position === "head") {
      url = `${config.API_BASE_URL}/api/queuelist/staff/${loggedInUser.Counter_ID}`;
    }
    if (user.Role === "student") {
      url = `${config.API_BASE_URL}/api/queuelist/student/${loggedInUser.Student_ID}`;
    }
    if (user.Role === "administrator") {
      url = `${config.API_BASE_URL}/api/queuelist/administrator`;
    }

    // If loggedInUser.Assigned_Counter is available, proceed with fetching data
    if (loggedInUser) {
      setLoading(true); // Start loading before making the request
      axios
        .get(url)
        .then((response) => {
          // console.log(response.data);
          // Format the data into a structure your DataGrid expects
          const formattedData = response.data.map((queue) => ({
            id: queue.Queue_ID,
            studentId: queue.Student_ID,
            date: format(new Date(queue.Start_Time), "yyyy-MM-dd"), // Ensure correct date format
            time: format(new Date(queue.Start_Time), "hh:mm a"),
            studentName: `${queue.Last_Name.toUpperCase()}, ${queue.First_Name.toUpperCase()} ${queue.Middle_Name.toUpperCase()}`,
            coursecode: queue.Course_Major.toUpperCase()
              ? queue.Course_Code.toUpperCase() +
                " - " +
                queue.Course_Major.toUpperCase()
              : queue.Course_Code.toUpperCase(), // Required by DataGrid
            purpose: queue.Purpose_Description.toUpperCase(),
            remarks: queue.Remarks,
            role: queue.Role,
            assignedCounter: queue.Assigned_Counter.toUpperCase(),
            status: queue.Status,
            personcategory: queue.Person_Category,
            windowId: queue.Window_ID,
            windowNumber: queue.Window_Number,
          }));
          setQueues(formattedData);
          setLoading(false); // Data fetched successfully, stop loading
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setError("Failed to fetch data.");
          setLoading(false); // Stop loading even if there's an error
        });
    }
  }, [loggedInUser]);

  // Filter queues based on search query

  const filteredQueues = queues.filter(
    (queue) =>
      queue.studentId.includes(searchQuery.toLowerCase()) ||
      queue.date.includes(searchQuery.toLowerCase()) ||
      queue.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
      queue.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      queue.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      queue.remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
      queue.assignedCounter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      queue.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define table columns
  const columns = [
    {
      field: "date",
      headerName: "Date",
      resizable: false,
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
    },
    {
      field: "time",
      headerName: "Time",
      resizable: false,
      minWidth: 100,
      maxWidth: 100,
      flex: 1,
    },
    {
      field: "studentId",
      headerName: "Student ID",
      minWidth: 120,
      maxWidth: 120,
      flex: 1,
      resizable: false,
      hide: user.Role === "student",
    },
    {
      field: "studentName",
      headerName: "Student",
      minWidth: 250,
      flex: 1,
      resizable: false,
      hide: user.Role === "student",
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
      field: "coursecode",
      headerName: "Course",
      minWidth: 100,
      flex: 1,
      resizable: false,
      hide: user.Role === "student",
    },
    {
      field: "purpose",
      headerName: "Purpose",
      minWidth: 240,
      flex: 1,
      resizable: false,
    },
    {
      field: "assignedCounter",
      headerName: "Office",
      minWidth: 100,
      flex: 1,
      resizable: false,
      hide: user.Role !== "administrator" && user.Role !== "student",
    },
    {
      field: "status",
      headerName: "Status",
    },
    {
      field: "remarks",
      headerName: "Remarks",
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      flex: 1,
      resizable: false,
      hide:
        user.Role === "administrator" || loggedInUser.Staff_Position === "head",
      renderCell: (params) => (
        <>
          {user.Role === "staff" && (
            <>
              <Button
                title="Manage Status"
                sx={{ textDecoration: "none", color: "green" }}
                onClick={() =>
                  handleManage(
                    params.row.id,
                    params.row.studentId,
                    params.row.status
                  )
                }
              >
                <AssignmentIcon sx={{ fontSize: 20, color: "green" }} />
                &nbsp; Manage
              </Button>
            </>
          )}
          {user.Role === "student" && params.row.status === "Waiting" && (
            <>
              {/* <IconButton
                title="Edit"
                color="warning"
                onClick={() => handleEdit(params.row.id)}
              >
                <Edit />
              </IconButton> */}
              <IconButton
                title="Delete"
                color="error"
                onClick={() => handleDelete(params.row.id)}
              >
                <Delete />
              </IconButton>
              <IconButton
                title="Dashboard"
                sx={{ color: "#2196f3" }}
                onClick={() =>
                  handleSelect(
                    params.row.windowId,
                    params.row.windowNumber,
                    params.row.assignedCounter,
                    params.row.studentId
                  )
                }
              >
                <DashboardIcon />
              </IconButton>
            </>
          )}
        </>
      ),
    },
  ];

  const visibleColumns = columns.filter((col) => !col.hide);

  const fetchQueue = () => {
    if (user.Role === "staff" && loggedInUser.Staff_Position === "staff") {
      url = `${config.API_BASE_URL}/api/queuelist/staff/window/${loggedInUser.Window_ID}`;
    }
    if (user.Role === "staff" && loggedInUser.Staff_Position === "head") {
      url = `${config.API_BASE_URL}/api/queuelist/staff/${loggedInUser.Counter_ID}`;
    }
    if (user.Role === "student") {
      url = `${config.API_BASE_URL}/api/queuelist/student/${loggedInUser.Student_ID}`;
    }
    if (user.Role === "administrator") {
      url = `${config.API_BASE_URL}/api/queuelist/administrator`;
    }

    // If loggedInUser.Assigned_Counter is available, proceed with fetching data
    if (loggedInUser) {
      setLoading(true); // Start loading before making the request
      axios
        .get(url)
        .then((response) => {
          // console.log(response.data);
          // Format the data into a structure your DataGrid expects
          const formattedData = response.data.map((queue) => ({
            id: queue.Queue_ID,
            studentId: queue.Student_ID,
            date: format(new Date(queue.Start_Time), "yyyy-MM-dd"), // Ensure correct date format
            time: format(new Date(queue.Start_Time), "hh:mm a"),
            studentName: `${queue.Last_Name.toUpperCase()}, ${queue.First_Name.toUpperCase()} ${queue.Middle_Name.toUpperCase()}`,
            coursecode: queue.Course_Major.toUpperCase()
              ? queue.Course_Code.toUpperCase() +
                " - " +
                queue.Course_Major.toUpperCase()
              : queue.Course_Code.toUpperCase(), // Required by DataGrid
            purpose: queue.Purpose_Description.toUpperCase(),
            remarks: queue.Remarks,
            role: queue.Role,
            assignedCounter: queue.Assigned_Counter.toUpperCase(),
            status: queue.Status,
            personcategory: queue.Person_Category,
            windowId: queue.Window_ID,
            windowNumber: queue.Window_Number,
          }));
          setQueues(formattedData);
          setLoading(false); // Data fetched successfully, stop loading
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setError("Failed to fetch data.");
          setLoading(false); // Stop loading even if there's an error
        });
    }
  };

  const pendingCount = queues.filter((q) => q.status === "Waiting").length;
  const completedCount = queues.filter((q) => q.status === "Completed").length;
  const cancelledCount = queues.filter((q) => q.status === "Cancelled").length;
  const totalCount = queues.length;

  const countsByMonth = {};

  queues.forEach((q) => {
    // Ensure the item has a valid createdAt date
    if (q.createdAt) {
      const date = new Date(q.createdAt);
      const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g. "2025-5"

      // Initialize the month object if it doesn't exist
      if (!countsByMonth[yearMonth]) {
        countsByMonth[yearMonth] = {
          pendingCount: 0,
          completedCount: 0,
          cancelledCount: 0,
        };
      }

      // Update the counts based on status
      if (q.status === "Waiting") {
        countsByMonth[yearMonth].pendingCount++;
      } else if (q.status === "Completed") {
        countsByMonth[yearMonth].completedCount++;
      } else if (q.status === "Cancelled") {
        countsByMonth[yearMonth].cancelledCount++;
      }
    }
  });

  // Handle Manage Button
  const handleManage = (id, studentId, status) => {
    // alert(id + " " + studentId + " " + status);
    if (status === "In Progress") {
      setStudent_ID(studentId);
    } else {
      setStudent_ID(null);
    }

    if (id) {
      axios
        .get(`${config.API_BASE_URL}/api/queue/` + id)
        .then(function (response) {
          // console.log(response.data[0]);
          setQueue(response.data[0]);

          setOpen(true);
        });
    }
  };

  const handleManageCancel = () => {
    fetchQueue();
    setOpen(false);
  };

  const handleManageStatus = (id, studentId, status) => {
    if (id === queue.Queue_ID) {
      // alert(
      //   id +
      //     " - " +
      //     status +
      //     " - " +
      //     queue.Remarks +
      //     " - " +
      //     loggedInUser.Staff_ID
      // );

      setQueue((prev) => {
        const updatedQueue = {
          ...prev,
          Status: status,
        };
        // console.log(updatedQueue); // logs the new state
        return updatedQueue;
      });

      // console.log(queue);

      // console.log(loggedInUser.Staff_ID);

      if (status === "In Progress") {
        axios
          .put(`${config.API_BASE_URL}/api/put/status/`, {
            Queue_ID: id,
            Status: status,
            Remarks: queue.Remarks,
            Staff_ID: loggedInUser.Staff_ID,
          })
          .then(function (response) {
            // console.log(response.data);
            if (response.data.errno) {
              alert("error");
            } else {
              emailjs
                .send(
                  "service_a44eotc", // Replace with your EmailJS Service ID
                  "template_3rmgz2i", // Replace with your EmailJS Template ID
                  {
                    Student_ID: queue.Student_ID,
                    Email_Address: queue.Email_Address,
                    Custom_Message: `Your queue is now ${status.toUpperCase()} kindly go to ${queue.Assigned_Counter.toUpperCase()}'S office at WINDOW ${
                      queue.Window_Number
                    }!`,
                  },
                  "JCUSScyWzhjLV0Xky" // Replace with your EmailJS Public Key
                )
                .then(
                  (result) => {
                    console.log("Email sent successfully", result.text);
                  },
                  (error) => {
                    console.error("Error sending email", error.text);
                  }
                );
              setStudent_ID(studentId);
              fetchQueue();
            }
          });
      } else if (status === "Transfer") {
        navigate(
          "/queueprofile/" +
            id +
            "/" +
            queue.Counter_ID +
            "/" +
            queue.Purpose_ID +
            "/" +
            queue.Window_ID
        );
      } else {
        axios
          .put(`${config.API_BASE_URL}/api/put/status/`, {
            Queue_ID: id,
            Staff_ID: loggedInUser.Staff_ID,
            Status: status,
            Remarks: queue.Remarks,
          })
          .then(function (response) {
            // console.log(response.data);
            if (response.data.errno) {
              alert("error");
            } else {
              let message = "";

              if (status === "Completed") {
                message = `Your queue is now ${status.toUpperCase()} kindly go to ${queue.Assigned_Counter.toUpperCase()}'S office at WINDOW ${
                  queue.Window_Number
                }!`;
              } else if (status === "Cancelled") {
                message = `We regret to inform you that your queue has been ${status.toUpperCase()} due to a NO SHOW!`;
              } else {
                message = `Your queue has been CREATED. Please wait patiently — you will be notified once it's your turn.`;
              }

              emailjs
                .send(
                  "service_a44eotc", // Replace with your EmailJS Service ID
                  "template_3rmgz2i", // Replace with your EmailJS Template ID
                  {
                    Student_ID: queue.Student_ID,
                    Email_Address: queue.Email_Address,
                    Custom_Message: message,
                  },
                  "JCUSScyWzhjLV0Xky" // Replace with your EmailJS Public Key
                )
                .then(
                  (result) => {
                    console.log("Email sent successfully", result.text);
                  },
                  (error) => {
                    console.error("Error sending email", error.text);
                  }
                );

              fetchQueue();
              setStudent_ID(false);
              setOpen(false);
            }
          });
      }
    }
  };

  // // Handle Edit Button
  // const handleEdit = (id) => {
  //   // alert(`Edit Queue ID: ${id}`);
  //   navigate("/queueprofile/" + id);
  // };

  // Handle Edit Button
  const handleSelect = (
    Window_ID,
    Window_Number,
    Assigned_Counter,
    Student_ID
  ) => {
    setOpenMiniDashboard(true);
    setWindowNumber(Window_Number);
    setAssignedCounter(Assigned_Counter);
    setWaitingStudent_ID(Student_ID);

    // Clear any existing interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Initial fetch
    fetchQueueData(Window_ID);

    // Start polling
    pollingRef.current = setInterval(() => {
      fetchQueueData(Window_ID);
    }, pollingInterval);
  };

  const fetchQueueData = (Window_ID) => {
    axios
      .get(
        `${config.API_BASE_URL}/api/queuelist/minidasboard/${Window_ID}/Waiting`
      )
      .then((response) => {
        setQueuesWaiting(response.data);
      });

    axios
      .get(
        `${config.API_BASE_URL}/api/queuelist/minidasboard/${Window_ID}/In Progress`
      )
      .then((response) => {
        setQueueInProgress(response.data[0]);
      });
  };

  // Optional: clear polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);
  // Open delete confirmation dialog
  const handleDelete = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    axios
      .delete(`${config.API_BASE_URL}/api/delete/queue/` + deleteId) // Example API
      .then(() => {
        setQueues(queues.filter((queue) => queue.id !== deleteId));
      })
      .catch((error) => {
        console.error("Error deleting queue:", error);
        alert("Failed to delete queue. Please try again.");
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

  const handleTextChange = (event) => {
    setQueue({
      ...queue,
      Remarks: event.target.value,
    });
  };

  return (
    <Container maxWidth="none" sx={{ mt: 5 }}>
      {(user.Role === "administrator" || user.Role === "staff") && (
        <Grid
          container
          spacing={2}
          sx={{ mb: 3 }}
          justifyContent="space-between"
        >
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#fff3cd", p: 2 }}>
              <Typography variant="h6" color="textPrimary">
                Pending
              </Typography>
              <Typography variant="h4" color="textPrimary">
                {pendingCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#d4edda", p: 2 }}>
              <Typography variant="h6" color="textPrimary">
                Completed
              </Typography>
              <Typography variant="h4" color="textPrimary">
                {completedCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#f8d7da", p: 2 }}>
              <Typography variant="h6" color="textPrimary">
                Cancelled
              </Typography>
              <Typography variant="h4" color="textPrimary">
                {cancelledCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e2e3e5", p: 2 }}>
              <Typography variant="h6" color="textPrimary">
                Total
              </Typography>
              <Typography variant="h4" color="textPrimary">
                {totalCount}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}
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
        {user.Role === "student" && (
          <Grid2 size={8} container justifyContent="right" alignItems="center">
            <Link
              to={"/queuepost/" + loggedInUser.Student_ID}
              style={{ textDecoration: "none", color: "black" }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: amber[500],
                  color: grey[800],
                }}
              >
                <AddToQueueIcon />
              </Button>
            </Link>
          </Grid2>
        )}
        {user.Role === "staff" && (
          <Grid2 size={8} container justifyContent="right" alignItems="center">
            <Link
              to={"/queuereport"}
              style={{ textDecoration: "none", color: "black" }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: amber[500],
                  color: grey[800],
                }}
              >
                <ListAltIcon />
              </Button>
            </Link>
          </Grid2>
        )}
      </Grid2>

      {/* DataGrid Table */}
      <DataGrid
        density="compact"
        sx={{
          "& .MuiDataGrid-cell:focus": { outline: "none" }, // Removes focus outline
          "& .MuiDataGrid-cell:focus-within": { outline: "none" }, // Ensures no focus border
          "& .waiting-row": { backgroundColor: "#fff3cd !important" }, // Yellow
          "& .inprogress-row": { backgroundColor: "#A7C7E7 !important" }, // blue
          "& .completed-row": { backgroundColor: "#d4edda !important" }, // Green
          "& .cancelled-row": { backgroundColor: "#f8d7da !important" }, // Red
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(68, 68, 68, 0.21) !important", // Transparent dark effect on hover
          },
        }}
        rows={filteredQueues}
        columns={visibleColumns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        getRowClassName={(params) => {
          if (params.row.status === "Waiting") return "waiting-row";
          if (params.row.status === "In Progress") return "inprogress-row";
          if (params.row.status === "Completed") return "completed-row";
          if (params.row.status === "Cancelled") return "cancelled-row";
          return "";
        }}
      />

      <Snackbar
        open={openStatus}
        autoHideDuration={3000}
        onClose={() => setStatusSuccess(false)}
      >
        <Alert severity="success" onClose={() => setStatusSuccess(false)}>
          Status Updated
        </Alert>
      </Snackbar>

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
            Are you sure you want to delete this queue? This action cannot be
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

      <Modal
        open={open}
        sx={{
          overflowY: "auto", // Enables vertical scrolling
        }}
      >
        <Box
          sx={{
            width: "90vw",
            maxWidth: "600px",
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 4,
            mx: "auto",
            my: "10vh",
            position: "relative",
            boxShadow: 24,
            outline: "none",
            "@media (max-width:600px)": {
              p: 2,
            },
          }}
        >
          <IconButton
            onClick={handleManageCancel}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "grey.600",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ fontSize: 18, color: "grey" }} gutterBottom>
              ID :
            </Typography>
            <Typography sx={{ fontSize: 18 }} gutterBottom>
              {queue.Student_ID}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ fontSize: 18, color: "grey" }} gutterBottom>
              Name :
            </Typography>
            <Typography
              sx={{ fontSize: 18, textTransform: "uppercase" }}
              gutterBottom
            >
              {queue.Last_Name +
                ", " +
                queue.First_Name +
                " " +
                queue.Middle_Name}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ fontSize: 18, color: "grey" }} gutterBottom>
              Purpose :
            </Typography>
            <Typography
              sx={{
                fontSize: 18,
                wordBreak: "break-word",
                overflowWrap: "break-word",
                textTransform: "uppercase",
              }}
              gutterBottom
            >
              {queue.Purpose_Description}
            </Typography>
          </Box>

          <TextField
            sx={{ mt: 2, mb: 4 }}
            rows={3}
            fullWidth
            multiline
            label="Remarks"
            name="Remarks"
            value={queue.Remarks}
            onChange={handleTextChange}
          />

          {Student_ID && (
            <Box
              sx={{
                mb: 4,
              }}
            >
              <QRScanner Student_ID={Student_ID} />
            </Box>
          )}

          <Grid2
            container
            spacing={2}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Grid2 item xs={6}>
              <Button
                variant="contained"
                sx={{ backgroundColor: "red" }}
                onClick={() =>
                  handleManageStatus(
                    queue.Queue_ID,
                    queue.Student_ID,
                    "Cancelled"
                  )
                }
                fullWidth
              >
                No Show
              </Button>
            </Grid2>
            <Grid2 item xs={6}>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#ffeb3b", color: "black" }}
                onClick={() =>
                  handleManageStatus(
                    queue.Queue_ID,
                    queue.Student_ID,
                    "Waiting"
                  )
                }
                fullWidth
              >
                Waiting
              </Button>
            </Grid2>
            <Grid2 item xs={6}>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#2196f3" }}
                onClick={() =>
                  handleManageStatus(
                    queue.Queue_ID,
                    queue.Student_ID,
                    "In Progress"
                  )
                }
                fullWidth
              >
                In Progress
              </Button>
            </Grid2>
            <Grid2 item xs={6}>
              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  handleManageStatus(
                    queue.Queue_ID,
                    queue.Student_ID,
                    "Completed"
                  )
                }
                fullWidth
              >
                Complete
              </Button>
            </Grid2>
            <Grid2 item xs={3}>
              <Button
                variant="contained"
                sx={{ backgroundColor: "grey" }}
                onClick={() =>
                  handleManageStatus(
                    queue.Queue_ID,
                    queue.Student_ID,
                    "Transfer"
                  )
                }
                fullWidth
              >
                Transfer
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Modal>

      <Modal
        open={openMiniDashboard}
        onClose={() => setOpenMiniDashboard(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflowY: "auto", // This enables scrolling on the modal background
        }}
      >
        <Box
          sx={{
            maxWidth: 400, // Adjust as needed
            // border: "black solid 1px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            mt: "5rem",
            mb: "3rem", // space for footer
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // Center horizontally
              padding: 2,
              gap: 2,
              overflowX: "auto", // Optional: remove if you don't want scroll
            }}
          >
            <Card
              sx={{
                width: "100%", // Optional: set a fixed width or percentage
                maxWidth: 400, // Adjust as needed
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: amber[100],
                border: "1px solid black",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: amber[900],
                  fontWeight: "bold",
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                {assignedCounter} <br></br> WINDOW {windowNumber}{" "}
              </Typography>

              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" fontWeight="bold" color={amber[900]}>
                  Now Serving
                </Typography>
                <Typography
                  variant="h4"
                  color="primary"
                  fontWeight="bold"
                  noWrap
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    marginY: 1,
                  }}
                >
                  {queueInProgress?.Student_ID || "None"}
                  {queueInProgress?.Person_Category ===
                    "Person With Disability" && (
                    <AccessibleIcon
                      sx={{ color: "blue", marginLeft: 1, flexShrink: 0 }}
                      titleAccess="Person with disability"
                    />
                  )}
                  {queueInProgress?.Person_Category === "Pregnant" && (
                    <PregnantWomanIcon
                      sx={{ color: "pink", marginLeft: 1, flexShrink: 0 }}
                      titleAccess="Pregnant person"
                    />
                  )}
                </Typography>
              </CardContent>

              <CardContent sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={amber[900]}
                  textAlign="center"
                >
                  Next in Line
                </Typography>
                <Box
                  sx={{
                    maxHeight: "50vh",
                    overflowY: "auto",
                    mt: 1,
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": {
                      width: 0,
                      height: 0,
                    },
                    "&:hover": {
                      scrollbarWidth: "thin",
                      "&::-webkit-scrollbar": {
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#888",
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "#f1f1f1",
                      },
                    },
                  }}
                >
                  {queuesWaiting.length > 0 ? (
                    queuesWaiting.map((queueWaiting, index) => (
                      <Box key={index} display="flex" justifyContent="center">
                        <Typography
                          variant="body1"
                          fontSize="2rem"
                          fontWeight="bold"
                          display="flex"
                          alignItems="center"
                          sx={{
                            color:
                              queueWaiting.Student_ID === waitingStudent_ID
                                ? "green"
                                : "default",
                          }}
                        >
                          {queueWaiting.Student_ID}
                          {queueWaiting.Person_Category ===
                            "Person With Disability" && (
                            <AccessibleIcon
                              sx={{ color: "blue", marginLeft: 1 }}
                              titleAccess="Person with disability"
                            />
                          )}
                          {queueWaiting.Person_Category === "Pregnant" && (
                            <PregnantWomanIcon
                              sx={{ color: "pink", marginLeft: 1 }}
                              titleAccess="Pregnant person"
                            />
                          )}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography textAlign="center">No queues</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default QueueList;
