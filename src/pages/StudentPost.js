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

const StudentPost = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState({
    Student_ID: "",
    Last_Name: "",
    First_Name: "",
    Middle_Name: "",
    Phone_Number: "",
    Email_Address: "",
    Person_Category: "",
    Password: "Welcome1$",
  });

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/students`).then(function (response) {
      //   console.log(response.data);
      setStudents(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/courses`).then(function (response) {
      //   console.log(response.data);
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

    //   console.log(student);
    if (found) {
      setError("Student ID is already used!");
    } else {
      if (foundEmailAddress) {
        setError("Email Address is already used!");
      } else {
        axios
          .post(`${config.API_BASE_URL}/api/post/student`, student)
          .then(function (response) {
            // console.log(response.data);
            navigate("/studentlist");
          });
        axios
          .post(`${config.API_BASE_URL}/api/post/user/student`, student)
          .then(function (response) {
            console.log(response.data);
            navigate("/studentlist");
          });
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
        }}
      >
        <Typography
          variant="h5"
          fontWeight={"bold"}
          align="center"
          color="#424242"
          gutterBottom
        >
          Add Student
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            autoFocus
            label="School ID"
            type="text"
            name="Student_ID"
            onChange={handleChange}
          />
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            label="Last Name"
            type="text"
            name="Last_Name"
            onChange={handleChange}
          />
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            label="First Name"
            type="text"
            name="First_Name"
            onChange={handleChange}
          />
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            fullWidth
            label="Middle Name"
            type="text"
            name="Middle_Name"
            onChange={handleChange}
          />
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
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
            // type="password"
            name="Password"
            value={student.Password}
            onChange={handleChange}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}

          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <Link
                to="/studentlist"
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

export default StudentPost;
