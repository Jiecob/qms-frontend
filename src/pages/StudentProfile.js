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

const StudentProfile = () => {
  const { id } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [student, setStudent] = useState({
    Student_ID: "",
    Last_Name: "",
    First_Name: "",
    Middle_Name: "",
    Email_Address: "",
    Person_Category: "",
  });
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState([]); // Store API data

  const [courses, setCourses] = useState([]);

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
    axios.get(`${config.API_BASE_URL}/api/courses`).then(function (response) {
      //   console.log(response.data);
      setCourses(response.data);
    });
  }, []);

  useEffect(() => {
    if (id) {
      url = `${config.API_BASE_URL}/api/student/${id}`;
      // console.log(user.Role);
    } else {
      url = `${config.API_BASE_URL}/api/student/${loggedInUser.Student_ID}`;
      // console.log(user.Role);
    }

    if (loggedInUser?.Student_ID || id) {
      // Only fetch if ID exists
      axios
        .get(url)
        .then(function (response) {
          // console.log(response.data[0]);
          setStudent(response.data[0]);
        })
        .catch(function (error) {
          console.error("Error fetching student data:", error);
        });
    }
  }, [loggedInUser]);

  const handleChange = (event) => {
    const value = event.target.value;
    setStudent({
      ...student,
      [event.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // console.log(student.Course_ID);

    axios
      .put(
        `${config.API_BASE_URL}/api/put/student/` + student.Student_ID,
        student
      )
      .then(function (response) {
        // console.log(response.data);
        if (response.data.errno) {
          setOpenWarning(true);
        } else {
          setOpenSuccess(true);
          if (user.Role === "administrator") {
            navigate("/studentlist");
          }
        }
      });
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
        <QRCodeSVG value={student.Student_ID} size={250} />

        <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, mt: 4 }}>
          Student Profile
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid2 container spacing={2} justifyContent="center">
            <Grid2 item size={12}>
              <TextField
                fullWidth
                required
                sx={{ "& input": { textTransform: "uppercase" } }}
                type="text"
                label="Student ID"
                name="Student_ID"
                value={student.Student_ID}
                onChange={handleChange}
                slotProps={{
                  input: {
                    readOnly: user.Role === "administrator" ? false : true,
                  },
                }}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                fullWidth
                required
                sx={{ "& input": { textTransform: "uppercase" } }}
                label="Last Name"
                name="Last_Name"
                value={student.Last_Name}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                fullWidth
                required
                sx={{ "& input": { textTransform: "uppercase" } }}
                label="First Name"
                name="First_Name"
                value={student.First_Name}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                fullWidth
                sx={{ "& input": { textTransform: "uppercase" } }}
                label="Middle Name"
                name="Middle_Name"
                value={student.Middle_Name}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                fullWidth
                required
                type="text"
                label="Phone Number"
                name="Phone_Number"
                value={student.Phone_Number}
                onChange={handleChange}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email Address"
                name="Email_Address"
                value={student.Email_Address}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="person-category-label">Course</InputLabel>
                <Select
                  name="Course_ID"
                  label="Course"
                  value={student.Course_ID || ""}
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
            </Grid2>
            <Grid2 item size={12}>
              <FormControl fullWidth>
                <InputLabel id="person-category-label">
                  Person Category
                </InputLabel>
                <Select
                  name="Person_Category"
                  label="Person Category"
                  value={student.Person_Category}
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
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              {user?.Role === "administrator" && (
                <Link
                  to="/studentlist"
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
                Save Profile
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
          Student ID is already used
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentProfile;
