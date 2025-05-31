import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid2,
  Box,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { QRCodeSVG } from "qrcode.react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import config from "../config";
import { Password } from "@mui/icons-material";

const StaffProfile = () => {
  const { id } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [staffUserAccount, setStaffUserAccount] = useState([]);

  const [staff, setStaff] = useState({
    Staff_ID: "",
    Staff_Last_Name: "",
    Staff_First_Name: "",
    Staff_Middle_Name: "",
    Staff_Email_Address: "",
    Assigned_Counter: "",
    Window_ID: "",
  });

  const [staffs, setStaffs] = useState([]);

  const [counters, setCounters] = useState([]);

  const [users, setUsers] = useState([]);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);

  const [error, setError] = useState("");

  const [loggedInUser, setLoggedInUser] = useState([]); // Store API data

  let url;

  const [windows, setWindows] = useState([]);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/windows`).then(function (response) {
      // console.log(response.data);
      setWindows(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/counters`).then(function (response) {
      // console.log(response.data);
      setCounters(response.data);
    });
  }, []);

  const sortedWindowData = [...windows].sort((a, b) => {
    if (a.Assigned_Counter.toLowerCase() === "none") return -1;
    if (b.Assigned_Counter.toLowerCase() === "none") return 1;
    return 0;
  });

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/users`).then(function (response) {
      // console.log(response.data);
      setUsers(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/user/` + user.User_ID + `/` + user.Role)
      .then(function (response) {
        // console.log(response.data[0]);
        setLoggedInUser(response.data[0]);
      });
  }, []);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/staffs`).then(function (response) {
      //   console.log(response.data);
      setStaffs(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/staff/` + id)
      .then(function (response) {
        console.log(response.data[0]);
        setStaff(response.data[0]);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/user/` + id)
      .then(function (response) {
        // console.log(response.data[0]);
        if (response.data && response.data[0]) {
          setStaffUserAccount(response.data[0]);
        } else {
          setStaffUserAccount({
            Username: "",
            Password: "",
          });
        }
      });
  }, []);

  const foundUser = users.find((obj) => {
    return obj.User_Type_ID === id;
  });

  const foundUserAccount = users.find((obj) => {
    return obj.Username === staffUserAccount.Username;
  });

  const foundAssignedCounter = staffs.find((obj) => {
    return obj.Window_ID == staff.Window_ID;
  });

  const handleChange = (event) => {
    const value = event.target.value;
    setStaff({
      ...staff,
      [event.target.name]: value,
    });
  };

  const handleChangeUserAccount = (event) => {
    const value = event.target.value;
    setStaffUserAccount({
      ...staffUserAccount,
      [event.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // console.log(staff);

    if (staff) {
      if (
        foundAssignedCounter &&
        foundAssignedCounter.Staff_ID !== staff.Staff_ID
      ) {
        if (foundAssignedCounter.Window_Number === null) {
          setError(
            `${foundAssignedCounter.Assigned_Counter.toUpperCase()}
             has already been assigned!`
          );
        } else {
          setError(
            `${foundAssignedCounter.Assigned_Counter.toUpperCase()} at Window ${
              foundAssignedCounter.Window_Number
            }
             has already been assigned!`
          );
        }

        console.log(staff);
      } else {
        axios
          .put(`${config.API_BASE_URL}/api/put/staff/` + id, staff)
          .then(function (response) {
            console.log(response.data);
            if (response.data.errno) {
              setOpenWarning(true);
            } else {
              if (!foundUser) {
                if (
                  staffUserAccount.Username === "" ||
                  staffUserAccount.Password === ""
                ) {
                  setError("Username and Password must not be empty!");
                } else {
                  if (!foundUserAccount) {
                    axios
                      .post(
                        `${config.API_BASE_URL}/api/post/user/staff/` + id,
                        staffUserAccount
                      )
                      .then(function (response) {
                        console.log(response.data);
                        navigate("/stafflist");
                        setOpenSuccess(true);
                      });
                  } else {
                    setError("Username is already used!");
                  }
                }
              } else {
                axios
                  .put(
                    `${config.API_BASE_URL}/api/put/user/staff/` + id,
                    staffUserAccount
                  )
                  .then(function (response) {
                    navigate("/stafflist");
                    setOpenSuccess(true);
                  })
                  .catch(function (error) {
                    // console.error("Error updating staff account:");
                    setError("Username is already used!");
                  });
              }
            }
          });
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 5 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          marginTop: 4,
          marginBottom: 4,
          // backgroundColor: "black",
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, mt: 4 }}>
          Staff Profile
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid2 container spacing={2} justifyContent="center">
            <Grid2 item size={12}>
              <Typography sx={{ mb: 2, textAlign: "left", color: "#0009" }}>
                User Account
              </Typography>
              <TextField
                fullWidth
                type="text"
                label="Username"
                name="Username"
                value={staffUserAccount ? staffUserAccount.Username : ""}
                onChange={handleChangeUserAccount}
                slotProps={{
                  inputLabel: {
                    shrink: !!staffUserAccount.Username,
                  },
                }}
              />
            </Grid2>
            <Grid2 item size={12} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                type="text"
                label="Password"
                name="Password"
                value={staffUserAccount ? staffUserAccount.Password : ""}
                onChange={handleChangeUserAccount}
                slotProps={{
                  inputLabel: {
                    shrink: !!staffUserAccount.Password,
                  },
                }}
              />
            </Grid2>
            <Grid2 item size={12}>
              <Typography sx={{ mb: 3, textAlign: "left", color: "#0009" }}>
                Personal Information
              </Typography>
              <TextField
                fullWidth
                required
                sx={{ "& input": { textTransform: "uppercase" } }}
                label="Last Name"
                name="Staff_Last_Name"
                value={staff.Staff_Last_Name}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                fullWidth
                required
                sx={{ "& input": { textTransform: "uppercase" } }}
                label="First Name"
                name="Staff_First_Name"
                value={staff.Staff_First_Name}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                fullWidth
                sx={{ "& input": { textTransform: "uppercase" } }}
                label="Middle Name"
                name="Staff_Middle_Name"
                value={staff.Staff_Middle_Name}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email Address"
                name="Staff_Email_Address"
                value={staff.Staff_Email_Address}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="person-category-label">Position</InputLabel>
                <Select
                  value={staff.Staff_Position || ""}
                  name="Staff_Position"
                  label="Position"
                  onChange={handleChange}
                  sx={{ textAlign: "left" }} // Ensures text alignment
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        textAlign: "left", // Also aligns dropdown items if needed
                      },
                    },
                  }}
                >
                  <MenuItem value="head">HEAD</MenuItem>
                  <MenuItem value="staff">STAFF</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 item size={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="person-category-label">Office</InputLabel>
                <Select
                  name="Counter_ID"
                  label="Office"
                  onChange={handleChange}
                  value={staff.Counter_ID || ""}
                  sx={{ textAlign: "left" }} // Ensures text alignment
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        textAlign: "left", // Also aligns dropdown items if needed
                      },
                    },
                  }}
                >
                  {counters.map((counter, index) => (
                    <MenuItem key={index} value={counter.Counter_ID}>
                      {counter.Assigned_Counter.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 item size={12}>
              {staff.Staff_Position !== "head" && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="person-category-label">Window</InputLabel>
                  <Select
                    value={staff.Window_ID || ""}
                    name="Window_ID"
                    label="Window"
                    onChange={handleChange}
                    sx={{ textAlign: "left" }} // Ensures text alignment
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          textAlign: "left", // Also aligns dropdown items if needed
                        },
                      },
                    }}
                  >
                    {sortedWindowData
                      .filter(
                        (window) => window.Counter_ID === staff.Counter_ID
                      )
                      .map((window) => (
                        <MenuItem
                          key={window.Window_ID}
                          value={window.Window_ID}
                        >
                          {window.Window_Number
                            ? `Window ${window.Window_Number}`.toUpperCase()
                            : `${window.Assigned_Counter}`.toUpperCase()}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                fullWidth
                type="number"
                label="Queue Number Limits"
                name="Queue_Limit"
                value={staff.Queue_Limit}
                onChange={handleChange}
              />
            </Grid2>
          </Grid2>

          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}

          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              {user?.Role === "administrator" && (
                <Link
                  to="/stafflist"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  <Button variant="contained" sx={{ mt: 2, mb: 2 }}>
                    Cancel
                  </Button>
                </Link>
              )}
            </Grid2>
            <Grid2 size={8}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                sx={{ mt: 2, mb: 2 }}
              >
                Save
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Paper>

      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={() => setOpenSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setOpenSuccess(false)}>
          Updated Profile
        </Alert>
      </Snackbar>

      <Snackbar
        open={openWarning}
        autoHideDuration={5000}
        onClose={() => setOpenWarning(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={() => setOpenWarning(false)}>
          Staff ID is already used
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StaffProfile;
