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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from "@mui/material";
import { amber } from "@mui/material/colors";
import SchoolLogo from "../images/new-vsu-logo.png";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import emailjs from "emailjs-com";
import config from "../config";

const RegisterStaff = () => {
  const navigate = useNavigate();

  const [staff, setStaff] = useState({
    Staff_Position: "staff",
  });

  const [staffs, setStaffs] = useState([]);

  const [emailVerfication, setEmailVerification] = useState([]);

  const [verificationCode, setVerificationCode] = useState(
    Math.floor(Math.random() * 899999 + 100000)
  );

  const [openDialog, setOpenDialog] = useState(false);

  const [openEmailVerification, setOpenEmailVerification] = useState(false);

  const [error, setError] = useState("");

  const [errorVerification, setErrorVerification] = useState("");

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
      obj.Counter_ID === staff.Counter_ID && obj.Window_ID === staff.Window_ID
    );
  });

  const foundHead = staffs.find((obj) => {
    return obj.Counter_ID === staff.Counter_ID;
  });

  const handleChangeEmailVerification = (event) => {
    const value = event.target.value;
    setEmailVerification({
      ...emailVerfication,
      [event.target.name]: value,
    });
  };

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
          emailSend(
            staff.Staff_Email_Address,
            staff.Staff_First_Name.toUpperCase(),
            `Your verification code is:\n\n${verificationCode}\n\nPlease enter this code to complete your verification.\n\nIf you didn’t request this code, please ignore this message.`
          );

          setOpenEmailVerification(true);
        }
      }
    }
  };

  const handleVerify = (e) => {
    e.preventDefault(); // Prevent default form submit behavior
    if (emailVerfication.verificationCode == verificationCode) {
      // console.log(foundHead);
      axios
        .post(`${config.API_BASE_URL}/api/post/staff`, staff)
        .then(function (response) {
          emailSend(
            foundHead.Staff_Email_Address,
            foundHead.Staff_First_Name.toUpperCase(),
            `A new account request has been submitted for:\n\nName: ${
              staff.Staff_First_Name.toUpperCase() +
              " " +
              staff.Staff_Last_Name.toUpperCase()
            }\nEmail: ${
              staff.Staff_Email_Address
            }\n\nPlease review and approve this request to proceed with account creation.\n\nTo take action, visit your staff list and click the edit icon and create the username and password.\n\nIf you did not expect this request, please investigate accordingly.`
          );

          emailSend(
            staff.Staff_Email_Address,
            staff.Staff_First_Name.toUpperCase(),
            `Your account request has been submitted to the Head of the ${foundHead.Assigned_Counter.toUpperCase()} Office for approval.\n\nYou will be notified once it is created.`
          );

          setOpenEmailVerification(false);
          setOpenDialog(true);
          setError(""); // clear any previous error
        })
        .catch(function (error) {
          console.error("Submission error:", error);
          setError("Something went wrong while submitting. Please try again.");
        });
    } else {
      setErrorVerification("Invalid verification code. Please try again.");
    }
  };

  function emailSend(Email_Address, Staff_First_Name, Custom_Message) {
    // alert(Custom_Message);

    if (Email_Address) {
      emailjs
        .send(
          "service_hoeq7no", // Replace with your EmailJS Service ID
          "template_d87ppd9", // Replace with your EmailJS Template ID
          {
            Staff_First_Name: Staff_First_Name,
            Email_Address: Email_Address,
            Custom_Message: Custom_Message,
          },
          "Tg8bLRkOoVaK30Jkr" // Replace with your EmailJS Public Key
        )
        .then(
          (result) => {
            console.log("Email sent successfully", result.text);
          },
          (error) => {
            console.error("Error sending email", error.text);
          }
        );
    }
  }

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
          backgroundColor: amber[500],
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <img src={SchoolLogo} alt="Logo" width="50" />
        </Box>

        <Typography
          variant="h5"
          fontWeight={"bold"}
          align="center"
          color="white"
          gutterBottom
        >
          Register Staff
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
          />
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
            <InputLabel id="person-category-label">Office</InputLabel>
            <Select
              required
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
                required
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

          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <Link
                to="/login"
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
                Register
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Paper>

      <Dialog
        open={openEmailVerification}
        onClose={() => setOpenEmailVerification(false)}
      >
        <DialogTitle>Email Verification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            We've sent a verification code to your email. Please enter the code
            below to verify your email address.
          </DialogContentText>

          {errorVerification && (
            <Typography
              variant="body2"
              color="error"
              style={{ marginTop: "8px" }}
            >
              {errorVerification}
            </Typography>
          )}

          <TextField
            autoFocus
            required
            margin="dense"
            id="verificationCode"
            name="verificationCode"
            label="Verification Code"
            type="text"
            fullWidth
            variant="standard"
            autoComplete="off"
            readOnly
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 6,
              style: {
                fontSize: "24px",
                textAlign: "center",
              },
            }}
            InputLabelProps={{
              style: { fontSize: "18px" },
            }}
            onChange={handleChangeEmailVerification}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmailVerification(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleVerify}>
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent>
          {/* Top-right close icon */}

          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircleOutlineIcon color="success" />
            <DialogContentText sx={{ color: "green" }}>
              Successfully registered!{" "}
              <span style={{ color: "black" }}>
                Please check your email for more details.{" "}
              </span>
            </DialogContentText>
          </Box>
        </DialogContent>

        {/* Bottom action button */}
        <DialogActions>
          <Button
            onClick={() => (window.location.href = "/registerstaff")}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegisterStaff;
