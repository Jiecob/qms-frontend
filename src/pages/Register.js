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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
} from "@mui/material";
import SchoolLogo from "../images/new-vsu-logo.png";
import { amber } from "@mui/material/colors";
import config from "../config";
import emailjs from "emailjs-com";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const Register = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState({
    Student_ID: "",
    Last_Name: "",
    First_Name: "",
    Middle_Name: "",
    Phone_Number: "",
    Email_Address: "",
    Person_Category: "",
    Password: "",
    Confirm_Password: "",
  });

  const [emailVerfication, setEmailVerification] = useState([]);

  const [verificationCode, setVerificationCode] = useState(
    Math.floor(Math.random() * 899999 + 100000)
  );

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);

  const [openEmailVerification, setOpenEmailVerification] = useState(false);

  const [errorVerification, setErrorVerification] = useState("");

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/students`).then(function (response) {
      //   console.log(response.data);
      setStudents(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/courses`).then(function (response) {
      // console.log(response.data);
      setCourses(response.data);
    });
  }, []);

  const found = students.find((obj) => {
    return obj.Student_ID === student.Student_ID;
  });

  const foundEmailAddress = students.find((obj) => {
    return obj.Email_Address === student.Email_Address;
  });

  const [error, setError] = useState("");

  const handleChangeEmailVerification = (event) => {
    const value = event.target.value;
    setEmailVerification({
      ...emailVerfication,
      [event.target.name]: value,
    });
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setStudent({
      ...student,
      [event.target.name]: value,
    });
  };

  // console.log(student);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (student.Password !== student.Confirm_Password) {
      setError("Password does NOT match");
    } else {
      if (
        !student.Student_ID ||
        !student.Last_Name ||
        !student.First_Name ||
        !student.Phone_Number ||
        !student.Email_Address ||
        !student.Password ||
        !student.Confirm_Password
      ) {
        setError("Fields are required");
        return;
      } else {
        // console.log(student);
        if (found) {
          setError("Student ID is already used!");
        } else {
          if (foundEmailAddress) {
            setError("Email Address is already used!");
          } else {
            const Custom_Message = `Hi ${student.Student_ID},\n\nYour verification code is:\n\n${verificationCode}\n\nPlease enter this code to complete your verification.\n\nIf you didn’t request this code, please ignore this message.`;
            emailSend(student.Email_Address, Custom_Message);
            setOpenEmailVerification(true);
          }
        }
      }
    }
  };

  const handleVerify = (e) => {
    // console.log(verificationCode);
    if (emailVerfication.verificationCode == verificationCode) {
      axios
        .post(`${config.API_BASE_URL}/api/post/student`, student)
        .then(function (response) {
          console.log(response.data);
          setOpenEmailVerification(false);
          setOpenDialog(true);
          // navigate("/login");
        });
      axios
        .post(`${config.API_BASE_URL}/api/post/user/student`, student)
        .then(function (response) {
          console.log(response.data);

          const Custom_Message = `Hi ${student.Student_ID},\n\nYour account has been created.\n\nUsername: ${student.Student_ID}\nPassword: ${student.Password}\n\nPlease use these credentials to log in to your account.\n\nIf you did not request this account, please ignore this message.`;

          emailSend(student.Email_Address, Custom_Message);

          setOpenEmailVerification(false);
          setOpenDialog(true);
          // navigate("/login");
        });
    } else {
      setErrorVerification("Invalid verification code. Please try again.");
    }
  };

  function emailSend(Email_Address, Custom_Message) {
    // alert(Custom_Message);

    if (Email_Address) {
      emailjs
        .send(
          "service_hoeq7no", // Replace with your EmailJS Service ID
          "template_d87ppd9", // Replace with your EmailJS Template ID
          {
            Email_Address: Email_Address,
            Custom_Message: Custom_Message,
          },
          "Tg8bLRkOoVaK30Jkr" // Replace with your EmailJS Public Key
        )
        .then(
          (result) => {
            console.log("Email sent successfully", result.text);
            // setOpenEmailVerification(true);
          },
          (error) => {
            console.error("Error sending email", error.text);
          }
        );
    }
  }

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
          REGISTER
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            autoFocus
            label="School ID"
            type="text"
            name="Student_ID"
            onChange={handleChange}
            sx={{ "& input": { textTransform: "uppercase" } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Last Name"
            type="text"
            name="Last_Name"
            onChange={handleChange}
            sx={{ "& input": { textTransform: "uppercase" } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="First Name"
            type="text"
            name="First_Name"
            onChange={handleChange}
            sx={{ "& input": { textTransform: "uppercase" } }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Middle Name"
            type="text"
            name="Middle_Name"
            onChange={handleChange}
            sx={{ "& input": { textTransform: "uppercase" } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Phone Number"
            type="text"
            name="Phone_Number"
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            name="Email_Address"
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="person-category-label">Course</InputLabel>
            <Select
              name="Course_ID"
              label="Course"
              onChange={handleChange}
              value={student.Course_ID || ""}
              sx={{ textAlign: "left" }} // Ensures text alignment
              MenuProps={{
                PaperProps: {
                  sx: {
                    textAlign: "left", // Also aligns dropdown items if needed
                  },
                },
              }}
            >
              {courses.map((course, index) => (
                <MenuItem key={index} value={course.Course_ID || ""}>
                  {`${course.Course_Code}${
                    course.Course_Major ? " - " + course.Course_Major : ""
                  }`.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="person-category-label">Person Category</InputLabel>
            <Select
              name="Person_Category"
              label="Person Category"
              onChange={handleChange}
              value={student.Person_Category || ""}
              sx={{ textAlign: "left" }} // Ensures text alignment
              MenuProps={{
                PaperProps: {
                  sx: {
                    textAlign: "left", // Also aligns dropdown items if needed
                  },
                },
              }}
            >
              <MenuItem value="None">Student</MenuItem>
              <MenuItem value="Person With Disability">
                Student - Person With Disability
              </MenuItem>
              <MenuItem value="Pregnant">Student - Pregnant</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            name="Password"
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            name="Confirm_Password"
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
      <Dialog open={openDialog}>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircleOutlineIcon color="success" />
            <DialogContentText sx={{ color: "green" }}>
              Successfully registered!{" "}
              <span style={{ color: "black" }}>
                Click here to{" "}
                <Link
                  to="/login"
                  underline="none"
                  sx={{ textDecoration: "none" }}
                >
                  Login
                </Link>
              </span>
            </DialogContentText>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Register;
