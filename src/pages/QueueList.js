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
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RefreshIcon from "@mui/icons-material/Refresh"; // import the icon
import BarChartIcon from "@mui/icons-material/BarChart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Link, useNavigate } from "react-router-dom";
import { amber, grey } from "@mui/material/colors";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import config from "../config";
import emailjs from "emailjs-com";
import QRScanner from "./QRScanner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 4,
  p: 4,
};

const QueueList = () => {
  const { user } = useAuth();

  // console.log(user);

  const [loggedInUser, setLoggedInUser] = useState([]); // Store API data

  // console.log(loggedInUser);

  const [queue, setQueue] = useState(null); // Store API data
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [Current_Student_ID, setCurrent_Student_ID] = useState(false);
  const [queuesRaw, setQueuesRaw] = useState([]); // Store API data
  const [windowQueueStats, setWindowQueueStats] = useState({});
  const [queues, setQueues] = useState([]); // Store API data

  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [deleteId, setDeleteId] = useState(null); // Queue ID to delete
  const [openDialog, setOpenDialog] = useState(false); // Delete confirmation dialog
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openStatus, setStatusSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [openChartModal, setOpenChartModal] = useState(false);
  const [openMiniDashboard, setOpenMiniDashboard] = useState(false);
  const [windowNumber, setWindowNumber] = useState("");
  const [assignedCounter, setAssignedCounter] = useState("");
  const [waitingStudent_ID, setWaitingStudent_ID] = useState("");
  const [isInProgress, setIsInProgress] = useState(false);
  const [buttonComplete, setButtonComplete] = useState(false);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // const [Student_ID, setStudent_ID] = useState("");

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
    let url = "";

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

    let intervalId;

    const fetchData = () => {
      if (loggedInUser) {
        setLoading(true);
        axios
          .get(url)
          .then((response) => {
            // console.log(response.data);
            setQueuesRaw(response.data);

            const formattedData = response.data.map((queue) => ({
              id: queue.Queue_ID,
              studentId: queue.Student_ID,
              date: format(new Date(queue.Start_Time), "yyyy-MM-dd"),
              time: format(new Date(queue.Start_Time), "hh:mm a"),
              studentName: `${queue.Last_Name.toUpperCase()}, ${queue.First_Name.toUpperCase()} ${queue.Middle_Name.toUpperCase()}`,
              coursecode: queue.Course_Major.toUpperCase()
                ? queue.Course_Code.toUpperCase() +
                  " - " +
                  queue.Course_Major.toUpperCase()
                : queue.Course_Code.toUpperCase(),
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

            const windowStats = {};
            response.data.forEach((queue) => {
              const window = queue.Window_Number || "Unassigned";
              if (!windowStats[window]) {
                windowStats[window] = { total: 0, completed: 0 };
              }
              windowStats[window].total += 1;
              if (queue.Status === "Completed") {
                windowStats[window].completed += 1;
              }
            });

            setWindowQueueStats(windowStats);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data.");
            setLoading(false);
          });
      }
    };

    fetchData(); // Initial fetch

    if (loggedInUser) {
      intervalId = setInterval(fetchData, 1000); // Auto update every 30 seconds
    }

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [loggedInUser, user]);

  // Convert windowQueueStats object to an array for charting
  const chartData = Object.entries(windowQueueStats).map(([window, stats]) => ({
    window,
    total: stats.total,
    completed: stats.completed,
  }));

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

  const waitingQueues = Array.isArray(queuesRaw)
    ? queuesRaw.filter(
        (q) => (q && q.Status === "Waiting") || q.Status === "In Progress"
      )
    : [];

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
      headerName: "Transaction",
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
      field: "windowNumber",
      headerName: "Window No.",
      minWidth: 100,
      flex: 1,
      resizable: false,
      hide:
        user.Role !== "administrator" &&
        user.Role !== "student" &&
        loggedInUser?.Staff_Position !== "head",
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
        user.Role === "administrator" ||
        loggedInUser.Staff_Position === "head" ||
        loggedInUser.Staff_Position === "staff",
      renderCell: (params) => (
        <>
          {/* {user.Role === "staff" && (
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
          )} */}
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
    let url = "";

    if (user.Role === "staff" && loggedInUser.Staff_Position === "staff") {
      url = `${config.API_BASE_URL}/api/queuelist/staff/window/${loggedInUser.Window_ID}`;
    } else if (
      user.Role === "staff" &&
      loggedInUser.Staff_Position === "head"
    ) {
      url = `${config.API_BASE_URL}/api/queuelist/staff/${loggedInUser.Counter_ID}`;
    } else if (user.Role === "student") {
      url = `${config.API_BASE_URL}/api/queuelist/student/${loggedInUser.Student_ID}`;
    } else if (user.Role === "administrator") {
      url = `${config.API_BASE_URL}/api/queuelist/administrator`;
    }

    if (loggedInUser && url) {
      setLoading(true);

      axios
        .get(url)
        .then((response) => {
          const rawData = response.data;

          // ✅ Sort by Queue_Number ascending
          const sortedData = rawData.sort(
            (a, b) => a.Queue_Number - b.Queue_Number
          );

          setQueuesRaw(sortedData);

          const formattedData = sortedData.map((queue) => ({
            id: queue.Queue_ID,
            studentId: queue.Student_ID,
            date: format(new Date(queue.Start_Time), "yyyy-MM-dd"),
            time: format(new Date(queue.Start_Time), "hh:mm a"),
            studentName: `${queue.Last_Name.toUpperCase()}, ${queue.First_Name.toUpperCase()} ${queue.Middle_Name.toUpperCase()}`,
            coursecode: queue.Course_Major?.toUpperCase()
              ? `${queue.Course_Code.toUpperCase()} - ${queue.Course_Major.toUpperCase()}`
              : queue.Course_Code.toUpperCase(),
            purpose: queue.Purpose_Description.toUpperCase(),
            remarks: queue.Remarks,
            role: queue.Role,
            assignedCounter: queue.Assigned_Counter?.toUpperCase(),
            status: queue.Status,
            personcategory: queue.Person_Category,
            windowId: queue.Window_ID,
            windowNumber: queue.Window_Number,
          }));

          setQueues(formattedData);

          const windowStats = {};
          response.data.forEach((queue) => {
            const window = queue.Window_Number || "Unassigned";
            if (!windowStats[window]) {
              windowStats[window] = { total: 0, completed: 0 };
            }
            windowStats[window].total += 1;
            if (queue.Status === "Completed") {
              windowStats[window].completed += 1;
            }
          });

          setWindowQueueStats(windowStats);

          setLoading(false);

          // ✅ Automatically select next valid queue
          const nextActiveIndex = sortedData.findIndex(
            (q) => q.Status !== "Completed" && q.Status !== "Cancelled"
          );

          if (nextActiveIndex !== -1) {
            const nextQueue = sortedData[nextActiveIndex];
            setCurrentQueueIndex(nextActiveIndex);
            setQueue(nextQueue);
            setCurrent_Student_ID(nextQueue.Student_ID || false);
          } else {
            setQueue(null);
            setCurrent_Student_ID(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setError("Failed to fetch data.");
          setLoading(false);
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

  const handleOpenModal = () => {
    if (queuesRaw.length > 0) {
      setCurrentQueueIndex(0);
      setCurrent_Student_ID(queuesRaw[0].Student_ID || false);
      setQueue(queuesRaw[0]);
      setIsInProgress(false); // <--- scanner off initially
      setOpen(true);
    } else {
      setOpen(true);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setQueue(null);
    setCurrent_Student_ID(false);
  };

  const handleManageStatus = (id, studentId, status) => {
    if (!queue || id !== queue.Queue_ID) return;

    setQueue((prev) => ({
      ...prev,
      Status: status,
    }));

    if (status === "In Progress") {
      setIsInProgress(true); // start scanning
      setCurrent_Student_ID(studentId);

      axios
        .put(`${config.API_BASE_URL}/api/put/status/`, {
          Queue_ID: id,
          Status: status,
          Remarks: queue.Remarks,
          Staff_ID: loggedInUser.Staff_ID,
        })
        .then((response) => {
          if (response.data.errno) {
            alert("Error updating status");
          } else {
            emailjs
              .send(
                "service_hoeq7no",
                "template_d87ppd9",
                {
                  Student_ID: queue.Student_ID,
                  Email_Address: queue.Email_Address,
                  Custom_Message: `Your queue is now ${status.toUpperCase()} kindly go to ${queue.Assigned_Counter.toUpperCase()}'S office at WINDOW ${
                    queue.Window_Number
                  }!`,
                },
                "Tg8bLRkOoVaK30Jkr"
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
          }
        });
    } else if (status === "Transfer") {
      setIsInProgress(false);
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
      // Hide scanner when status is Cancelled or Completed or else
      if (status === "Cancelled" || status === "Completed") {
        setIsInProgress(false);
        setCurrent_Student_ID(false);
      }

      axios
        .put(`${config.API_BASE_URL}/api/put/status/`, {
          Queue_ID: id,
          Staff_ID: loggedInUser.Staff_ID,
          Status: status,
          Remarks: queue.Remarks,
        })
        .then((response) => {
          if (response.data.errno) {
            alert("Error updating status");
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
                "service_hoeq7no",
                "template_d87ppd9",
                {
                  Student_ID: queue.Student_ID,
                  Email_Address: queue.Email_Address,
                  Custom_Message: message,
                },
                "Tg8bLRkOoVaK30Jkr"
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

            if (status === "Cancelled" || status === "Completed") {
              if (currentQueueIndex + 1 < queuesRaw.length) {
                const nextIndex = currentQueueIndex + 1;
                setCurrentQueueIndex(nextIndex);
                setQueue(queuesRaw[nextIndex]);
                setCurrent_Student_ID(queuesRaw[nextIndex].Student_ID || false);
              } else {
                handleCloseModal();
              }
            } else {
              // For other statuses (like CREATED), you can decide to hide scanner or not
              setCurrent_Student_ID(false);
              setOpen(false);
            }
          }
        });
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

  const handleOpenConfirm = (status) => {
    setPendingStatus(status);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setButtonComplete(false);
    setConfirmOpen(false);
    if (pendingStatus && queue) {
      handleManageStatus(queue.Queue_ID, queue.Student_ID, pendingStatus);
    }
    setPendingStatus(null);
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setPendingStatus(null);
  };

  const handleOpenChartModal = () => {
    setOpenChartModal(true);
    fetchQueue();
  };

  const handleCloseChartModal = () => {
    setOpenChartModal(false);
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
        {loggedInUser?.Role === "staff" && (
          <Grid2
            size={8}
            container
            justifyContent="right"
            alignItems="center"
            spacing={1}
          >
            {loggedInUser?.Staff_Position === "head" && (
              <Grid2>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleOpenChartModal}
                >
                  <BarChartIcon />
                </Button>
              </Grid2>
            )}
            {loggedInUser?.Staff_Position === "staff" && (
              <Grid2>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleOpenModal}
                >
                  MANAGE QUEUE
                </Button>
              </Grid2>
            )}

            <Grid2>
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
          </Grid2>
        )}
      </Grid2>

      {/* DataGrid Table */}
      <div style={{ height: 400, overflowY: "auto" }}>
        <DataGrid
          density="compact"
          sx={{
            "& .MuiDataGrid-cell:focus": { outline: "none" },
            "& .MuiDataGrid-cell:focus-within": { outline: "none" },
            "& .waiting-row": { backgroundColor: "#fff3cd !important" },
            "& .inprogress-row": { backgroundColor: "#A7C7E7 !important" },
            "& .completed-row": { backgroundColor: "#d4edda !important" },
            "& .cancelled-row": { backgroundColor: "#f8d7da !important" },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(68, 68, 68, 0.21) !important",
            },
          }}
          rows={filteredQueues}
          columns={visibleColumns}
          pageSize={20}
          rowsPerPageOptions={[5, 10, 20]}
          getRowClassName={(params) => {
            if (params.row.status === "Waiting") return "waiting-row";
            if (params.row.status === "In Progress") return "inprogress-row";
            if (params.row.status === "Completed") return "completed-row";
            if (params.row.status === "Cancelled") return "cancelled-row";
            return "";
          }}
        />
      </div>

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

      <Modal open={open} onClose={handleCloseModal} sx={{ overflowY: "auto" }}>
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
            "@media (max-width:600px)": { p: 2 },
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", top: 8, right: 8, color: "grey.600" }}
          >
            <CloseIcon />
          </IconButton>

          {queue && waitingQueues.length !== 0 ? (
            <>
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
                value={queue.Remarks || ""}
                onChange={handleTextChange}
              />

              {isInProgress && Current_Student_ID && (
                <Box sx={{ mb: 4 }}>
                  <QRScanner
                    Student_ID={Current_Student_ID}
                    onScanResult={(isValid) => {
                      if (isValid) {
                        setButtonComplete(true);
                      } else {
                        // show error or retry
                      }
                    }}
                  />
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
                    onClick={() => handleOpenConfirm("Cancelled")}
                    fullWidth
                  >
                    Cancelled
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
                    onClick={() => handleOpenConfirm("Completed")}
                    fullWidth
                    disabled={!buttonComplete} // <-- this should be controlled by parent state
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
            </>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "text.secondary",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <HourglassEmptyIcon
                sx={{ fontSize: 48, color: "primary.main" }}
              />
              <Typography variant="h6" component="div">
                No queues at the moment
              </Typography>
              <Typography variant="body2" sx={{ maxWidth: 300 }}>
                There are currently no queue entries. Please check back later or
                refresh the page.
              </Typography>
            </Box>
          )}
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

      <Modal open={openChartModal} onClose={handleCloseChartModal}>
        <Box sx={style}>
          {/* Close Button */}
          <IconButton
            aria-label="close"
            onClick={handleCloseChartModal}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Refresh Button */}
          <IconButton
            aria-label="refresh"
            onClick={() => {
              fetchQueue();
            }}
            sx={{
              position: "absolute",
              right: 56, // space it 40px left from the close button
              top: 16,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <RefreshIcon />
          </IconButton>

          {chartData.length > 0 ? (
            <div className="bg-white shadow-lg rounded-2xl p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Queue Overview
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  barSize={30}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="window"
                    tick={{
                      fill: "#1f2937", // Darker color
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                    tickFormatter={(value) => `Window ${value}`}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Window ${label}`}
                    contentStyle={{
                      backgroundColor: "#f9fafb",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "14px",
                    }}
                    itemStyle={{ color: "#374151" }}
                    labelStyle={{ fontWeight: "bold", color: "#111827" }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: 20 }}
                    formatter={(value) => (
                      <span style={{ color: "#4b5563", fontSize: "14px" }}>
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="total"
                    fill="#6366f1"
                    name="Total Queues"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    fill="#10b981"
                    name="Completed Queues"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p>No data available for chart.</p>
            </div>
          )}
        </Box>
      </Modal>

      <Dialog open={confirmOpen} onClose={handleCancelConfirm}>
        <DialogTitle>
          {pendingStatus === "Cancelled"
            ? "Confirm Cancellation"
            : "Confirm Completion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingStatus === "Cancelled"
              ? "Are you sure you want to cancel this queue? This action cannot be undone."
              : "Are you sure you want to mark this queue as completed?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            variant="outlined"
          >
            No
          </Button>
          <Button
            onClick={handleConfirm}
            color="success"
            variant="contained"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QueueList;
