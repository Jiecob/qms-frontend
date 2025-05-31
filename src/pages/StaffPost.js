import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Grid2,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { amber } from "@mui/material/colors";
import config from "../config";

const StaffPost = () => {
  const navigate = useNavigate();

  const [staff, setStaff] = useState({});

  const [staffs, setStaffs] = useState([]);
  const [windows, setWindows] = useState([]);
  const [counters, setCounters] = useState([]);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/staffs`).then(function (response) {
      // console.log(response.data);
      setStaffs(response.data);
    });
  }, []);

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

  const [error, setError] = useState("");

  const found = staffs.find((obj) => {
    return (
      obj.Staff_Last_Name === staff.Staff_Last_Name &&
      obj.Staff_First_Name === staff.Staff_First_Name &&
      obj.Staff_Middle_Name === staff.Staff_Middle_Name &&
      obj.Staff_Email_Address === staff.Staff_Email_Address
    );
  });

  const foundEmailAddress = staffs.find((obj) => {
    return obj.Staff_Email_Address === staff.Staff_Email_Address;
  });

  const foundAssignedCounter = staffs.find((obj) => {
    return (
      obj.Assigned_Counter === staff.Assigned_Counter &&
      Number(obj.Window_Number) === Number(staff.Window_Number)
    );
  });

  const handleChange = (event) => {
    const value = event.target.value;
    setStaff({
      ...staff,
      [event.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // console.log(staff);

    if (found) {
      setError("Staff is already added!");
    } else {
      if (foundEmailAddress) {
        setError("Email address is already used!");
      } else {
        if (foundAssignedCounter) {
          setError(
            foundAssignedCounter.Assigned_Counter.toUpperCase() +
              " Window " +
              foundAssignedCounter.Window_Number +
              " has been assigned already!"
          );
        } else {
          if (staff.Staff_Position === "head") {
            setStaff((prevData) => ({
              ...prevData,
              Window_ID: "", // You can use null if that's preferred
            }));

            console.log(staff);

            axios
              .post(`${config.API_BASE_URL}/api/post/staff`, staff)
              .then(function (response) {
                // console.log(response.data);
                navigate("/stafflist");
                setError("");
              });
          } else {
            axios
              .post(`${config.API_BASE_URL}/api/post/staff`, staff)
              .then(function (response) {
                // console.log(response.data);
                navigate("/stafflist");
                setError("");
              });
          }
        }
      }
    }
  };

  const sortedWindowData = [...windows].sort((a, b) => {
    if (a.Assigned_Counter.toLowerCase() === "none") return -1;
    if (b.Assigned_Counter.toLowerCase() === "none") return 1;
    return 0;
  });

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          marginTop: 4,
          marginBottom: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={"bold"}
          align="center"
          color="#424242"
          gutterBottom
        >
          Add Staff
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            label="Last Name"
            type="text"
            name="Staff_Last_Name"
            onChange={handleChange}
          />
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            label="First Name"
            type="text"
            name="Staff_First_Name"
            onChange={handleChange}
          />
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            fullWidth
            label="Middle Name"
            type="text"
            name="Staff_Middle_Name"
            onChange={handleChange}
          />{" "}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            name="Staff_Email_Address"
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="person-category-label">Position</InputLabel>
            <Select
              required
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
                  .filter((window) => window.Counter_ID === staff.Counter_ID)
                  .map((window) => (
                    <MenuItem key={window.Window_ID} value={window.Window_ID}>
                      {window.Window_Number
                        ? `Window ${window.Window_Number}`.toUpperCase()
                        : `${window.Assigned_Counter}`.toUpperCase()}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
          <TextField
            fullWidth
            type="number"
            label="Queue Number Limits"
            name="Queue_Limit"
            value={staff.Queue_Limit}
            onChange={handleChange}
          />
          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <Link
                to="/stafflist"
                style={{ textDecoration: "none", color: "black" }}
              >
                <Button variant="contained" sx={{ mt: 2, mb: 2 }}>
                  Cancel
                </Button>
              </Link>
            </Grid2>
            <Grid2 size={8}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 2, mb: 2 }}
              >
                Add
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Paper>
    </Container>
  );
};

export default StaffPost;
