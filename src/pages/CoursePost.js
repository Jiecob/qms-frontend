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

const CoursePost = () => {
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    Course_Code: "",
    Course_Description: "",
    Course_Major: "",
  });

  const [courses, setCourses] = useState([]);

  const [windows, setWindows] = useState([]);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/courses`).then(function (response) {
      // console.log(response.data);
      setCourses(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/windows`).then(function (response) {
      // console.log(response.data);
      setWindows(response.data);
    });
  }, []);

  const [error, setError] = useState("");

  const found = courses.find((obj) => {
    return (
      obj.Course_Code === course.Course_Code &&
      obj.Course_Description === course.Course_Description &&
      obj.Course_Major === course.Course_Major
    );
  });

  const handleChange = (event) => {
    const value = event.target.value;
    setCourse({
      ...course,
      [event.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(course);

    if (found) {
      setError("Course is already added!");
    } else {
      axios
        .post(`${config.API_BASE_URL}/api/post/course`, course)
        .then(function (response) {
          // console.log(response.data);
          navigate("/courselist");
          setError("");
        });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
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
          Add Course
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            label="Course Code"
            type="text"
            name="Course_Code"
            onChange={handleChange}
          />
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            label="Course Description"
            type="text"
            name="Course_Description"
            onChange={handleChange}
          />
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            fullWidth
            label="Course Major"
            type="text"
            name="Course_Major"
            onChange={handleChange}
          />
          <Typography align="center" color="#424242" sx={{ mt: 2 }}>
            Choose a window for auto-suggestion during queue creation.
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="person-category-label">Window</InputLabel>
            <Select
              value={course.Window_ID || ""}
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
              {windows.map((window, index) => (
                <MenuItem key={index} value={window.Window_ID}>
                  {window.Assigned_Counter.toUpperCase() +
                    " - WINDOW " +
                    window.Window_Number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <Link
                to="/courselist"
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

export default CoursePost;
