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
} from "@mui/material";
import SchoolLogo from "../images/vsu-logo.png";
import { amber } from "@mui/material/colors";
import config from "../config";
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

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/students`).then(function (response) {
      //   console.log(response.data);
      setStudents(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/courses`).then(function (response) {
      console.log(response.data);
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

  const handleChange = (event) => {
    const value = event.target.value;
    setStudent({
      ...student,
      [event.target.name]: value,
    });
  };

  //   console.log(student);

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
            axios
              .post(`${config.API_BASE_URL}/api/post/student`, student)
              .then(function (response) {
                console.log(response.data);
                setOpenDialog(true);
                // navigate("/login");
              });
            axios
              .post(`${config.API_BASE_URL}/api/post/user/student`, student)
              .then(function (response) {
                console.log(response.data);
                setOpenDialog(true);
                // navigate("/login");
              });
          }
        }
      }
    }
  };

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
                <MenuItem key={index} value={course.Course_ID}>
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
                .
              </span>
            </DialogContentText>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Register;
